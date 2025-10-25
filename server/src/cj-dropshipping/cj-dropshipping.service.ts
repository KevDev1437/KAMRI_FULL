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

  // 🧹 Fonction pour nettoyer le HTML de la description
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

  // 🎨 Fonction pour extraire les couleurs des variantes
  private extractColorsFromVariants(variants: any[]): string {
    if (!variants || variants.length === 0) return 'N/A';
    
    const colors = [...new Set(variants.map(v => {
      const name = v.variantNameEn || v.variantName || '';
      // Extraire la couleur (première partie avant le tiret)
      const color = name.split('-')[0]?.trim();
      return color;
    }).filter(Boolean))];
    
    return colors.join(', ');
  }

  // 📏 Fonction pour extraire les tailles des variantes
  private extractSizesFromVariants(variants: any[]): string {
    if (!variants || variants.length === 0) return 'N/A';
    
    const sizes = [...new Set(variants.map(v => {
      const name = v.variantNameEn || v.variantName || '';
      // Extraire la taille (deuxième partie après le tiret)
      const size = name.split('-')[1]?.trim();
      return size;
    }).filter(Boolean))];
    
    return sizes.join(', ');
  }

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
      
      // 🔇 LOGS RÉDUITS : Éviter le spam de logs
      this.logger.log('🔍 Vérification connexion CJ...');
      
      // Vérifier si le client est connecté
      let connected = false;
      let tier = config.tier || 'free';
      let errorMessage = '';
      
      try {
        if (!config.email || !config.apiKey) {
          errorMessage = 'Email ou API Key manquant';
          this.logger.log('❌ Credentials manquants');
        } else if (!config.enabled) {
          errorMessage = 'Intégration CJ désactivée';
          this.logger.log('❌ Intégration désactivée');
        } else {
          const client = await this.initializeClient();
          connected = true;
          
          // Vérifier le token
          const hasToken = this.cjApiClient['accessToken'];
          const tokenExpiry = this.cjApiClient['tokenExpiry'];
          const isTokenValid = hasToken && tokenExpiry && new Date() < tokenExpiry;
          
          this.logger.log('🔑 État du token:', {
            hasToken: !!hasToken,
            tokenExpiry: tokenExpiry,
            isTokenValid: isTokenValid
          });
          
          this.logger.log('✅ Client CJ connecté (sans synchronisation automatique)');
        }
      } catch (error) {
        connected = false;
        errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error('❌ Erreur de connexion:', errorMessage);
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
        tips: connected ? [
          'Connexion CJ active - Vous pouvez rechercher des produits',
          'Synchronisez vos favoris pour les importer',
          'Gérez vos commandes via l\'interface CJ'
        ] : [
          errorMessage || 'Problème de connexion détecté',
          'Vérifiez vos credentials CJ',
          'Activez l\'intégration si nécessaire',
          'Testez la connexion avec le bouton "Tester la connexion"'
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
          productSku: product.cjProductId, // Utiliser le PID comme SKU temporairement
          sellPrice: Number(product.price) || Number(product.originalPrice) || 0, // Utiliser le prix de vente si disponible
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
   * Mapper un produit CJ vers le modèle KAMRI
   */
  private async mapCJProduct(
    cjProduct: CJProduct, 
    categoryId?: string, 
    margin?: number
  ): Promise<any> {
    const finalPrice = cjProduct.sellPrice; // Utiliser le prix original de CJ
    
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
   * Obtenir les détails d'un produit CJ (comme dans le script test)
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
      
      // 🔍 LOGS DÉTAILLÉS POUR DEBUG
      this.logger.log('📦 === DONNÉES BRUTES RÉCUPÉRÉES ===');
      this.logger.log('📝 Nom:', (cjProduct as any).productNameEn || (cjProduct as any).productName);
      this.logger.log('📦 SKU:', (cjProduct as any).productSku);
      this.logger.log('💰 Prix:', (cjProduct as any).sellPrice);
      this.logger.log('🖼️ Image (type):', typeof (cjProduct as any).productImage);
      this.logger.log('🖼️ Image (contenu):', (cjProduct as any).productImage);
      this.logger.log('🏷️ Catégorie:', (cjProduct as any).categoryName);
      this.logger.log('📏 Poids:', (cjProduct as any).productWeight);
      this.logger.log('📦 Poids emballage:', (cjProduct as any).packingWeight);
      this.logger.log('📐 Dimensions:', (cjProduct as any).dimensions);
      this.logger.log('🏪 Statut:', (cjProduct as any).status);
      this.logger.log('🏷️ Type:', (cjProduct as any).productType);
      this.logger.log('🏭 Fournisseur:', (cjProduct as any).supplierName);
      this.logger.log('📊 Lists:', (cjProduct as any).listedNum);
      this.logger.log('💰 Prix suggéré:', (cjProduct as any).suggestSellPrice);
      this.logger.log('📅 Date création:', (cjProduct as any).createrTime);
      this.logger.log('🎨 Variantes (nombre):', (cjProduct as any).variants?.length || 0);
      this.logger.log('⭐ Avis (nombre):', (cjProduct as any).reviews?.length || 0);
      this.logger.log('📋 Description (longueur):', (cjProduct as any).description?.length || 0);
      
      // Mapper les données selon la structure attendue par le frontend
      const mappedProduct = {
        pid: (cjProduct as any).pid,
        productName: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        productNameEn: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        productSku: (cjProduct as any).productSku,
        sellPrice: (cjProduct as any).sellPrice,
        productImage: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage[0] : (cjProduct as any).productImage,
        // Ajouter toutes les images pour le frontend
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
        // Champs supplémentaires de l'API (avec accès sécurisé)
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
      
      // 🔍 LOGS DU PRODUIT MAPPÉ FINAL
      this.logger.log('📦 === PRODUIT MAPPÉ FINAL ===');
      this.logger.log('📝 Nom final:', mappedProduct.productName);
      this.logger.log('📦 SKU final:', mappedProduct.productSku);
      this.logger.log('💰 Prix final:', mappedProduct.sellPrice);
      this.logger.log('🖼️ Image finale:', mappedProduct.productImage);
      this.logger.log('🏷️ Catégorie finale:', mappedProduct.categoryName);
      this.logger.log('📏 Poids final:', mappedProduct.productWeight);
      this.logger.log('📦 Poids emballage final:', mappedProduct.packingWeight);
      this.logger.log('🏪 Statut final:', mappedProduct.status);
      this.logger.log('🏷️ Type final:', mappedProduct.productType);
      this.logger.log('🏭 Fournisseur final:', mappedProduct.supplierName);
      this.logger.log('📊 Lists final:', mappedProduct.listedNum);
      this.logger.log('💰 Prix suggéré final:', mappedProduct.suggestSellPrice);
      this.logger.log('📅 Date création finale:', mappedProduct.createrTime);
      this.logger.log('🎨 Variantes finales (nombre):', mappedProduct.variants?.length || 0);
      this.logger.log('⭐ Avis finaux (nombre):', mappedProduct.reviews?.length || 0);
      this.logger.log('📋 Description finale (longueur):', mappedProduct.description?.length || 0);
      this.logger.log('📦 === FIN LOGS DEBUG ===');
      
      return mappedProduct;
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
        // Ajouter les champs manquants pour la compatibilité avec l'API CJ
        pid: product.cjProductId,
        productName: product.name,
        productNameEn: product.name,
        productSku: product.cjProductId, // Utiliser le PID comme SKU temporaire
        productImage: product.image, // Image principale
        sellPrice: product.price,
        categoryName: product.category,
        weight: 0,
        dimensions: '',
        brand: '',
        tags: [],
        reviews: [],
        rating: 0,
        totalReviews: 0,
        variants: [],
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
    if (!categoryName) {
      // Créer une catégorie par défaut si pas de nom
      const defaultCategory = await this.prisma.category.findFirst({
        where: { name: 'CJ Dropshipping' }
      });
      
      if (defaultCategory) {
        return defaultCategory.id;
      }
      
      return await this.prisma.category.create({
        data: {
          name: 'CJ Dropshipping',
          description: 'Catégorie par défaut pour les produits CJ',
        },
      }).then(cat => cat.id);
    }

    // Nettoyer le nom de catégorie des caractères spéciaux
    const cleanCategoryName = categoryName
      .replace(/，/g, ',')  // Remplacer la virgule chinoise par une virgule normale
      .replace(/[^\w\s,.-]/g, '')  // Supprimer les caractères spéciaux sauf lettres, chiffres, espaces, virgules, points, tirets
      .trim();

    // Utiliser toLowerCase() pour une recherche case-insensitive universelle
    const lowerCategoryName = cleanCategoryName.toLowerCase();
    
    const categories = await this.prisma.category.findMany();
    
    // Recherche exacte d'abord
    let category = categories.find(
      c => c.name.toLowerCase() === lowerCategoryName
    );

    // Si pas trouvé, recherche partielle (pour gérer les variations)
    if (!category) {
      category = categories.find(
        c => c.name.toLowerCase().includes(lowerCategoryName) || 
             lowerCategoryName.includes(c.name.toLowerCase())
      );
    }

    if (category) {
      this.logger.log(`✅ Catégorie trouvée: ${categoryName} → ${category.name}`);
      return category.id;
    }

    // Créer une nouvelle catégorie avec le nom nettoyé
    this.logger.log(`➕ Création nouvelle catégorie: ${cleanCategoryName}`);
    const newCategory = await this.prisma.category.create({
      data: {
        name: cleanCategoryName,
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
      
      // 🔄 RÉCUPÉRATION SIMPLIFIÉE : Maximum 10 favoris (1 page)
      this.logger.log('📦 Récupération des favoris CJ (limité à 10)...');
        
        const result = await client.makeRequest('GET', '/product/myProduct/query', {
        pageNumber: 1,
          pageSize: 10 // Limite fixe de l'API CJ
        });
        
      if (result.code !== 200) {
        this.logger.error('❌ Erreur récupération favoris:', result.message);
        return {
          success: false,
          products: [],
          total: 0
        };
      }
      
      const data = result.data as any;
      const totalRecords = data.totalRecords || 0;
      const favorites = data.content || [];
      
      this.logger.log(`📦 Page 1: ${favorites.length} favoris récupérés`);
      this.logger.log(`📊 Total API: ${totalRecords} favoris`);
      
      // Utiliser les données récupérées
      const responseData = {
        totalRecords: totalRecords,
        content: favorites
      };
      
      // Traitement des données récupérées
      if (responseData.totalRecords > 0) {
        this.logger.log(`✅ ${responseData.totalRecords} favoris trouvés`);
        
        // Transformer les données selon la structure CJ (myProduct/query API)
        const transformedProducts = responseData.content.map((product: any) => {
          return {
            pid: product.productId,
            productName: product.nameEn || product.productName,
            productNameEn: product.nameEn || product.productName,
            productSku: product.sku || product.productSku,
            sellPrice: product.sellPrice,
            productImage: product.bigImage || product.productImage,
            categoryName: product.defaultArea || product.categoryName || 'CJ Dropshipping',
            description: this.cleanDescription(product.description || ''),
            variants: product.variants || [],
            rating: product.rating || 0,
            totalReviews: product.totalReviews || product.reviews?.length || 0,
            weight: product.weight || product.productWeight || 0,
            dimensions: product.dimensions || '',
            brand: product.brand || '',
            tags: product.tags || [],
            reviews: product.reviews || [],
            // Informations supplémentaires comme dans le script test
            productWeight: product.productWeight,
            packingWeight: product.packingWeight,
            productType: product.productType,
            productUnit: product.productUnit,
            productKeyEn: product.productKeyEn,
            materialNameEn: product.materialNameEn,
            packingNameEn: product.packingNameEn,
            suggestSellPrice: product.suggestSellPrice,
            listedNum: product.listedNum,
            supplierName: product.supplierName,
            createrTime: product.createrTime,
            status: product.status
          };
        });
        
        return {
          success: true,
          products: transformedProducts,
          total: responseData.totalRecords
        };
      } else {
        this.logger.log('ℹ️ Aucun favori trouvé');
        return {
          success: true,
          products: [],
          total: 0
        };
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

      // 🔧 CORRECTION : Dédoublonner une dernière fois avant import
      const uniqueFavorites = favorites.products.filter((product: any, index: number, self: any[]) => 
        index === self.findIndex(p => p.pid === product.pid)
      );
      
      // 🔍 DEBUG : Analyser les doublons
      this.logger.log(`🔍 Analyse des doublons:`);
      this.logger.log(`📊 Total avant dédoublonnage: ${favorites.products.length}`);
      this.logger.log(`📊 Total après dédoublonnage: ${uniqueFavorites.length}`);
      
      // Vérifier les PIDs pour identifier les doublons
      const pids = favorites.products.map(p => p.pid);
      const uniquePids = [...new Set(pids)];
      this.logger.log(`📊 PIDs uniques: ${uniquePids.length}, PIDs totaux: ${pids.length}`);
      
      if (pids.length !== uniquePids.length) {
        this.logger.log(`⚠️ DOUBLONS DÉTECTÉS dans les PIDs`);
        const duplicates = pids.filter((pid, index) => pids.indexOf(pid) !== index);
        this.logger.log(`🔄 PIDs dupliqués: ${duplicates.join(', ')}`);
      }
      
      console.log(`🔍 Favoris finaux dédoublonnés: ${favorites.products.length} → ${uniqueFavorites.length}`);
      
      this.logger.log(`📦 ${uniqueFavorites.length} favoris uniques trouvés, début de l'import...`);
      console.log(`🚀 === DÉBUT IMPORT DES FAVORIS ===`);
      console.log(`📊 Total favoris à importer: ${uniqueFavorites.length}`);
      
      let synced = 0;
      const errors = [];

      // Importer chaque favori vers KAMRI (marquer comme favori)
      for (let i = 0; i < uniqueFavorites.length; i++) {
        const favorite = uniqueFavorites[i];
        this.logger.log(`🔄 Traitement favori ${i + 1}/${uniqueFavorites.length}: ${favorite.nameEn || favorite.productName || 'Sans nom'}`);
        
        console.log(`\n📦 === FAVORI ${i + 1}/${uniqueFavorites.length} ===`);
        console.log(`📝 Nom: ${favorite.nameEn || favorite.productName || 'Sans nom'}`);
        console.log(`📝 SKU: ${favorite.productSku}`);
        console.log(`📝 ProductId: ${favorite.pid}`);
        console.log(`📝 Prix: ${favorite.sellPrice}`);
        console.log(`📝 Image: ${favorite.productImage ? '✅' : '❌'}`);
        
        try {
          this.logger.log(`📝 Import du favori: PID=${favorite.pid}, SKU=${favorite.productSku}`);
          const importResult = await this.importProduct(favorite.pid, undefined, 0, true); // isFavorite = true, marge = 0
          synced++;
          console.log(`✅ Favori ${i + 1} importé avec succès`);
          this.logger.log(`✅ Favori ${i + 1} importé avec succès: ${favorite.nameEn || favorite.productName}`);
          
          // Attendre entre les imports pour éviter le rate limiting
          if (i < uniqueFavorites.length - 1) {
            console.log(`⏳ Attente 3 secondes avant le prochain import...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          errors.push(favorite.productSku || favorite.pid);
          console.log(`❌ Erreur import favori ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
          this.logger.error(`❌ Erreur import favori ${i + 1} (${favorite.productSku || favorite.pid}):`, error);
          
          // Attendre même en cas d'erreur pour éviter le rate limiting
          if (i < uniqueFavorites.length - 1) {
            console.log(`⏳ Attente 3 secondes après erreur...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }

      this.logger.log('📊 === RÉSULTAT SYNCHRONISATION ===');
      this.logger.log(`✅ Favoris importés: ${synced}`);
      this.logger.log(`❌ Erreurs: ${errors.length}`);
      
      console.log(`\n🎉 === RÉSULTAT FINAL SYNCHRONISATION ===`);
      console.log(`✅ Favoris importés avec succès: ${synced}`);
      console.log(`❌ Erreurs d'import: ${errors.length}`);
      console.log(`📊 Total traités: ${uniqueFavorites.length}`);
      console.log(`📊 Taux de succès: ${((synced / uniqueFavorites.length) * 100).toFixed(1)}%`);
      
      if (errors.length > 0) {
        console.log(`\n❌ Erreurs détaillées:`);
        errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
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
  async importProduct(pid: string, categoryId?: string, margin: number = 0, isFavorite: boolean = false): Promise<any> {
    this.logger.log('🔍 === DÉBUT IMPORT PRODUIT CJ ===');
    this.logger.log('📝 Paramètres:', { pid, categoryId, margin, isFavorite });
    
    // 🚨 VALIDATION : Rejeter les PID invalides
    if (!pid || pid === 'imported' || pid === 'available' || pid === 'selected' || pid === 'pending') {
      this.logger.error(`❌ PID invalide reçu: "${pid}" - Ignoré pour éviter les appels API inutiles`);
      this.logger.error('🔍 Stack trace:', new Error().stack);
      return {
        success: false,
        message: `PID invalide: "${pid}" - Ce n'est pas un ID de produit CJ valide`,
        product: null
      };
    }
    
    try {
      this.logger.log('🔗 Initialisation du client CJ...');
      const client = await this.initializeClient();
      
      this.logger.log('📦 Récupération des détails du produit CJ...');
      
      // 🔧 UTILISER LA MÊME LOGIQUE QUE getProductDetails
      const result = await client.makeRequest('GET', `/product/query?pid=${pid}`);
      
      if (result.code !== 200) {
        this.logger.error(`❌ Erreur détails produit ${pid}:`, result.message);
        throw new Error(result.message || 'Erreur lors de la récupération des détails du produit');
      }
      
      const cjProduct = result.data;
      
      // 🔍 LOGS DÉTAILLÉS POUR L'IMPORT
      this.logger.log('📦 === DONNÉES BRUTES RÉCUPÉRÉES POUR IMPORT ===');
      this.logger.log('📝 Nom:', (cjProduct as any).productNameEn || (cjProduct as any).productName);
      this.logger.log('📦 SKU:', (cjProduct as any).productSku);
      this.logger.log('💰 Prix:', (cjProduct as any).sellPrice);
      this.logger.log('🖼️ Image (type):', typeof (cjProduct as any).productImage);
      this.logger.log('🖼️ Image (contenu):', (cjProduct as any).productImage);
      this.logger.log('🏷️ Catégorie:', (cjProduct as any).categoryName);
      this.logger.log('📏 Poids:', (cjProduct as any).productWeight);
      this.logger.log('📦 Poids emballage:', (cjProduct as any).packingWeight);
      this.logger.log('📐 Dimensions:', (cjProduct as any).dimensions);
      this.logger.log('🏪 Statut:', (cjProduct as any).status);
      this.logger.log('🏷️ Type:', (cjProduct as any).productType);
      this.logger.log('🏭 Fournisseur:', (cjProduct as any).supplierName);
      this.logger.log('📊 Lists:', (cjProduct as any).listedNum);
      this.logger.log('💰 Prix suggéré:', (cjProduct as any).suggestSellPrice);
      this.logger.log('📅 Date création:', (cjProduct as any).createrTime);
      this.logger.log('🎨 Variantes (nombre):', (cjProduct as any).variants?.length || 0);
      this.logger.log('⭐ Avis (nombre):', (cjProduct as any).reviews?.length || 0);
      this.logger.log('📋 Description (longueur):', (cjProduct as any).description?.length || 0);
      
      this.logger.log('📦 Produit CJ récupéré:', {
        name: (cjProduct as any).productNameEn || (cjProduct as any).productName,
        price: (cjProduct as any).sellPrice,
        category: (cjProduct as any).categoryName,
        hasImage: !!(cjProduct as any).productImage
      });
      
      // Créer le produit KAMRI
      // 🔧 CORRECTION : Gérer les prix avec plage (ex: "2.4-12.81")
      let originalPrice = 0;
      const priceStr = String((cjProduct as any).sellPrice || '');
      console.log(`💰 Prix brut reçu: "${priceStr}" (type: ${typeof (cjProduct as any).sellPrice})`);
      
      if (priceStr.includes('-')) {
        // Prendre le prix minimum de la plage
        const priceRange = priceStr.split('-');
        originalPrice = Number(priceRange[0]) || 0;
        console.log(`💰 Prix plage détectée: ${priceRange[0]} → ${originalPrice}`);
      } else {
        originalPrice = Number(priceStr) || 0;
        console.log(`💰 Prix simple: ${priceStr} → ${originalPrice}`);
      }
      const sellingPrice = originalPrice; // Utiliser le prix original de CJ
      
      this.logger.log('💰 Prix calculés:', {
        originalPrice,
        sellingPrice
      });
      
      // ✅ SAUVEGARDER SEULEMENT LA CATÉGORIE EXTERNE (comme les produits statiques)
      this.logger.log('🔍 Catégorie externe CJ:', (cjProduct as any).categoryName);
      
      this.logger.log('💾 Sauvegarde dans la base de données...');
      // ✅ NOUVELLE APPROCHE : STOCKER DANS LE MAGASIN CJ (upsert pour éviter les doublons)
      const cjStoreProduct = await this.prisma.cJProductStore.upsert({
        where: { cjProductId: pid },
        update: {
          name: (cjProduct as any).productNameEn || (cjProduct as any).productName,
          description: (cjProduct as any).description,
          price: sellingPrice,
          originalPrice: originalPrice,
          image: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage[0] : (cjProduct as any).productImage,
          category: (cjProduct as any).categoryName,
          status: 'available', // Remettre en disponible si déjà importé
          isFavorite: isFavorite, // Marquer comme favori si spécifié
        },
        create: {
          cjProductId: pid,
          name: (cjProduct as any).productNameEn || (cjProduct as any).productName,
          description: (cjProduct as any).description,
          price: sellingPrice,
          originalPrice: originalPrice,
          image: Array.isArray((cjProduct as any).productImage) ? (cjProduct as any).productImage[0] : (cjProduct as any).productImage,
          category: (cjProduct as any).categoryName,
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
