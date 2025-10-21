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
  private readonly baseURL = 'https://developers.cjdropshipping.cn/api2.0/v1';
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private lastRequestTime = 0;
  private requestCount = 0;
  private rateLimitResetTime = 0;
  private config: CJConfig | null = null;

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
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    try {
      this.logger.log('Rafraîchissement du token...');
      
      const response = await this.axiosInstance.post('/user/refresh', {
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
   * Gérer le rate limiting selon le tier
   */
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Rate limits selon le tier
    const rateLimits = {
      free: { requests: 1, window: 1000 }, // 1 req/s
      plus: { requests: 2, window: 1000 }, // 2 req/s
      prime: { requests: 4, window: 1000 }, // 4 req/s
      advanced: { requests: 6, window: 1000 }, // 6 req/s
    };

    const limit = rateLimits[this.config.tier || 'free'];
    const minInterval = limit.window / limit.requests;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      this.logger.debug(`Rate limiting: attente de ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Effectuer une requête avec gestion automatique des tokens et rate limiting
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<CJResponse<T>> {
    // Gérer le rate limiting
    await this.handleRateLimit();

    // Vérifier et rafraîchir le token si nécessaire
    if (!this.accessToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      await this.refreshAccessToken();
    }

    const headers: any = {
      'CJ-Access-Token': this.accessToken,
    };

    if (this.config.platformToken) {
      headers['platformToken'] = this.config.platformToken;
    }

    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
        headers,
      });

      return response.data;
    } catch (error) {
      if (error instanceof CJAPIError && error.code === 401) {
        // Token expiré, essayer de rafraîchir
        this.logger.warn('Token expiré, tentative de rafraîchissement...');
        await this.refreshAccessToken();
        
        // Retry avec le nouveau token
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
    const params = {
      keyword,
      pageNum: options.pageNum || 1,
      pageSize: options.pageSize || 20,
      categoryId: options.categoryId,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      countryCode: options.countryCode || 'US',
      sortBy: options.sortBy || 'relevance',
    };

    const response = await this.makeRequest('GET', '/product/search', { params });
    return response.data as any;
  }

  /**
   * Obtenir les détails d'un produit
   */
  async getProductDetails(pid: string): Promise<CJProduct> {
    const response = await this.makeRequest('GET', `/product/detail/${pid}`);
    return response.data as any;
  }

  /**
   * Obtenir les variantes d'un produit
   */
  async getProductVariants(pid: string): Promise<CJVariant[]> {
    const response = await this.makeRequest('GET', `/product/variant/${pid}`);
    return response.data as any;
  }

  /**
   * Obtenir le stock d'un produit
   */
  async getProductStock(vid: string): Promise<any> {
    const response = await this.makeRequest('GET', `/product/stock/${vid}`);
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
   * Obtenir les catégories
   */
  async getCategories(): Promise<any[]> {
    const response = await this.makeRequest('GET', '/product/category');
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

