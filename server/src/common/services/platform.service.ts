import { Injectable } from '@nestjs/common';
import { MobileOptimizedResponse, PlatformResponse, WebOptimizedResponse } from '../interfaces/platform-response.interface';

@Injectable()
export class PlatformService {
  detectPlatform(userAgent: string, platformHeader?: string): 'mobile' | 'web' {
    if (platformHeader) {
      return platformHeader as 'mobile' | 'web';
    }

    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'mobile';
    }
    return 'web';
  }

  createMobileResponse<T>(data: T, metadata?: any): MobileOptimizedResponse<T> {
    return {
      data,
      platform: 'mobile',
      optimized: true,
      metadata: {
        pagination: metadata?.pagination || { page: 1, limit: 20, total: 0 },
        cache: metadata?.cache || { ttl: 300, key: 'mobile_cache' }
      }
    };
  }

  createWebResponse<T>(data: T, metadata?: any): WebOptimizedResponse<T> {
    return {
      data,
      platform: 'web',
      optimized: true,
      metadata: {
        pagination: metadata?.pagination || { page: 1, limit: 50, total: 0 },
        cache: metadata?.cache || { ttl: 600, key: 'web_cache' }
      }
    };
  }

  createSharedResponse<T>(data: T, platform: 'mobile' | 'web'): PlatformResponse<T> {
    return {
      data,
      platform,
      optimized: false
    };
  }

  optimizeForMobile<T>(data: T[]): T[] {
    // Optimisations spécifiques mobile
    return data.slice(0, 20); // Limite mobile
  }

  optimizeForWeb<T>(data: T[]): T[] {
    // Optimisations spécifiques web
    return data.slice(0, 50); // Limite web
  }

  optimizeResponse<T>(data: T, platform: 'mobile' | 'web', options?: any): PlatformResponse<T> {
    if (platform === 'mobile') {
      return this.createMobileResponse(data, options);
    } else {
      return this.createWebResponse(data, options);
    }
  }
}
