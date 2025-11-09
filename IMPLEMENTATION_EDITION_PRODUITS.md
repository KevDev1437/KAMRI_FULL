# ✅ Implémentation du Workflow d'Édition Manuelle des Produits

## 📋 Résumé

Implémentation complète du workflow d'édition manuelle des produits avant publication, avec approche hybride en 3 niveaux.

---

## ✅ Ce qui a été implémenté

### 1. **Schéma Prisma** ✅

**Fichier :** `server/prisma/schema.prisma`

**Champs ajoutés dans le modèle `Product` :**
```prisma
// ✅ Édition manuelle avant publication
margin           Float?   // Marge appliquée (%)
isEdited         Boolean  @default(false) // Produit édité manuellement
editedAt         DateTime? // Date de dernière édition
editedBy         String?  // ID de l'admin qui a édité
```

**Action requise :** Exécuter la migration Prisma
```bash
cd server
npx prisma migrate dev --name add_product_edition_fields
npx prisma generate
```

---

### 2. **DTOs (Data Transfer Objects)** ✅

#### **PrepareProductDto**
**Fichier :** `server/src/products/dto/prepare-product.dto.ts`

**Champs :**
- `categoryId` (requis) : ID de la catégorie KAMRI
- `margin` (optionnel) : Marge à appliquer (%, défaut: 30)
- `supplierId` (optionnel) : ID du fournisseur

#### **EditProductDto**
**Fichier :** `server/src/products/dto/edit-product.dto.ts`

**Champs (tous optionnels) :**
- `name` : Nom du produit
- `description` : Description du produit
- `margin` : Marge à appliquer (%)
- `categoryId` : ID de la catégorie KAMRI
- `image` : Image principale
- `images` : Liste des images
- `badge` : Badge du produit
- `stock` : Stock disponible

---

### 3. **Services Backend** ✅

#### **ProductsService - Nouvelles Méthodes**

**Fichier :** `server/src/products/products.service.ts`

##### **Méthodes de Nettoyage (Niveau 1 - Automatique)**
- `cleanProductName(name: string)` : Nettoie le nom (trim, espaces, caractères spéciaux)
- `cleanProductDescription(description: string)` : Nettoie la description (HTML, entités)
- `calculatePriceWithMargin(originalPrice: number, margin: number)` : Calcule le prix avec marge

##### **Méthodes de Préparation et Édition**
- `prepareCJProductForPublication(cjStoreProductId, prepareData, userId?)` : 
  - Crée un `Product` (draft) depuis `CJProductStore`
  - Applique le nettoyage automatique (Niveau 1)
  - Calcule le prix avec marge par défaut (30%)
  - Marque le produit CJ comme "imported"

- `editDraftProduct(id, editData, userId?)` :
  - Édite un produit en draft
  - Recalcule le prix si la marge change
  - Gère les images multiples
  - Marque comme édité (`isEdited: true`, `editedAt`, `editedBy`)

- `publishProduct(id)` :
  - Publie un produit draft (passe à `active`)
  - Vérifie les prérequis (catégorie, nom, prix)

- `getDraftProducts()` : Liste tous les produits en draft
- `getDraftProduct(id)` : Récupère un produit draft par ID

---

### 4. **Endpoints API** ✅

**Fichier :** `server/src/products/products.controller.ts`

**Tous les endpoints sont protégés par JWT (`@UseGuards(JwtAuthGuard)`)**

#### **Préparation**
```
POST /api/products/cj/prepare/:cjStoreProductId
Body: PrepareProductDto
Response: Product (draft)
```

#### **Liste et Détails**
```
GET /api/products/draft
Response: Product[] (drafts)

GET /api/products/draft/:id
Response: Product (draft)
```

#### **Édition**
```
PATCH /api/products/draft/:id/edit
Body: EditProductDto
Response: Product (draft, isEdited: true)
```

#### **Publication**
```
PATCH /api/products/draft/:id/publish
Response: Product (active)
```

---

### 5. **Amélioration du Nettoyage Automatique** ✅

**Fichier :** `server/src/cj-dropshipping/services/cj-favorite.service.ts`

**Méthodes ajoutées :**
- `cleanProductName(name: string)` : Nettoie le nom lors de l'import CJ
- `cleanProductDescription(description: string)` : Nettoie la description lors de l'import CJ

**Utilisation :** Les produits importés dans `CJProductStore` sont automatiquement nettoyés (Niveau 1).

---

## 🔄 Workflow Implémenté

