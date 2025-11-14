# 🔄 GUIDE COMPLET - RÉIMPORT & TESTS

**Date**: 14 Novembre 2025  
**Objectif**: Vider la BD et réimporter pour tester les corrections

---

## 📋 **CHECKLIST COMPLÈTE**

- [ ] 1. Vider la base de données
- [ ] 2. Démarrer le backend
- [ ] 3. Réimporter 1-2 produits de test
- [ ] 4. Vérifier les stocks dans Prisma Studio
- [ ] 5. Tester sur le frontend
- [ ] 6. Valider que tout fonctionne

---

## 🗑️ **ÉTAPE 1 : VIDER LA BASE DE DONNÉES**

### Commandes à exécuter :

```bash
cd server
npx ts-node reset-cj-products.ts
```

**Résultat attendu** :
```
✅ X variants supprimés
✅ X mappings CJ supprimés
✅ X produits CJ supprimés
✅ X produits CJ Store supprimés
```

---

## 🚀 **ÉTAPE 2 : DÉMARRER LE BACKEND**

### Dans un terminal séparé :

```bash
cd server
npm run start:dev
```

**Attendez de voir** :
```
[Nest] Application successfully started
```

---

## 📦 **ÉTAPE 3 : IMPORTER DES PRODUITS DE TEST**

### Option A : Via l'interface admin

1. **Ouvrez** : `http://localhost:3002/admin/cj-dropshipping`

2. **Recherchez** : "Short Sleeve" ou "CJYD216578501AZ"

3. **Cliquez sur "Importer"** sur 1-2 produits

4. **Attendez** le message de succès

### Option B : Via l'API directement

```bash
curl -X POST http://localhost:3001/api/cj-dropshipping/import-product \
  -H "Content-Type: application/json" \
  -d '{"pid": "2410201006291602200", "margin": 0}'
```

---

## 🔍 **ÉTAPE 4 : VÉRIFIER LES STOCKS DANS PRISMA STUDIO**

### 1. Ouvrir Prisma Studio

```bash
cd server
npm run db:studio
```

Puis allez sur `http://localhost:5555`

### 2. Vérifier la table `ProductVariant`

**Navigation** : Tables → ProductVariant

**Points à vérifier** :

| Champ | Attendu |
|-------|---------|
| `stock` | ✅ **Valeur numérique (pas 0, pas NULL)** |
| `status` | ✅ `'available'` ou `'out_of_stock'` |
| `lastSyncAt` | ✅ Date récente |
| `cjVariantId` | ✅ ID CJ valide |

**❌ Si stock = 0 ou NULL** :
- Mes corrections n'ont PAS fonctionné
- Vérifiez les logs backend

**✅ Si stock > 0** :
- Mes corrections FONCTIONNENT ! 🎉
- Passez à l'étape 5

### 3. Exemple de résultat attendu

```
ProductVariant:
  - name: "Short Sleeve ... Purple S"
    stock: 156  ✅ (pas 0 !)
    status: "available"
    lastSyncAt: 2025-11-14...

  - name: "Short Sleeve ... Green XXL"
    stock: 89   ✅ (pas 0 !)
    status: "available"
    lastSyncAt: 2025-11-14...
```

---

## 🌐 **ÉTAPE 5 : TESTER SUR LE FRONTEND**

### 1. Trouver l'ID du produit

Dans Prisma Studio :
- Table `Product`
- Copiez l'`id` du produit importé

### 2. Ouvrir la page produit

```
http://localhost:3000/product/[COLLEZ_L_ID_ICI]
```

**Exemple** :
```
http://localhost:3000/product/cmhxyz123abc456
```

### 3. Tester les variants

**Actions** :
1. Sélectionnez une couleur (ex: Green)
2. Sélectionnez une taille (ex: XXL)
3. Regardez l'affichage du stock

**Résultat attendu** :
```
✅ "156 en stock"  (ou autre nombre > 0)

PAS :
❌ "Rupture de stock"
❌ "0 en stock"
```

### 4. Vérifier dans la console navigateur

**Ouvrir** : `F12` → Console

**Chercher** :
```javascript
✅ Variant trouvé: { 
  id: "...", 
  color: "Green", 
  size: "XXL", 
  stock: 156  // ✅ Pas 0 !
}
```

---

## ✅ **ÉTAPE 6 : VALIDATION FINALE**

