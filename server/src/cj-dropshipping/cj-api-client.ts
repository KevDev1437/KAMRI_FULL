import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export class CJAPIError extends Error {
  constructor(
    public code: number,
    message: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'CJAPIError';
  }
}

export interface CJConfig {
  email: string;
  apiKey: string;
  tier?: 'free' | 'plus' | 'prime' | 'advanced';
  platformToken?: string;
  debug?: boolean;
}

export interface CJResponse<T = any> {
  code: number;
  result: boolean;
  message: string;
  data: T;
  requestId?: string;
}

export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  productImage: string;
  sellPrice: number;
  variants: CJVariant[];
  categoryName: string;
  description: string;
  weight: number;
  dimensions: string;
  brand: string;
  tags: string[];
  reviews: CJReview[];
  rating: number;
  totalReviews: number;
}

export interface CJVariant {
  vid: string;
  variantSku: string;
  variantSellPrice: number;
  variantKey: string;
  variantValue: string;
  stock: number;
  images: string[];
}

export interface CJReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export interface CJOrder {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  shippingAddress: any;
  products: any[];
  trackNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CJFreightOption {
  logisticName: string;
  shippingTime: string;
  freight: number;
  currency: string;
}

@Injectable()
export class CJAPIClient {
  private readonly logger = new Logger(CJAPIClient.name);
  private readonly baseURL = 'https://developers.cjdropshipping.com/api2.0/v1';
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private lastRequestTime = 0;
  private requestCount = 0;
  private rateLimitResetTime = 0;
  private config: CJConfig | null = null;
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue: boolean = false;
  public tier: 'free' | 'plus' | 'prime' | 'advanced' = 'free';

