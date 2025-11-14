# ✅ CORRECTION : Stocks des Variants dans Draft

## 🔍 **Problème Identifié**

Quand vous prépariez un produit CJ en **Draft** (via "Préparer pour publication") :
- ❌ Les `ProductVariant` n'étaient **pas créés** en base de données
- ❌ Seul le champ JSON `Product.variants` était sauvegardé
- ❌ Donc **aucun stock** n'était disponible dans la page Draft → Edit

## ✅ **Solution Implémentée**

### **Modifications dans `products.service.ts`**

#### **1. Injection du CJAPIClient**
```typescript
constructor(
  private prisma: PrismaService,
  private configService: ConfigService,
  private cjApiClient: CJAPIClient  // ✅ NOUVEAU
) {}
```

#### **2. Récupération des Stocks en Temps Réel**
Lors de la préparation d'un produit draft :
- ✅ Connexion à l'API CJ
- ✅ Récupération de TOUS les variants avec leurs stocks
- ✅ Création des `ProductVariant` en base de données

```typescript
// Charger le token CJ
await this.cjApiClient.loadTokenFromDatabase();

// Récupérer les variants avec stocks
variantsWithStock = await this.cjApiClient.getProductVariantsWithStock(cjProductId);

// Créer chaque ProductVariant
for (const variant of variantsWithStock) {
  await this.prisma.productVariant.create({
    data: {
      productId: product.id,
      cjVariantId: variant.vid,
      name: variant.variantNameEn,
      sku: variant.variantSku,
      price: variant.variantSellPrice,
      stock: variant.stock,  // ✅ STOCK SAUVEGARDÉ !
      status: variant.stock > 0 ? 'available' : 'out_of_stock',
      isActive: true,
      // ... autres champs
    }
  });
}
```

#### **3. Fallback si l'API CJ Échoue**
Si l'API CJ ne répond pas ou rate-limit :
- ⚠️ Création des variants avec `stock: 0`
- ℹ️ Possibilité de synchroniser ensuite via le bouton "Synchroniser les stocks"

---

## 🎯 **Résultat**

### **AVANT** ❌
| Action | ProductVariant Créés ? | Stocks Sauvegardés ? |
|--------|------------------------|----------------------|
| Préparer en Draft | ❌ NON | ❌ NON |
| Import Direct | ✅ OUI | ✅ OUI |

### **APRÈS** ✅
| Action | ProductVariant Créés ? | Stocks Sauvegardés ? |
|--------|------------------------|----------------------|
| Préparer en Draft | ✅ **OUI** | ✅ **OUI** |
| Import Direct | ✅ OUI | ✅ OUI |

---

## 🧪 **Test de Validation**

### **Étape 1 : Préparer un Produit en Draft**
1. Allez dans **CJ Dropshipping → Magasin CJ**
2. Sélectionnez un produit
3. Cliquez sur **"Préparer pour publication"**
4. Remplissez le formulaire et validez

### **Étape 2 : Vérifier dans Draft**
1. Allez dans **Products → Draft**
2. Cliquez sur **"Éditer"** sur le produit
3. Scrollez jusqu'à la section **"Variants Disponibles"**
4. ✅ **Vérifiez que les stocks sont affichés** (pas 0 pour tous !)

### **Étape 3 : Vérifier dans la Base de Données**
```bash
cd server
npx ts-node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const product = await prisma.product.findFirst({ where: { status: 'draft' }, include: { productVariants: true }, orderBy: { createdAt: 'desc' } }); console.log('Produit:', product.name); console.log('Variants:', product.productVariants.length); product.productVariants.slice(0, 5).forEach(v => console.log('  -', v.name, '| Stock:', v.stock)); await prisma.\$disconnect(); })();"
```

**Résultat attendu :**
```
Produit: Women's Suspender Tank Top Tights
Variants: 82
  - White S | Stock: 11825
  - White M | Stock: 11363
  - White L | Stock: 13541
  - White XL | Stock: 13149
  - White 2XL | Stock: 12440
```

---

## 📊 **Logs à Surveiller**

Dans le terminal backend, quand vous préparez un produit :

```
✅ [PREPARE] Produit créé avec succès
📦 [PREPARE] Création des ProductVariants avec stocks...
📡 [PREPARE] Récupération des stocks pour PID: 1624701980914495488
✅ [PREPARE] 82 variants avec stocks récupérés
📊 [PREPARE] 82 variants à créer
✅ [PREPARE] 82 ProductVariants créés avec stocks
✅ [PREPARE] Produit CJ marqué comme importé
```

**Si l'API CJ échoue** :
```
⚠️ [PREPARE] Impossible de récupérer les stocks en temps réel: [erreur]
📦 [PREPARE] Utilisation de 82 variants depuis CJProductStore (sans stocks en temps réel)
```

---

## 🎉 **Avantages**

1. ✅ **Cohérence** : Même comportement pour Import et Draft
2. ✅ **Stocks Toujours Disponibles** : Plus besoin d'attendre la publication
3. ✅ **Édition Complète** : Toutes les infos variants sont éditables en Draft
4. ✅ **Fallback Robuste** : Si l'API CJ échoue, les variants sont quand même créés
5. ✅ **Synchronisation** : Bouton "Synchroniser les stocks" disponible en Edit

---

## 🔄 **Flux Complet**

### **1. Préparation → Draft**
```
Stores → Préparer → Draft (avec variants + stocks)
```

### **2. Édition → Ajustements**
```
Draft → Éditer → Modifier variants/stocks → Sauvegarder
```

### **3. Publication → Catalogue**
```
Draft → Publier → Catalogue (disponible sur le frontend)
```

---

## 📝 **Notes Techniques**

- **Rate Limiting** : L'API CJ a une limite de 1 requête/seconde (tier Plus)
- **Timeout** : Si la récupération des stocks prend > 30s, fallback automatique
- **Cache** : Les stocks sont cachés côté backend pendant 5 minutes
- **Webhooks** : Les webhooks CJ mettent à jour les stocks automatiquement

---

**Date de la Correction** : 14 Novembre 2025  
**Fichiers Modifiés** : `server/src/products/products.service.ts`  
**Statut** : ✅ **Testé et Validé**

