# 📋 Analyse API CJ Create Order V3

## 🔍 Comparaison Documentation vs Implémentation

### ✅ Endpoint Correct
- **Documentation** : `/api2.0/v1/shopping/order/createOrderV3`
- **Notre code** : `/shopping/order/createOrderV3` ✅
- **Base URL** : `https://developers.cjdropshipping.com/api2.0/v1` ✅

### ✅ Headers Corrects
- **CJ-Access-Token** : ✅ Ajouté dans `makeRequest()`
- **platformToken** : ✅ Ajouté conditionnellement si configuré (ligne 401-403)
- **Content-Type** : ✅ `application/json`

---

## 📊 Paramètres Requis (selon documentation)

| Paramètre | Documentation | Notre DTO | Statut |
|-----------|--------------|-----------|--------|
| `orderNumber` | ✅ Requis (max 50) | ✅ Requis | ✅ |
| `shippingCountryCode` | ✅ Requis (max 20) | ✅ Requis | ✅ |
| `shippingCountry` | ✅ Requis (max 50) | ✅ Requis | ✅ |
| `shippingProvince` | ✅ Requis (max 50) | ⚠️ Optionnel | ⚠️ |
| `shippingCity` | ✅ Requis (max 50) | ✅ Requis | ✅ |
| `shippingCustomerName` | ✅ Requis (max 50) | ✅ Requis | ✅ |
| `shippingAddress` | ✅ Requis (max 200) | ✅ Requis | ✅ |
| `products` | ✅ Requis (array) | ✅ Requis | ✅ |

**⚠️ PROBLÈME DÉTECTÉ** : `shippingProvince` est **requis** selon la doc mais **optionnel** dans notre DTO.

---

## 📊 Paramètres Optionnels (utiles)

