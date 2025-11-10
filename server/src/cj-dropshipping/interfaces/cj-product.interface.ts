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

/**
 * Options de recherche de produits (API V2)
 */
export interface CJProductSearchOptions {
  // Pagination V2
  page?: number;                      // ✅ V2 utilise "page" (min 1, max 1000)
  size?: number;                      // ✅ V2 utilise "size" (min 1, max 100)
  
  // Recherche
  keyWord?: string;                   // ✅ V2 utilise "keyWord" au lieu de productName
  
  // Catégories
  categoryId?: string;                // ID catégorie niveau 3
  lv2categoryList?: string[];         // ✅ NOUVEAU : Liste IDs catégories niveau 2
  lv3categoryList?: string[];         // ✅ NOUVEAU : Liste IDs catégories niveau 3
  
  // Filtres de prix
  minPrice?: number;                  // → Devient startSellPrice en V2
  maxPrice?: number;                  // → Devient endSellPrice en V2
  
  // Filtres d'inventaire
  startInventory?: number;            // → Devient startWarehouseInventory en V2
  endInventory?: number;              // → Devient endWarehouseInventory en V2
  verifiedWarehouse?: number;         // 0=Tous, 1=Vérifié, 2=Non vérifié
  
  // Localisation
  countryCode?: string;               // Ex: "CN", "US", "FR"
  zonePlatform?: string;              // ✅ NOUVEAU : Ex: "shopify", "ebay", "amazon"
  isWarehouse?: boolean;              // ✅ NOUVEAU : true=recherche entrepôt global
  currency?: string;                  // ✅ NOUVEAU : Ex: "USD", "AUD", "EUR"
  
  // Certifications et personnalisation
  hasCertification?: number;          // ✅ NOUVEAU : 0=Non, 1=Oui
  customization?: number;             // ✅ NOUVEAU : 0=Non, 1=Oui
  
  // Filtres de temps
  timeStart?: number;                 // Timestamp (millisecondes)
  timeEnd?: number;                   // Timestamp (millisecondes)
  
  // Tri
  sort?: 'asc' | 'desc';              // Ordre de tri
  orderBy?: number;                   // ✅ V2 utilise des nombres: 0=best match, 1=listing, 2=price, 3=time, 4=inventory
  
  // Fournisseur
  supplierId?: string;                // ID du fournisseur
  
  // ✅ NOUVEAU : Features (V2)
  features?: string[];                // Ex: ['enable_description', 'enable_category', 'enable_video']
  
  // Type de produit
  productType?: number;               // Type de produit
  productFlag?: number;                // ✅ NOUVEAU : 0=Trending, 1=New, 2=Video, 3=Slow-moving
  
  // Livraison
  isFreeShipping?: number;            // 0=Non, 1=Oui
  isSelfPickup?: number;              // 0=Non, 1=Oui
  
  // Legacy support
  pageNum?: number;                   // Pour compatibilité avec ancien code
  pageSize?: number;                  // Pour compatibilité avec ancien code
  productName?: string;               // Pour compatibilité avec ancien code
  productNameEn?: string;             // Pour compatibilité avec ancien code
}

export interface CJProductSearchResult {
  products: CJProduct[];              // ✅ V2 utilise "products" au lieu de "list"
  total: number;                      // Total de résultats (totalRecords en V2)
  pageNumber: number;                 // ✅ V2 utilise "pageNumber" au lieu de "pageNum"
  pageSize: number;                   // Taille de page
  totalPages?: number;                 // ✅ NOUVEAU : Nombre total de pages
  relatedCategories?: CJCategory[];   // ✅ NOUVEAU : Catégories liées
  warehouses?: CJWarehouse[];         // ✅ NOUVEAU : Entrepôts disponibles
  keyWord?: string;                   // ✅ NOUVEAU : Mot-clé utilisé
  searchHit?: string;                 // ✅ NOUVEAU : Statistiques de recherche
  // Legacy support
  list?: CJProduct[];                 // Pour compatibilité avec ancien code
  pageNum?: number;                   // Pour compatibilité avec ancien code
}

/**
 * Catégorie liée (V2)
 */
export interface CJCategory {
  categoryId: string;
  categoryName: string;
}

/**
 * Entrepôt (V2)
 */
export interface CJWarehouse {
  warehouseId: string;
  warehouseName: string;
  countryCode: string;
}

/**
 * Options pour récupérer My Products (favoris)
 */
export interface CJMyProductsOptions {
  keyword?: string;       // Filtrer par nom/SKU
  categoryId?: string;    // Filtrer par catégorie
  startAt?: string;       // Date début (format: yyyy-MM-dd hh:mm:ss)
  endAt?: string;         // Date fin
  isListed?: number;      // 0 ou 1
  visiable?: number;      // 0 ou 1
  hasPacked?: number;     // 0 ou 1
  hasVirPacked?: number;  // 0 ou 1
  pageSize?: number;      // Max 100
}

/**
 * Structure d'un produit My Product (favori CJ)
 */
export interface CJMyProduct {
  productId: string;           // ID du produit
  bigImage: string;            // Image principale
  nameEn: string;              // Nom anglais
  sku: string;                 // SKU du produit
  vid: string;                 // ID du variant
  packWeight: string;          // Poids avec emballage (g)
  weight: string;              // Poids produit (g)
  sellPrice: string;           // Prix de vente
  discountPrice?: string;      // Prix réduit
  discountPriceRate?: string;  // Taux de réduction
  totalPrice: string;          // Prix total
  productType: string;         // Type de produit
  propertyKeyList: string[];   // Propriétés logistiques
  defaultArea: string;         // Entrepôt par défaut
  areaId: string;              // ID entrepôt
  areaCountryCode: string;     // Code pays entrepôt
  listedShopNum: string;       // Nombre de boutiques listées
  createAt: number;            // Timestamp ajout aux favoris
  hasPacked: number;           // A un packaging
  hasVirPacked: number;        // A un packaging virtuel
  shopMethod: string;          // Méthode d'expédition
  trialFreight: string;        // Frais de test
  freightDiscount: string;      // Réduction livraison
  lengthList?: number[];       // Liste des longueurs (mm)
  heightList?: number[];       // Liste des hauteurs (mm)
  widthList?: number[];        // Liste des largeurs (mm)
  volumeList?: number[];       // Liste des volumes (mm³)
}

/**
 * Réponse paginée My Products
 */
export interface CJMyProductsResponse {
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
  totalPages: number;
  content: CJMyProduct[];
}

export interface CJProductImportResult {
  productId: string;
  cjProductId: string;
  success: boolean;
  message?: string;
}

