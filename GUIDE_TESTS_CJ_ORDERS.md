# 🧪 GUIDE DE TESTS - INTÉGRATION CJ ORDERS

**Date** : $(date)  
**Système** : Création automatique des commandes CJ depuis KAMRI

---

## 📋 PRÉREQUIS

### 1. Vérifier la configuration CJ

```bash
# Vérifier que la configuration CJ est active
# Via l'admin : /admin/cj-dropshipping/config
# Ou via API :
GET http://localhost:3001/api/cj-dropshipping/config
```

**Vérifications** :
- ✅ Email CJ configuré
- ✅ API Key CJ configuré
- ✅ Statut "enabled" = true
- ✅ Token CJ valide (non expiré)

### 2. Préparer des données de test

**Produits CJ nécessaires** :
- Au moins 1 produit avec `source = 'cj-dropshipping'`
- Le produit doit avoir un `cjProductId`
- Le produit doit avoir au moins 1 `ProductVariant` avec `cjVariantId` (vid)

**Utilisateur de test** :
- Un utilisateur avec une adresse de livraison configurée
- L'adresse doit avoir `isDefault = true`

---

## 🧪 TEST 1 : Création automatique (Commande avec produits CJ)

### Objectif
Vérifier que lorsqu'une commande KAMRI est créée avec des produits CJ, la commande CJ est créée automatiquement.

### Étapes

#### 1. Préparer les données

```sql
-- Vérifier qu'un produit CJ existe avec variant
SELECT 
  p.id as product_id,
  p.name,
  p.cjProductId,
  p.source,
  pv.id as variant_id,
  pv.cjVariantId as vid,
  pv.sku
FROM products p
LEFT JOIN product_variants pv ON pv.productId = p.id
WHERE p.source = 'cj-dropshipping' 
  AND p.cjProductId IS NOT NULL
  AND pv.cjVariantId IS NOT NULL
LIMIT 1;
```

