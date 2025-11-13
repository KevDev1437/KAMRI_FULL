# 🔄 Explication : Pourquoi les tables se remplissent automatiquement

## 📋 Problème

Les tables suivantes se remplissent automatiquement sans action de votre part :
- **Product** (452 enregistrements)
- **ProductUpdateNotification** (1449 enregistrements)
- **ProductVariant** (500 enregistrements)
- **WebhookLog** (2427 enregistrements)

## 🔍 Cause

CJ Dropshipping envoie automatiquement des **webhooks** à votre serveur chaque fois qu'un produit, variant, stock ou commande est modifié sur leur plateforme.

### Flux automatique :

```
CJ Dropshipping Platform
    ↓ (modification produit/variant/stock)
    ↓
POST /api/cj-dropshipping/webhooks
    ↓
Votre serveur NestJS
    ↓
1. Enregistre dans WebhookLog
2. Traite le webhook (PRODUCT/VARIANT/STOCK)
3. Crée/met à jour Product ou ProductVariant
4. Crée ProductUpdateNotification
```

## 🎯 Types de webhooks reçus

1. **PRODUCT** → Crée/met à jour `Product`
2. **VARIANT** → Crée/met à jour `ProductVariant`
3. **STOCK** → Met à jour le stock des variants
4. **ORDER** → Traite les commandes

Chaque webhook génère :
- 1 enregistrement dans `WebhookLog`
- 1 enregistrement dans `ProductUpdateNotification` (si produit/variant traité)

## ✅ Solutions

### Option 1 : Désactiver les webhooks (recommandé pour développement)

```bash
cd server
npx ts-node disable-cj-webhooks.ts
```

### Option 2 : Filtrer les webhooks dans le code

Modifier `server/src/cj-dropshipping/services/cj-webhook.service.ts` pour ignorer certains types :

```typescript
async processWebhook(payload: CJWebhookPayload): Promise<WebhookProcessingResult> {
  // Ignorer certains types de webhooks
  if (payload.type === 'PRODUCT' || payload.type === 'VARIANT') {
    this.logger.log(`⚠️ Webhook ${payload.type} ignoré (mode développement)`);
    return {
      success: true,
      messageId: payload.messageId,
      type: payload.type,
      processedAt: new Date(),
      skipped: true
    };
  }
  // ... reste du code
}
```

### Option 3 : Vider régulièrement les tables

Utiliser le script `clear-products-tables.ts` pour nettoyer périodiquement :

```bash
cd server
npx ts-node clear-products-tables.ts
```

### Option 4 : Configurer les webhooks pour ne recevoir que certains types

Modifier l'endpoint de configuration pour ne recevoir que les webhooks ORDER :

```typescript
// Dans cj-dropshipping.controller.ts
await this.cjWebhookService.configureWebhooks(
  true,
  'https://votre-url.com/api/cj-dropshipping/webhooks',
  ['order'] // Seulement les commandes
);
```

## 🔧 Vérifier l'état des webhooks

Pour voir quels webhooks sont configurés, vous pouvez appeler l'API CJ :

```bash
GET https://developers.cjdropshipping.com/api2.0/v1/webhook/query
Headers: CJ-Access-Token: votre-token
```

## 📊 Statistiques

Avec 2427 webhooks reçus :
- Environ 452 produits créés/mis à jour
- Environ 500 variants créés/mis à jour
- 1449 notifications générées

Cela indique que CJ Dropshipping envoie beaucoup de notifications automatiques, probablement pour synchroniser les données en temps réel.

## ⚠️ Important

- Les webhooks sont **utiles en production** pour garder les données synchronisées
- En **développement**, ils peuvent remplir rapidement la base de données
- Il est recommandé de **désactiver les webhooks** pendant le développement si vous ne voulez pas que les tables se remplissent automatiquement

