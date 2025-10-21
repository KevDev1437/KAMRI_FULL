export interface CJConfig {
  id: string;
  email: string;
  apiKey: string;
  tier: 'free' | 'plus' | 'prime' | 'advanced';
  platformToken?: string;
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
  stockInfo?: any;
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
  shippingAddress: CJShippingAddress;
  products: CJOrderProduct[];
  trackNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CJOrderProduct {
  vid: string;
  quantity: number;
  price: number;
  productName: string;
  variantInfo: string;
}

export interface CJShippingAddress {
  country: string;
  countryCode: string;
  province?: string;
  city: string;
  address: string;
  customerName: string;
  phone: string;
  zipCode?: string;
}

export interface CJWebhookLog {
  id: string;
  type: 'PRODUCT' | 'STOCK' | 'ORDER' | 'LOGISTICS';
  messageId: string;
  payload: any;
  processed: boolean;
  error?: string;
  createdAt: Date;
}

export interface CJStats {
  products: {
    total: number;
    synced: number;
  };
  orders: {
    total: number;
    active: number;
  };
  webhooks: {
    total: number;
    recent: number;
    processed: number;
  };
}

export interface CJProductSearchFilters {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  countryCode?: string;
  sortBy?: string;
}

export interface CJImportResult {
  productId: string;
  cjProductId: string;
  success: boolean;
  message?: string;
}

