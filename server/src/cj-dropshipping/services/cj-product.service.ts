import { Injectable, Logger } from '@nestjs/common';
import { DuplicatePreventionService } from '../../common/services/duplicate-prevention.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import { CJProductSearchDto } from '../dto/cj-product-search.dto';
import { CJProduct } from '../interfaces/cj-product.interface';

@Injectable()
export class CJProductService {
  private readonly logger = new Logger(CJProductService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient,
    private duplicateService: DuplicatePreventionService
  ) {}

  // ✅ AMÉLIORATION : Cache multi-niveaux avec TTL configurable
  private defaultProductsCache: { data: CJProduct[]; timestamp: number } | null = null;
  
  private readonly searchCache = new Map<string, { 
    data: CJProduct[]; 
    timestamp: number; 
    ttl: number;
    searchParams: any;
  }>();
  
  private readonly detailsCache = new Map<string, { 
    data: any; 
    timestamp: number; 
    ttl: number;
  }>();
  
  private readonly stockCache = new Map<string, { 
    data: any; 
    timestamp: number; 
    ttl: number;
  }>();
  
  private readonly categoriesCache = new Map<string, { 
    data: any; 
    timestamp: number; 
    ttl: number;
  }>();
  
  // Configuration des TTL (Time To Live) en millisecondes
  private readonly CACHE_TTL = {
    SEARCH: 5 * 60 * 1000,      // 5 minutes pour les recherches
    DETAILS: 15 * 60 * 1000,    // 15 minutes pour les détails
    STOCK: 2 * 60 * 1000,       // 2 minutes pour le stock (plus volatile)
    CATEGORIES: 60 * 60 * 1000,  // 1 heure pour les catégories
  };
  
