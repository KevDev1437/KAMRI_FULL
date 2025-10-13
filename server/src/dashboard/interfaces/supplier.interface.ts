export interface SupplierConfig {
  name: string;
  baseUrl: string;
  endpoints: {
    products: string;
    users: string;
    categories: string;
    carts?: string;
  };
  auth: {
    type: 'none' | 'oauth2' | 'api-key';
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
  rateLimit: {
    requests: number;
    window: string;
  };
}

export interface SupplierResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ProductData {
  id: string | number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  stock?: number;
  brand?: string;
  sku?: string;
  [key: string]: any;
}

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  address?: any;
  [key: string]: any;
}

export interface CategoryData {
  id: string | number;
  name: string;
  description?: string;
  [key: string]: any;
}
