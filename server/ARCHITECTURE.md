# 🏗️ Architecture Backend Multi-Plateforme

## 📋 Vue d'ensemble

Cette architecture permet de gérer efficacement les applications **mobile** et **web** avec un seul backend NestJS, tout en optimisant les performances pour chaque plateforme.

## 🎯 Structure des Endpoints

### 📱 Mobile (`/api/mobile/*`)
- **Optimisé pour** : Performance, bande passante limitée
- **Limites** : 20 produits max, cache 5min
- **Headers requis** : `x-platform: mobile`

### 🌐 Web (`/api/web/*`)
- **Optimisé pour** : Fonctionnalités riches, données détaillées
- **Limites** : 50 produits max, cache 10min
- **Headers requis** : `x-platform: web`

### 🔄 Shared (`/api/shared/*`)
- **Optimisé pour** : Détection automatique de plateforme
- **Usage** : Endpoints communs, fallback
- **Détection** : Via User-Agent

## 🚀 Endpoints Disponibles

### Authentification
```
POST /api/mobile/auth/login     # Mobile optimisé
POST /api/web/auth/login        # Web optimisé
POST /api/shared/auth/login     # Détection auto
```

### Produits
```
GET /api/mobile/products        # 20 produits max, cache 5min
GET /api/web/products          # 50 produits max, cache 10min
GET /api/shared/products       # Détection auto
```

### Panier
```
GET /api/mobile/cart           # Panier mobile
GET /api/web/cart              # Panier web
```

## 🔧 Configuration

### Headers Requis
```javascript
// Mobile
headers: {
  'x-platform': 'mobile',
  'Content-Type': 'application/json'
}

// Web
headers: {
  'x-platform': 'web',
  'Content-Type': 'application/json'
}
```

### Réponses Optimisées
```typescript
// Mobile
{
  data: [...],
  platform: 'mobile',
  optimized: true,
  metadata: {
    pagination: { page: 1, limit: 20, total: 100 },
    cache: { ttl: 300, key: 'mobile_cache' }
  }
}

// Web
{
  data: [...],
  platform: 'web',
  optimized: true,
  metadata: {
    pagination: { page: 1, limit: 50, total: 100 },
    cache: { ttl: 600, key: 'web_cache' }
  }
}
```

## 🛡️ Sécurité

### Guards
- **PlatformGuard** : Vérifie la plateforme
- **AuthGuard** : Authentification (à implémenter)
- **RateLimitGuard** : Limitation de débit (à implémenter)

### Middleware
- **PlatformMiddleware** : Détection automatique
- **CacheMiddleware** : Gestion du cache
- **LoggingMiddleware** : Logs des requêtes

## 📊 Performance

### Cache Strategy
- **Mobile** : Cache court (5min) pour économiser la bande passante
- **Web** : Cache long (10min) pour les performances
- **Shared** : Cache adaptatif selon la plateforme

### Optimisations
- **Mobile** : Données compressées, pagination réduite
- **Web** : Données enrichies, pagination étendue
- **Shared** : Détection automatique et optimisation

## 🔄 Migration

### Étape 1 : Endpoints Existants
```typescript
// Ancien
GET /api/products

// Nouveau
GET /api/mobile/products  # Mobile
GET /api/web/products     # Web
GET /api/shared/products  # Auto
```

### Étape 2 : Mise à Jour des Clients
```typescript
// Mobile
const response = await fetch('/api/mobile/products', {
  headers: { 'x-platform': 'mobile' }
});

// Web
const response = await fetch('/api/web/products', {
  headers: { 'x-platform': 'web' }
});
```

## 🧪 Tests

### Tests Unitaires
```bash
npm run test:mobile
npm run test:web
npm run test:shared
```

### Tests d'Intégration
```bash
npm run test:integration
```

## 📈 Monitoring

### Métriques
- **Performance** : Temps de réponse par plateforme
- **Cache** : Taux de hit/miss
- **Erreurs** : Erreurs par plateforme

### Logs
```typescript
// Log automatique
{
  platform: 'mobile',
  endpoint: '/api/mobile/products',
  responseTime: 150ms,
  cacheHit: true
}
```

## 🚀 Déploiement

### Variables d'Environnement
```env
# Cache
MOBILE_CACHE_TTL=300
WEB_CACHE_TTL=600

# Rate Limiting
MOBILE_RATE_LIMIT=100
WEB_RATE_LIMIT=200

# Platform Detection
AUTO_DETECT_PLATFORM=true
```

### Docker
```dockerfile
# Optimisations par plateforme
ENV PLATFORM=mobile
ENV CACHE_TTL=300
```

## 🔧 Maintenance

### Ajout d'un Nouvel Endpoint
1. Créer le contrôleur dans `/mobile/` ou `/web/`
2. Ajouter les tests
3. Documenter l'API
4. Mettre à jour les clients

### Debugging
```typescript
// Logs détaillés
console.log('Platform detected:', req.platform);
console.log('Optimization applied:', optimization);
console.log('Cache key:', cacheKey);
```

## 📚 Documentation API

### Swagger
- **Mobile** : `http://localhost:3001/api/docs/mobile`
- **Web** : `http://localhost:3001/api/docs/web`
- **Shared** : `http://localhost:3001/api/docs/shared`

### Postman Collection
- Import des collections par plateforme
- Tests automatisés
- Documentation interactive