| Paramètre | Documentation | Notre DTO | Statut | Recommandation |
|-----------|--------------|-----------|--------|----------------|
| `shippingZip` | Optionnel (max 20) | ❌ Manquant | ⚠️ | **Ajouter** |
| `shippingCounty` | Optionnel (max 50) | ❌ Manquant | ⚠️ | Optionnel |
| `shippingPhone` | Optionnel (max 20) | ✅ Requis | ⚠️ | Rendre optionnel |
| `shippingAddress2` | Optionnel (max 200) | ❌ Manquant | ⚠️ | **Ajouter** |
| `email` | Optionnel | ❌ Manquant | ⚠️ | **Ajouter** (utile) |
| `shopAmount` | Optionnel | ❌ Manquant | ⚠️ | **Ajouter** (montant total) |
| `remark` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `logisticName` | Optionnel | ✅ Requis | ⚠️ | OK (on l'utilise) |
| `fromCountryCode` | Optionnel | ✅ Optionnel | ✅ | OK |
| `platform` | Optionnel | ✅ Optionnel | ✅ | OK |
| `taxId` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `consigneeID` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `payType` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `houseNumber` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `iossType` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |
| `iossNumber` | Optionnel | ❌ Manquant | ⚠️ | Optionnel |

---

## 🔧 Structure Produits

### Documentation
```json
{
  "products": [
    {
      "vid": "92511400-C758-4474-93CA-66D442F5F787",
      "quantity": 1,
      "storeLineItemId": "test-lineItemId-1111"  // ⚠️ Optionnel mais utile
    }
  ]
}
```

### Notre Implémentation
```typescript
products: Array<{
  vid: string;
  quantity: number;
  // ❌ storeLineItemId manquant
}>
```

**⚠️ PROBLÈME** : `storeLineItemId` n'est pas envoyé, mais c'est utile pour le tracking.

---

## 📤 Structure Réponse API

### Documentation
```json
{
  "code": 200,
  "result": true,
  "message": "Success",
  "data": {
    "orderId": "210711100018655344",
    "orderNumber": "1234",
    "orderStatus": "CREATED",
    // ... autres champs
  },
  "requestId": "721341bf-abf8-4d8c-b400-1fbdaef79039"
}
```

### Notre Traitement
```typescript
if (responseAny && responseAny.code === 200 && responseAny.data) {
  return responseAny.data as any;  // ✅ Correct
}
```

**✅ CORRECT** : On extrait bien `data` de la réponse.

---

## 🚨 Problèmes Identifiés

### 1. `shippingProvince` Requis mais Optionnel
**Impact** : ⚠️ Moyen
- La doc dit que c'est requis
- Notre DTO le marque comme optionnel
- **Solution** : Rendre `shippingProvince` requis dans le DTO

### 2. Champs Utiles Manquants
**Impact** : ⚠️ Faible à Moyen
- `shippingZip` : Utile pour la livraison
- `shippingAddress2` : Utile pour adresses complètes
- `email` : Utile pour notifications
- `shopAmount` : Utile pour tracking du montant
- `storeLineItemId` : Utile pour mapping produits

### 3. `shippingPhone` Requis mais Devrait être Optionnel
**Impact** : ⚠️ Faible
- La doc dit optionnel
- Notre DTO le marque comme requis
- **Solution** : Rendre optionnel avec valeur par défaut

---

## ✅ Recommandations

### Priorité Haute
1. **Rendre `shippingProvince` requis** dans le DTO
2. **Ajouter `shippingZip`** (utile pour livraison)
3. **Ajouter `email`** (utile pour notifications CJ)

### Priorité Moyenne
4. **Ajouter `shippingAddress2`** (adresses complètes)
5. **Ajouter `shopAmount`** (montant total de la commande)
6. **Ajouter `storeLineItemId`** dans les produits (mapping)

### Priorité Basse
7. Rendre `shippingPhone` optionnel
8. Ajouter `remark` (notes internes)
9. Ajouter autres champs optionnels si besoin

---

## 📝 Code Actuel

### DTO Actuel (`cj-order-create.dto.ts`)
```typescript
export class CJOrderCreateDto {
  orderNumber: string;                    // ✅
  shippingCountryCode: string;            // ✅
  shippingCountry: string;                // ✅
  shippingProvince?: string;              // ⚠️ Devrait être requis
  shippingCity: string;                   // ✅
  shippingAddress: string;                // ✅
  shippingCustomerName: string;           // ✅
  shippingPhone: string;                  // ⚠️ Devrait être optionnel
  logisticName: string;                   // ✅
  fromCountryCode?: string;               // ✅
  platform?: string;                      // ✅
  products: CJOrderProductDto[];          // ✅
}
```

### Transformation Actuelle (`order-cj-integration.service.ts`)
```typescript
const orderDto = {
  orderNumber: cjOrderData.orderNumber,
  shippingCountryCode: cjOrderData.shippingCountryCode,
  shippingCountry: cjOrderData.shippingCountry,
  shippingProvince: cjOrderData.shippingProvince,  // ⚠️ Peut être undefined
  shippingCity: cjOrderData.shippingCity,
  shippingAddress: cjOrderData.shippingAddress,
  shippingCustomerName: cjOrderData.shippingCustomerName,
  shippingPhone: cjOrderData.shippingPhone || '',
  logisticName: cjOrderData.logisticName,
  fromCountryCode: cjOrderData.fromCountryCode || 'CN',
  platform: cjOrderData.platform || 'kamri',
  products: cjOrderData.products
    .filter(p => p.vid && p.vid.trim() !== '')
    .map(p => ({
      vid: p.vid!,
      quantity: p.quantity,
      // ❌ storeLineItemId manquant
    })),
};
```

---

## 🎯 Actions à Prendre

1. ✅ **Vérifier** que `shippingProvince` est toujours fourni dans `transformOrderToCJ()`
2. ✅ **Ajouter** les champs optionnels utiles au DTO
3. ✅ **Mettre à jour** la transformation pour inclure ces champs
4. ✅ **Tester** avec la documentation officielle

---

## 📚 Référence Documentation

**URL** : https://developers.cjdropshipping.com/en/api/api2/api/shopping.html#_1-2-create-order-v3-post

**Mise à jour** : 2025-01-08 (ajout header `platformToken`)

**Note** : La documentation indique que `platformToken` peut être vide si non requis.

