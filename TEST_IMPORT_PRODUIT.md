# 🧪 TEST D'IMPORT DE PRODUIT CJ AVEC STOCKS

## ✅ État Initial
- ✅ Base de données nettoyée (0 produits, 0 variants)
- ✅ Code backend mis à jour (récupération stock via `/product/stock/getInventoryByPid`)
- ✅ Dashboard admin mis à jour (colonne Stock ajoutée dans ProductDetailsModal)
- ✅ Backend en cours d'exécution (port 3001)
- ✅ Admin dashboard en cours de démarrage (port 3002)

---

## 📋 PROCÉDURE DE TEST

### **ÉTAPE 1 : Accéder au Dashboard Admin**
1. Ouvrez votre navigateur
2. Allez sur `http://localhost:3002`
3. Connectez-vous (si nécessaire)

### **ÉTAPE 2 : Naviguer vers CJ Dropshipping**
1. Dans le menu latéral, cliquez sur **"CJ Dropshipping"**
2. Vous devriez voir l'interface de connexion/recherche CJ

### **ÉTAPE 3 : Vérifier la Connexion CJ**
- Si déjà connecté → passez à l'étape 4
- Si non connecté → cliquez sur "Se connecter à CJ"
- Le système devrait utiliser le token existant en base de données

### **ÉTAPE 4 : Rechercher un Produit**
1. Dans la barre de recherche, tapez : **"medical scrubs"** ou **"work clothes hospital"**
2. Cliquez sur "Rechercher"
3. Attendez les résultats

### **ÉTAPE 5 : Ouvrir les Détails d'un Produit** 🔍
1. Cliquez sur **"Product Details"** (ou l'icône 👁️) d'un produit
2. Le modal devrait s'ouvrir

### **ÉTAPE 6 : VÉRIFIER LA COLONNE STOCK** ⭐
**C'EST ICI QUE VOUS VERREZ LA DIFFÉRENCE !**

Dans le tableau des variants, vous devriez voir :

| Variant | VID | SKU | Price | **Stock** ⬅️ | Weight | Dimensions |
|---------|-----|-----|-------|-------------|--------|------------|
| Purple S | ... | ... | $5.31 | **✅ 150** (en vert) | 330g | ... |
| Purple M | ... | ... | $5.31 | **✅ 200** (en vert) | 350g | ... |
| Black S | ... | ... | $5.31 | **❌ 0** (en rouge) | 330g | ... |

**Stock > 0** = Affiché en **VERT** 🟢
**Stock = 0** = Affiché en **ROUGE** 🔴
**Stock N/A** = Affiché en **GRIS** ⚪

### **ÉTAPE 7 : Importer le Produit** 📦
1. Dans le modal "Product Details", cliquez sur **"Importer ce produit"**
2. Attendez la fin de l'import (notification de succès)
3. Fermez le modal

### **ÉTAPE 8 : Vérifier dans la Base de Données**

Ouvrez un nouveau terminal et exécutez :
```bash
cd server
npx ts-node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const product = await prisma.product.findFirst({ include: { productVariants: true } }); console.log('Produit:', product.name); console.log('Variants:', product.productVariants.length); product.productVariants.slice(0, 3).forEach(v => console.log('  -', v.name, '| Stock:', v.stock)); await prisma.\$disconnect(); })();"
```

**Résultat attendu :**
```
Produit: Short Sleeve Hollow Work Clothes Hospital...
Variants: 60
  - Purple S | Stock: 150
  - Purple M | Stock: 200
  - Purple L | Stock: 180
```

### **ÉTAPE 9 : Tester sur le Frontend Web** 🌐

1. Ouvrez `http://localhost:3000`
2. Allez sur la page du produit importé
3. Sélectionnez une couleur et une taille
4. **Vérifiez que le stock s'affiche correctement**
   - Si stock > 0 → Bouton "Ajouter au panier" actif
   - Si stock = 0 → Message "Rupture de stock"

---

## ✅ CRITÈRES DE SUCCÈS

- [ ] La colonne "Stock" est visible dans le modal "Product Details"
- [ ] Les stocks sont affichés avec les bonnes couleurs (vert/rouge)
- [ ] L'import du produit sauvegarde les stocks dans ProductVariant
- [ ] Les stocks sont corrects dans la base de données
- [ ] Le frontend web affiche correctement les stocks
- [ ] La sélection de variant met à jour le stock affiché

---

## ❌ SI PROBLÈME

### Le stock affiche "N/A" dans le modal
➡️ L'API CJ n'a pas retourné le stock pour ce produit
➡️ Essayez un autre produit

### Le stock est 0 pour tous les variants après import
➡️ Vérifiez les logs backend pendant l'import
➡️ Cherchez : `📦 === ENRICHISSEMENT VARIANTS AVEC STOCK ===`
➡️ Vérifiez qu'il dit : `✅ X variants enrichis avec stock`

### La colonne Stock n'apparaît pas
➡️ Videz le cache du navigateur (Ctrl+F5)
➡️ Vérifiez que ProductDetailsModal.tsx a bien été recompilé

---

## 📊 LOGS À SURVEILLER

Dans le terminal backend, cherchez :
```
📦 === ENRICHISSEMENT VARIANTS AVEC STOCK ===
⚡ === RÉCUPÉRATION STOCK BULK (PID: ...) ===
✅ Variant XXXXXXX: 150 en stock
✅ Stock de 60 variants récupéré en 1 requête
✅ 60 variants enrichis avec stock
```

Si vous voyez `⚠️ Aucun stock variant trouvé` → Le produit n'a pas de stock sur CJ

---

## 🎯 RÉSULTAT ATTENDU FINAL

**Après ce test complet, vous devriez avoir :**
1. ✅ Un produit importé avec 60 variants
2. ✅ Chaque variant avec son stock correct en base de données
3. ✅ La colonne Stock visible dans l'admin
4. ✅ Le stock affiché correctement sur le frontend web
5. ✅ Le système prêt pour importer tous vos produits !

---

**🎉 Si tout fonctionne, vous pourrez réimporter tous vos produits CJ avec les stocks corrects !**

