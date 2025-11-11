# 🚀 TEST RAPIDE - Création Commande CJ

Votre configuration CJ est **active et prête** ! Voici comment tester rapidement :

## ✅ Votre Configuration

- ✅ **Email** : projectskevin834@gmail.com
- ✅ **Tier** : plus
- ✅ **Token** : Valide (expire le 2025-11-25)
- ✅ **Webhooks** : Configurés
- ✅ **Statut** : Connecté

---

## 🧪 TEST RAPIDE - 3 Étapes

### Étape 1 : Vérifier les prérequis

```bash
# Exécuter le script de vérification
npx ts-node server/test-cj-order-now.ts
```

Ce script vérifie :
- ✅ Configuration CJ active
- ✅ Produits CJ avec variants disponibles
- ✅ Utilisateurs avec adresses

**Si tout est OK**, vous verrez les IDs à utiliser.

---

### Étape 2 : Créer une commande (2 options)

#### Option A : Via API (recommandé)

```bash
# 1. Récupérer votre token JWT (via login admin)
# 2. Remplacer les valeurs ci-dessous

curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "ID_PRODUIT_CJ_ICI",
        "quantity": 1,
        "price": 29.99
      }
    ]
  }'
```

**Notez l'`orderId` retourné** (ex: `cmh1tmkgg0001je2guthziyj0`)

#### Option B : Via Frontend Admin

1. Aller sur `/admin/products`
2. Trouver un produit CJ (avec badge "CJ Dropshipping")
3. Créer une commande depuis le panier ou directement

---

### Étape 3 : Vérifier la création CJ

#### A. Vérifier les logs du serveur

Dans les logs, vous devriez voir :

```
📦 Création commande pour user [user_id]
✅ Commande KAMRI créée: [order_id]
🔍 Vérification produits CJ pour commande [order_id]
✅ Produits CJ trouvés: true
🔄 Transformation commande [order_id] vers format CJ
📤 Envoi commande à CJ...
✅ Commande CJ créée: [cj_order_id]
✅ Mapping créé: [mapping_id]
```

#### B. Vérifier via API

```bash
# Remplacer ORDER_ID par l'ID de votre commande
curl -X GET http://localhost:3001/api/orders/ORDER_ID/cj-status \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Réponse attendue** :
```json
{
  "success": true,
  "hasCJOrder": true,
  "data": {
    "id": "...",
    "orderId": "...",
    "cjOrderId": "...",
    "cjOrderNumber": "KAMRI-...",
    "status": "CREATED",
    "trackNumber": null
  }
}
```

#### C. Vérifier en base de données

```sql
-- Remplacer ORDER_ID
SELECT 
  o.id as kamri_order_id,
  o.total,
  o.status as kamri_status,
  cj.cjOrderId,
  cj.cjOrderNumber,
  cj.status as cj_status,
  cj.createdAt
FROM orders o
LEFT JOIN cj_order_mappings cj ON cj.orderId = o.id
WHERE o.id = 'ORDER_ID';
```

---

## 🎯 Test avec Commande Existante

Si vous avez déjà une commande, testez directement :

```bash
# 1. Vérifier si elle a des produits CJ
npx ts-node server/test-cj-order-now.ts ORDER_ID_ICI

# 2. Si OK, créer la commande CJ manuellement
curl -X POST http://localhost:3001/api/orders/ORDER_ID_ICI/create-cj \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

---

## 🔍 Dépannage Rapide

### ❌ "Pas de produit CJ trouvé"

**Solution** :
1. Aller sur `/admin/cj-dropshipping/products`
2. Importer un produit CJ
3. Vérifier qu'il a des variants avec `cjVariantId`

### ❌ "Pas d'utilisateur avec adresse"

**Solution** :
1. Aller sur `/admin/users`
2. Créer/modifier un utilisateur
3. Ajouter une adresse et la marquer comme défaut

### ❌ "Erreur API CJ"

**Vérifications** :
- Token valide (votre token expire le 2025-11-25, donc OK)
- Email et API Key corrects (déjà configurés)
- Produit a un `vid` (variant ID) valide

---

## 📊 Checklist de Validation

Après avoir créé une commande, vérifiez :

- [ ] Commande KAMRI créée dans `orders`
- [ ] Mapping CJ créé dans `cj_order_mappings`
- [ ] `cjOrderId` présent et valide
- [ ] `cjOrderNumber` au format `KAMRI-xxxxx-timestamp`
- [ ] Statut initial = `CREATED`
- [ ] Logs montrent le processus complet
- [ ] API `/cj-status` retourne les bonnes infos

---

## 🎉 Prochaines Étapes

Une fois la commande CJ créée :

1. **Webhooks** : Les webhooks ORDER mettront à jour automatiquement le statut
2. **Tracking** : Le `trackNumber` sera ajouté automatiquement via webhook LOGISTIC
3. **Admin** : Vous pouvez voir les commandes CJ sur `/admin/cj-dropshipping/orders`

---

**Besoin d'aide ?** Consultez `GUIDE_TESTS_CJ_ORDERS.md` pour plus de détails.

