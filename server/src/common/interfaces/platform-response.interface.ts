export interface PlatformResponse<T> {
  data: T;
  platform: 'mobile' | 'web';
  optimized: boolean;
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    cache?: {
      ttl: number;
      key: string;
    };
  };
}

export interface MobileOptimizedResponse<T> extends PlatformResponse<T> {
  platform: 'mobile';
  optimized: true;
  metadata: {
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    cache: {
      ttl: number;
      key: string;
    };
  };
}

export interface WebOptimizedResponse<T> extends PlatformResponse<T> {
  platform: 'web';
  optimized: true;
  metadata: {
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    cache: {
      ttl: number;
      key: string;
    };
  };
}