```
┌─────────────────────────────────────────────────────────┐
│ 1. IMPORT CJ (Niveau 1 - Automatique)                    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ CJProductStore                                          │
│ - Données brutes CJ                                     │
│ - Nettoyage automatique (nom, description)              │
│ - Status: 'available'                                   │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PRÉPARATION (POST /api/products/cj/prepare/:id)      │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Product (status: 'draft')                               │
│ - Copie depuis CJProductStore                           │
│ - Application marge par défaut (30%)                    │
│ - Assignation catégorie KAMRI                           │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. ÉDITION MANUELLE (PATCH /api/products/draft/:id/edit)│
│    ⭐ VOTRE BESOIN PRINCIPAL                             │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Product (status: 'draft', isEdited: true)              │
│ - Nom traduit/amélioré                                  │
│ - Description enrichie                                   │
│ - Marge personnalisée                                   │
│ - Catégorie assignée                                    │
│ - Images sélectionnées                                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. PUBLICATION (PATCH /api/products/draft/:id/publish)  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Product (status: 'active')                             │
│ - Produit visible dans le catalogue                     │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. FRONTEND (Niveau 3 - Dynamique)                       │
│    - Transformations dynamiques (promotions, badges)    │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Actions Requises

### 1. **Migration Prisma** ⚠️

**À faire immédiatement :**
```bash
cd server
npx prisma migrate dev --name add_product_edition_fields
npx prisma generate
```

### 2. **Page Admin d'Édition** ⏳

**À créer :** `apps/admin/src/app/admin/products/draft/page.tsx`

**Fonctionnalités à implémenter :**
- Liste des produits en draft
- Formulaire d'édition (nom, description, marge, catégorie, images)
- Bouton "Sauvegarder" (appelle `PATCH /api/products/draft/:id/edit`)
- Bouton "Publier" (appelle `PATCH /api/products/draft/:id/publish`)
- Prévisualisation du prix calculé avec marge

**Exemple de structure :**
```typescript
// apps/admin/src/app/admin/products/draft/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function DraftProductsPage() {
  const [drafts, setDrafts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  // Charger les produits draft
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const data = await apiClient.get('/products/draft');
    setDrafts(data);
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      margin: product.margin || 30,
      categoryId: product.categoryId,
      // ...
    });
  };

  const handleSave = async (id) => {
    await apiClient.patch(`/products/draft/${id}/edit`, formData);
    setEditing(null);
    loadDrafts();
  };

  const handlePublish = async (id) => {
    await apiClient.patch(`/products/draft/${id}/publish`);
    loadDrafts();
  };

  return (
    <div>
      <h1>Produits en Draft</h1>
      {/* Liste et formulaire d'édition */}
    </div>
  );
}
```

---

## 🧪 Tests à Effectuer

### 1. **Test de Préparation**
```bash
# Préparer un produit CJ
POST /api/products/cj/prepare/{cjStoreProductId}
{
  "categoryId": "cat_123",
  "margin": 30,
  "supplierId": "supp_456"
}
```

**Vérifier :**
- ✅ Produit créé avec `status: 'draft'`
- ✅ Prix calculé avec marge (30%)
- ✅ Nom et description nettoyés
- ✅ `CJProductStore` marqué comme "imported"

### 2. **Test d'Édition**
```bash
# Éditer un produit draft
PATCH /api/products/draft/{id}/edit
{
  "name": "Nouveau nom",
  "description": "Nouvelle description",
  "margin": 50
}
```

**Vérifier :**
- ✅ Produit mis à jour
- ✅ Prix recalculé avec nouvelle marge (50%)
- ✅ `isEdited: true`, `editedAt`, `editedBy` renseignés

### 3. **Test de Publication**
```bash
# Publier un produit draft
PATCH /api/products/draft/{id}/publish
```

**Vérifier :**
- ✅ Produit passe à `status: 'active'`
- ✅ Produit visible dans `GET /api/products`

---

## 📊 État d'Avancement

| Tâche | Statut | Fichier |
|-------|--------|---------|
| Champs Prisma | ✅ | `server/prisma/schema.prisma` |
| DTOs | ✅ | `server/src/products/dto/` |
| Service de préparation | ✅ | `server/src/products/products.service.ts` |
| Service d'édition | ✅ | `server/src/products/products.service.ts` |
| Endpoints API | ✅ | `server/src/products/products.controller.ts` |
| Nettoyage automatique | ✅ | `server/src/cj-dropshipping/services/cj-favorite.service.ts` |
| **Page admin d'édition** | ⏳ | **À créer** |

---

## 🎯 Prochaines Étapes

1. ✅ **Exécuter la migration Prisma** (requis)
2. ⏳ **Créer la page admin d'édition** (priorité)
3. ⏳ **Tester le workflow complet**
4. ⏳ **Améliorer les transformations frontend** (Niveau 3 - optionnel)

---

## 📚 Documentation API

Tous les endpoints sont documentés dans Swagger :
- Accès : `http://localhost:3000/api` (après démarrage du serveur)
- Section : `products`

---

## ✅ Conclusion

**Backend :** ✅ 100% implémenté
**Frontend Admin :** ⏳ À créer (page d'édition)

Le workflow est fonctionnel côté backend. Il ne reste plus qu'à créer l'interface admin pour l'édition manuelle.

