# 🔍 Diagnostic Erreur "Invalid products"

## ❌ Erreur Actuelle

```
code: 1603000
message: "100202:Invalid products."
```

## 🔎 Causes Possibles

### 1. **VID Invalide ou Inexistant**
- Le `vid` (variant ID) n'existe pas dans CJ
- Le `vid` a été supprimé ou désactivé
- Le `vid` est un PID (product ID) au lieu d'un VID (variant ID)

### 2. **Format VID Incorrect**
- Le format du `vid` n'est pas reconnu par CJ
- Caractères spéciaux non autorisés
- VID vide ou null

### 3. **Produit Sans Variant Actif**
- Le produit n'a pas de variant actif dans CJ
- Les variants ont été désactivés

## ✅ Améliorations Apportées

### 1. Validation Renforcée
- ✅ Vérification que le variant est actif (`isActive: true`)
- ✅ Vérification que `cjVariantId` existe et n'est pas vide
- ✅ Validation du format du `vid` (alphanumérique)
- ✅ Filtrage des produits invalides avant envoi

### 2. Logs Détaillés
- ✅ Log de chaque produit avec son `vid` et `quantity`
- ✅ Log des produits validés avant envoi
- ✅ Log des données complètes envoyées à CJ

### 3. Gestion d'Erreurs
- ✅ Messages d'erreur plus clairs
- ✅ Identification des produits problématiques
- ✅ Suggestion de synchroniser les variants

## 🧪 Prochaines Étapes de Diagnostic

### 1. Vérifier les Logs
Lors de la prochaine création de commande, vérifier dans les logs :
```
✅ Produit {id} ajouté avec vid={vid}, quantity={quantity}
📦 Produits validés: [...]
📤 Envoi commande CJ avec produits: [...]
```

### 2. Vérifier les Variants en Base
```sql
-- Vérifier les variants d'un produit
SELECT p.id, p.name, p.cjProductId, 
       pv.id as variant_id, pv.cjVariantId, pv.isActive, pv.sku
FROM products p
LEFT JOIN product_variants pv ON pv.productId = p.id
WHERE p.cjProductId IS NOT NULL
ORDER BY p.id, pv.isActive DESC;
```

### 3. Vérifier les Variants dans CJ
- Utiliser l'API CJ pour vérifier si les `vid` existent
- Endpoint : `GET /product/variant/query?pid={pid}`

## 🔧 Solutions

### Solution 1 : Synchroniser les Variants
Si les variants sont manquants ou invalides :
1. Aller sur `/admin/orders/create`
2. Cliquer sur "Synchroniser tous les variants CJ"
3. Attendre la fin de la synchronisation
4. Réessayer de créer la commande

### Solution 2 : Vérifier les VID Manuellement
1. Ouvrir la console du navigateur
2. Vérifier les logs backend pour voir les `vid` envoyés
3. Vérifier dans CJ si ces `vid` existent

### Solution 3 : Utiliser l'API CJ pour Valider
Créer un script de validation :
```typescript
// Vérifier si un vid existe dans CJ
const vid = "2511110210411613200";
const response = await cjApiClient.getVariantDetails(vid);
if (!response) {
  console.error(`VID ${vid} n'existe pas dans CJ`);
}
```

## 📋 Checklist de Vérification

- [ ] Les produits ont des variants avec `cjVariantId` non null
- [ ] Les variants sont actifs (`isActive: true`)
- [ ] Les `vid` sont au format correct (alphanumérique)
- [ ] Les `vid` existent dans CJ (vérifier via API)
- [ ] Les quantités sont > 0
- [ ] Les logs montrent les produits validés avant envoi

## 🎯 Action Immédiate

**Pour la prochaine commande, vérifier les logs pour voir :**
1. Quels `vid` sont envoyés
2. Si les produits sont bien validés
3. Le message d'erreur exact de CJ

Les logs améliorés devraient maintenant montrer exactement quels produits sont envoyés et pourquoi ils sont rejetés.

