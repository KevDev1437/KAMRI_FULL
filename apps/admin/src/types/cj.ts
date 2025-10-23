// Types et interfaces pour CJ Dropshipping

export interface SearchFilters {
  // Recherche basique
  keyword: string;
  category: string; // Sélecteur hiérarchique CJ
  minPrice: number;
  maxPrice: number;
  
  // Filtres avancés
  stockCountry: 'US' | 'FR' | 'CN' | 'ALL';
  minStock: number;
  deliveryTime: '24' | '48' | '72' | 'ALL';
  freeShippingOnly: boolean;
  sortBy: 'popularity' | 'price_asc' | 'price_desc' | 'newest';
  productType: 'ORDINARY_PRODUCT' | 'ALL';
}

export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  productImage: string;
  sellPrice: number;
  originalPrice: number;
  categoryName: string;
  variants: CJVariant[];
  stock?: { [country: string]: number };
  deliveryTime?: string;
  freeShipping?: boolean;
  listedNum?: number; // Popularité
  isPopular?: boolean;
  badges?: string[];
}

export interface CJVariant {
  variantId: string;
  variantSku: string;
  sellPrice: number;
  originalPrice: number;
  stock: number;
  variantName: string;
  variantImage?: string;
}

export interface CJCategory {
  id: string;
  name: string;
  parentId?: string;
  children?: CJCategory[];
  level: number;
}

export interface CJProductCard {
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: { [country: string]: number };
  deliveryTime: string;
  isFreeShipping: boolean;
  variantsCount: number;
  isPopular: boolean;
  badges: string[];
}

export interface SearchState {
  filters: SearchFilters;
  results: CJProduct[];
  categories: CJCategory[];
  loading: boolean;
  searchInProgress: boolean;
  importInProgress: { [pid: string]: boolean };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
  };
}

export interface CJSearchResponse {
  success: boolean;
  data: {
    list: CJProduct[];
    total: number;
    pageNum: number;
    pageSize: number;
  };
  error?: string;
}

export interface CJImportResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Constantes pour les badges
export const CJ_BADGES = {
  FREE_SHIPPING: 'FREE_SHIPPING',
  POPULAR: 'POPULAR',
  FAST_DELIVERY: 'FAST_DELIVERY',
  HIGH_STOCK: 'HIGH_STOCK',
  LOW_PRICE: 'LOW_PRICE'
} as const;

export type CJBadge = typeof CJ_BADGES[keyof typeof CJ_BADGES];

// Constantes pour les pays de stock
export const STOCK_COUNTRIES = {
  US: 'US',
  FR: 'FR',
  CN: 'CN',
  ALL: 'ALL'
} as const;

export type StockCountry = typeof STOCK_COUNTRIES[keyof typeof STOCK_COUNTRIES];

// Constantes pour le tri
export const SORT_OPTIONS = {
  POPULARITY: 'popularity',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest'
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
