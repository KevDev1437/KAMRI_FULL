import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CJAPIClient } from '../cj-api-client';
import { CJProductSearchDto } from '../dto/cj-product-search.dto';
import { CJProduct } from '../interfaces/cj-product.interface';

@Injectable()
export class CJProductService {
  private readonly logger = new Logger(CJProductService.name);

  constructor(
    private prisma: PrismaService,
    private cjApiClient: CJAPIClient
  ) {}

  // Cache simple pour éviter les requêtes répétées
  private defaultProductsCache: { data: CJProduct[]; timestamp: number } | null = null;
  private searchCache: Map<string, { data: CJProduct[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
   * Rechercher des produits
   */
  async searchProducts(query: CJProductSearchDto): Promise<CJProduct[]> {
    this.logger.log('🔍 === DÉBUT RECHERCHE PRODUITS CJ ===');
    this.logger.log('📝 Paramètres de recherche:', JSON.stringify(query, null, 2));
    
    // 🔍 RECHERCHE CJ DROPSHIPPING : Toujours sur l'API CJ pour découvrir de nouveaux produits
    this.logger.log('🔍 Recherche sur l\'API CJ Dropshipping...');
    
    // 🚨 PROTECTION : Éviter les appels inutiles pendant le rate limiting
    const hasToken = this.cjApiClient['accessToken'];
    const tokenExpiry = this.cjApiClient['tokenExpiry'];
    const isTokenValid = hasToken && tokenExpiry && new Date() < tokenExpiry;
    
    if (!isTokenValid) {
      this.logger.log('🔑 Token CJ invalide - Connexion requise');
      throw new Error('Token CJ invalide - Veuillez vous reconnecter');
    }
    
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
          
          const result = await client.searchProducts(query.keyword, {
            pageNum: page,
            pageSize: 100, // 100 produits par page (limite API CJ)
            countryCode: query.countryCode,
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
      
      // Filtrage côté serveur
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

  /**
   * Obtenir les détails d'un produit CJ
   */
  async getProductDetails(pid: string): Promise<any> {
    try {
      this.logger.log(`📦 Récupération des détails du produit CJ: ${pid}`);
      
      const client = await this.initializeClient();
      
      // Utiliser la même logique que le script test
      const result = await client.makeRequest('GET', `/product/query?pid=${pid}`);
      
      if (result.code !== 200) {
        this.logger.error(`❌ Erreur détails produit ${pid}:`, result.message);
        throw new Error(result.message || 'Erreur lors de la récupération des détails du produit');
      }
      
      const cjProduct = result.data;
      this.logger.log(`✅ Détails récupérés pour ${pid}`);
      
      // Mapper les données selon la structure attendue par le frontend
      const mappedProduct = {
        pid: (cjProduct as any).pid,
        productName: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        productNameEn: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        productSku: (cjProduct as any).productSku,
        sellPrice: (cjProduct as any).sellPrice,
        productImage: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage[0] : (cjProduct as any).productImage,
        images: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage : [(cjProduct as any).productImage],
        categoryName: (cjProduct as any).categoryName,
        description: this.cleanDescription((cjProduct as any).description || ''),
        variants: (cjProduct as any).variants || [],
        rating: (cjProduct as any).rating || 0,
        totalReviews: (cjProduct as any).totalReviews || (cjProduct as any).reviews?.length || 0,
        weight: (cjProduct as any).productWeight || (cjProduct as any).weight || 0,
        dimensions: (cjProduct as any).dimensions || '',
        brand: (cjProduct as any).brand || '',
        tags: (cjProduct as any).tags || [],
        reviews: (cjProduct as any).reviews || [],
        // Champs supplémentaires de l'API
        productWeight: (cjProduct as any).productWeight,
        productUnit: (cjProduct as any).productUnit,
        productType: (cjProduct as any).productType,
        categoryId: (cjProduct as any).categoryId,
        entryCode: (cjProduct as any).entryCode,
        entryName: (cjProduct as any).entryName,
        entryNameEn: (cjProduct as any).entryNameEn,
        materialName: (cjProduct as any).materialName,
        materialNameEn: (cjProduct as any).materialNameEn,
        materialKey: (cjProduct as any).materialKey,
        packingWeight: (cjProduct as any).packingWeight,
        packingName: (cjProduct as any).packingName,
        packingNameEn: (cjProduct as any).packingNameEn,
        packingKey: (cjProduct as any).packingKey,
        productKey: (cjProduct as any).productKey,
        productKeyEn: (cjProduct as any).productKeyEn,
        productProSet: (cjProduct as any).productProSet,
        productProEnSet: (cjProduct as any).productProEnSet,
        addMarkStatus: (cjProduct as any).addMarkStatus,
        suggestSellPrice: (cjProduct as any).suggestSellPrice,
        listedNum: (cjProduct as any).listedNum,
        status: (cjProduct as any).status,
        supplierName: (cjProduct as any).supplierName,
        supplierId: (cjProduct as any).supplierId,
        customizationVersion: (cjProduct as any).customizationVersion,
        customizationJson1: (cjProduct as any).customizationJson1,
        customizationJson2: (cjProduct as any).customizationJson2,
        customizationJson3: (cjProduct as any).customizationJson3,
        customizationJson4: (cjProduct as any).customizationJson4,
        createrTime: (cjProduct as any).createrTime,
        productVideo: (cjProduct as any).productVideo
      };
      
      return mappedProduct;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des détails du produit ${pid}:`, error);
      throw error;
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
}

