// Configuration pour les clients mobile et web

// ===== MOBILE CONFIGURATION =====
export const mobileConfig = {
  baseURL: 'http://localhost:3001/api/mobile',
  headers: {
    'x-platform': 'mobile',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
  retryAttempts: 3,
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 50, // 50 items max
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 20,
  },
};

// ===== WEB CONFIGURATION =====
export const webConfig = {
  baseURL: 'http://localhost:3001/api/web',
  headers: {
    'x-platform': 'web',
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondes
  retryAttempts: 2,
  cache: {
    ttl: 600, // 10 minutes
    maxSize: 100, // 100 items max
  },
  pagination: {
    defaultLimit: 50,
    maxLimit: 50,
  },
};

// ===== SHARED CONFIGURATION =====
export const sharedConfig = {
  baseURL: 'http://localhost:3001/api/shared',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000, // 12 secondes
  retryAttempts: 2,
  cache: {
    ttl: 450, // 7.5 minutes (moyenne)
    maxSize: 75, // 75 items max
  },
  pagination: {
    defaultLimit: 30,
    maxLimit: 50,
  },
};

// ===== DETECTION AUTOMATIQUE =====
export function detectPlatform(): 'mobile' | 'web' {
  if (typeof window === 'undefined') return 'web'; // SSR
  
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'mobile';
  }
  
  return 'web';
}

// ===== CONFIGURATION ADAPTATIVE =====
export function getConfig() {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'mobile':
      return mobileConfig;
    case 'web':
      return webConfig;
    default:
      return sharedConfig;
  }
}

// ===== EXEMPLE D'UTILISATION =====

// Mobile
export const mobileAPI = {
  async getProducts(page = 1, limit = 20) {
    const response = await fetch(`${mobileConfig.baseURL}/products?page=${page}&limit=${limit}`, {
      headers: mobileConfig.headers,
    });
    return response.json();
  },
  
  async login(email: string, password: string) {
    const response = await fetch(`${mobileConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: mobileConfig.headers,
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};

// Web
export const webAPI = {
  async getProducts(page = 1, limit = 50, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters && { filters: JSON.stringify(filters) }),
    });
    
    const response = await fetch(`${webConfig.baseURL}/products?${params}`, {
      headers: webConfig.headers,
    });
    return response.json();
  },
  
  async login(email: string, password: string) {
    const response = await fetch(`${webConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: webConfig.headers,
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
};

// Shared (détection automatique)
export const sharedAPI = {
  async getProducts(page = 1, limit = 30) {
    const response = await fetch(`${sharedConfig.baseURL}/products?page=${page}&limit=${limit}`, {
      headers: sharedConfig.headers,
    });
    return response.json();
  },
};

// ===== EXEMPLE D'INTÉGRATION =====

// React Native (Mobile)
export const useMobileAPI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const data = await mobileAPI.getProducts(page, 20);
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { products, loading, fetchProducts };
};

// Next.js (Web)
export const useWebAPI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchProducts = async (page = 1, filters?: any) => {
    setLoading(true);
    try {
      const data = await webAPI.getProducts(page, 50, filters);
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { products, loading, fetchProducts };
};
