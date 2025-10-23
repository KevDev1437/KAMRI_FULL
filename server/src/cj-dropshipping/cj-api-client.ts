import axios, { AxiosInstance } from 'axios';

export class CJAPIClient {
  private api: AxiosInstance;
  private readonly baseUrl = process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1';
  private readonly apiKey = process.env.CJ_API_KEY;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': this.apiKey,
        'User-Agent': 'KAMRI-Admin/1.0'
      }
    });

    // Intercepteur pour les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ Erreur API CJ:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async getCategories() {
    try {
      const response = await this.api.get('/product/getCategoryList');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération catégories CJ:', error);
      throw new Error('Impossible de récupérer les catégories CJ');
    }
  }

  async searchProducts(params: any) {
    try {
      console.log('🔗 [CJ-API] Tentative de recherche avec paramètres:', params);
      console.log('🔑 [CJ-API] Clé API configurée:', !!this.apiKey);
      console.log('🔑 [CJ-API] Clé API valeur:', this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'NON CONFIGURÉE');
      console.log('🌐 [CJ-API] URL de base:', this.baseUrl);
      
      if (!this.apiKey) {
        throw new Error('Clé API CJ non configurée');
      }
      
      const response = await this.api.get('/product/list', { params });
      console.log('✅ [CJ-API] Réponse reçue:', response.data);
      return response.data.data || { list: [], total: 0 };
    } catch (error: any) {
      console.error('❌ [CJ-API] Erreur recherche produits:', error);
      console.error('❌ [CJ-API] Détails erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.code === 'ENOTFOUND') {
        throw new Error('ENOTFOUND: Impossible de résoudre l\'adresse de l\'API CJ');
      } else if (error.response?.status === 401) {
        throw new Error('401: Clé API invalide - Vérifiez votre clé API CJ Dropshipping');
      } else if (error.response?.status === 403) {
        throw new Error('403: Accès refusé - Vérifiez vos permissions CJ');
      } else {
        throw new Error(`Erreur API CJ: ${error.message}`);
      }
    }
  }

  async getProductDetails(pid: string) {
    try {
      const response = await this.api.get(`/product/queryProductById`, {
        params: { pid }
      });
      return response.data.data;
    } catch (error) {
      console.error(`❌ Erreur détails produit CJ ${pid}:`, error);
      throw new Error(`Impossible de récupérer les détails du produit ${pid}`);
    }
  }

  async getProductStock(pid: string, countryCode: string) {
    try {
      const response = await this.api.get('/product/queryProductInventory', {
        params: { pid, countryCode }
      });
      return response.data.data;
    } catch (error) {
      console.error(`❌ Erreur stock produit CJ ${pid}:`, error);
      throw new Error(`Impossible de récupérer le stock du produit ${pid}`);
    }
  }

  async testConnection() {
    try {
      console.log('🔍 [CJ-API-TEST] Début du test de connexion...');
      console.log(`🔑 [CJ-API-TEST] Clé API: ${this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'NON CONFIGURÉE'}`);
      console.log(`🌐 [CJ-API-TEST] URL de base: ${this.baseUrl}`);
      
      // Test avec un endpoint qui nécessite une authentification
      const response = await this.api.get('/product/list', {
        params: { pageNum: 1, pageSize: 1 }
      });
      
      console.log(`📊 [CJ-API-TEST] Status HTTP: ${response.status}`);
      console.log(`📊 [CJ-API-TEST] Headers de réponse:`, response.headers);
      console.log(`📊 [CJ-API-TEST] Données reçues:`, response.data);
      
      // Vérifier que la réponse contient des données valides
      if (response.data && response.data.success !== false) {
        console.log('✅ [CJ-API-TEST] Connexion réussie !');
        return true;
      }
      console.log('❌ [CJ-API-TEST] Réponse invalide');
      return false;
    } catch (error: any) {
      console.error('❌ [CJ-API-TEST] Erreur test connexion CJ:', error);
      console.error('❌ [CJ-API-TEST] Type d\'erreur:', error.constructor.name);
      console.error('❌ [CJ-API-TEST] Message d\'erreur:', error.message);
      console.error('❌ [CJ-API-TEST] Status HTTP:', error.response?.status);
      console.error('❌ [CJ-API-TEST] Headers d\'erreur:', error.response?.headers);
      console.error('❌ [CJ-API-TEST] Données d\'erreur:', error.response?.data);
      
      // Si c'est une erreur 401, la clé API est invalide
      if (error.response?.status === 401) {
        console.error('❌ [CJ-API-TEST] Clé API CJ invalide (401 Unauthorized)');
        return false;
      }
      
      return false;
    }
  }
}