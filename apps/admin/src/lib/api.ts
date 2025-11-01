const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    // Récupérer le token depuis le localStorage au démarrage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || localStorage.getItem('auth_token');
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
          localStorage.setItem('token', data.access_token);
          // store refresh token if backend returns it
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { data };
      } else {
        return { error: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  async register(email: string, name: string, password: string, role: string = 'admin'): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Méthode générique pour les appels API avec authentification
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    if (!this.token) {
      return { error: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        // If 401 attempt refresh once
        if (response.status === 401) {
          const refreshed = await this.attemptRefresh();
          if (refreshed) {
            // retry original request once
            const retry = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers,
              },
            });
            try {
              const retryData = await retry.json();
              if (retry.ok) return { data: retryData };
              return { error: retryData.message || `Erreur API (${retry.status})` };
            } catch (e) {
              return { error: `Erreur API (${retry.status})` };
            }
          }
        }

        return { error: data?.message || `Erreur API (${response.status})` };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  // Attempt to refresh tokens using refresh_token stored in localStorage
  private async attemptRefresh(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await resp.json();
      if (resp.ok && data.access_token) {
        this.token = data.access_token;
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      // failed refresh -> logout
      this.logout();
      return false;
    } catch (e) {
      this.logout();
      return false;
    }
  }

  // Dashboard
  async getDashboardStats() {
    return this.fetchWithAuth('/dashboard/stats');
  }

  async getDashboardActivity() {
    return this.fetchWithAuth('/dashboard/activity');
  }

  async getSalesChart() {
    return this.fetchWithAuth('/dashboard/sales-chart');
  }

  async getTopCategories() {
    return this.fetchWithAuth('/dashboard/top-categories');
  }

  // Produits
  async getProducts() {
    return this.fetchWithAuth('/products');
  }

  async getProduct(id: string) {
    return this.fetchWithAuth(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getPendingProducts() {
    return this.fetchWithAuth('/products/admin/pending');
  }

  async approveProduct(id: string) {
    return this.fetchWithAuth(`/products/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectProduct(id: string) {
    return this.fetchWithAuth(`/products/${id}/reject`, {
      method: 'PATCH',
    });
  }

  // Fournisseurs
  async getSuppliers() {
    return this.fetchWithAuth('/suppliers');
  }

  async getSupplier(id: string) {
    return this.fetchWithAuth(`/suppliers/${id}`);
  }

  async createSupplier(supplierData: any) {
    return this.fetchWithAuth('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id: string, supplierData: any) {
    return this.fetchWithAuth(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id: string) {
    return this.fetchWithAuth(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  async testSupplierConnection(id: string) {
    return this.fetchWithAuth(`/suppliers/${id}/test`, {
      method: 'POST',
    });
  }

  async importProducts(supplierId: string) {
    return this.fetchWithAuth(`/suppliers/${supplierId}/import`, {
      method: 'POST',
    });
  }

  async getSupplierStats() {
    return this.fetchWithAuth('/suppliers/stats');
  }

  // Catégories
  async getCategories() {
    return this.fetchWithAuth('/categories');
  }

  async createCategory(categoryData: { name: string; description?: string; icon?: string; color?: string }) {
    return this.fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: { name?: string; description?: string; icon?: string; color?: string }) {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Commandes
  async getOrders() {
    return this.fetchWithAuth('/orders');
  }

  async getOrder(id: string) {
    return this.fetchWithAuth(`/orders/${id}`);
  }

  // Utilisateurs
  async getUsers() {
    return this.fetchWithAuth('/users');
  }

  async updateUser(id: string, userData: any) {
    return this.fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Paramètres
  async getSettings() {
    return this.fetchWithAuth('/settings');
  }

  async updateSettings(settingsData: any) {
    return this.fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Category Mappings
  async getCategoryMappings() {
    return this.fetchWithAuth('/categories/mappings/all');
  }

  async createCategoryMapping(data: {
    supplierId: string;
    externalCategory: string;
    internalCategory: string;
  }) {
    return this.fetchWithAuth('/categories/mappings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategoryMapping(id: string, data: {
    internalCategory?: string;
    status?: string;
  }) {
    return this.fetchWithAuth(`/categories/mappings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUnmappedExternalCategories() {
    return this.fetchWithAuth('/categories/unmapped-external');
  }

  async getProductsReadyForValidation(categoryId?: string) {
    const url = categoryId 
      ? `/products/admin/ready-for-validation?categoryId=${categoryId}`
      : '/products/admin/ready-for-validation';
    
    return this.fetchWithAuth(url);
  }

  // ✅ MÉTHODES CJ DROPSHIPPING
  async searchCJProducts(params: {
    productName?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    pageNum?: number;
    pageSize?: number;
    countryCode?: string;
    sort?: string;
    orderBy?: string;
  }) {
    // Construire l'URL avec les paramètres de recherche
    const searchParams = new URLSearchParams();
    if (params.productName) searchParams.append('productName', params.productName);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.pageNum) searchParams.append('pageNum', params.pageNum.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.countryCode) searchParams.append('countryCode', params.countryCode);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.orderBy) searchParams.append('orderBy', params.orderBy);

    const queryString = searchParams.toString();
    const url = `/cj-dropshipping/products/search${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithAuth(url, {
      method: 'GET',
    });
  }


  async getCJConfig() {
    return this.fetchWithAuth('/cj-dropshipping/config');
  }

  async updateCJConfig(configData: any) {
    return this.fetchWithAuth('/cj-dropshipping/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  async testCJConnection() {
    return this.fetchWithAuth('/cj-dropshipping/config/test', {
      method: 'POST',
    });
  }

  // ✅ NOUVELLES MÉTHODES CJ DROPSHIPPING
  async getCJProductDetails(pid: string) {
    return this.fetchWithAuth(`/cj-dropshipping/products/${pid}/details`);
  }

  async getCJCategories() {
    return this.fetchWithAuth('/cj-dropshipping/categories');
  }

  async importCJProduct(productData: any) {
    return this.fetchWithAuth('/cj-dropshipping/products/import', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getCJProductStock(pid: string, countryCode?: string) {
    const url = `/cj-dropshipping/products/${pid}/stock?countryCode=${countryCode || 'US'}`;
    return this.fetchWithAuth(url);
  }

  // ✅ NOUVELLE MÉTHODE : Statistiques anti-doublons
  async getDuplicateStats() {
    return this.fetchWithAuth('/duplicates/stats');
  }
}

// Instance globale
export const apiClient = new ApiClient();