  constructor(
    private configService: ConfigService
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const { code, message, requestId } = error.response.data;
          throw new CJAPIError(code, message, requestId);
        }
        throw error;
      }
    );
  }

  /**
   * Initialiser la configuration CJ
   */
  setConfig(config: CJConfig): void {
    this.config = config;
    this.tier = config.tier || 'free';
    this.logger.log(`Configuration CJ mise à jour - Niveau: ${this.tier}`);
  }

  /**
   * Vérifier si la configuration est disponible
   */
  private checkConfig(): void {
    if (!this.config) {
      throw new Error('Configuration CJ Dropshipping non initialisée');
    }
  }

  /**
   * Authentification avec l'API CJ
   */
  async login(): Promise<void> {
    try {
      this.checkConfig();
      this.logger.log('Authentification avec CJ Dropshipping...');
      this.logger.log('Config:', JSON.stringify(this.config, null, 2));
      
      const response = await this.axiosInstance.post('/authentication/getAccessToken', {
        email: this.config!.email,
        apiKey: this.config!.apiKey,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      this.logger.log('Response:', JSON.stringify(response.data, null, 2));
      const { data } = response.data;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.tokenExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 jours

      this.logger.log('Authentification réussie');
    } catch (error) {
      this.logger.error('Erreur d\'authentification:', error);
      throw error;
    }
  }

  /**
   * Rafraîchir le token d'accès
   */
  /**
   * Calcule le délai optimal basé sur le niveau utilisateur
   */
  private getOptimalDelay(): number {
    const tier = this.tier || 'free';
    
    switch (tier) {
      case 'free':
        return 1200; // 1.2s pour Free (1 req/s)
      case 'plus':
        return 600;  // 0.6s pour Plus (2 req/s)
      case 'prime':
        return 300;  // 0.3s pour Prime (4 req/s)
      case 'advanced':
        return 200;  // 0.2s pour Advanced (6 req/s)
      default:
        return 1200; // Par défaut, Free
    }
  }

  /**
   * Calcule le délai de retry après rate limit
   */
  private getRetryDelay(): number {
    const tier = this.tier || 'free';
    
    switch (tier) {
      case 'free':
        return 15000; // 15s pour Free
      case 'plus':
        return 10000; // 10s pour Plus
      case 'prime':
        return 8000;  // 8s pour Prime
      case 'advanced':
        return 5000;  // 5s pour Advanced
      default:
        return 15000; // Par défaut, Free
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    try {
      this.logger.log('Rafraîchissement du token...');
      
      const response = await this.axiosInstance.post('/authentication/refreshAccessToken', {
        refreshToken: this.refreshToken,
      });

      const { data } = response.data;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.tokenExpiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

      this.logger.log('Token rafraîchi avec succès');
    } catch (error) {
      this.logger.error('Erreur de rafraîchissement du token:', error);
      // Si le refresh échoue, on relogin
      await this.login();
    }
  }

  /**
   * Gérer la queue des requêtes pour éviter les requêtes simultanées
   */
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Attendre entre chaque requête
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Gérer le rate limiting selon le tier
   */
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Rate limits selon le tier - STRICT pour respecter l'API CJ
    const rateLimits = {
      free: { requests: 1, window: 1500 }, // 1 req/1.5s pour être sûr
      plus: { requests: 1, window: 1200 }, // 1 req/1.2s
      prime: { requests: 1, window: 1000 }, // 1 req/1s
      advanced: { requests: 1, window: 800 }, // 1 req/0.8s
    };

    const limit = rateLimits[this.config.tier || 'free'];
    const minInterval = limit.window / limit.requests;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      this.logger.log(`⏳ Rate limiting: attente de ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Effectuer une requête avec gestion automatique des tokens et rate limiting
   */
  public async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<CJResponse<T>> {
    this.logger.log('🔍 === DÉBUT makeRequest ===');
    this.logger.log('📝 Paramètres:', { method, endpoint, hasData: !!data });
    
    // Attendre que la queue soit vide avant de faire une nouvelle requête
    while (this.isProcessingQueue) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Gérer le rate limiting
    await this.handleRateLimit();
    this.logger.log('✅ Rate limiting géré');

    // Vérifier et rafraîchir le token si nécessaire
    if (!this.accessToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      this.logger.log('🔄 Token expiré ou manquant, rafraîchissement...');
      await this.refreshAccessToken();
    }
    this.logger.log('✅ Token valide');

    const headers: any = {
      'CJ-Access-Token': this.accessToken,
    };

    if (this.config.platformToken) {
      headers['platformToken'] = this.config.platformToken;
    }

    this.logger.log('📡 Headers configurés:', Object.keys(headers));
    this.logger.log('🌐 URL complète:', `${this.baseURL}${endpoint}`);

    try {
      this.logger.log('📡 Envoi de la requête...');
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
        headers,
      });

      this.logger.log('✅ Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataType: typeof response.data
      });
      this.logger.log('🔍 === FIN makeRequest ===');
      
      // ✅ PAUSE INTELLIGENTE basée sur le niveau utilisateur
      const delay = this.getOptimalDelay();
      this.logger.log(`⏳ Pause de ${delay}ms respectée (niveau: ${this.tier})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return response.data;
    } catch (error) {
      this.logger.error('❌ === ERREUR makeRequest ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      
      // Gérer l'erreur 429 (Too Many Requests) avec retry intelligent
      if (error instanceof CJAPIError && (error.code === 429 || error.code === 1600200)) {
        const retryDelay = this.getRetryDelay();
        this.logger.warn(`⏳ Rate limit atteint (${error.code}), attente de ${retryDelay}ms avant retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        this.logger.log('🔄 Retry après rate limit...');
        try {
          const retryResponse = await this.axiosInstance.request({
            method,
            url: endpoint,
            data,
            headers: {
              'CJ-Access-Token': this.accessToken,
              ...(this.config.platformToken && { platformToken: this.config.platformToken }),
            },
          });
          this.logger.log('✅ Retry réussi après rate limit');
          return retryResponse.data;
        } catch (retryError) {
          this.logger.error('❌ Retry échoué après rate limit:', retryError);
          throw retryError;
        }
      }
      
      // Gestion des erreurs d'authentification
      if (error instanceof CJAPIError && (error.code === 401 || error.code === 1600001 || error.code === 1600003)) {
        this.logger.warn(`🔑 Erreur d'authentification (${error.code}), tentative de rafraîchissement...`);
        await this.refreshAccessToken();
        
        // Retry avec le nouveau token
        this.logger.log('🔄 Retry avec nouveau token...');
        const retryResponse = await this.axiosInstance.request({
          method,
          url: endpoint,
          data,
          headers: {
            'CJ-Access-Token': this.accessToken,
            ...(this.config.platformToken && { platformToken: this.config.platformToken }),
          },
        });

        return retryResponse.data;
      }
      throw error;
    }
  }

  /**
   * Obtenir les paramètres du compte
   */
  async getSettings(): Promise<any> {
    return this.makeRequest('GET', '/user/settings');
  }

  /**
   * Obtenir le solde du compte
   */
  async getBalance(): Promise<any> {
    return this.makeRequest('GET', '/user/balance');
  }

  /**
   * Rechercher des produits
   */
  async searchProducts(
    keyword?: string,
    options: {
      pageNum?: number;
      pageSize?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      countryCode?: string;
      sortBy?: string;
    } = {}
  ): Promise<{ list: CJProduct[]; total: number; pageNum: number; pageSize: number }> {
    this.logger.log('🔍 === DÉBUT CLIENT API CJ searchProducts ===');
    this.logger.log('📝 Paramètres reçus:', { keyword, options });
    
    const params = {
      keyword,
      pageNum: options.pageNum || 1,
      pageSize: Math.max(options.pageSize || 20, 10), // Minimum 10 selon la doc CJ
      categoryId: options.categoryId,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      countryCode: options.countryCode, // ← CORRECTION: Pas de pays par défaut
      sortBy: options.sortBy || 'relevance',
    };

    this.logger.log('📊 Paramètres finaux:', JSON.stringify(params, null, 2));

    // Utiliser des paramètres moins restrictifs pour obtenir plus de résultats
    const requestParams = {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      productName: params.keyword, // ← CORRECTION: Utiliser productName au lieu de keyword
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      categoryId: params.categoryId,
      searchType: 0, // 0=All products selon la doc CJ
      // Paramètres moins restrictifs pour obtenir plus de résultats
      productType: 'ORDINARY_PRODUCT', // Produits ordinaires
      // Désactiver les filtres trop restrictifs
      // isFreeShipping: 1, // Commenté pour inclure tous les produits
      // verifiedWarehouse: 1, // Commenté pour inclure tous les produits
      sort: 'desc', // Tri décroissant
      orderBy: 'createAt', // Trier par date de création
    };
    
    this.logger.log('📡 Paramètres de requête API:', JSON.stringify(requestParams, null, 2));
    this.logger.log('🌐 URL complète: GET /product/list');
    
    try {
      // Construire l'URL avec les paramètres de requête
      const queryString = new URLSearchParams();
      Object.entries(requestParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      
      const endpoint = `/product/list?${queryString.toString()}`;
      this.logger.log('🌐 Endpoint final:', endpoint);
      
      const response = await this.makeRequest('GET', endpoint);
      
      this.logger.log('✅ Réponse API CJ reçue');
      this.logger.log('📊 Structure de la réponse:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasList: !!(response.data as any)?.list,
        listLength: (response.data as any)?.list?.length || 0,
        total: (response.data as any)?.total || 0
      });
      
      const result = response.data as any;
      this.logger.log('🎉 Client API CJ searchProducts terminé avec succès');
      this.logger.log('🔍 === FIN CLIENT API CJ searchProducts ===');
      
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR CLIENT API CJ searchProducts ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('🔍 === FIN ERREUR CLIENT API CJ searchProducts ===');
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un produit
   */
  async getProductDetails(pid: string): Promise<CJProduct> {
    this.logger.log('🔍 === DÉBUT getProductDetails ===');
    this.logger.log('📝 PID:', pid);
    
    try {
      // Construire l'URL avec les paramètres de requête
      const endpoint = `/product/query?pid=${pid}`;
      this.logger.log('🌐 Endpoint final:', endpoint);
      
      const response = await this.makeRequest('GET', endpoint);
      
      this.logger.log('✅ Réponse API CJ reçue');
      this.logger.log('📊 Structure de la réponse:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasProduct: !!(response.data as any)?.productNameEn
      });
      
      const result = response.data as any;
      this.logger.log('🎉 getProductDetails terminé avec succès');
      this.logger.log('🔍 === FIN getProductDetails ===');
      
      return result;
    } catch (error) {
      this.logger.error('❌ === ERREUR getProductDetails ===');
      this.logger.error('💥 Erreur détaillée:', error);
      this.logger.error('📊 Type d\'erreur:', typeof error);
      this.logger.error('📊 Message d\'erreur:', error instanceof Error ? error.message : String(error));
      this.logger.error('🔍 === FIN ERREUR getProductDetails ===');
      throw error;
    }
  }

  /**
   * Obtenir les variantes d'un produit
   */
  async getProductVariants(pid: string): Promise<CJVariant[]> {
    const response = await this.makeRequest('GET', `/product/variant/query`, { params: { pid } });
    return response.data as any;
  }

  /**
   * Obtenir le stock d'un produit
   */
  async getProductStock(vid: string): Promise<any> {
    const response = await this.makeRequest('GET', `/produit/stock/queryByVid`, { params: { vid } });
    return response.data;
  }

  /**
   * Obtenir les avis d'un produit
   */
  async getProductReviews(pid: string): Promise<CJReview[]> {
    const response = await this.makeRequest('GET', `/product/review/${pid}`);
    return response.data as any;
  }

 

  /**
   * Créer une commande (V3)
   */
  async createOrderV3(orderData: {
    orderNumber: string;
    shippingCountryCode: string;
    shippingCountry: string;
    shippingProvince?: string;
    shippingCity: string;
    shippingAddress: string;
    shippingCustomerName: string;
    shippingPhone: string;
    logisticName: string;
    fromCountryCode?: string;
    platform?: string;
    products: Array<{
      vid: string;
      quantity: number;
    }>;
  }): Promise<CJOrder> {
    const response = await this.makeRequest('POST', '/order/createOrderV3', orderData);
    return response.data as any;
  }

  /**
   * Obtenir le statut d'une commande
   */
  async getOrderStatus(orderId: string): Promise<CJOrder> {
    const response = await this.makeRequest('GET', `/order/orderStatus/${orderId}`);
    return response.data as any;
  }

  /**
   * Obtenir la liste des commandes
   */
  async getOrders(options: {
    pageNum?: number;
    pageSize?: number;
    orderStatus?: string;
    startTime?: string;
    endTime?: string;
  } = {}): Promise<{ list: CJOrder[]; total: number }> {
    const params = {
      pageNum: options.pageNum || 1,
      pageSize: options.pageSize || 20,
      orderStatus: options.orderStatus,
      startTime: options.startTime,
      endTime: options.endTime,
    };

    const response = await this.makeRequest('GET', '/order/orderList', { params });
    return response.data as any;
  }

  /**
   * Calculer les frais de port
   */
  async calculateFreight(
    fromCountryCode: string,
    toCountryCode: string,
    products: Array<{ vid: string; quantity: number }>
  ): Promise<CJFreightOption[]> {
    const response = await this.makeRequest('POST', '/logistics/calculateFreight', {
      fromCountryCode,
      toCountryCode,
      products,
    });
    return response.data as any;
  }

  /**
   * Obtenir le tracking d'un colis
   */
  async getTracking(trackNumber: string): Promise<any> {
    const response = await this.makeRequest('GET', `/logistics/track/${trackNumber}`);
    return response.data;
  }

  /**
   * Obtenir les méthodes de livraison disponibles
   */
  async getLogisticsMethods(): Promise<any[]> {
    const response = await this.makeRequest('GET', '/logistics/logisticsList');
    return response.data as any;
  }

  /**
   * Configurer les webhooks
   */
  async configureWebhooks(webhookUrl: string, events: string[]): Promise<any> {
    const response = await this.makeRequest('POST', '/webhook/configure', {
      webhookUrl,
      events,
    });
    return response.data;
  }

  /**
   * Obtenir les logs de webhooks
   */
  async getWebhookLogs(): Promise<any[]> {
    const response = await this.makeRequest('GET', '/webhook/logs');
    return response.data as any;
  }

  /**
   * Méthodes utilitaires
   */

  /**
   * Rechercher des produits avec gestion du stock
   */
  async searchProductsWithStock(
    keyword: string,
    options: any = {}
  ): Promise<CJProduct[]> {
    const products = await this.searchProducts(keyword, options);
    
    // Enrichir avec les informations de stock
    const enrichedProducts = await Promise.all(
      products.list.map(async (product) => {
        try {
          const stockInfo = await this.getProductStock(product.variants[0]?.vid);
          return {
            ...product,
            stockInfo,
          };
        } catch (error) {
          this.logger.warn(`Impossible de récupérer le stock pour ${product.pid}:`, error);
          return product;
        }
      })
    );

    return enrichedProducts;
  }

  /**
   * Obtenir un produit complet avec toutes ses informations
   */
  async getProductWithStock(pid: string): Promise<CJProduct> {
    const product = await this.getProductDetails(pid);
    const variants = await this.getProductVariants(pid);
    const reviews = await this.getProductReviews(pid);
    
    return {
      ...product,
      variants,
      reviews,
    };
  }

  /**
   * Récupérer toutes les catégories
   */
  async getCategories(): Promise<any[]> {
    this.logger.log('🏷️ Récupération des catégories CJ...');
    
    try {
      const response = await this.makeRequest('GET', '/product/getCategory');
      
      if (response.code === 200) {
        const categories = Array.isArray(response.data) ? response.data : [];
        this.logger.log(`✅ ${categories.length} catégories récupérées`);
        return categories;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      this.logger.error('❌ Erreur récupération catégories:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'arbre des catégories (utilise le même endpoint que getCategories)
   */
  async getCategoriesTree(): Promise<any[]> {
    this.logger.log('🌳 Récupération de l\'arbre des catégories CJ...');
    
    try {
      // L'endpoint /product/getCategory retourne déjà la structure hiérarchique
      const response = await this.makeRequest('GET', '/product/getCategory');
      
      if (response.code === 200) {
        const tree = Array.isArray(response.data) ? response.data : [];
        this.logger.log(`✅ Arbre des catégories récupéré`);
        return tree;
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération de l\'arbre');
      }
    } catch (error) {
      this.logger.error('❌ Erreur récupération arbre:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', '/user/logout');
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.logger.log('Déconnexion réussie');
    } catch (error) {
      this.logger.warn('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Vérifier si le client est connecté
   */
  isConnected(): boolean {
    return !!this.accessToken && 
           (!this.tokenExpiry || new Date() < this.tokenExpiry);
  }

  /**
   * Obtenir les informations de connexion
   */
  getConnectionInfo(): {
    connected: boolean;
    tokenExpiry?: Date;
    tier: string;
  } {
    return {
      connected: this.isConnected(),
      tokenExpiry: this.tokenExpiry || undefined,
      tier: this.config.tier || 'free',
    };
  }
}

