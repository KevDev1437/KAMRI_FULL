import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PlatformMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || '';
    const platformHeader = req.headers['x-platform'] as string;
    
    // Détection automatique de la plateforme
    let platform = 'web'; // Par défaut
    
    if (platformHeader) {
      platform = platformHeader;
    } else if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      platform = 'mobile';
    }
    
    // Ajouter la plateforme détectée à la requête
    req['platform'] = platform;
    req['userAgent'] = userAgent;
    
    // Ajouter des headers de réponse pour le cache
    if (platform === 'mobile') {
      res.setHeader('X-Cache-TTL', '300'); // 5 minutes pour mobile
      res.setHeader('X-Optimized-For', 'mobile');
    } else {
      res.setHeader('X-Cache-TTL', '600'); // 10 minutes pour web
      res.setHeader('X-Optimized-For', 'web');
    }
    
    next();
  }
}