**Notez** :
- `product_id` : ID du produit KAMRI
- `variant_id` : ID du variant (optionnel si OrderItem n'a pas productVariantId)
- `vid` : Variant ID CJ (nécessaire)

#### 2. Créer une commande via API

```bash
# Remplacer les valeurs :
# - TOKEN : Votre token JWT
# - USER_ID : ID de l'utilisateur
# - PRODUCT_ID : ID du produit CJ trouvé ci-dessus

curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_ICI",
        "quantity": 1,
        "price": 29.99
      }
    ]
  }'
```

#### 3. Vérifier les logs backend

```bash
# Dans les logs du serveur, vous devriez voir :
# ✅ Commande KAMRI créée: [order_id]
# 🔍 Vérification produits CJ pour commande [order_id]
# ✅ Produits CJ trouvés: true
# 🔄 Transformation commande [order_id] vers format CJ
# 📤 Envoi commande à CJ...
# ✅ Commande CJ créée: [cj_order_id]
# ✅ Mapping créé: [mapping_id]
```

#### 4. Vérifier en base de données

```sql
-- Vérifier que la commande KAMRI existe
SELECT * FROM orders WHERE id = 'ORDER_ID_ICI';

-- Vérifier que le mapping CJ existe
SELECT * FROM cj_order_mappings WHERE orderId = 'ORDER_ID_ICI';

-- Vérifier les détails du mapping
SELECT 
  o.id as kamri_order_id,
  o.total,
  o.status as kamri_status,
  cj.cjOrderId,
  cj.cjOrderNumber,
  cj.status as cj_status,
  cj.trackNumber,
  cj.createdAt
FROM orders o
JOIN cj_order_mappings cj ON cj.orderId = o.id
WHERE o.id = 'ORDER_ID_ICI';
```

#### 5. Vérifier via API

```bash
# Vérifier le statut CJ
curl -X GET http://localhost:3001/api/orders/ORDER_ID_ICI/cj-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Réponse attendue :
# {
#   "success": true,
#   "hasCJOrder": true,
#   "data": {
#     "id": "...",
#     "orderId": "...",
#     "cjOrderId": "...",
#     "cjOrderNumber": "KAMRI-...",
#     "status": "CREATED",
#     ...
#   }
# }
```

### ✅ Résultat attendu

- ✅ Commande KAMRI créée avec succès
- ✅ Commande CJ créée automatiquement
- ✅ Mapping `CJOrderMapping` créé
- ✅ Logs montrent le processus complet
- ✅ API `/cj-status` retourne les infos CJ

---

## 🧪 TEST 2 : Commande sans produits CJ (Skip)

### Objectif
Vérifier que les commandes sans produits CJ ne tentent pas de créer une commande CJ.

### Étapes

#### 1. Créer une commande avec produit non-CJ

```bash
# Utiliser un produit qui n'est PAS CJ (source != 'cj-dropshipping')

curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_NON_CJ_ID",
        "quantity": 1,
        "price": 19.99
      }
    ]
  }'
```

#### 2. Vérifier les logs

```bash
# Dans les logs, vous devriez voir :
# ✅ Commande KAMRI créée: [order_id]
# 🔍 Vérification produits CJ pour commande [order_id]
# ❌ Produits CJ trouvés: false
# ℹ️ Commande sans produits CJ, skip
```

#### 3. Vérifier en base

```sql
-- Vérifier qu'aucun mapping CJ n'a été créé
SELECT * FROM cj_order_mappings WHERE orderId = 'ORDER_ID_ICI';
-- Devrait retourner 0 lignes
```

### ✅ Résultat attendu

- ✅ Commande KAMRI créée normalement
- ✅ Aucune tentative de création CJ
- ✅ Aucun mapping CJ créé
- ✅ Logs indiquent "skip"

---

## 🧪 TEST 3 : Création manuelle via endpoint

### Objectif
Tester l'endpoint de création manuelle de commande CJ.

### Étapes

#### 1. Créer d'abord une commande KAMRI (sans produits CJ ou avec)

```bash
# Créer une commande normale
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 1,
        "price": 29.99
      }
    ]
  }'
```

**Notez l'`orderId` retourné**

#### 2. Vérifier si la commande a des produits CJ

```bash
curl -X GET http://localhost:3001/api/orders/ORDER_ID_ICI/has-cj-products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Réponse :
# {
#   "success": true,
#   "hasCJProducts": true/false
# }
```

#### 3. Créer manuellement la commande CJ

```bash
curl -X POST http://localhost:3001/api/orders/ORDER_ID_ICI/create-cj \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Réponse attendue si succès :
# {
#   "success": true,
#   "message": "Commande CJ créée avec succès",
#   "data": {
#     "success": true,
#     "cjOrderId": "...",
#     "cjOrderNumber": "KAMRI-...",
#     "mapping": { ... }
#   }
# }
```

#### 4. Vérifier le statut

```bash
curl -X GET http://localhost:3001/api/orders/ORDER_ID_ICI/cj-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### ✅ Résultat attendu

- ✅ Endpoint répond correctement
- ✅ Commande CJ créée si produits CJ présents
- ✅ Message d'erreur clair si pas de produits CJ
- ✅ Mapping créé en base

---

## 🧪 TEST 4 : Commande déjà mappée (Double création)

### Objectif
Vérifier que le système évite les doublons.

### Étapes

#### 1. Créer une commande CJ (via TEST 1 ou TEST 3)

#### 2. Tenter de créer à nouveau

```bash
curl -X POST http://localhost:3001/api/orders/ORDER_ID_ICI/create-cj \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Réponse attendue :
# {
#   "success": false,
#   "message": "Commande CJ déjà existante",
#   "data": {
#     "success": false,
#     "cjOrderId": "...",
#     "mapping": { ... }
#   }
# }
```

### ✅ Résultat attendu

- ✅ Pas de doublon créé
- ✅ Message clair indiquant que la commande existe déjà
- ✅ Retourne les infos de la commande existante

---

## 🧪 TEST 5 : Gestion des erreurs

### Objectif
Vérifier que les erreurs sont bien gérées sans bloquer la commande KAMRI.

### Scénarios à tester

#### A. Produit CJ sans variant ID

```sql
-- Créer un produit CJ sans variant
INSERT INTO products (id, name, price, cjProductId, source)
VALUES ('test-product-no-variant', 'Test Product', 10.00, 'CJ123', 'cj-dropshipping');

-- Créer une commande avec ce produit
-- Devrait échouer à la transformation mais la commande KAMRI est créée
```

#### B. API CJ indisponible

```bash
# Désactiver temporairement la config CJ
# Ou utiliser un email/apiKey invalide

# Créer une commande
# La commande KAMRI doit être créée
# L'erreur CJ doit être loggée mais ne pas bloquer
```

#### C. Adresse manquante

```sql
-- Supprimer l'adresse par défaut d'un utilisateur
DELETE FROM addresses WHERE userId = 'USER_ID' AND isDefault = true;

-- Créer une commande
-- Le système doit utiliser les infos utilisateur comme fallback
```

### ✅ Résultat attendu

- ✅ Commande KAMRI toujours créée
- ✅ Erreurs loggées clairement
- ✅ Pas de crash du serveur
- ✅ Messages d'erreur informatifs

---

## 🔍 VÉRIFICATIONS AVANCÉES

### 1. Vérifier les webhooks CJ

Une fois la commande CJ créée, vérifier que les webhooks ORDER fonctionnent :

```sql
-- Vérifier les logs webhooks
SELECT * FROM webhook_logs 
WHERE type = 'ORDER' 
ORDER BY receivedAt DESC 
LIMIT 10;
```

### 2. Vérifier la synchronisation des statuts

```bash
# Appeler l'endpoint de sync (si disponible)
# Ou vérifier que les webhooks mettent à jour le statut
```

### 3. Vérifier les données transformées

```typescript
// Dans les logs, vérifier que les données CJ sont correctes :
// - orderNumber format: KAMRI-xxxxx-timestamp
// - shippingAddress complète
// - products avec vid et sku corrects
// - logisticName selon le pays
```

---

## 📊 CHECKLIST DE VALIDATION

### Backend
- [ ] Commande KAMRI créée avec produits CJ → Commande CJ créée automatiquement
- [ ] Commande KAMRI sans produits CJ → Pas de création CJ (skip)
- [ ] Endpoint `/create-cj` fonctionne
- [ ] Endpoint `/cj-status` retourne les bonnes infos
- [ ] Endpoint `/has-cj-products` fonctionne
- [ ] Pas de doublon si commande CJ existe déjà
- [ ] Erreurs gérées sans bloquer la commande KAMRI
- [ ] Logs détaillés et informatifs

### Base de données
- [ ] Table `orders` : commande créée
- [ ] Table `cj_order_mappings` : mapping créé avec bonnes données
- [ ] Relations correctes (orderId → order.id)
- [ ] Statut initial = 'CREATED'

### Logs
- [ ] Logs montrent le processus complet
- [ ] Erreurs loggées clairement
- [ ] Pas d'erreurs non gérées

---

## 🚨 DÉPANNAGE

### Problème : "Commande CJ non créée"

**Vérifications** :
1. Produit a-t-il un `cjProductId` ?
2. Produit a-t-il un variant avec `cjVariantId` ?
3. Configuration CJ est-elle active ?
4. Token CJ est-il valide ?

**Solution** :
```sql
-- Vérifier les produits CJ
SELECT p.id, p.name, p.cjProductId, p.source,
       pv.cjVariantId, pv.isActive
FROM products p
LEFT JOIN product_variants pv ON pv.productId = p.id
WHERE p.id = 'PRODUCT_ID';
```

### Problème : "Erreur transformation"

**Vérifications** :
1. L'utilisateur a-t-il une adresse ?
2. Les champs d'adresse sont-ils complets ?
3. Le code pays est-il valide ?

**Solution** :
```sql
-- Vérifier l'adresse utilisateur
SELECT * FROM addresses 
WHERE userId = 'USER_ID' AND isDefault = true;
```

### Problème : "API CJ retourne erreur"

**Vérifications** :
1. Email et API Key corrects ?
2. Token CJ valide (non expiré) ?
3. Format des données conforme à l'API CJ ?

**Solution** :
```bash
# Tester la connexion CJ
curl -X GET http://localhost:3001/api/cj-dropshipping/config
```

---

## 📝 NOTES IMPORTANTES

1. **Variants obligatoires** : Pour que la création fonctionne, les produits CJ doivent avoir des variants avec `cjVariantId`. Si ce n'est pas le cas, le système utilisera `cjProductId` comme fallback (non idéal).

2. **Adresses** : Le système cherche d'abord une adresse par défaut. Si aucune n'est trouvée, il utilise les infos utilisateur comme fallback.

3. **Transactions** : La création CJ se fait APRÈS la transaction KAMRI pour éviter de bloquer la commande en cas d'erreur CJ.

4. **Logs** : Tous les logs sont préfixés avec des emojis pour faciliter le debugging :
   - 🔍 = Vérification
   - ✅ = Succès
   - ⚠️ = Avertissement
   - ❌ = Erreur
   - 📤 = Envoi
   - 🔄 = Transformation

---

**Bon testing ! 🚀**

