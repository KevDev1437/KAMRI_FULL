import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';
import { UpdateCJConfigDto } from './dto/cj-config.dto';
import { CJOrderCreateDto } from './dto/cj-order-create.dto';
import { CJProductSearchDto } from './dto/cj-product-search.dto';
import { CJOrder, CJOrderCreateResult } from './interfaces/cj-order.interface';
import { CJProduct, CJProductImportResult } from './interfaces/cj-product.interface';
import { CJWebhookPayload } from './interfaces/cj-webhook.interface';

@Injectable()
export class CJDropshippingService {
  private readonly logger = new Logger(CJDropshippingService.name);
  private cjClient: CJAPIClient | null = null;

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient
  ) {}

  /**
   * Initialiser le client CJ avec la configuration
   */
  private async initializeClient(): Promise<CJAPIClient> {
    if (this.cjClient && this.cjClient.isConnected()) {
      return this.cjClient;
    }

    const config = await this.getConfig();
    if (!config.enabled) {
      throw new BadRequestException('L\'intégration CJ Dropshipping est désactivée');
    }

    // Initialiser la configuration du client injecté
    this.cjApiClient.setConfig({
      email: config.email,
      apiKey: config.apiKey,
      tier: config.tier as any,
      platformToken: config.platformToken,
      debug: process.env.CJ_DEBUG === 'true',
    });

    await this.cjApiClient.login();
    this.cjClient = this.cjApiClient;
    return this.cjClient;
  }

  /**
   * Obtenir la configuration CJ
   */
  async getConfig(): Promise<any> {
    let config = await this.prisma.cJConfig.findFirst();
    
    if (!config) {
      // Créer une configuration par défaut
      config = await this.prisma.cJConfig.create({
        data: {
          email: process.env.CJ_EMAIL || '',
          apiKey: process.env.CJ_API_KEY || '',
          tier: process.env.CJ_TIER || 'free',
          platformToken: process.env.CJ_PLATFORM_TOKEN || null,
          enabled: false,
        },
      });
    }

    return {
      ...config,
      connected: this.cjClient?.isConnected() || false,
    };
  }

  /**
   * Mettre à jour la configuration CJ
   */
  async updateConfig(data: UpdateCJConfigDto): Promise<any> {
    const existingConfig = await this.prisma.cJConfig.findFirst();
    
    const configData = {
      ...(data.email && { email: data.email }),
      ...(data.apiKey && { apiKey: data.apiKey }),
      ...(data.tier && { tier: data.tier }),
      ...(data.platformToken !== undefined && { platformToken: data.platformToken }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
    };

    if (existingConfig) {
      const updatedConfig = await this.prisma.cJConfig.update({
        where: { id: existingConfig.id },
        data: configData,
      });

      // Réinitialiser le client si les credentials ont changé
      if (data.email || data.apiKey) {
        this.cjClient = null;
      }

      return {
        ...updatedConfig,
        connected: this.cjClient?.isConnected() || false,
      };
    } else {
      const newConfig = await this.prisma.cJConfig.create({
        data: {
          email: data.email || '',
          apiKey: data.apiKey || '',
          tier: data.tier || 'free',
          platformToken: data.platformToken,
          enabled: data.enabled || false,
        },
      });

      return {
        ...newConfig,
        connected: false,
      };
    }
  }

  /**
   * Tester la connexion CJ
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = await this.initializeClient();
      const settings = await client.getSettings();
      this.logger.log('Test de connexion CJ réussi');
      return true;
    } catch (error) {
      this.logger.error('Test de connexion CJ échoué:', error);
      return false;
    }
  }

  /**
   * Rechercher des produits
   */
  async searchProducts(query: CJProductSearchDto): Promise<CJProduct[]> {
    try {
      const client = await this.initializeClient();
      const result = await client.searchProducts(query.keyword, {
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        categoryId: query.categoryId,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        countryCode: query.countryCode,
        sortBy: query.sortBy,
      });

      return result.list;
    } catch (error) {
      this.logger.error('Erreur lors de la recherche de produits:', error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un produit
   */
  async getProductDetails(pid: string): Promise<CJProduct> {
    try {
      const client = await this.initializeClient();
      return await client.getProductWithStock(pid);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du produit ${pid}:`, error);
      throw error;
    }
  }

  /**
   * Importer un produit CJ vers KAMRI
   */
  async importProduct(pid: string, categoryId?: string, margin?: number): Promise<CJProductImportResult> {
    try {
      const client = await this.initializeClient();
      const cjProduct = await client.getProductWithStock(pid);

      // Vérifier si le produit existe déjà
      const existingMapping = await this.prisma.cJProductMapping.findFirst({
        where: { cjProductId: pid },
      });

      if (existingMapping) {
        return {
          productId: existingMapping.productId,
          cjProductId: pid,
          success: false,
          message: 'Produit déjà importé',
        };
      }

      // Mapper le produit CJ vers le modèle KAMRI
      const mappedProduct = await this.mapCJProduct(cjProduct, categoryId, margin);

      // Créer le produit dans KAMRI
      const product = await this.prisma.product.create({
        data: mappedProduct,
      });

      // Créer le mapping CJ
      await this.prisma.cJProductMapping.create({
        data: {
          productId: product.id,
          cjProductId: pid,
          cjSku: cjProduct.productSku,
          lastSyncAt: new Date(),
        },
      });

      this.logger.log(`Produit ${pid} importé avec succès vers KAMRI`);

      return {
        productId: product.id,
        cjProductId: pid,
        success: true,
        message: 'Produit importé avec succès',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'import du produit ${pid}:`, error);
      throw error;
    }
  }

  /**
   * Mapper un produit CJ vers le modèle KAMRI
   */
  private async mapCJProduct(
    cjProduct: CJProduct, 
    categoryId?: string, 
    margin?: number
  ): Promise<any> {
    const finalPrice = margin ? cjProduct.sellPrice * (1 + margin / 100) : cjProduct.sellPrice;
    
    // Trouver une catégorie appropriée
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      targetCategoryId = await this.mapCategory(cjProduct.categoryName);
    }

    return {
      name: cjProduct.productNameEn || cjProduct.productName,
      description: cjProduct.description,
      price: finalPrice,
      originalPrice: cjProduct.sellPrice,
      image: cjProduct.productImage,
      categoryId: targetCategoryId,
      supplierId: 'cj-dropshipping', // ID du fournisseur CJ
      externalCategory: cjProduct.categoryName,
      status: 'active',
      stock: cjProduct.variants?.[0]?.stock || 0,
      images: cjProduct.variants?.[0]?.images || [cjProduct.productImage],
    };
  }

  /**
   * Synchroniser les produits
   */
  async syncProducts(filters?: any): Promise<{ synced: number; errors: number }> {
    try {
      const mappings = await this.prisma.cJProductMapping.findMany();
      let synced = 0;
      let errors = 0;

      for (const mapping of mappings) {
        try {
          const client = await this.initializeClient();
          const cjProduct = await client.getProductDetails(mapping.cjProductId);
          
          // Mettre à jour le produit KAMRI
          await this.prisma.product.update({
            where: { id: mapping.productId },
            data: {
              price: cjProduct.sellPrice,
              stock: cjProduct.variants?.[0]?.stock || 0,
              updatedAt: new Date(),
            },
          });

          // Mettre à jour le mapping
          await this.prisma.cJProductMapping.update({
            where: { id: mapping.id },
            data: { lastSyncAt: new Date() },
          });

          synced++;
        } catch (error) {
          this.logger.error(`Erreur sync produit ${mapping.cjProductId}:`, error);
          errors++;
        }
      }

      return { synced, errors };
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des produits:', error);
      throw error;
    }
  }

  /**
   * Obtenir le stock d'un produit
   */
  async getInventory(vid: string): Promise<any> {
    try {
      const client = await this.initializeClient();
      return await client.getProductStock(vid);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du stock ${vid}:`, error);
      throw error;
    }
  }

  /**
   * Synchroniser l'inventaire
   */
  async syncInventory(productIds: string[]): Promise<{ updated: number; errors: number }> {
    try {
      const mappings = productIds.length > 0 
        ? await this.prisma.cJProductMapping.findMany({
            where: { productId: { in: productIds } },
          })
        : await this.prisma.cJProductMapping.findMany();

      let updated = 0;
      let errors = 0;

      for (const mapping of mappings) {
        try {
          const client = await this.initializeClient();
          const cjProduct = await client.getProductDetails(mapping.cjProductId);
          
          // Mettre à jour le stock
          await this.prisma.product.update({
            where: { id: mapping.productId },
            data: {
              stock: cjProduct.variants?.[0]?.stock || 0,
              updatedAt: new Date(),
            },
          });

          updated++;
        } catch (error) {
          this.logger.error(`Erreur sync stock ${mapping.cjProductId}:`, error);
          errors++;
        }
      }

      return { updated, errors };
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation de l\'inventaire:', error);
      throw error;
    }
  }

  /**
   * Créer une commande CJ
   */
  async createOrder(orderData: CJOrderCreateDto): Promise<CJOrderCreateResult> {
    try {
      const client = await this.initializeClient();
      const cjOrder = await client.createOrderV3(orderData);

      return {
        orderId: cjOrder.orderId,
        orderNumber: cjOrder.orderNumber,
        status: cjOrder.orderStatus,
        totalAmount: cjOrder.totalAmount,
        message: 'Commande CJ créée avec succès',
      };
    } catch (error) {
      this.logger.error('Erreur lors de la création de la commande CJ:', error);
      throw error;
    }
  }

  /**
   * Obtenir le statut d'une commande
   */
  async getOrderStatus(orderId: string): Promise<CJOrder> {
    try {
      const client = await this.initializeClient();
      return await client.getOrderStatus(orderId);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du statut ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Synchroniser les statuts de commandes
   */
  async syncOrderStatuses(): Promise<{ synced: number; errors: number }> {
    try {
      const mappings = await this.prisma.cJOrderMapping.findMany();
      let synced = 0;
      let errors = 0;

      for (const mapping of mappings) {
        try {
          const client = await this.initializeClient();
          const cjOrder = await client.getOrderStatus(mapping.cjOrderId);
          
          // Mettre à jour le mapping
          await this.prisma.cJOrderMapping.update({
            where: { id: mapping.id },
            data: {
              status: cjOrder.orderStatus,
              trackNumber: cjOrder.trackNumber,
            },
          });

          // Mettre à jour la commande KAMRI
          await this.prisma.order.update({
            where: { id: mapping.orderId },
            data: {
              status: this.mapCJStatusToKamri(cjOrder.orderStatus),
            },
          });

          synced++;
        } catch (error) {
          this.logger.error(`Erreur sync commande ${mapping.cjOrderId}:`, error);
          errors++;
        }
      }

      return { synced, errors };
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des commandes:', error);
      throw error;
    }
  }

  /**
   * Calculer les frais de port
   */
  async calculateShipping(data: any): Promise<any> {
    try {
      const client = await this.initializeClient();
      return await client.calculateFreight(
        data.fromCountryCode,
        data.toCountryCode,
        data.products
      );
    } catch (error) {
      this.logger.error('Erreur lors du calcul des frais de port:', error);
      throw error;
    }
  }

  /**
   * Obtenir le tracking d'un colis
   */
  async getTracking(trackNumber: string): Promise<any> {
    try {
      const client = await this.initializeClient();
      return await client.getTracking(trackNumber);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du tracking ${trackNumber}:`, error);
      throw error;
    }
  }

  /**
   * Gérer les webhooks CJ
   */
  async handleWebhook(type: string, payload: CJWebhookPayload): Promise<void> {
    try {
      // Logger le webhook
      await this.prisma.cJWebhookLog.create({
        data: {
          type,
          messageId: payload.messageId,
          payload: JSON.stringify(payload),
          processed: false,
        },
      });

      // Traiter selon le type
      switch (type) {
        case 'PRODUCT':
          await this.handleProductWebhook(payload);
          break;
        case 'STOCK':
          await this.handleStockWebhook(payload);
          break;
        case 'ORDER':
          await this.handleOrderWebhook(payload);
          break;
        case 'LOGISTICS':
          await this.handleLogisticsWebhook(payload);
          break;
      }

      // Marquer comme traité
      await this.prisma.cJWebhookLog.updateMany({
        where: { messageId: payload.messageId },
        data: { processed: true },
      });

      this.logger.log(`Webhook ${type} traité avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors du traitement du webhook ${type}:`, error);
      
      // Logger l'erreur
      await this.prisma.cJWebhookLog.updateMany({
        where: { messageId: payload.messageId },
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      
      throw error;
    }
  }

  /**
   * Gérer le webhook de stock
   */
  private async handleStockWebhook(payload: CJWebhookPayload): Promise<void> {
    const stockData = payload.params;
    
    for (const [vid, stockInfo] of Object.entries(stockData)) {
      const mapping = await this.prisma.cJProductMapping.findFirst({
        where: { cjProductId: vid },
      });
      
      if (mapping) {
        const stock = Array.isArray(stockInfo) ? stockInfo[0]?.storageNum || 0 : stockInfo;
        
        await this.prisma.product.update({
          where: { id: mapping.productId },
          data: { stock: Number(stock) },
        });
      }
    }
  }

  /**
   * Gérer le webhook de commande
   */
  private async handleOrderWebhook(payload: CJWebhookPayload): Promise<void> {
    const { orderNumber, orderStatus, trackNumber } = payload.params;
    
    const mapping = await this.prisma.cJOrderMapping.findFirst({
      where: { cjOrderNumber: orderNumber },
    });
    
    if (mapping) {
      await this.prisma.cJOrderMapping.update({
        where: { id: mapping.id },
        data: {
          status: orderStatus,
          trackNumber: trackNumber,
        },
      });
      
      await this.prisma.order.update({
        where: { id: mapping.orderId },
        data: {
          status: this.mapCJStatusToKamri(orderStatus),
        },
      });
    }
  }

  /**
   * Gérer le webhook de produit
   */
  private async handleProductWebhook(payload: CJWebhookPayload): Promise<void> {
    // Logique pour gérer les changements de produits
    this.logger.log('Webhook produit reçu:', payload.params);
  }

  /**
   * Gérer le webhook de logistique
   */
  private async handleLogisticsWebhook(payload: CJWebhookPayload): Promise<void> {
    // Logique pour gérer les mises à jour de tracking
    this.logger.log('Webhook logistique reçu:', payload.params);
  }

  /**
   * Configurer les webhooks
   */
  async configureWebhooks(enable: boolean): Promise<any> {
    try {
      const client = await this.initializeClient();
      const webhookUrl = process.env.CJ_WEBHOOK_URL || 'http://localhost:3001/api/cj-dropshipping/webhooks';
      
      if (enable) {
        return await client.configureWebhooks(webhookUrl, [
          'PRODUCT',
          'STOCK', 
          'ORDER',
          'LOGISTICS'
        ]);
      } else {
        return await client.configureWebhooks('', []);
      }
    } catch (error) {
      this.logger.error('Erreur lors de la configuration des webhooks:', error);
      throw error;
    }
  }

  /**
   * Mapper le statut CJ vers KAMRI
   */
  private mapCJStatusToKamri(cjStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'PENDING',
      'PAID': 'CONFIRMED',
      'SHIPPED': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED',
    };
    
    return statusMap[cjStatus] || 'PENDING';
  }

  /**
   * Obtenir les logs des webhooks
   */
  async getWebhookLogs(query: any): Promise<any[]> {
    return this.prisma.cJWebhookLog.findMany({
      where: query.type ? { type: query.type } : {},
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
    });
  }

  /**
   * Obtenir les statistiques
   */
  async getStats(): Promise<any> {
    const productMappings = await this.prisma.cJProductMapping.count();
    const orderMappings = await this.prisma.cJOrderMapping.count();
    const webhookLogs = await this.prisma.cJWebhookLog.count();
    const recentWebhooks = await this.prisma.cJWebhookLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
        },
      },
    });

    return {
      productMappings,
      orderMappings,
      webhookLogs,
      recentWebhooks,
    };
  }

  /**
   * Statistiques des produits
   */
  async getProductStats(): Promise<any> {
    return {
      synced: await this.prisma.cJProductMapping.count({
        where: {
          lastSyncAt: {
            not: null,
          },
        },
      }),
    };
  }

  /**
   * Statistiques des commandes
   */
  async getOrderStats(): Promise<any> {
    return {
      active: await this.prisma.cJOrderMapping.count({
        where: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED'],
          },
        },
      }),
    };
  }

  /**
   * Statistiques des webhooks
   */
  async getWebhookStats(): Promise<any> {
    return {
      processed: await this.prisma.cJWebhookLog.count({
        where: { processed: true },
      }),
      failed: await this.prisma.cJWebhookLog.count({
        where: { 
          processed: false,
          error: { not: null },
        },
      }),
    };
  }

  /**
   * Mapper une catégorie CJ vers KAMRI
   */
  private async mapCategory(categoryName: string): Promise<string> {
    // Utiliser toLowerCase() pour une recherche case-insensitive universelle
    const lowerCategoryName = categoryName.toLowerCase();
    
    const categories = await this.prisma.category.findMany();
    const category = categories.find(
      c => c.name.toLowerCase() === lowerCategoryName
    );

    if (category) {
      return category.id;
    }

    const newCategory = await this.prisma.category.create({
      data: {
        name: categoryName,
        description: `Catégorie CJ: ${categoryName}`,
      },
    });

    return newCategory.id;
  }
}
