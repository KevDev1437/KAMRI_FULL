import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';
import { CJWebhookPayload } from './cj-webhook.controller';

@Injectable()
export class CJWebhookService {
  private readonly logger = new Logger(CJWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Traite les mises à jour de produits
   */
  async handleProductUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour produit: ${params.pid}`);
    
    try {
      // Vérifier si le produit existe déjà
      const existingProduct = await this.prisma.product.findFirst({
        where: { cjPid: params.pid }
      });

      if (existingProduct) {
        // Mettre à jour le produit existant
        await this.prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: params.productName || existingProduct.name,
            description: params.productDescription || existingProduct.description,
            image: params.productImage || existingProduct.image,
            price: params.productSellPrice ? parseFloat(params.productSellPrice) : existingProduct.price,
            status: params.productStatus === 3 ? 'ACTIVE' : 'INACTIVE',
            sku: params.productSku || existingProduct.sku,
            updatedAt: new Date(),
          }
        });
        
        this.logger.log(`✅ Produit mis à jour: ${params.pid}`);
      } else {
        // Créer un nouveau produit
        await this.prisma.product.create({
          data: {
            cjPid: params.pid,
            name: params.productName || 'Produit CJ',
            description: params.productDescription || '',
            image: params.productImage || '',
            price: params.productSellPrice ? parseFloat(params.productSellPrice) : 0,
            status: params.productStatus === 3 ? 'ACTIVE' : 'INACTIVE',
            sku: params.productSku || '',
            categoryId: params.categoryId || null,
            supplier: 'CJ_DROPSHIPPING',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        this.logger.log(`✅ Nouveau produit créé: ${params.pid}`);
      }

      // Log des champs modifiés
      if (params.fields && params.fields.length > 0) {
        this.logger.log(`📝 Champs modifiés: ${params.fields.join(', ')}`);
      }

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour produit ${params.pid}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les mises à jour de variantes
   */
  async handleVariantUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour variante: ${params.vid}`);
    
