import type { CJConfig } from '@/types/cj.types';
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// CJConfig and CJWebhookLog types are imported from shared types to ensure consistency across the app

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

// CJWebhookLog type is imported from shared types (`@/types/cj.types`) above

export const useCJDropshipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: `${API_URL}/cj-dropshipping`,
  });

  // Intercepteur pour ajouter le token à chaque requête
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Aucun token d\'authentification trouvé');
    }
    return config;
  });

  // Intercepteur pour gérer les erreurs d'authentification
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Erreur d\'authentification:', error.response.data);
        // Optionnel: rediriger vers la page de connexion
        // window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );

  // ===== CONFIGURATION =====

  const getConfig = async (): Promise<CJConfig> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/config');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de la configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (config: Partial<CJConfig>): Promise<CJConfig> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/config', config);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (): Promise<{
    success: boolean;
    message: string;
    categories?: any[];
    products?: any[];
    categoriesCount?: number;
    productsCount?: number;
  }> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/config/test');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du test de connexion');
      return {
        success: false,
        message: err.response?.data?.message || 'Erreur lors du test de connexion'
      };
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = async (): Promise<{
    connected: boolean;
    tier: string;
    lastSync: string | null;
    apiLimits: {
      qps: string;
      loginPer5min: number;
      refreshPerMin: number;
    };
    tips: string[];
  }> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/status');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du statut');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== PRODUITS =====

  const getDefaultProducts = async (params?: { pageNum?: number; pageSize?: number; countryCode?: string }): Promise<CJProduct[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products/default', { params: params || {} });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits par défaut');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: any): Promise<CJProduct[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products/search', { params: query });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche de produits');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (pid: string): Promise<CJProduct> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/${pid}/details`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des détails du produit');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductVariantStock = async (pid: string, variantId?: string, countryCode?: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (variantId) params.append('variantId', variantId);
      if (countryCode) params.append('countryCode', countryCode);
      
      const queryString = params.toString();
      const url = `/products/${pid}/variant-stock${queryString ? `?${queryString}` : ''}`;
      
      const { data } = await api.get(url);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du stock des variantes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importProduct = async (pid: string, categoryId?: string, margin?: number): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/products/${pid}/import`, {
        categoryId,
        margin,
      });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'import du produit');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async (filters?: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/products/sync', filters);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la synchronisation des produits');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== INVENTAIRE =====

  const getInventory = async (vid: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/inventory/${vid}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'inventaire');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async (productIds?: string[]): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/inventory/sync', { productIds });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la synchronisation de l\'inventaire');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== COMMANDES =====

  const createOrder = async (orderData: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/orders', orderData);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = async (orderId: string): Promise<CJOrder> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du statut de la commande');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncOrderStatuses = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/orders/sync');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la synchronisation des commandes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== LOGISTIQUE =====

  const calculateShipping = async (data: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await api.post('/logistics/calculate', data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du calcul des frais de port');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTracking = async (trackNumber: string): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/logistics/tracking/${trackNumber}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du tracking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== WEBHOOKS =====

  const configureWebhooks = async (
    enable: boolean,
    callbackUrl?: string,
    types?: ('product' | 'stock' | 'order' | 'logistics')[]
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/webhooks/configure', {
        enable,
        callbackUrl,
        types: types || ['product', 'stock', 'order', 'logistics']
      });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la configuration des webhooks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWebhookStatus = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/webhooks/status');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du statut des webhooks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWebhookLogs = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/webhooks/logs');
      // L'API retourne { logs, total, page, limit }
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des logs de webhooks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== STATISTIQUES =====

  const getStats = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/stats');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les catégories CJ Dropshipping
  const getCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/categories');
      // Extraire le tableau categories de la réponse { success, categories, total, message }
      return data.categories || data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des catégories CJ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer l'arbre des catégories CJ Dropshipping
  const getCategoriesTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/categories/tree');
      // Extraire le tableau tree de la réponse { success, tree, message }
      return data.tree || data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'arbre des catégories CJ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour synchroniser les catégories CJ Dropshipping
  const syncCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/categories/sync');
      // Extraire le tableau categories de la réponse { success, categories, total, message }
      return data.categories || data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la synchronisation des catégories CJ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== NOUVELLES MÉTHODES DE CATÉGORIES AVANCÉES =====

  // Fonction pour rechercher des catégories avec filtres
  const searchCategories = async (params: {
    keyword?: string;
    level?: number;
    language?: string;
    page?: number;
    pageSize?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.level) queryParams.append('level', params.level.toString());
      if (params.language) queryParams.append('language', params.language);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const { data } = await api.get(`/categories/search?${queryParams.toString()}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche de catégories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les catégories populaires
  const getPopularCategories = async (limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      const { data } = await api.get(`/categories/popular${queryParams}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des catégories populaires');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les sous-catégories
  const getSubCategories = async (parentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/categories/${parentId}/subcategories`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des sous-catégories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer le chemin d'une catégorie (breadcrumb)
  const getCategoryPath = async (categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/categories/${categoryId}/path`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du chemin de la catégorie');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/sync-favorites');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la synchronisation des favoris');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== GESTION DU CACHE =====

  const getCacheStats = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/cache/stats');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques du cache');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanExpiredCache = async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/cache/clean');
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du nettoyage du cache');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getConfig,
    updateConfig,
    testConnection,
    getConnectionStatus,
    getDefaultProducts,
    searchProducts,
    getProductDetails,
    importProduct,
    syncProducts,
    getInventory,
    syncInventory,
    createOrder,
    getOrderStatus,
    syncOrderStatuses,
    calculateShipping,
    getTracking,
    configureWebhooks,
    getWebhookStatus,
    getWebhookLogs,
    getStats,
    getCategories,
    getCategoriesTree,
    syncCategories,
    syncFavorites,
    getProductVariantStock,
    // ✨ NOUVELLES MÉTHODES DE CACHE
    getCacheStats,
    cleanExpiredCache,
    // ✨ NOUVELLES MÉTHODES DE CATÉGORIES AVANCÉES
    searchCategories,
    getPopularCategories,
    getSubCategories,
    getCategoryPath,
  };
};

