import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CJConfig {
  id: string;
  email: string;
  apiKey: string;
  tier: string;
  enabled: boolean;
  connected: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
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

export interface CJWebhookLog {
  id: string;
  type: string;
  messageId: string;
  payload: any;
  processed: boolean;
  error?: string;
  createdAt: Date;
}

export const useCJDropshipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: `${API_URL}/api/cj-dropshipping`,
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

  const testConnection = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/config/test');
      return data.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du test de connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===== PRODUITS =====

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
      const { data } = await api.get(`/products/${pid}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des détails du produit');
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

  const configureWebhooks = async (enable: boolean): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/webhooks/configure', { enable });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la configuration des webhooks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getWebhookLogs = async (): Promise<CJWebhookLog[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/webhooks/logs');
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

  return {
    loading,
    error,
    getConfig,
    updateConfig,
    testConnection,
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
    getWebhookLogs,
    getStats,
  };
};