    try {
      // Vérifier si la variante existe déjà
      const existingVariant = await this.prisma.productVariant.findFirst({
        where: { cjVid: params.vid }
      });

      if (existingVariant) {
        // Mettre à jour la variante existante
        await this.prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            name: params.variantName || existingVariant.name,
            sku: params.variantSku || existingVariant.sku,
            price: params.variantSellPrice ? parseFloat(params.variantSellPrice) : existingVariant.price,
            status: params.variantStatus === 1 ? 'ACTIVE' : 'INACTIVE',
            weight: params.variantWeight || existingVariant.weight,
            dimensions: {
              length: params.variantLength || existingVariant.dimensions?.length,
              width: params.variantWidth || existingVariant.dimensions?.width,
              height: params.variantHeight || existingVariant.dimensions?.height,
            },
            image: params.variantImage || existingVariant.image,
            updatedAt: new Date(),
          }
        });
        
        this.logger.log(`✅ Variante mise à jour: ${params.vid}`);
      } else {
        // Créer une nouvelle variante
        await this.prisma.productVariant.create({
          data: {
            cjVid: params.vid,
            name: params.variantName || 'Variante CJ',
            sku: params.variantSku || '',
            price: params.variantSellPrice ? parseFloat(params.variantSellPrice) : 0,
            status: params.variantStatus === 1 ? 'ACTIVE' : 'INACTIVE',
            weight: params.variantWeight || 0,
            dimensions: {
              length: params.variantLength || 0,
              width: params.variantWidth || 0,
              height: params.variantHeight || 0,
            },
            image: params.variantImage || '',
            productId: null, // À associer manuellement ou via logique métier
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        this.logger.log(`✅ Nouvelle variante créée: ${params.vid}`);
      }

      // Log des champs modifiés
      if (params.fields && params.fields.length > 0) {
        this.logger.log(`📝 Champs modifiés: ${params.fields.join(', ')}`);
      }

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour variante ${params.vid}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les mises à jour de stock
   */
  async handleStockUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour stock`);
    
    try {
      // Parcourir tous les stocks reçus
      for (const [vid, stockData] of Object.entries(params)) {
        if (Array.isArray(stockData)) {
          for (const stock of stockData) {
            // Mettre à jour ou créer le stock
            await this.prisma.stock.upsert({
              where: {
                variantId_warehouseId: {
                  variantId: stock.vid,
                  warehouseId: stock.areaId,
                }
              },
              update: {
                quantity: stock.storageNum,
                warehouseName: stock.areaEn,
                countryCode: stock.countryCode,
                updatedAt: new Date(),
              },
              create: {
                variantId: stock.vid,
                warehouseId: stock.areaId,
                quantity: stock.storageNum,
                warehouseName: stock.areaEn,
                countryCode: stock.countryCode,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            });
            
            this.logger.log(`📦 Stock mis à jour: ${stock.vid} - ${stock.areaEn}: ${stock.storageNum}`);
          }
        }
      }

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les mises à jour de commandes
   */
  async handleOrderUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour commande: ${params.orderNumber}`);
    
    try {
      // Mettre à jour ou créer la commande
      await this.prisma.order.upsert({
        where: { cjOrderId: params.cjOrderId.toString() },
        update: {
          orderNumber: params.orderNumber,
          status: this.mapOrderStatus(params.orderStatus),
          logisticName: params.logisticName,
          trackNumber: params.trackNumber,
          payDate: params.payDate ? new Date(params.payDate) : null,
          deliveryDate: params.deliveryDate ? new Date(params.deliveryDate) : null,
          completeDate: params.completeDate ? new Date(params.completeDate) : null,
          updatedAt: new Date(),
        },
        create: {
          cjOrderId: params.cjOrderId.toString(),
          orderNumber: params.orderNumber,
          status: this.mapOrderStatus(params.orderStatus),
          logisticName: params.logisticName,
          trackNumber: params.trackNumber,
          createdAt: new Date(params.createDate),
          updatedAt: new Date(params.updateDate),
          payDate: params.payDate ? new Date(params.payDate) : null,
          deliveryDate: params.deliveryDate ? new Date(params.deliveryDate) : null,
          completeDate: params.completeDate ? new Date(params.completeDate) : null,
        }
      });
      
      this.logger.log(`✅ Commande mise à jour: ${params.orderNumber}`);

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour commande ${params.orderNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les mises à jour logistiques
   */
  async handleLogisticUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour logistique: ${params.orderId}`);
    
    try {
      // Mettre à jour la commande avec les informations logistiques
      await this.prisma.order.updateMany({
        where: { cjOrderId: params.orderId.toString() },
        data: {
          logisticName: params.logisticName,
          trackNumber: params.trackingNumber,
          trackingStatus: params.trackingStatus,
          trackingEvents: params.logisticsTrackEvents,
          updatedAt: new Date(),
        }
      });
      
      this.logger.log(`✅ Logistique mise à jour: ${params.orderId} - ${params.trackingNumber}`);

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour logistique ${params.orderId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les mises à jour de sourcing
   */
  async handleSourcingUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement mise à jour sourcing: ${params.cjSourcingId}`);
    
    try {
      // Créer ou mettre à jour le sourcing
      await this.prisma.sourcing.upsert({
        where: { cjSourcingId: params.cjSourcingId },
        update: {
          status: params.status,
          failReason: params.failReason,
          updatedAt: new Date(),
        },
        create: {
          cjProductId: params.cjProductId,
          cjVariantId: params.cjVariantId,
          cjVariantSku: params.cjVariantSku,
          cjSourcingId: params.cjSourcingId,
          status: params.status,
          failReason: params.failReason,
          createdAt: new Date(params.createDate),
          updatedAt: new Date(),
        }
      });
      
      this.logger.log(`✅ Sourcing mis à jour: ${params.cjSourcingId} - ${params.status}`);

    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour sourcing ${params.cjSourcingId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les divisions de commandes
   */
  async handleOrderSplitUpdate(payload: CJWebhookPayload) {
    const { messageId, params } = payload;
    
    this.logger.log(`🔄 Traitement division commande: ${params.originalOrderId}`);
    
    try {
      // Traiter chaque commande divisée
      for (const splitOrder of params.splitOrderList) {
        await this.prisma.order.create({
          data: {
            cjOrderId: splitOrder.orderCode,
            orderNumber: splitOrder.orderCode,
            status: this.mapOrderStatus(splitOrder.orderStatus.toString()),
            parentOrderId: params.originalOrderId,
            createdAt: new Date(splitOrder.createAt),
            updatedAt: new Date(),
          }
        });
        
        this.logger.log(`✅ Commande divisée créée: ${splitOrder.orderCode}`);
      }

    } catch (error) {
      this.logger.error(`❌ Erreur division commande ${params.originalOrderId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mappe le statut de commande CJ vers le statut interne
   */
  private mapOrderStatus(cjStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'PENDING',
      'PAID': 'PAID',
      'PROCESSING': 'PROCESSING',
      'SHIPPED': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED',
    };
    
    return statusMap[cjStatus] || 'PENDING';
  }

  /**
   * Configure les webhooks CJ
   */
  async configureWebhooks(params: {
    product?: {
      type: 'ENABLE' | 'CANCEL';
      callbackUrls: string[];
    };
    stock?: {
      type: 'ENABLE' | 'CANCEL';
      callbackUrls: string[];
    };
    order?: {
      type: 'ENABLE' | 'CANCEL';
      callbackUrls: string[];
    };
    logistics?: {
      type: 'ENABLE' | 'CANCEL';
      callbackUrls: string[];
    };
  }): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Configuration des webhooks CJ...');
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      const result = await client.makeRequest('/webhook/set', params);
      
      if (result.code === 200) {
        this.logger.log('✅ Webhooks configurés avec succès');
        return {
          success: true,
          message: 'Webhooks configurés avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la configuration des webhooks');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur configuration webhooks: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Configure tous les webhooks avec des URLs par défaut
   */
  async setupDefaultWebhooks(baseUrl: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🔧 Configuration des webhooks par défaut: ${baseUrl}`);
    
    const webhookParams = {
      product: {
        type: 'ENABLE' as const,
        callbackUrls: [`${baseUrl}/cj-dropshipping/webhooks/product`]
      },
      stock: {
        type: 'ENABLE' as const,
        callbackUrls: [`${baseUrl}/cj-dropshipping/webhooks/stock`]
      },
      order: {
        type: 'ENABLE' as const,
        callbackUrls: [`${baseUrl}/cj-dropshipping/webhooks/order`]
      },
      logistics: {
        type: 'ENABLE' as const,
        callbackUrls: [`${baseUrl}/cj-dropshipping/webhooks/logistic`]
      }
    };
    
    return this.configureWebhooks(webhookParams);
  }

  /**
   * Désactive tous les webhooks
   */
  async disableAllWebhooks(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Désactivation de tous les webhooks CJ...');
    
    const webhookParams = {
      product: {
        type: 'CANCEL' as const,
        callbackUrls: []
      },
      stock: {
        type: 'CANCEL' as const,
        callbackUrls: []
      },
      order: {
        type: 'CANCEL' as const,
        callbackUrls: []
      },
      logistics: {
        type: 'CANCEL' as const,
        callbackUrls: []
      }
    };
    
    return this.configureWebhooks(webhookParams);
  }

  /**
   * Récupère le statut des webhooks
   */
  async getWebhookStatus(): Promise<{ success: boolean; status: any }> {
    this.logger.log('📊 Récupération du statut des webhooks...');
    
    try {
      const client = new CJAPIClient(
        process.env.CJ_EMAIL,
        process.env.CJ_API_KEY,
        { tier: 'free', debug: true }
      );
      
      await client.login();
      
      // Note: L'API CJ ne fournit pas d'endpoint pour récupérer le statut des webhooks
      // Cette méthode est un placeholder pour une future implémentation
      this.logger.log('ℹ️ Statut des webhooks non disponible via l\'API CJ');
      
      return {
        success: true,
        status: {
          message: 'Statut des webhooks non disponible via l\'API CJ',
          note: 'Vérifiez manuellement dans votre compte CJ'
        }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur récupération statut webhooks: ${error.message}`, error.stack);
      throw error;
    }
  }
}
