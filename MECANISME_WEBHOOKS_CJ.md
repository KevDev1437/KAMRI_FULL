# 🔄 Mécanisme de Fonctionnement des Webhooks CJ Dropshipping

## 📋 Vue d'Ensemble

Les webhooks CJ Dropshipping permettent de recevoir des notifications en temps réel lorsque des produits, variantes, stocks ou commandes sont modifiés sur la plateforme CJ.

## 🎯 Types de Webhooks Supportés

1. **PRODUCT** - Mise à jour d'un produit
2. **VARIANT** - Mise à jour d'une variante
3. **STOCK** - Mise à jour du stock
4. **ORDER** - Mise à jour d'une commande
5. **ORDERSPLIT** - Division d'une commande
6. **SOURCINGCREATE** - Création d'un sourcing

## 🔄 Flux de Traitement

### 1. Réception du Webhook

```
CJ Dropshipping → POST /api/cj-dropshipping/webhooks
```

### 2. Validation

- ✅ Vérification HTTPS (production)
- ✅ Validation du payload
- ✅ Vérification de l'intégration activée

### 3. Enregistrement

- ✅ Log dans `WebhookLog`
- ✅ Statut : `RECEIVED`

### 4. Traitement

- ✅ Routage selon le type
- ✅ Mise à jour des données
- ✅ Création de notifications

### 5. Réponse

- ✅ Format CJ conforme : `{ code, result, message, data, requestId }`
- ✅ Toujours retourner 200 OK

## 📊 Notifications de Mise à Jour

Lorsqu'un produit est mis à jour via webhook, une notification est créée dans `ProductUpdateNotification` pour informer l'administrateur.

## 🔧 Configuration

Les webhooks peuvent être configurés via :
- `POST /api/cj-dropshipping/webhooks/configure`
- `GET /api/cj-dropshipping/webhooks/status`
- `GET /api/cj-dropshipping/webhooks/logs`

