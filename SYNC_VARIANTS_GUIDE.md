# 🔄 GUIDE : Synchroniser les Variants CJ

## Problème

Tous vos produits CJ affichent "⚠️ Pas de variant" car les variants ne sont pas créés dans la table `ProductVariant`.

## Solution : Synchroniser les Variants

### Option 1 : Via l'API (Recommandé)

**Synchroniser tous les produits CJ en une fois** :

```bash
curl -X POST http://localhost:3001/api/cj-dropshipping/products/sync-all-variants \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

**Synchroniser un produit spécifique** :

```bash
# Remplacer PRODUCT_ID par l'ID du produit
curl -X POST http://localhost:3001/api/cj-dropshipping/products/PRODUCT_ID/sync-variants-stock \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

### Option 2 : Via le Frontend Admin

1. Aller sur `/admin/cj-dropshipping/products`
2. Pour chaque produit CJ, cliquer sur "Synchroniser variants" (si le bouton existe)
3. Ou utiliser l'API directement depuis la console du navigateur

### Option 3 : Script de synchronisation

Le script `server/sync-cj-variants.ts` est disponible mais nécessite d'attendre le rate limit.

## Après Synchronisation

Une fois les variants synchronisés :

1. **Rechargez la page** `/admin/orders/create`
2. Les produits CJ devraient maintenant avoir des variants
3. Le badge "⚠️ Pas de variant" devrait disparaître
4. Vous pourrez créer des commandes CJ normalement

## Vérification

Pour vérifier qu'un produit a des variants :

```sql
SELECT 
  p.id,
  p.name,
  p.cjProductId,
  COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.productId = p.id
WHERE p.source = 'cj-dropshipping'
  AND p.cjProductId IS NOT NULL
GROUP BY p.id
HAVING variant_count > 0;
```

## Note Importante

⚠️ **Rate Limiting** : CJ limite les requêtes selon votre tier :
- **Free** : 1 req/s
- **Plus** : 2 req/s (votre tier actuel)
- **Prime** : 4 req/s
- **Advanced** : 6 req/s

La synchronisation de tous les produits peut prendre du temps. Le système respecte automatiquement les limites.

---

**Commencez par synchroniser quelques produits pour tester, puis synchronisez tous les produits.**

