# CJ Dropshipping Integration

## 📋 Overview

Module d'intégration de l'API CJ Dropshipping dans KAMRI. Ce module permet de synchroniser automatiquement les produits, gérer les commandes et recevoir les notifications en temps réel via webhooks.

## 🚀 Setup

### 1. Configuration

Ajouter dans `.env`:
```env
# CJ Dropshipping API
CJ_EMAIL=your@email.com
CJ_API_KEY=your_api_key_here
CJ_TIER=free                    # free, plus, prime, advanced
CJ_PLATFORM_TOKEN=              # optionnel
CJ_WEBHOOK_URL=http://localhost:3001/api/cj-dropshipping/webhooks
CJ_DEBUG=true                   # pour dev, false en prod
```

### 2. Migration Base de Données

```bash
cd server
npx prisma generate
npx prisma db push
```

### 3. Test de Connexion

```bash
cd server
npx ts-node src/cj-dropshipping/test-cj-integration.ts
```

## 📚 API Endpoints

### Configuration
- `GET /api/cj-dropshipping/config` - Obtenir la configuration
- `PUT /api/cj-dropshipping/config` - Mettre à jour la configuration
- `POST /api/cj-dropshipping/config/test` - Tester la connexion

### Produits
- `GET /api/cj-dropshipping/products/search` - Rechercher des produits
- `GET /api/cj-dropshipping/products/:pid` - Obtenir les détails d'un produit
- `POST /api/cj-dropshipping/products/:pid/import` - Importer un produit
- `POST /api/cj-dropshipping/products/sync` - Synchroniser les produits

### Inventaire
- `GET /api/cj-dropshipping/inventory/:vid` - Obtenir le stock d'une variante
- `POST /api/cj-dropshipping/inventory/sync` - Synchroniser l'inventaire

### Commandes
- `POST /api/cj-dropshipping/orders` - Créer une commande
- `GET /api/cj-dropshipping/orders/:orderId` - Obtenir le statut d'une commande
- `POST /api/cj-dropshipping/orders/sync` - Synchroniser les statuts

### Logistique
- `POST /api/cj-dropshipping/logistics/calculate` - Calculer les frais de port
- `GET /api/cj-dropshipping/logistics/tracking/:trackNumber` - Obtenir le tracking

### Webhooks
- `POST /api/cj-dropshipping/webhooks` - Recevoir les webhooks
- `POST /api/cj-dropshipping/webhooks/configure` - Configurer les webhooks
- `GET /api/cj-dropshipping/webhooks/logs` - Obtenir les logs

### Statistiques
- `GET /api/cj-dropshipping/stats` - Obtenir les statistiques

## 🔄 Workflows

### Import de Produit
1. Rechercher produit via `/products/search`
2. Voir détails via `/products/:pid`
3. Importer via `/products/:pid/import`
4. Le produit est créé dans KAMRI avec mapping CJ

### Création de Commande
1. Client passe commande sur KAMRI
2. Service détecte produits CJ
3. Créer commande CJ automatiquement
4. Mapping créé entre commande KAMRI et CJ
5. Webhooks mettent à jour le statut

### Synchronisation Stock
1. CRON task toutes les heures
2. Récupère stock de tous produits CJ
3. Met à jour stock dans KAMRI
4. Webhooks pour updates en temps réel

## 🏗️ Architecture

### Backend (NestJS)
```
server/src/cj-dropshipping/
├── cj-api-client.ts           # Client API CJ TypeScript
├── cj-dropshipping.service.ts # Service principal
├── cj-dropshipping.controller.ts # Controller REST
├── cj-dropshipping.module.ts  # Module NestJS
├── dto/                        # DTOs de validation
│   ├── cj-config.dto.ts
│   ├── cj-product-search.dto.ts
│   ├── cj-order-create.dto.ts
│   └── cj-webhook.dto.ts
├── entities/                   # Entités
│   └── cj-config.entity.ts
├── interfaces/                 # Interfaces TypeScript
│   ├── cj-product.interface.ts
│   ├── cj-order.interface.ts
│   └── cj-webhook.interface.ts
└── test-cj-integration.ts     # Script de test
```

