import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLATFORM_KEY } from '../decorators/platform.decorator';

@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlatform = this.reflector.getAllAndOverride<string>(PLATFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlatform) {
      return true; // Pas de restriction de plateforme
    }

    const request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'] || '';
    const platform = request.headers['x-platform'] || this.detectPlatform(userAgent);

    return platform === requiredPlatform || requiredPlatform === 'shared';
  }

  private detectPlatform(userAgent: string): string {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'mobile';
    }
    return 'web';
  }
}
