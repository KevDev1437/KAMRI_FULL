import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CJAPIClient } from './cj-api-client';
import { UpdateCJConfigDto } from './dto/cj-config.dto';
import { CJOrderCreateDto } from './dto/cj-order-create.dto';
import { CJProductSearchDto } from './dto/cj-product-search.dto';
import { CJOrder, CJOrderCreateResult } from './interfaces/cj-order.interface';
import { CJProduct } from './interfaces/cj-product.interface';
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
    this.logger.log('🚀 Initialisation du client CJ...');
    
    // Vérifier si on a un token valide
    const hasToken = this.cjApiClient['accessToken'];
    const tokenExpiry = this.cjApiClient['tokenExpiry'];
    const isTokenValid = hasToken && tokenExpiry && new Date() < tokenExpiry;
    
    if (!isTokenValid) {
      this.logger.log('🔑 Pas de token valide - Login CJ requis');
      
      const config = await this.getConfig();
      if (!config.enabled) {
        throw new BadRequestException('L\'intégration CJ Dropshipping est désactivée');
      }

      // Initialiser la configuration du client injecté
      this.cjApiClient.setConfig({
        email: config.email,
        apiKey: config.apiKey,
        tier: config.tier as 'free' | 'plus' | 'prime' | 'advanced',
        platformToken: config.platformToken,
        debug: process.env.CJ_DEBUG === 'true',
      });

      await this.cjApiClient.login();
      this.logger.log('✅ Login CJ réussi');
    } else {
      this.logger.log('✅ Token CJ déjà valide - Utilisation de la connexion existante');
    }
    
    return this.cjApiClient;
  }

  /**
   * Obtenir la configuration CJ
   */
  async getConfig(): Promise<any> {
    let config = await this.prisma.cJConfig.findFirst();
    
    if (!config) {
      // Créer une configuration par défaut vide
      config = await this.prisma.cJConfig.create({
        data: {
          email: '',
          apiKey: '',
          tier: 'free',
          platformToken: null,
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
   * Tester la connexion CJ et charger les données initiales
   */
  async testConnection(): Promise<{ 
    success: boolean; 
    message: string; 
    categories?: any[]; 
    products?: any[];
    categoriesCount?: number;
    productsCount?: number;
  }> {
    try {
      this.logger.log('🚀 === DÉBUT CONNEXION ET CHARGEMENT SIMULTANÉ ===');
      this.logger.log('Initialisation du client CJ...');
      const client = await this.initializeClient();
      this.logger.log('✅ Client CJ initialisé');
      
      // Charger les catégories ET les produits en parallèle
      this.logger.log('📡 Chargement simultané des catégories et produits...');
      
      const [categoriesResult, productsResult] = await Promise.allSettled([
        client.getCategories(),
        client.searchProducts('', { pageNum: 1, pageSize: 100 })
      ]);
      
      const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
      const productsData = productsResult.status === 'fulfilled' ? productsResult.value : { list: [] };
      const products = Array.isArray(productsData) ? productsData : productsData.list || [];
      
      this.logger.log(`✅ Connexion réussie - ${categories.length} catégories, ${products.length} produits chargés`);
      
      // ✅ SUPPRESSION DE LA SYNCHRONISATION AUTOMATIQUE
      // La synchronisation ne doit se faire que sur demande explicite
      this.logger.log('✅ Connexion CJ établie (sans synchronisation automatique)');
      
      return { 
        success: true, 
        message: `Connexion CJ Dropshipping réussie - ${categories.length} catégories et ${products.length} produits chargés`,
        categories,
        products,
        categoriesCount: categories.length,
        productsCount: products.length
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Test de connexion CJ échoué:', error);
      return { 
        success: false, 
        message: `Connexion CJ Dropshipping échouée: ${errorMessage}` 
      };
    }
  }

  /**
   * Obtenir le statut de connexion CJ
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    tier: string;
    lastSync: string | null;
    apiLimits: {
      qps: string;
      loginPer5min: number;
      refreshPerMin: number;
    };
    tips: string[];
  }> {
    try {
      // Récupérer la configuration
      const config = await this.getConfig();
      
      // Vérifier si le client est connecté
      let connected = false;
      let tier = config.tier || 'free';
      
      try {
        if (config.email && config.apiKey) {
          const client = await this.initializeClient();
          connected = true;
          
          // ✅ SUPPRESSION DE LA SYNCHRONISATION AUTOMATIQUE
          // La synchronisation ne doit se faire que sur demande explicite
          this.logger.log('✅ Client CJ connecté (sans synchronisation automatique)');
        }
      } catch (error) {
        connected = false;
      }

      // Définir les limites selon le tier
      const apiLimits = {
        free: { qps: '1 req/s', loginPer5min: 1, refreshPerMin: 5 },
        plus: { qps: '2 req/s', loginPer5min: 1, refreshPerMin: 5 },
        prime: { qps: '4 req/s', loginPer5min: 1, refreshPerMin: 5 },
        advanced: { qps: '6 req/s', loginPer5min: 1, refreshPerMin: 5 }
      };

      const limits = apiLimits[tier as keyof typeof apiLimits] || apiLimits.free;

      return {
        connected,
        tier,
        lastSync: null, // TODO: Implémenter le suivi de la dernière sync
        apiLimits: {
          qps: limits.qps,
          loginPer5min: limits.loginPer5min,
          refreshPerMin: limits.refreshPerMin
        },
        tips: [
          'Testez votre connexion avec le bouton "Tester la connexion"',
          'Synchronisez votre tier avec votre compte CJ officiel',
          'Activez l\'intégration pour commencer à utiliser les fonctionnalités',
          'Gardez vos credentials sécurisés et ne les partagez jamais'
        ]
      };
    } catch (error) {
      this.logger.error('Erreur récupération statut connexion:', error);
      return {
        connected: false,
        tier: 'free',
        lastSync: null,
        apiLimits: {
          qps: '1 req/s',
          loginPer5min: 1,
          refreshPerMin: 5
        },
        tips: [
          'Erreur lors de la récupération du statut',
          'Vérifiez votre configuration CJ',
          'Contactez le support si le problème persiste'
        ]
      };
    }
  }

  // Cache simple pour éviter les requêtes répétées
  private defaultProductsCache: { data: CJProduct[]; timestamp: number } | null = null;
  private searchCache: Map<string, { data: CJProduct[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Obtenir les produits par défaut (sans filtre)
   */
  async getDefaultProducts(query: { pageNum?: number; pageSize?: number; countryCode?: string }): Promise<CJProduct[]> {
    this.logger.log('🔍 === DÉBUT getDefaultProducts ===');
    this.logger.log('📝 Paramètres:', JSON.stringify(query, null, 2));
    
    // Vérifier le cache pour la première page
    if (query.pageNum === 1 && this.defaultProductsCache && 
        (Date.now() - this.defaultProductsCache.timestamp) < this.CACHE_DURATION) {
      this.logger.log('📦 Utilisation du cache pour les produits par défaut');
      return this.defaultProductsCache.data;
    }
    
    try {
      this.logger.log('🚀 Initialisation du client CJ...');
      const client = await this.initializeClient();
      this.logger.log('✅ Client CJ initialisé avec succès');

      this.logger.log('📡 Appel API CJ getDefaultProducts...');
      const result = await client.searchProducts(undefined, {
        pageNum: query.pageNum || 1,
        pageSize: query.pageSize || 100, // 100 produits par défaut (limite API CJ)
        countryCode: query.countryCode, // ← CORRECTION: Pas de pays par défaut
        sortBy: 'relevance',
      });

      this.logger.log('📊 Résultat API CJ brut:', JSON.stringify({
        total: result.total,
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        listLength: result.list?.length || 0
      }, null, 2));

      const products = result.list || [];
      
      // Mettre en cache pour la première page
      if (query.pageNum === 1) {
        this.defaultProductsCache = {
          data: products,
          timestamp: Date.now()
        };
        this.logger.log('📦 Produits mis en cache pour 5 minutes');
      }
      
      this.logger.log(`🎉 getDefaultProducts terminé avec succès: ${products.length} produits`);
      this.logger.log('🔍 === FIN getDefaultProducts ===');
      
      return products;
    } catch (error) {
      this.logger.error('❌ === ERREUR getDefaultProducts ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('📊 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 === FIN ERREUR getDefaultProducts ===');
      throw error;
    }
  }

  /**
   * Rechercher des produits
   */
  async searchProducts(query: CJProductSearchDto): Promise<CJProduct[]> {
    this.logger.log('🔍 === DÉBUT RECHERCHE PRODUITS CJ ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(query, null, 2));
    
    try {
      this.logger.log('🚀 Initialisation du client CJ...');
      const client = await this.initializeClient();
      this.logger.log('✅ Client CJ initialisé avec succès');

      this.logger.log('📡 Récupération de PLUSIEURS pages de l\'API CJ...');
      
      // Récupérer PLUSIEURS pages de l'API CJ UNE SEULE FOIS pour avoir plus de produits à filtrer
      const allProducts: CJProduct[] = [];
      const maxPages = 3; // 3 pages = 600 produits max
      
      // Vérifier si on a déjà des produits en cache pour cette recherche
      const cacheKey = `search_${query.keyword}_${query.categoryId}_${query.minPrice}_${query.maxPrice}`;
      const cachedProducts = this.getCachedProducts(cacheKey);
      
      if (cachedProducts && cachedProducts.length > 0) {
        this.logger.log(`📦 Utilisation du cache: ${cachedProducts.length} produits`);
        allProducts.push(...cachedProducts);
      } else {
        // Récupérer les produits depuis l'API CJ
        for (let page = 1; page <= maxPages; page++) {
          this.logger.log(`📄 Récupération page ${page}/${maxPages}...`);
          
          const result = await client.searchProducts(query.keyword, { // ← CORRECTION: Passer le keyword
            pageNum: page,
            pageSize: 100, // 100 produits par page (limite API CJ)
            countryCode: query.countryCode, // ← CORRECTION: Pas de pays par défaut
            categoryId: query.categoryId,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            sortBy: query.sortBy,
          });
          
          allProducts.push(...result.list);
          this.logger.log(`📦 Page ${page}: ${result.list.length} produits récupérés`);
          
          if (result.list.length < 100) {
            this.logger.log('📄 Dernière page atteinte');
            break; // Dernière page
          }
          
          // Attendre entre les pages pour éviter le rate limiting
          if (page < maxPages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Mettre en cache les produits récupérés
        this.setCachedProducts(cacheKey, allProducts);
      }
      
      this.logger.log(`📦 Total reçu : ${allProducts.length} produits de l'API CJ`);
      
      // Filtrage côté serveur (VOTRE CODE EXISTANT EST BON)
      let filteredProducts = allProducts;
      
      if (query.keyword && query.keyword.trim()) {
        this.logger.log(`🔍 Filtrage par mot-clé: "${query.keyword}"`);
        const keyword = query.keyword.toLowerCase();
        
        filteredProducts = allProducts.filter(product => {
          const name = (product.productName || '').toLowerCase();
          const nameEn = (product.productNameEn || '').toLowerCase();
          const sku = (product.productSku || '').toLowerCase();
          const category = (product.categoryName || '').toLowerCase();
          
          return name.includes(keyword) ||
                 nameEn.includes(keyword) ||
                 sku.includes(keyword) ||
                 category.includes(keyword);
        });
        
        this.logger.log(`✅ ${filteredProducts.length} produits après filtrage par mot-clé`);
      }
      
      // Appliquer la pagination sur les résultats filtrés
      const pageNum = query.pageNum || 1;
      const pageSize = query.pageSize || 20;
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      
      const paginatedProducts = filteredProducts.slice(start, end);
      
      this.logger.log(`📄 Pagination: page ${pageNum}, ${pageSize} produits par page`);
      this.logger.log(`📦 Résultat final: ${paginatedProducts.length} produits retournés`);
      this.logger.log('🎉 Recherche terminée avec succès');
      this.logger.log('🔍 === FIN RECHERCHE PRODUITS CJ ===');
      
      return paginatedProducts;
    } catch (error) {
      this.logger.error('❌ === ERREUR RECHERCHE PRODUITS CJ ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('📊 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 === FIN ERREUR RECHERCHE PRODUITS CJ ===');
      throw error;
    }
  }

  /**
   * Obtenir les produits en cache
   */
  private getCachedProducts(cacheKey: string): CJProduct[] | null {
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Mettre en cache les produits
   */
  private setCachedProducts(cacheKey: string, products: CJProduct[]): void {
    this.searchCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });
  }

  /**
   * Récupérer toutes les catégories depuis l'API CJ
   */
  async getCategories(): Promise<any[]> {
    this.logger.log('🏷️ === RÉCUPÉRATION DES CATÉGORIES CJ ===');
    
    try {
      const client = await this.initializeClient();
      const categories = await client.getCategories();
      
      this.logger.log(`✅ ${categories.length} catégories récupérées`);
      
      return categories;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'arbre des catégories
   */
  async getCategoriesTree(): Promise<any[]> {
    this.logger.log('🌳 === RÉCUPÉRATION DE L\'ARBRE DES CATÉGORIES ===');
    
    try {
      const client = await this.initializeClient();
      const tree = await client.getCategoriesTree();
      
      this.logger.log(`✅ Arbre des catégories récupéré`);
      
      return tree;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération de l\'arbre:', error);
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

    const syncedProducts = await this.prisma.cJProductMapping.count({
      where: { lastSyncAt: { not: null } },
    });

    const activeOrders = await this.prisma.cJOrderMapping.count({
      where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
    });

    return {
      products: {
        total: productMappings,
        synced: syncedProducts,
      },
      orders: {
        total: orderMappings,
        active: activeOrders,
      },
      webhooks: {
        total: webhookLogs,
        recent: recentWebhooks,
      },
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
   * Obtenir les détails d'un produit CJ
   */
  async getProductDetails(pid: string): Promise<any> {
    try {
      const client = await this.initializeClient();
      return await client.getProductDetails(pid);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des détails du produit ${pid}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le stock d'un produit via ses détails
   */
  async getProductStockFromDetails(pid: string): Promise<{ success: boolean; stock: number; message: string }> {
    try {
      this.logger.log(`📦 Récupération du stock pour le produit ${pid}...`);
      
      const client = await this.initializeClient();
      const result = await client.makeRequest('GET', '/product/query', { pid });
      
      if (result.code === 200) {
        const productData = result.data as any;
        const variants = productData.variants || [];
        
        // Calculer le stock total de toutes les variantes
        let totalStock = 0;
        for (const variant of variants) {
          // Le stock n'est pas directement dans les variants selon la doc
          // Il faut faire un appel séparé pour chaque variante
          totalStock += 0; // TODO: Récupérer le stock réel
        }
        
        this.logger.log(`✅ Stock récupéré pour le produit ${pid}: ${totalStock}`);
        return {
          success: true,
          stock: totalStock,
          message: `${totalStock} unités disponibles`
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des détails du produit');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération stock produit ${pid}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      return {
        success: false,
        stock: 0,
        message: 'Stock non disponible'
      };
    }
  }

  /**
   * Récupérer les produits CJ importés dans KAMRI
   */
  async getImportedProducts(filters?: { isFavorite?: boolean }): Promise<any[]> {
    try {
      this.logger.log('📦 Récupération des produits CJ importés...');
      
      // Construire la clause WHERE si des filtres sont fournis
      const whereClause: any = {};
      if (filters?.isFavorite !== undefined) {
        whereClause.isFavorite = filters.isFavorite;
      }
      
      // Récupérer tous les produits du magasin CJ
      const cjProducts = await this.prisma.cJProductStore.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      
      this.logger.log(`✅ ${cjProducts.length} produits CJ importés trouvés`);
      
      // Transformer les données pour l'interface (format compatible avec StoreProduct)
      return cjProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        status: product.status,
        isFavorite: product.isFavorite || false,
        cjProductId: product.cjProductId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));
    } catch (error) {
      this.logger.error(`❌ Erreur récupération produits importés: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      this.logger.error('🔍 Détails de l\'erreur:', error);
      return [];
    }
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

  /**
   * Ajoute un produit à "Mes Produits"
   */
  async addToMyProducts(productId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`➕ Ajout du produit ${productId} à mes produits...`);
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('POST', '/product/addToMyProduct', {
        productId: productId
      });
      
      if (result.code === 200) {
        this.logger.log(`✅ Produit ${productId} ajouté à mes produits`);
        return {
          success: true,
          message: 'Produit ajouté à mes produits avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur ajout produit ${productId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Récupère la liste de mes produits (favoris CJ)
   */
  async getMyProducts(params: {
    keyword?: string;
    categoryId?: string;
    startAt?: string;
    endAt?: string;
    isListed?: number;
    visiable?: number;
    hasPacked?: number;
    hasVirPacked?: number;
  } = {}): Promise<{ success: boolean; products: any[]; total: number }> {
    this.logger.log('📦 === DÉBUT RÉCUPÉRATION FAVORIS CJ ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(params, null, 2));
    
    try {
      const client = await this.initializeClient();
      this.logger.log('🔗 Client CJ initialisé, appel API...');
      
      const result = await client.makeRequest('GET', '/product/myProduct/query', params);
      
      this.logger.log('📊 Réponse API reçue:', {
        code: result.code,
        hasData: !!result.data,
        dataType: typeof result.data
      });
      
      if (result.code === 200) {
        const data = result.data as any;
        this.logger.log('📦 Détails des favoris:', {
          totalRecords: data.totalRecords,
          contentLength: data.content?.length || 0,
          hasContent: !!data.content
        });
        
        this.logger.log(`✅ ${data.totalRecords} produits favoris trouvés`);
        this.logger.log('🔍 === FIN RÉCUPÉRATION FAVORIS CJ ===');
        
        return {
          success: true,
          products: data.content || [],
          total: data.totalRecords || 0
        };
      } else {
        this.logger.error('❌ Erreur API CJ:', result.message);
        throw new Error(result.message || 'Erreur lors de la récupération des favoris');
      }
    } catch (error) {
      this.logger.error('❌ === ERREUR RÉCUPÉRATION FAVORIS ===');
      this.logger.error(`💥 Erreur: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR RÉCUPÉRATION FAVORIS ===');
      throw error;
    }
  }

  /**
   * Synchroniser les favoris CJ avec KAMRI
   */
  async syncFavorites(): Promise<{ success: boolean; synced: number; message: string }> {
    this.logger.log('🔄 === DÉBUT SYNCHRONISATION FAVORIS CJ ===');
    this.logger.log('📝 Étape 1: Récupération des favoris depuis CJ...');
    
    try {
      // Récupérer tous les favoris CJ
      const favorites = await this.getMyProducts();
      
      this.logger.log('📊 Résultat getMyProducts:', {
        success: favorites.success,
        totalProducts: favorites.products?.length || 0,
        total: favorites.total || 0
      });
      
      if (!favorites.success) {
        this.logger.error('❌ Échec de la récupération des favoris CJ');
        return {
          success: false,
          synced: 0,
          message: 'Erreur lors de la récupération des favoris CJ'
        };
      }
      
      if (favorites.products.length === 0) {
        this.logger.log('ℹ️ Aucun favori CJ trouvé');
        return {
          success: true,
          synced: 0,
          message: 'Aucun favori CJ trouvé'
        };
      }

      this.logger.log(`📦 ${favorites.products.length} favoris trouvés, début de l'import...`);
      let synced = 0;
      const errors = [];

      // Importer chaque favori vers KAMRI (marquer comme favori)
      for (let i = 0; i < favorites.products.length; i++) {
        const favorite = favorites.products[i];
        this.logger.log(`🔄 Traitement favori ${i + 1}/${favorites.products.length}: ${favorite.nameEn || favorite.productName || 'Sans nom'}`);
        
        try {
          this.logger.log(`📝 Import du favori: PID=${favorite.productId}, SKU=${favorite.sku}`);
          await this.importProduct(favorite.productId, undefined, 2.5, true); // isFavorite = true
          synced++;
          this.logger.log(`✅ Favori ${i + 1} importé avec succès: ${favorite.nameEn || favorite.productName}`);
        } catch (error) {
          errors.push(favorite.sku || favorite.productId);
          this.logger.error(`❌ Erreur import favori ${i + 1} (${favorite.sku || favorite.productId}):`, error);
        }
      }

      this.logger.log('📊 === RÉSULTAT SYNCHRONISATION ===');
      this.logger.log(`✅ Favoris importés: ${synced}`);
      this.logger.log(`❌ Erreurs: ${errors.length}`);
      if (errors.length > 0) {
        this.logger.log('🔍 Erreurs détaillées:', errors);
      }

      return {
        success: true,
        synced,
        message: `${synced} favoris importés avec succès${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`
      };
    } catch (error) {
      this.logger.error('❌ === ERREUR CRITIQUE SYNCHRONISATION FAVORIS ===');
      this.logger.error(`💥 Erreur: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR SYNCHRONISATION ===');
      
      return {
        success: false,
        synced: 0,
        message: `Erreur synchronisation: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Récupère les variantes d'un produit
   */
  async getProductVariants(params: {
    pid?: string;
    productSku?: string;
    variantSku?: string;
    countryCode?: string;
  }): Promise<{ success: boolean; variants: any[] }> {
    this.logger.log('🔍 Récupération des variantes du produit...');
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('GET', '/product/variant/query', params);
      
      if (result.code === 200) {
        const data = result.data as any;
        this.logger.log(`✅ ${data.length} variantes trouvées`);
        return {
          success: true,
          variants: data || []
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des variantes');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération variantes: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Récupère le stock d'un produit
   */
  async getProductStock(vid: string): Promise<{ success: boolean; stock: any[] }> {
    this.logger.log(`📦 Récupération du stock pour la variante ${vid}...`);
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('GET', '/product/stock/queryByVid', { vid });
      
      if (result.code === 200) {
        const stockData = Array.isArray(result.data) ? result.data : [];
        this.logger.log(`✅ Stock récupéré pour ${stockData.length} entrepôts`);
        return {
          success: true,
          stock: stockData
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération du stock');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération stock: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Récupère les avis d'un produit
   */
  async getProductReviews(params: {
    pid: string;
    score?: number;
    pageNum?: number;
    pageSize?: number;
  }): Promise<{ success: boolean; reviews: any[]; total: number }> {
    this.logger.log(`⭐ Récupération des avis du produit ${params.pid}...`);
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('GET', '/product/productComments', params);
      
      if (result.code === 0) {
        const data = result.data as any;
        this.logger.log(`✅ ${data.total} avis trouvés`);
        return {
          success: true,
          reviews: data.list || [],
          total: parseInt(data.total) || 0
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des avis');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération avis: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Crée une demande de sourcing
   */
  async createSourcing(params: {
    productName: string;
    productImage: string;
    productUrl?: string;
    remark?: string;
    price?: number;
    thirdProductId?: string;
    thirdVariantId?: string;
    thirdProductSku?: string;
  }): Promise<{ success: boolean; cjSourcingId: string; message: string }> {
    this.logger.log(`🔍 Création d'une demande de sourcing pour ${params.productName}...`);
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('POST', '/product/sourcing/create', params);
      
      if (result.code === 0) {
        const data = result.data as any;
        this.logger.log(`✅ Demande de sourcing créée: ${data.cjSourcingId}`);
        return {
          success: true,
          cjSourcingId: data.cjSourcingId,
          message: 'Demande de sourcing créée avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la création de la demande de sourcing');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur création sourcing: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Récupère les catégories de produits
   */
  async getProductCategories(): Promise<{ success: boolean; categories: any[] }> {
    this.logger.log('📂 Récupération des catégories de produits...');
    
    try {
      const client = await this.initializeClient();
      
      const result = await client.makeRequest('GET', '/product/getCategory', {});
      
      if (result.code === 200) {
        const categories = Array.isArray(result.data) ? result.data : [];
        this.logger.log(`✅ ${categories.length} catégories trouvées`);
        return {
          success: true,
          categories: categories
        };
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur récupération catégories: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Importer un produit CJ vers KAMRI
   */
  async importProduct(pid: string, categoryId?: string, margin: number = 2.5, isFavorite: boolean = false): Promise<any> {
    this.logger.log('🔍 === DÉBUT IMPORT PRODUIT CJ ===');
    this.logger.log('📝 Paramètres:', { pid, categoryId, margin, isFavorite });
    
    try {
      this.logger.log('🔗 Initialisation du client CJ...');
      const client = await this.initializeClient();
      
      this.logger.log('📦 Récupération des détails du produit CJ...');
      const cjProduct = await client.getProductDetails(pid);
      
      this.logger.log('📦 Produit CJ récupéré:', {
        name: cjProduct.productNameEn || cjProduct.productName,
        price: cjProduct.sellPrice,
        category: cjProduct.categoryName,
        hasImage: !!cjProduct.productImage
      });
      
      // Créer le produit KAMRI
      const originalPrice = Number(cjProduct.sellPrice) || 0; // Prix original avec fallback
      const sellingPrice = originalPrice * margin; // Prix de vente avec marge
      
      this.logger.log('💰 Prix calculés:', {
        originalPrice,
        margin,
        sellingPrice
      });
      
      // ✅ SAUVEGARDER SEULEMENT LA CATÉGORIE EXTERNE (comme les produits statiques)
      this.logger.log('🔍 Catégorie externe CJ:', cjProduct.categoryName);
      
      this.logger.log('💾 Sauvegarde dans la base de données...');
      // ✅ NOUVELLE APPROCHE : STOCKER DANS LE MAGASIN CJ (upsert pour éviter les doublons)
      const cjStoreProduct = await this.prisma.cJProductStore.upsert({
        where: { cjProductId: pid },
        update: {
          name: cjProduct.productNameEn || cjProduct.productName,
          description: cjProduct.description,
          price: sellingPrice,
          originalPrice: originalPrice,
          image: cjProduct.productImage,
          category: cjProduct.categoryName,
          status: 'available', // Remettre en disponible si déjà importé
          isFavorite: isFavorite, // Marquer comme favori si spécifié
        },
        create: {
          cjProductId: pid,
          name: cjProduct.productNameEn || cjProduct.productName,
          description: cjProduct.description,
          price: sellingPrice,
          originalPrice: originalPrice,
          image: cjProduct.productImage,
          category: cjProduct.categoryName,
          status: 'available',
          isFavorite: isFavorite, // Marquer comme favori si spécifié
        },
      });

      this.logger.log('✅ Produit ajouté au magasin CJ:', {
        id: cjStoreProduct.id,
        name: cjStoreProduct.name,
        isFavorite: cjStoreProduct.isFavorite,
        status: cjStoreProduct.status
      });
      this.logger.log('🎉 Import terminé avec succès');
      this.logger.log('🔍 === FIN IMPORT PRODUIT CJ ===');
      return cjStoreProduct;
    } catch (error) {
      this.logger.error('❌ === ERREUR IMPORT PRODUIT ===');
      this.logger.error(`💥 Erreur import produit ${pid}: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.error(`📊 Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
      this.logger.error('🔍 === FIN ERREUR IMPORT PRODUIT ===');
      throw error;
    }
  }
}