### Checklist de validation :

- [ ] ✅ Produit importé avec succès
- [ ] ✅ Variants créés dans `ProductVariant`
- [ ] ✅ Champ `stock` rempli (pas 0, pas NULL)
- [ ] ✅ Frontend affiche "X en stock"
- [ ] ✅ Sélection couleur/taille fonctionne
- [ ] ✅ Message "Rupture de stock" disparu

### Si TOUT est ✅ :

🎉 **MES CORRECTIONS FONCTIONNENT !**

Vous pouvez maintenant :
1. Importer tous vos produits CJ
2. Tous auront leurs stocks corrects dès l'import
3. Plus besoin de synchronisation manuelle

### Si quelque chose est ❌ :

**Vérifiez les logs backend** :

```bash
# Cherchez dans les logs :
[CJFavoriteService] === ENRICHISSEMENT VARIANTS AVEC STOCK ===
[CJFavoriteService] ✅ X variants enrichis avec stock
[CJFavoriteService] 📊 Stock total du produit: X unités
```

**Si vous voyez** :
```
⚠️ Aucun variant avec stock trouvé
```

**Causes possibles** :
1. API CJ a échoué
2. PID incorrect
3. Produit supprimé sur CJ

**Solution** : Essayez un autre produit

---

## 🐛 **DEBUGGING**

### Si les stocks sont toujours à 0 :

**1. Vérifier que mes corrections sont bien là** :

```bash
cd server/src/cj-dropshipping/services
grep "stock: parseInt" cj-webhook.service.ts
```

**Attendu** :
```typescript
stock: parseInt(v.stock || v.variantStock || '0', 10),
```

**2. Vérifier les logs d'import** :

Dans le terminal backend, cherchez :
```
📦 Création de X variants dans ProductVariant...
✅ Variants créés: X, mis à jour: X
```

**3. Tester l'API CJ directement** :

```bash
cd server
npx ts-node test-single-sync.ts
```

---

## 📊 **RAPPORT APRÈS TESTS**

### À remplir après vos tests :

**Import réussi ?** : [ ] OUI / [ ] NON

**Stocks présents ?** : [ ] OUI / [ ] NON

**Frontend affiche ?** : [ ] OUI / [ ] NON

**Nombre de produits testés** : _____

**Problèmes rencontrés** : 
```
(décrivez ici)
```

---

## 🎯 **SCÉNARIOS DE TEST**

### Test 1 : Import basique

**Produit** : Short Sleeve Hollow Work Clothes  
**PID CJ** : 2410201006291602200  
**Variants attendus** : 60  
**Stock attendu** : > 0  

### Test 2 : Webhook CJ

**Attendez un webhook CJ** (nouveau produit ajouté sur CJ)  
**Vérifiez** : Le produit arrive avec stock ≠ 0  

### Test 3 : Produit sans variants

**Produit** : (un produit simple sans couleurs/tailles)  
**Attendu** : Stock global du produit utilisé  

---

## 💡 **CONSEILS**

### ✅ Bonnes pratiques :

1. **Testez avec 1-2 produits d'abord**
2. **Vérifiez Prisma Studio après chaque import**
3. **Gardez les logs backend ouverts**
4. **Testez plusieurs combinaisons couleur/taille**

### ⚠️ À éviter :

1. ❌ Importer 100 produits d'un coup
2. ❌ Ne pas vérifier les logs
3. ❌ Ignorer les erreurs dans la console

---

## 📞 **EN CAS DE PROBLÈME**

Si après le réimport, les stocks sont toujours à 0 :

1. **Envoyez-moi les logs backend** (section avec `[CJFavoriteService]`)
2. **Screenshot de Prisma Studio** (table ProductVariant)
3. **URL du produit testé**
4. **Console navigateur** (logs de ProductInfo.tsx)

Je pourrai alors diagnostiquer précisément le problème !

---

## 🎉 **CONCLUSION**

Avec mes corrections :
- ✅ Webhooks créent variants avec stock
- ✅ Import manuel crée variants avec stock
- ✅ Frontend affiche les stocks correctement
- ✅ Plus de "Rupture de stock" injustifiée

**C'est parti pour le test !** 🚀

---

**Document créé le** : 14/11/2025  
**Temps estimé** : 15-20 minutes  
**Niveau** : Débutant  

