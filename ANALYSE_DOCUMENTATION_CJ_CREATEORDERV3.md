# 📚 Analyse Documentation CJ createOrderV3

## ✅ Champs Requis (Y) selon la documentation

### Paramètres principaux
- `orderNumber` (string, 50) - Identifiant unique de la commande
- `shippingCountryCode` (string, 20) - Code pays à 2 lettres (ISO 3166-1 alpha-2)
- `shippingCountry` (string, 50) - Nom du pays
- `shippingProvince` (string, 50) - Province/État
- `shippingCity` (string, 50) - Ville
- `shippingAddress` (string, 200) - Adresse
- `shippingCustomerName` (string, 50) - Nom du client
- `logisticName` (string, 50) - Nom de la logistique
- `fromCountryCode` (string, 20) - Code pays d'expédition (REQUIS Y)
- `products` (List) - Liste des produits

### Paramètres produits
- `vid` (string, 50) - **Optionnel mais requis si pas de sku**
- `sku` (string, 50) - **Optionnel mais requis si pas de vid**
- `quantity` (int, 50) - **REQUIS**

## ⚠️ Champs Optionnels mais Importants

### Paramètres principaux
- `shippingZip` (string, 20) - Code postal
- `shippingCounty` (string, 50) - Comté
- `shippingPhone` (string, 20) - Téléphone
- `shippingAddress2` (string, 200) - Adresse ligne 2
- `houseNumber` (string, 20) - Numéro de maison
- `email` (string, 50) - Email
- `taxId` (string, 20) - ID taxe
- `remark` (string, 500) - Remarque
- `consigneeID` (string, 20) - ID destinataire
- `shopAmount` (BigDecimal, 20) - Montant commande store
- `platform` (string, 20) - Plateforme (shopify, etc.)
- `iossType` (int, 20) - Type IOSS
- `iossNumber` (string, 10) - Numéro IOSS

### Paramètres produits
- `unitPrice` (BigDecimal, 20) - Prix unitaire
- `storeLineItemId` (string, 125) - ID ligne commande store
- `podProperties` (string, 500) - Propriétés POD (JSON string)

## 🔍 Découverte Importante : `productionImgList`

### Constat
- **Non documenté** dans les paramètres de requête de `createOrderV3`
- **Apparaît dans la réponse** (`podPropertiesInfo.productionImgList`)
- **Erreur 5021** : "productionImgList is empty, order cannot be created"

### Hypothèses
1. **Champ requis non documenté** : CJ exige ce champ même s'il n'est pas dans la doc officielle
2. **Requis pour certains produits** : Peut-être requis pour les produits POD (Print on Demand)
3. **Doit être inclus dans `podProperties`** : Peut-être que les images doivent être dans `podProperties` au lieu d'un champ séparé

### Solution Implémentée
- Envoyer `productionImgList` comme **tableau vide `[]`** si aucune image n'est disponible
- Ne jamais envoyer `undefined` ou omettre le champ
- Récupérer les images depuis :
  1. Relation Prisma `images`
  2. Champ `product.image` (JSON ou URL)
  3. Image du variant
  4. Image du produit directement

## 📋 Vérification de Conformité

### ✅ Champs Requis - Tous Présents
- [x] `orderNumber` - Généré automatiquement
- [x] `shippingCountryCode` - Récupéré depuis l'adresse
- [x] `shippingCountry` - Récupéré depuis l'adresse
- [x] `shippingProvince` - Récupéré depuis l'adresse (avec fallback 'N/A')
- [x] `shippingCity` - Récupéré depuis l'adresse
- [x] `shippingAddress` - Récupéré depuis l'adresse
- [x] `shippingCustomerName` - Récupéré depuis l'adresse
- [x] `logisticName` - Sélectionné selon le pays
- [x] `fromCountryCode` - Défini à 'CN' par défaut
- [x] `products` - Transformés depuis les items de commande
- [x] `products[].vid` - Récupéré depuis `ProductVariant.cjVariantId`
- [x] `products[].quantity` - Récupéré depuis `OrderItem.quantity`

### ✅ Champs Optionnels - Inclus si Disponibles
- [x] `shippingZip` - Inclus si disponible
- [x] `shippingAddress2` - Inclus si disponible
- [x] `shippingPhone` - Inclus si disponible (fallback à '' si vide)
- [x] `email` - Inclus si disponible
- [x] `shopAmount` - Inclus (montant total de la commande)
- [x] `platform` - Défini à 'kamri'
- [x] `products[].storeLineItemId` - ID de `OrderItem`
- [x] `products[].productionImgList` - **Toujours envoyé (vide si pas d'images)**

## 🎯 Points d'Attention

1. **`fromCountryCode` est REQUIS (Y)** - ✅ Déjà géré (défaut 'CN')
2. **`productionImgList` non documenté mais requis** - ✅ Géré (tableau vide si nécessaire)
3. **`vid` ou `sku` requis** - ✅ Toujours `vid` utilisé (depuis `ProductVariant.cjVariantId`)
4. **`shippingProvince` requis** - ✅ Géré avec fallback 'N/A' si manquant

## 📝 Notes

- La documentation officielle ne mentionne pas `productionImgList` dans les paramètres de requête
- L'erreur 5021 suggère que ce champ est requis dans certains contextes
- Solution : Toujours envoyer `productionImgList` (même vide) pour éviter l'erreur

