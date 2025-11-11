# 🔄 Comment synchroniser les variants dans ProductVariant

## Méthode 1 : Via l'interface Admin (Recommandé)

### Étape 1 : Trouver le produit
1. Aller sur `/admin/orders/create`
2. Chercher le produit par son ID CJ (ex: `CJHB1123384`)

### Étape 2 : Synchroniser
- Si le produit apparaît avec un bouton "Sync", cliquer dessus
- Le variant sera créé automatiquement dans `ProductVariant`

## Méthode 2 : Synchroniser tous les produits

1. Aller sur `/admin/orders/create`
2. Cliquer sur "Sync tous variants CJ" en haut à droite
3. Attendre la fin de la synchronisation

## Méthode 3 : Via l'API (Terminal/Postman)

### Pour un produit spécifique :
```bash
# Remplacer PRODUCT_ID par l'ID du produit dans la table Product
curl -X POST http://localhost:3001/api/cj-dropshipping/products/PRODUCT_ID/sync-variants-stock \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Pour tous les produits :
```bash
curl -X POST http://localhost:3001/api/cj-dropshipping/products/sync-all-variants \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

## Méthode 4 : Via le script TypeScript

```bash
# Synchroniser tous les produits
npx ts-node server/sync-cj-variants.ts

# Synchroniser un produit spécifique
npx ts-node server/sync-cj-variants.ts PRODUCT_ID
```

## Vérification

Pour vérifier que le variant est bien dans `ProductVariant` :

```sql
SELECT 
  pv.id,
  pv.cjVariantId,
  pv.sku,
  pv.name,
  pv.stock,
  p.name as product_name
FROM product_variants pv
JOIN products p ON p.id = pv.productId
WHERE p.cjProductId = 'CJHB1123384';
```

## Important

⚠️ **Le produit doit d'abord être dans la table `Product`** avant de pouvoir synchroniser ses variants.

Si le produit n'est pas encore importé :
1. Aller sur `/admin/cj-dropshipping/products`
2. Chercher le produit
3. Cliquer sur "Importer"
4. Ensuite synchroniser les variants

