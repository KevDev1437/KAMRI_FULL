const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
  status: string;
  badge?: string;
  stock: number;
  sales: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Authentification
  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
        }
        return { data };
      } else {
        return { error: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  async register(email: string, name: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, role: 'user' }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
        }
        return { data };
      } else {
        return { error: data.message || 'Erreur d\'inscription' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Méthode générique pour les appels API
  private async fetchPublic(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        return { error: data.message || 'Erreur API' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        return { error: data.message || 'Erreur API' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  // Produits
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.fetchPublic('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.fetchWithAuth(`/products/${id}`);
  }

  // Catégories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.fetchWithAuth('/categories');
  }

  // Panier (pour plus tard)
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.fetchWithAuth('/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse> {
    return this.fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<ApiResponse> {
    return this.fetchWithAuth(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  // Commandes
  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/orders');
  }

  async createOrder(orderData: any): Promise<ApiResponse> {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

// Instance globale
export const apiClient = new ApiClient();