### Frontend Admin (Next.js)
```
apps/admin/src/
├── hooks/
│   └── useCJDropshipping.ts   # Hook API CJ
├── types/
│   └── cj.types.ts            # Types TypeScript
└── app/admin/cj-dropshipping/
    ├── page.tsx               # Page principale
    ├── config/page.tsx        # Configuration
    ├── products/page.tsx      # Recherche produits
    ├── orders/page.tsx        # Gestion commandes
    └── webhooks/page.tsx      # Configuration webhooks
```

### Base de Données (Prisma)
```sql
-- Configuration CJ
model CJConfig {
  id            String   @id @default(cuid())
  email         String
  apiKey        String
  tier          String   @default("free")
  platformToken String?
  enabled       Boolean  @default(true)
  accessToken   String?
  refreshToken  String?
  tokenExpiry   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

-- Mapping produits CJ
model CJProductMapping {
  id          String   @id @default(cuid())
  productId   String   @unique
  cjProductId String
  cjSku       String
  lastSyncAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  product     Product  @relation(fields: [productId], references: [id])
}

-- Mapping commandes CJ
model CJOrderMapping {
  id            String   @id @default(cuid())
  orderId       String   @unique
  cjOrderId     String
  cjOrderNumber String
  status        String
  trackNumber   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  order         Order    @relation(fields: [orderId], references: [id])
}

-- Logs webhooks CJ
model CJWebhookLog {
  id        String   @id @default(cuid())
  type      String
  messageId String   @unique
  payload   String   # JSON string
  processed Boolean  @default(false)
  error     String?
  createdAt DateTime @default(now())
}
```

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `CJ_EMAIL` | Email du compte CJ | - |
| `CJ_API_KEY` | Clé API CJ | - |
| `CJ_TIER` | Niveau d'abonnement | `free` |
| `CJ_PLATFORM_TOKEN` | Token de plateforme (optionnel) | - |
| `CJ_WEBHOOK_URL` | URL des webhooks | `http://localhost:3001/api/cj-dropshipping/webhooks` |
| `CJ_DEBUG` | Mode debug | `true` |

### Niveaux d'abonnement

| Tier | Requêtes/seconde | Limite |
|------|------------------|---------|
| Free | 1 req/s | Basique |
| Plus | 2 req/s | Standard |
| Prime | 4 req/s | Avancé |
| Advanced | 6 req/s | Premium |

## 🐛 Troubleshooting

### Rate Limit Exceeded
- Vérifier le tier dans la configuration
- Attendre avant de retry
- Le client gère automatiquement le throttling

### Token Expired
- Le client refresh automatiquement
- Vérifier que le refresh token est valide
- Relogin si les deux tokens sont expirés

### Webhook Not Received
- Vérifier l'URL dans la configuration CJ
- URL doit être HTTPS en production
- Réponse doit être 200 OK < 3s
- Vérifier les logs dans `CJWebhookLog`

### Produit non importé
- Vérifier que le produit existe dans CJ
- Vérifier les permissions de l'API key
- Vérifier les logs d'erreur

### Commande non créée
- Vérifier que les produits sont disponibles
- Vérifier l'adresse de livraison
- Vérifier les méthodes de livraison

## 📊 Monitoring

### Logs
- Tous les appels API sont loggés
- Erreurs stockées dans `CJWebhookLog`
- Métriques disponibles via `/stats`

### Alertes
- Webhooks non traités
- Erreurs de synchronisation
- Rate limits atteints

## 🔒 Sécurité

### API Key
- Stockée chiffrée en base
- Jamais exposée au frontend
- Rotation recommandée

### Webhooks
- Validation de signature (à implémenter)
- Rate limiting sur les endpoints
- Logs de sécurité

## 🚀 Déploiement

### Checklist
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Tests passés
- [ ] Webhooks configurés
- [ ] Monitoring activé

### Production
- HTTPS obligatoire pour webhooks
- Rate limiting configuré
- Logs centralisés
- Alertes configurées

## 📈 Performance

### Optimisations
- Cache des tokens
- Requêtes en batch
- Synchronisation asynchrone
- Retry automatique

### Métriques
- Temps de réponse API
- Taux de succès
- Latence des webhooks
- Utilisation des quotas

## 🔄 Maintenance

### Tâches régulières
- Nettoyage des logs anciens
- Synchronisation des stocks
- Mise à jour des statuts
- Monitoring des erreurs

### Mises à jour
- Suivre les changements API CJ
- Tester les nouvelles fonctionnalités
- Mettre à jour la documentation
- Former les utilisateurs

