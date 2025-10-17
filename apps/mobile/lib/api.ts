// Utiliser l'IP réelle au lieu de localhost pour l'app mobile
const API_BASE_URL = 'http://192.168.129.10:3001';

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  originalPrice?: number;
  image?: string;
  category?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  status: string;
  stock: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private async fetch(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<any>> {
    console.log('🚀 [MOBILE API] Appel API:', `${API_BASE_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('📡 [MOBILE API] Réponse reçue:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      const data = await response.json();
      console.log('📦 [MOBILE API] Données:', data);

      if (response.ok) {
        console.log('✅ [MOBILE API] Succès');
        return { data };
      } else {
        console.log('❌ [MOBILE API] Erreur API:', data.message);
        return { error: data.message || 'Erreur API' };
      }
    } catch (error) {
      console.log('❌ [MOBILE API] Erreur réseau:', error);
      return { error: 'Erreur réseau' };
    }
  }

  // Produits
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.fetch('/api/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.fetch(`/api/products/${id}`);
  }

  // Catégories
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.fetch('/api/categories');
  }
}

export const apiClient = new ApiClient();
