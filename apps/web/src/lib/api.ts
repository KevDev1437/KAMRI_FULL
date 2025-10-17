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


  private async fetchPublic(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    console.log('🌐 [API] fetchPublic appelé', { endpoint });
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log('📡 [API] Réponse publique reçue', { status: response.status, data });

      if (response.ok) {
        return { data };
      } else {
        console.log('❌ [API] Erreur API publique', { status: response.status, error: data.message });
        return { error: data.message || 'Erreur API' };
      }
    } catch (error) {
      console.log('❌ [API] Erreur réseau publique', error);
      return { error: 'Erreur réseau' };
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    console.log('🔑 [API] fetchWithAuth appelé', { endpoint, hasToken: !!this.token });
    
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
      console.log('📡 [API] Réponse reçue', { status: response.status, data });

      if (response.ok) {
        return { data };
      } else {
        console.log('❌ [API] Erreur API', { status: response.status, error: data.message });
        return { error: data.message || 'Erreur API' };
      }
    } catch (error) {
      console.log('❌ [API] Erreur réseau', error);
      return { error: 'Erreur réseau' };
    }
  }

  // Produits
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.fetchPublic('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.fetchPublic(`/products/${id}`);
  }

  // Catégories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.fetchPublic('/categories');
  }

  async createCategory(categoryData: { name: string; description?: string; icon?: string; color?: string }): Promise<ApiResponse<Category>> {
    return this.fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: { name?: string; description?: string; icon?: string; color?: string }): Promise<ApiResponse<Category>> {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart methods
  async getCart(userId: string): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth(`/cart/${userId}`);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity }),
    });
  }

  async removeFromCart(userId: string, itemId: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/cart/${userId}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(userId: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/cart/${userId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist methods
  async getWishlist(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<ApiResponse<void>> {
    return this.fetchWithAuth('/wishlist', {
      method: 'DELETE',
    });
  }

  // Address methods
  async getAddresses(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/addresses');
  }

  async createAddress(addressData: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<any>> {
    // L'ID de l'utilisateur sera récupéré automatiquement par le backend via le token JWT
    return this.fetchWithAuth('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: string, addressData: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/addresses/${id}/default`, {
      method: 'POST',
    });
  }

  // User Settings methods
  async getUserSettings(): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/user-settings');
  }

  async updateUserSettings(settingsData: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      orderHistory?: boolean;
      dataSharing?: boolean;
    };
    preferences?: {
      theme?: string;
      language?: string;
      currency?: string;
    };
  }): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/user-settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async deleteUserAccount(): Promise<ApiResponse<void>> {
    return this.fetchWithAuth('/user-settings/account', {
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