  // Statistiques de cache
  private cacheStats = {
    searchHits: 0,
    searchMisses: 0,
    detailsHits: 0,
    detailsMisses: 0,
    stockHits: 0,
    stockMisses: 0,
    categoriesHits: 0,
    categoriesMisses: 0,
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (legacy)

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
      
      const config = await this.prisma.cJConfig.findFirst();
      if (!config?.enabled) {
        throw new Error('L\'intégration CJ Dropshipping est désactivée');
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
   * Obtenir les produits par défaut (sans filtre)
   */
  async getDefaultProducts(query: { pageNum?: number; pageSize?: number; countryCode?: string }): Promise<CJProduct[]> {
    this.logger.log('🔍 === DÉBUT getDefaultProducts ===');
    this.logger.log('📝 Paramètres:', JSON.stringify(query, null, 2));
    
    // 🚨 PROTECTION : Si le token est valide, utiliser la base de données locale
    const hasToken = this.cjApiClient['accessToken'];
    const tokenExpiry = this.cjApiClient['tokenExpiry'];
    const isTokenValid = hasToken && tokenExpiry && new Date() < tokenExpiry;
    
    if (isTokenValid) {
      this.logger.log('✅ Token CJ valide - Utilisation de la base de données locale');
      const existingProducts = await this.prisma.cJProductStore.count();
      
      if (existingProducts > 0) {
        this.logger.log(`📦 ${existingProducts} produits en base - Utilisation du cache local`);
        const cachedProducts = await this.prisma.cJProductStore.findMany({
          take: Number(query.pageSize) || 100,
          orderBy: { createdAt: 'desc' }
        });
        
        // Transformer en format CJProduct
        return cachedProducts.map(product => ({
          pid: product.cjProductId,
          productName: product.name,
          productNameEn: product.name,
          productSku: (product as any).productSku || product.cjProductId,
          sellPrice: Number(product.price) || Number(product.originalPrice) || 0,
          productImage: product.image,
          categoryName: product.category,
          description: product.description,
          variants: [],
          rating: 0,
          totalReviews: 0,
          weight: 0,
          dimensions: '',
          brand: '',
          tags: [],
          reviews: []
        }));
      } else {
        this.logger.log('📦 Aucun produit en base - Appel API CJ nécessaire');
      }
    } else {
      this.logger.log('🔑 Token CJ invalide ou expiré - Appel API CJ nécessaire');
    }
    
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
        pageSize: query.pageSize || 100,
        countryCode: query.countryCode,
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
   * Rechercher des produits avec cache amélioré
   */
  async searchProducts(query: CJProductSearchDto): Promise<CJProduct[]> {
    this.logger.log('🔍 === DÉBUT RECHERCHE PRODUITS CJ ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(query, null, 2));
    
    // Créer une clé de cache basée sur les paramètres de recherche
    const cacheKey = `search_${JSON.stringify(query)}`;
    
    // Vérifier le cache d'abord
    const cachedProducts = this.getCachedSearch(cacheKey);
    if (cachedProducts) {
      this.logger.log('🔍 === FIN RECHERCHE PRODUITS CJ (CACHE) ===');
      return cachedProducts;
    }
    
    try {
      this.logger.log('🔄 Initialisation du client CJ...');
      const client = await this.initializeClient();
      this.logger.log('✅ Client CJ initialisé avec succès');

      // ✅ CORRECTION: Recherche simple sans trop de filtres
      this.logger.log('� Appel API CJ avec paramètres minimaux...');
      
      const result = await client.searchProducts(query.keyword || query.productNameEn, {
        pageNum: query.pageNum || 1,
        pageSize: Math.min(query.pageSize || 20, 200), // Max 200 selon doc CJ
        categoryId: query.categoryId,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        countryCode: query.countryCode,
        // Utiliser les nouveaux paramètres de la doc CJ
        ...query.productType && { productType: query.productType },
        ...query.deliveryTime && { deliveryTime: query.deliveryTime },
        ...query.verifiedWarehouse && { verifiedWarehouse: query.verifiedWarehouse },
        ...query.startInventory && { startInventory: query.startInventory },
        ...query.endInventory && { endInventory: query.endInventory },
        ...query.isFreeShipping !== undefined && { isFreeShipping: query.isFreeShipping },
        ...query.searchType !== undefined && { searchType: query.searchType },
        ...query.sort && { sort: query.sort },
        ...query.orderBy && { orderBy: query.orderBy },
      });
      
      const products = result.list || [];
      
      // Mettre en cache les résultats
      this.setCachedSearch(cacheKey, products, query);
      
      this.logger.log(`📈 Résultat API CJ : ${products.length} produits reçus`);
      this.logger.log(`📊 Total disponible : ${result.total || 0} produits`);
      this.logger.log('🎉 Recherche terminée avec succès');
      this.logger.log('🔍 === FIN RECHERCHE PRODUITS CJ ===');
      
      return products;
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
   * Synchroniser les catégories CJ
   */
  async syncCategories(): Promise<any> {
    try {
      const client = await this.initializeClient();
      const categories = await client.getCategories();
      
      // Ici, vous pouvez ajouter une logique pour sauvegarder les catégories
      // dans votre base de données si nécessaire
      
      return {
        success: true,
        message: 'Catégories synchronisées avec succès',
        categories: categories
      };
    } catch (error) {
      this.logger.error('Erreur lors de la synchronisation des catégories:', error);
      throw error;
    }
  }

  // ===== MÉTHODES AVANCÉES POUR LES CATÉGORIES =====

  /**
   * Recherche avancée de catégories avec filtres et pagination
   */
  async searchCategories(params: {
    parentId?: string;
    level?: number;
    keyword?: string;
    countryCode?: string;
    includeEmpty?: boolean;
    includeProductCount?: boolean;
    pageNum?: number;
    pageSize?: number;
  }): Promise<any> {
    this.logger.log('🔍 === DÉBUT RECHERCHE CATÉGORIES AVANCÉE ===');
    this.logger.log('📝 Paramètres:', params);
    
    // Vérifier le cache d'abord
    const cacheKey = `categories_search_${JSON.stringify(params)}`;
    const cached = this.categoriesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL.CATEGORIES) {
      this.cacheStats.categoriesHits++;
      this.logger.log(`📦 Cache HIT pour recherche catégories: ${cacheKey}`);
      return cached.data;
    } else {
      this.cacheStats.categoriesMisses++;
    }

    try {
      const client = await this.initializeClient();
      const result = await client.searchCategories(params);
      
      // Mettre en cache
      this.categoriesCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.CATEGORIES
      });
      
      this.logger.log('🎉 Recherche catégories terminée avec succès');
      this.logger.log('🔍 === FIN RECHERCHE CATÉGORIES AVANCÉE ===');
      
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR RECHERCHE CATÉGORIES ===');
      this.logger.error('💥 Erreur:', error);
      this.logger.error('🔍 === FIN ERREUR RECHERCHE CATÉGORIES ===');
      throw error;
    }
  }

  /**
   * Obtenir les catégories populaires
   */
  async getPopularCategories(limit: number = 10): Promise<any[]> {
    this.logger.log(`🔥 Récupération des ${limit} catégories populaires...`);
    
    const cacheKey = `popular_categories_${limit}`;
    const cached = this.categoriesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL.CATEGORIES) {
      this.cacheStats.categoriesHits++;
      return cached.data;
    } else {
      this.cacheStats.categoriesMisses++;
    }

    try {
      const client = await this.initializeClient();
      const categories = await client.getPopularCategories(limit);
      
      // Mettre en cache
      this.categoriesCache.set(cacheKey, {
        data: categories,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.CATEGORIES
      });
      
      this.logger.log(`✅ ${categories.length} catégories populaires récupérées`);
      return categories;
    } catch (error) {
      this.logger.error('❌ Erreur récupération catégories populaires:', error);
      throw error;
    }
  }

  /**
   * Obtenir les sous-catégories d'une catégorie
   */
  async getSubCategories(parentId: string): Promise<any[]> {
    this.logger.log(`📂 Récupération des sous-catégories pour ${parentId}...`);
    
    const cacheKey = `sub_categories_${parentId}`;
    const cached = this.categoriesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL.CATEGORIES) {
      this.cacheStats.categoriesHits++;
      return cached.data;
    } else {
      this.cacheStats.categoriesMisses++;
    }

    try {
      const client = await this.initializeClient();
      const subCategories = await client.getSubCategories(parentId);
      
      // Mettre en cache
      this.categoriesCache.set(cacheKey, {
        data: subCategories,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.CATEGORIES
      });
      
      this.logger.log(`✅ ${subCategories.length} sous-catégories trouvées`);
      return subCategories;
    } catch (error) {
      this.logger.error('❌ Erreur récupération sous-catégories:', error);
      throw error;
    }
  }

  /**
   * Obtenir le chemin d'une catégorie (breadcrumb)
   */
  async getCategoryPath(categoryId: string): Promise<any[]> {
    this.logger.log(`🗂️ Récupération du chemin pour la catégorie ${categoryId}...`);
    
    const cacheKey = `category_path_${categoryId}`;
    const cached = this.categoriesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL.CATEGORIES) {
      this.cacheStats.categoriesHits++;
      return cached.data;
    } else {
      this.cacheStats.categoriesMisses++;
    }

    try {
      const client = await this.initializeClient();
      const path = await client.getCategoryPath(categoryId);
      
      // Mettre en cache
      this.categoriesCache.set(cacheKey, {
        data: path,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.CATEGORIES
      });
      
      this.logger.log(`✅ Chemin de ${path.length} niveaux récupéré`);
      return path;
    } catch (error) {
      this.logger.error('❌ Erreur récupération chemin catégorie:', error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un produit CJ avec cache (priorité: cache → base locale → API CJ)
   */
  async getProductDetails(productId: string): Promise<any> {
    try {
      this.logger.log(`📦 Récupération des détails du produit CJ: ${productId}`);
      
      // 1️⃣ Vérifier le cache d'abord
      const cachedDetails = this.getCachedDetails(productId);
      if (cachedDetails) {
        return cachedDetails;
      }
      
      // 2️⃣ Essayer de trouver le produit dans la base locale
      let localProduct = null;
      
      // Essayer par cjProductId 
      localProduct = await this.prisma.cJProductStore.findFirst({
        where: { cjProductId: productId }
      });
      
      // Si pas trouvé, essayer par productSku
      if (!localProduct) {
        localProduct = await this.prisma.cJProductStore.findFirst({
          where: { productSku: productId }
        });
      }
      
      // Si trouvé en local, utiliser ces données (plus rapide et fiable)
      if (localProduct) {
        this.logger.log(`✅ Produit trouvé en local: ${localProduct.name}`);
        const details = this.mapLocalProductToDetails(localProduct);
        
        // Mettre en cache les détails locaux
        this.setCachedDetails(productId, details);
        
        return details;
      }
      
      // 3️⃣ Si pas en local, faire l'appel API vers CJ avec l'endpoint correct
      this.logger.log(`🌐 Produit non trouvé en local, appel API CJ...`);
      
      const client = await this.initializeClient();
      // ✅ CORRECTION: Utiliser l'endpoint /product/detail/{pid} selon la doc CJ
      const cjProduct = await client.getProductDetails(productId);
      
      const details = this.mapApiProductToDetails(cjProduct);
      
      // Mettre en cache les détails API
      this.setCachedDetails(productId, details);
      
      this.logger.log(`✅ Détails récupérés depuis l'API CJ pour ${productId}`);
      
      return details;
      
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des détails du produit ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le stock des variantes d'un produit avec cache (selon doc CJ)
   */
  async getProductVariantStock(pid: string, variantId?: string, countryCode?: string): Promise<any> {
    try {
      this.logger.log(`📦 Récupération du stock des variantes: ${pid}`);
      this.logger.log(`📝 Paramètres: variantId=${variantId}, countryCode=${countryCode}`);
      
      // Créer une clé de cache incluant tous les paramètres
      const stockKey = `stock_${pid}_${variantId || 'all'}_${countryCode || 'default'}`;
      
      // Vérifier le cache d'abord
      const cachedStock = this.getCachedStock(stockKey);
      if (cachedStock) {
        return cachedStock;
      }
      
      const client = await this.initializeClient();
      const stockData = await client.getProductVariantStock(pid, variantId, countryCode);
      
      // Mettre en cache les données de stock
      this.setCachedStock(stockKey, stockData);
      
      this.logger.log(`✅ Stock des variantes récupéré pour ${pid}`);
      
      return stockData;
      
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du stock des variantes ${pid}:`, error);
      throw error;
    }
  }

  /**
   * Mapper un produit local vers la structure de détails
   */
  private mapLocalProductToDetails(localProduct: any): any {
    // Parser les variants JSON si c'est une string
    let variants = [];
    try {
      variants = typeof localProduct.variants === 'string' 
        ? JSON.parse(localProduct.variants) 
        : (localProduct.variants || []);
    } catch (e) {
      this.logger.warn('Erreur parsing variants:', e);
      variants = [];
    }

    return {
      pid: localProduct.cjProductId,
      productName: localProduct.name,
      productNameEn: localProduct.name,
      productSku: localProduct.productSku || localProduct.cjProductId,
      sellPrice: localProduct.price,
      productImage: this.extractFirstImage(localProduct.image),
      images: this.parseImageArray(localProduct.image),
      categoryName: localProduct.category,
      description: this.cleanDescription(localProduct.description || ''),
      variants: variants,
      rating: 0, // Pas de données de review locales
      totalReviews: 0,
      weight: localProduct.productWeight || 0,
      dimensions: localProduct.dimensions || '',
      brand: localProduct.brand || '',
      tags: localProduct.tags ? (typeof localProduct.tags === 'string' ? JSON.parse(localProduct.tags) : localProduct.tags) : [],
      reviews: [],
      
      // Champs supplémentaires de l'API disponibles en local
      productWeight: localProduct.productWeight,
      productUnit: localProduct.productUnit,
      productType: localProduct.productType,
      entryCode: null, // Pas stocké localement
      entryName: null,
      entryNameEn: null,
      materialName: null,
      materialNameEn: this.parseJsonField(localProduct.materialNameEn),
      materialKey: null,
      packingWeight: localProduct.packingWeight,
      packingName: null,
      packingNameEn: this.parseJsonField(localProduct.packingNameEn),
      packingKey: null,
      productKey: null,
      productKeyEn: localProduct.productKeyEn,
      productProSet: null,
      productProEnSet: null,
      addMarkStatus: null,
      suggestSellPrice: localProduct.suggestSellPrice,
      listedNum: localProduct.listedNum,
      status: '3', // Produit disponible
      supplierName: localProduct.supplierName || 'CJ Dropshipping',
      supplierId: null,
      customizationVersion: null,
      customizationJson1: null,
      customizationJson2: null,
      customizationJson3: null,
      customizationJson4: null,
      createrTime: localProduct.createrTime,
      productVideo: null
    };
  }

  /**
   * Mapper un produit de l'API CJ vers la structure de détails  
   */
  private mapApiProductToDetails(cjProduct: any): any {
    return {
      pid: cjProduct.pid,
      productName: cjProduct.productNameEn || cjProduct.productName,
      productNameEn: cjProduct.productNameEn || cjProduct.productName,
      productSku: cjProduct.productSku,
      sellPrice: cjProduct.sellPrice,
      productImage: Array.isArray(cjProduct.productImage) ? cjProduct.productImage[0] : cjProduct.productImage,
      images: Array.isArray(cjProduct.productImage) ? cjProduct.productImage : [cjProduct.productImage],
      categoryName: cjProduct.categoryName,
      description: this.cleanDescription(cjProduct.description || ''),
      variants: cjProduct.variants || [],
      rating: cjProduct.rating || 0,
      totalReviews: cjProduct.totalReviews || (cjProduct.reviews?.length || 0),
      weight: cjProduct.productWeight || cjProduct.weight || 0,
      dimensions: cjProduct.dimensions || '',
      brand: cjProduct.brand || '',
      tags: cjProduct.tags || [],
      reviews: cjProduct.reviews || [],
      
      // Champs supplémentaires de l'API
      productWeight: cjProduct.productWeight,
      productUnit: cjProduct.productUnit,
      productType: cjProduct.productType,
      categoryId: cjProduct.categoryId,
      entryCode: cjProduct.entryCode,
      entryName: cjProduct.entryName,
      entryNameEn: cjProduct.entryNameEn,
      materialName: cjProduct.materialName,
      materialNameEn: cjProduct.materialNameEn,
      materialKey: cjProduct.materialKey,
      packingWeight: cjProduct.packingWeight,
      packingName: cjProduct.packingName,
      packingNameEn: cjProduct.packingNameEn,
      packingKey: cjProduct.packingKey,
      productKey: cjProduct.productKey,
      productKeyEn: cjProduct.productKeyEn,
      productProSet: cjProduct.productProSet,
      productProEnSet: cjProduct.productProEnSet,
      addMarkStatus: cjProduct.addMarkStatus,
      suggestSellPrice: cjProduct.suggestSellPrice,
      listedNum: cjProduct.listedNum,
      status: cjProduct.status,
      supplierName: cjProduct.supplierName,
      supplierId: cjProduct.supplierId,
      customizationVersion: cjProduct.customizationVersion,
      customizationJson1: cjProduct.customizationJson1,
      customizationJson2: cjProduct.customizationJson2,
      customizationJson3: cjProduct.customizationJson3,
      customizationJson4: cjProduct.customizationJson4,
      createrTime: cjProduct.createrTime,
      productVideo: cjProduct.productVideo
    };
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
      
      // Transformer les données pour l'interface
      return cjProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        // Utiliser les vraies données stockées
        pid: product.cjProductId,
        productName: product.name,
        productNameEn: product.name,
        productSku: (product as any).productSku || product.cjProductId,
        productImage: product.image,
        sellPrice: product.price,
        categoryName: product.category,
        // Ajouter toutes les données détaillées
        weight: (product as any).productWeight || 0,
        dimensions: (product as any).dimensions || '',
        brand: (product as any).brand || '',
        tags: (product as any).tags ? JSON.parse((product as any).tags) : [],
        reviews: (product as any).reviews ? JSON.parse((product as any).reviews) : [],
        rating: 0,
        totalReviews: (product as any).reviews ? JSON.parse((product as any).reviews).length : 0,
        variants: (product as any).variants ? JSON.parse((product as any).variants) : [],
        status: product.status,
        isFavorite: product.isFavorite || false,
        cjProductId: product.cjProductId,
        // Ajouter les champs techniques
        productWeight: (product as any).productWeight,
        packingWeight: (product as any).packingWeight,
        productType: (product as any).productType,
        productUnit: (product as any).productUnit,
        productKeyEn: (product as any).productKeyEn,
        materialNameEn: (product as any).materialNameEn,
        packingNameEn: (product as any).packingNameEn,
        suggestSellPrice: (product as any).suggestSellPrice,
        listedNum: (product as any).listedNum,
        supplierName: (product as any).supplierName,
        createrTime: (product as any).createrTime,
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
   * Fonction pour nettoyer le HTML de la description
   */
  private cleanDescription(htmlDescription: string): string {
    if (!htmlDescription) return 'N/A';
    
    // Supprimer les balises HTML
    let cleaned = htmlDescription
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par des espaces
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/&quot;/g, '"') // Remplacer &quot; par "
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim(); // Supprimer les espaces en début/fin
    
    // Limiter à 200 caractères pour l'affichage
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 200) + '...';
    }
    
    return cleaned;
  }

  // ===== MÉTHODES DE SYNCHRONISATION =====
  
  async syncProducts(filters?: any): Promise<{ synced: number; errors: number }> {
    // TODO: Implémenter la synchronisation des produits
    return { synced: 0, errors: 0 };
  }

  async getInventory(vid: string): Promise<{ success: boolean; stock: any[] }> {
    // TODO: Implémenter la récupération du stock
    return { success: false, stock: [] };
  }

  async syncInventory(productIds: string[]): Promise<{ updated: number; errors: number }> {
    // TODO: Implémenter la synchronisation de l'inventaire
    return { updated: 0, errors: 0 };
  }

  /**
   * Extraire la première image d'un champ image (peut être string JSON ou URL simple)
   */
  private extractFirstImage(imageField: any): string {
    if (!imageField) return '';
    
    // Si c'est déjà un array
    if (Array.isArray(imageField)) {
      return imageField[0] || '';
    }
    
    // Si c'est une string qui ressemble à du JSON
    if (typeof imageField === 'string') {
      if (imageField.startsWith('[')) {
        try {
          const parsed = JSON.parse(imageField);
          return Array.isArray(parsed) ? (parsed[0] || '') : imageField;
        } catch (e) {
          return imageField;
        }
      }
      return imageField;
    }
    
    return String(imageField);
  }

  /**
   * Parser le champ image en array d'URLs
   */
  private parseImageArray(imageField: any): string[] {
    if (!imageField) return [];
    
    // Si c'est déjà un array
    if (Array.isArray(imageField)) {
      return imageField;
    }
    
    // Si c'est une string qui ressemble à du JSON
    if (typeof imageField === 'string') {
      if (imageField.startsWith('[')) {
        try {
          const parsed = JSON.parse(imageField);
          return Array.isArray(parsed) ? parsed : [imageField];
        } catch (e) {
          return [imageField];
        }
      }
      return [imageField];
    }
    
    return [String(imageField)];
  }

  /**
   * Parser les champs JSON qui peuvent être des chaînes
   */
  private parseJsonField(field: any): any {
    if (!field) return null;
    
    if (typeof field === 'string' && field.startsWith('[')) {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed.join(', ') : parsed;
      } catch (e) {
        return field;
      }
    }
    
    return field;
  }

  // ✅ NOUVELLES MÉTHODES DE CACHE AMÉLIORÉES

  /**
   * Obtenir une entrée du cache de recherche
   */
  private getCachedSearch(cacheKey: string): CJProduct[] | null {
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      this.cacheStats.searchHits++;
      this.logger.log(`📦 Cache HIT pour recherche: ${cacheKey}`);
      return cached.data;
    }
    
    if (cached) {
      this.searchCache.delete(cacheKey); // Nettoyer le cache expiré
    }
    
    this.cacheStats.searchMisses++;
    this.logger.log(`❌ Cache MISS pour recherche: ${cacheKey}`);
    return null;
  }

  /**
   * Mettre en cache une recherche
   */
  private setCachedSearch(cacheKey: string, products: CJProduct[], searchParams: any): void {
    this.searchCache.set(cacheKey, {
      data: products,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL.SEARCH,
      searchParams
    });
    this.logger.log(`💾 Mise en cache recherche: ${cacheKey} (${products.length} produits)`);
  }

  /**
   * Obtenir les détails d'un produit depuis le cache
   */
  private getCachedDetails(pid: string): any | null {
    const cached = this.detailsCache.get(pid);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      this.cacheStats.detailsHits++;
      this.logger.log(`📦 Cache HIT pour détails: ${pid}`);
      return cached.data;
    }
    
    if (cached) {
      this.detailsCache.delete(pid);
    }
    
    this.cacheStats.detailsMisses++;
    return null;
  }

  /**
   * Mettre en cache les détails d'un produit
   */
  private setCachedDetails(pid: string, details: any): void {
    this.detailsCache.set(pid, {
      data: details,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL.DETAILS
    });
    this.logger.log(`💾 Mise en cache détails: ${pid}`);
  }

  /**
   * Obtenir le stock depuis le cache
   */
  private getCachedStock(stockKey: string): any | null {
    const cached = this.stockCache.get(stockKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      this.cacheStats.stockHits++;
      this.logger.log(`📦 Cache HIT pour stock: ${stockKey}`);
      return cached.data;
    }
    
    if (cached) {
      this.stockCache.delete(stockKey);
    }
    
    this.cacheStats.stockMisses++;
    return null;
  }

  /**
   * Mettre en cache le stock
   */
  private setCachedStock(stockKey: string, stock: any): void {
    this.stockCache.set(stockKey, {
      data: stock,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL.STOCK
    });
    this.logger.log(`💾 Mise en cache stock: ${stockKey}`);
  }

  /**
   * Nettoyer tous les caches expirés
   */
  public cleanExpiredCache(): void {
    const now = Date.now();
    
    // Nettoyer le cache de recherche
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.searchCache.delete(key);
      }
    }
    
    // Nettoyer le cache des détails
    for (const [key, value] of this.detailsCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.detailsCache.delete(key);
      }
    }
    
    // Nettoyer le cache du stock
    for (const [key, value] of this.stockCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.stockCache.delete(key);
      }
    }
    
    // Nettoyer le cache des catégories
    for (const [key, value] of this.categoriesCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.categoriesCache.delete(key);
      }
    }
    
    this.logger.log('🧹 Nettoyage des caches expirés terminé');
  }

  /**
   * Obtenir les statistiques du cache
   */
  public getCacheStats(): any {
    return {
      ...this.cacheStats,
      cacheSizes: {
        search: this.searchCache.size,
        details: this.detailsCache.size,
        stock: this.stockCache.size,
        categories: this.categoriesCache.size
      },
      hitRates: {
        search: this.cacheStats.searchHits / (this.cacheStats.searchHits + this.cacheStats.searchMisses) * 100,
        details: this.cacheStats.detailsHits / (this.cacheStats.detailsHits + this.cacheStats.detailsMisses) * 100,
        stock: this.cacheStats.stockHits / (this.cacheStats.stockHits + this.cacheStats.stockMisses) * 100,
        categories: this.cacheStats.categoriesHits / (this.cacheStats.categoriesHits + this.cacheStats.categoriesMisses) * 100,
      }
    };
  }
}

