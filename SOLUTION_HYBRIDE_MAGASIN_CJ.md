# 🎯 Solution Hybride - Gestion du Magasin CJ

## 📋 Vue d'ensemble

Cette solution permet de **garder les produits CJ dans le magasin** tout en **filtrant ceux déjà importés** pour éviter l'encombrement. C'est la solution optimale pour gérer des milliers de produits.

## ✅ Implémentations terminées

### 1. ⚙️ Base de données (Prisma Schema)

**Fichier**: `server/prisma/schema.prisma`

Ajout de 2 champs au modèle `CJProductStore`:

```prisma
model CJProductStore {
  // ... champs existants ...
  
  // ✅ NOUVEAU : Statut d'importation
  importStatus      String  @default("not_imported")
  importedProductId String? // ID du produit dans Product (si importé)
}
```

**Valeurs possibles pour `importStatus`**:
- `not_imported` : Produit dans le magasin, jamais importé
- `imported_draft` : Produit importé en brouillon
- `imported_published` : Produit importé et publié

### 2. 🔄 Service de prévention des doublons

**Fichier**: `server/src/common/services/duplicate-prevention.service.ts`

La méthode `upsertCJStoreProduct` a été mise à jour pour :
- ✅ Initialiser `importStatus` à `'not_imported'` pour les nouveaux produits
- ✅ Préserver le statut existant lors des mises à jour

### 3. 📊 Script de mise à jour des produits existants

**Fichier**: `server/update-import-status.js`

Script exécuté avec succès qui a mis à jour **30 produits** :
- 29 produits → `imported_published` (actifs)
- 1 produit → `imported_draft` (brouillon)

**Utilisation** :
```bash
cd server
node update-import-status.js
```

## 🚧 À compléter : Frontend

### Filtrage des produits du magasin

Lorsque vous affichez les produits du magasin CJ, ajoutez ce filtre :

```typescript
// Dans votre composant React
const [showImportedProducts, setShowImportedProducts] = useState(false);

// Filtrer les produits
const storeProducts = allCJProducts.filter(product => {
  if (showImportedProducts) {
    return true; // Afficher tous
  }
  return product.importStatus === 'not_imported'; // Uniquement non importés
});
```

### Badge visuel

Ajoutez un badge pour indiquer le statut :

```tsx
{product.importStatus === 'imported_published' && (
  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
    ✅ Publié
  </span>
)}
{product.importStatus === 'imported_draft' && (
  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
    📝 Brouillon
  </span>
)}
```

### Toggle pour afficher/masquer

```tsx
<div className="flex items-center space-x-2 mb-4">
  <input
    type="checkbox"
    id="show-imported"
    checked={showImportedProducts}
    onChange={(e) => setShowImportedProducts(e.target.checked)}
    className="rounded"
  />
  <label htmlFor="show-imported" className="text-sm text-gray-700">
    Afficher les produits déjà importés
  </label>
</div>
```

## 🔧 À compléter : Backend

### Mise à jour automatique du statut lors de l'import

**Fichiers à modifier** :
1. `server/src/products/products.service.ts` - méthode `importCJProduct`
2. `server/src/suppliers/suppliers.service.ts` - méthode `importProducts`
3. `server/src/common/services/duplicate-prevention.service.ts` - méthode `upsertCJProduct`

**Code à ajouter après la création d'un produit** :

```typescript
// Après avoir créé le produit dans la table Product
const product = await this.prisma.product.create({ ... });

// ✅ Mettre à jour le statut d'import dans CJProductStore
await this.prisma.cJProductStore.updateMany({
  where: { cjProductId: pid },
  data: {
    importStatus: 'imported_draft',
    importedProductId: product.id
  }
});
```

### Mise à jour lors de la publication

Quand un produit passe de `draft` à `published` ou `active` :

```typescript
// Dans la méthode de mise à jour de produit
if (product.status === 'published' || product.status === 'active') {
  // ✅ Mettre à jour le statut dans le magasin CJ
  await this.prisma.cJProductStore.updateMany({
    where: { importedProductId: product.id },
    data: { importStatus: 'imported_published' }
  });
}
```

## 📊 Statistiques actuelles

```
📦 30 produits dans le magasin CJ:
   - 29 importés et publiés (imported_published)
   - 1 importé en brouillon (imported_draft)
   - 0 non importés (not_imported)
```

## 🎯 Avantages de cette solution

✅ **Synchronisation continue** : Les webhooks CJ peuvent toujours mettre à jour les produits  
✅ **Pas de perte de données** : Tous les produits restent accessibles  
✅ **Interface propre** : Filtrage intelligent pour masquer les produits déjà importés  
✅ **Traçabilité** : On sait toujours quel produit CJ correspond à quel produit KAMRI  
✅ **Scalable** : Fonctionne avec des milliers de produits  
✅ **Re-import facile** : Possibilité de ré-importer ou mettre à jour n'importe quel produit  

## 🚀 Prochaines étapes recommandées

1. **Frontend** : Ajouter le filtre sur la page du magasin CJ
2. **Backend** : Compléter la mise à jour automatique lors de l'import
3. **Tests** : Vérifier que le statut se met à jour correctement
4. **Documentation** : Mettre à jour le README avec ces informations

## 📝 Notes importantes

- ⚠️ Les produits déjà importés ne sont **PAS supprimés** du magasin
- 🔄 Les webhooks CJ continuent de synchroniser les produits (prix, stock, etc.)
- 🎨 Le filtrage est côté frontend pour plus de flexibilité
- 💾 La relation `importedProductId` permet de retrouver facilement le produit KAMRI

## 🔗 Fichiers modifiés

- ✅ `server/prisma/schema.prisma`
- ✅ `server/src/common/services/duplicate-prevention.service.ts`
- ✅ `server/update-import-status.js`
- ⏳ `apps/admin/src/app/admin/cj-dropshipping/products/page.tsx` (à compléter)
- ⏳ `server/src/products/products.service.ts` (à compléter)

