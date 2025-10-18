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

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    console.log('🔑 [MOBILE API] Token défini:', token.substring(0, 20) + '...');
    this.token = token;
  }

  clearToken() {
    console.log('🗑️ [MOBILE API] Token supprimé');
    this.token = null;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<any>> {
    console.log('🚀 [MOBILE API] Appel API:', `${API_BASE_URL}${endpoint}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Ajouter le token JWT si disponible
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔐 [MOBILE API] Token JWT ajouté à la requête');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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

  // Méthodes d'authentification
  async login(email: string): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log('🔐 [MOBILE API] Connexion avec email:', email);
    const response = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    // Stocker le token si la connexion réussit
    if (response.data && response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  async register(email: string): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log('📝 [MOBILE API] Inscription avec email:', email);
    const response = await this.fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email,
        name: email.split('@')[0], // Utiliser la partie avant @ comme nom
        password: 'auto-generated',
        role: 'user'
      }),
    });
    
    // Stocker le token si l'inscription réussit
    if (response.data && response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  // Méthodes pour les utilisateurs
  async getUserProfile(): Promise<ApiResponse<User>> {
    console.log('👤 [MOBILE API] Récupération du profil utilisateur');
    return this.fetch('/api/users/profile');
  }

  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    console.log('✏️ [MOBILE API] Mise à jour du profil:', userData);
    console.log('✏️ [MOBILE API] Type de données:', typeof userData);
    console.log('✏️ [MOBILE API] Données sérialisées:', JSON.stringify(userData));
    
    const response = await this.fetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    console.log('✏️ [MOBILE API] Réponse de mise à jour:', response);
    return response;
  }

  // Méthodes pour les adresses
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    console.log('🏠 [MOBILE API] Récupération des adresses');
    return this.fetch('/api/addresses');
  }

  async addAddress(addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Address>> {
    console.log('➕ [MOBILE API] Ajout d\'une adresse:', addressData);
    return this.fetch('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId: string, addressData: Partial<Address>): Promise<ApiResponse<Address>> {
    console.log('✏️ [MOBILE API] Mise à jour de l\'adresse:', addressId, addressData);
    return this.fetch(`/api/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    console.log('🗑️ [MOBILE API] Suppression de l\'adresse:', addressId);
    return this.fetch(`/api/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour les commandes
  async getOrders(): Promise<ApiResponse<any[]>> {
    console.log('📦 [MOBILE API] Récupération des commandes');
    return this.fetch('/api/users/orders');
  }

  // Méthodes pour les paramètres utilisateur
  async getUserSettings(): Promise<ApiResponse<any>> {
    console.log('⚙️ [MOBILE API] Récupération des paramètres utilisateur');
    return this.fetch('/api/users/settings');
  }

  async updateUserSettings(settings: any): Promise<ApiResponse<any>> {
    console.log('⚙️ [MOBILE API] Mise à jour des paramètres utilisateur:', settings);
    return this.fetch('/api/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Méthodes pour les favoris (wishlist)
  async getWishlist(): Promise<ApiResponse<any[]>> {
    console.log('❤️ [MOBILE API] Récupération des favoris');
    return this.fetch('/api/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    console.log('❤️ [MOBILE API] Ajout aux favoris:', productId);
    return this.fetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    console.log('❤️ [MOBILE API] Suppression des favoris:', productId);
    return this.fetch(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<ApiResponse<void>> {
    console.log('❤️ [MOBILE API] Vidage des favoris');
    return this.fetch('/api/wishlist', {
      method: 'DELETE',
    });
  }

  // Méthodes pour le panier (cart)
  async getCart(): Promise<ApiResponse<any[]>> {
    console.log('🛒 [MOBILE API] Récupération du panier');
    return this.fetch(`/api/cart/${this.getUserId()}`);
  }

  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<any>> {
    console.log('🛒 [MOBILE API] Ajout au panier:', productId, 'quantité:', quantity);
    return this.fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: this.getUserId(),
        productId, 
        quantity 
      }),
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    console.log('🛒 [MOBILE API] Suppression du panier:', itemId);
    return this.fetch(`/api/cart/${this.getUserId()}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse<void>> {
    console.log('🛒 [MOBILE API] Vidage du panier');
    return this.fetch(`/api/cart/${this.getUserId()}`, {
      method: 'DELETE',
    });
  }

  // Méthode utilitaire pour obtenir l'userId depuis le token
  private getUserId(): string {
    // Pour l'instant, on retourne un userId par défaut
    // TODO: Extraire l'userId du token JWT
    return 'user-id-placeholder';
  }
}

export const apiClient = new ApiClient();
