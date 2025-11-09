# 📊 Détails des Sections du Dashboard Admin - Du Bas vers le Haut

## 📋 Vue d'ensemble

Le dashboard admin KAMRI est organisé en sections verticales dans la sidebar. Cette documentation détaille chaque section **en partant du bas vers le haut**, expliquant comment chaque section fonctionne selon le code.

---

## 🔵 1. CJ Dropshipping (Section du Bas - Actuellement Sélectionnée)

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/cj-dropshipping/page.tsx`  
**Sous-pages :**
- `apps/admin/src/app/admin/cj-dropshipping/config/page.tsx` - Configuration
- `apps/admin/src/app/admin/cj-dropshipping/products/page.tsx` - Recherche/Import produits
- `apps/admin/src/app/admin/cj-dropshipping/categories/page.tsx` - Catégories CJ
- `apps/admin/src/app/admin/cj-dropshipping/orders/page.tsx` - Commandes CJ
- `apps/admin/src/app/admin/cj-dropshipping/webhooks/page.tsx` - Webhooks
- `apps/admin/src/app/admin/cj-dropshipping/cache/page.tsx` - Gestion du cache

### 🎯 Fonction Principale
Gestion complète de l'intégration CJ Dropshipping avec KAMRI, incluant la configuration, l'import de produits, la synchronisation des favoris, et la gestion des commandes.

### 🔧 Composants Utilisés

#### Hook Personnalisé
- **`useCJDropshipping`** (`apps/admin/src/hooks/useCJDropshipping.ts`)
  - Encapsule tous les appels API CJ
  - Méthodes : `getConfig()`, `getStats()`, `testConnection()`, `getConnectionStatus()`, `getDefaultProducts()`, `searchProducts()`, `importProduct()`, `syncFavorites()`, etc.

#### Composants UI
- **`ProductDetailsModal`** (`apps/admin/src/components/cj/ProductDetailsModal.tsx`)
  - Modal affichant les détails complets d'un produit CJ
  - Utilisé dans la page de recherche de produits

### 📡 Appels API Backend

#### Configuration
```typescript
GET  /api/cj-dropshipping/config              // Obtenir la configuration
PUT  /api/cj-dropshipping/config              // Mettre à jour la configuration
POST /api/cj-dropshipping/config/test         // Tester la connexion
GET  /api/cj-dropshipping/config/status       // Statut de connexion
```

#### Produits
```typescript
GET  /api/cj-dropshipping/products/default    // Produits par défaut
GET  /api/cj-dropshipping/products/search     // Recherche produits
GET  /api/cj-dropshipping/products/:pid/details // Détails produit
POST /api/cj-dropshipping/products/:pid/import  // Importer un produit
POST /api/cj-dropshipping/sync-favorites      // Synchroniser favoris
```

#### Statistiques
```typescript
GET  /api/cj-dropshipping/stats              // Statistiques générales
GET  /api/cj-dropshipping/stats/products     // Stats produits
GET  /api/cj-dropshipping/stats/orders        // Stats commandes
GET  /api/cj-dropshipping/stats/webhooks      // Stats webhooks
```

### 🔄 Flux de Données

#### 1. Page Principale (`/admin/cj-dropshipping`)
```
1. Chargement initial
   └─> useCJDropshipping.getConfig()
   └─> useCJDropshipping.getStats()
   └─> useCJDropshipping.getConnectionStatus()

2. Affichage
   ├─> Statut de connexion (connecté/déconnecté)
   ├─> Tier (free, plus, prime, advanced)
   ├─> Statistiques (produits, commandes, webhooks)
   └─> Actions rapides (config, produits, commandes, webhooks)

3. Test de connexion
   └─> useCJDropshipping.testConnection()
       └─> POST /api/cj-dropshipping/config/test
           └─> Backend : CJConfigService.testConnection()
               ├─> Authentification CJ
               ├─> Chargement catégories
               └─> Chargement produits (100 premiers)
```

#### 2. Page Produits (`/admin/cj-dropshipping/products`)
```
1. Chargement initial
   └─> useCJDropshipping.testConnection()
       └─> Charge catégories et produits simultanément

2. Recherche de produits
   └─> useCJDropshipping.searchProducts(filters)
       └─> GET /api/cj-dropshipping/products/search
           └─> Backend : CJProductService.searchProducts()
               ├─> Vérification cache
               ├─> Appel API CJ si nécessaire
               └─> Mise en cache des résultats

3. Import d'un produit
   └─> useCJDropshipping.importProduct(pid, categoryId, margin)
       └─> POST /api/cj-dropshipping/products/:pid/import
           └─> Backend : CJFavoriteService.importProduct()
               ├─> Récupération détails depuis API CJ
               ├─> Vérification doublons (DuplicatePreventionService)
               └─> Sauvegarde dans CJProductStore
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/cj-dropshipping/cj-dropshipping.controller.ts` - Contrôleur principal
- `server/src/cj-dropshipping/services/cj-main.service.ts` - Service principal
- `server/src/cj-dropshipping/services/cj-product.service.ts` - Gestion produits
- `server/src/cj-dropshipping/services/cj-favorite.service.ts` - Import et favoris
- `server/src/cj-dropshipping/services/cj-config.service.ts` - Configuration

**Base de données :**
- `CJConfig` - Configuration de l'intégration
- `CJProductStore` - Magasin des produits CJ importés
- `CJProductMapping` - Mapping produits KAMRI ↔ CJ

---

## 🏪 2. Magasins

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/stores/page.tsx`

### 🎯 Fonction Principale
Gestion des magasins (stores) connectés à la plateforme KAMRI, incluant les magasins CJ Dropshipping et les magasins génériques.

### 🔧 Fonctionnalités

#### 1. Liste des Magasins
- Affichage de tous les magasins (CJ Dropshipping, CJ Favoris, autres)
- Statistiques par magasin (total, available, imported, selected, pending)
- Statut de connexion et dernière synchronisation

#### 2. Produits d'un Magasin
- Sélection d'un magasin pour voir ses produits
- Filtres : recherche, statut, catégorie
- Import/sélection de produits depuis le magasin

### 📡 Appels API Backend

```typescript
GET  /api/stores                              // Liste des magasins
GET  /api/stores/:storeId/products            // Produits d'un magasin
GET  /api/cj-dropshipping/config/status       // Statut CJ
GET  /api/cj-dropshipping/stats               // Statistiques CJ
GET  /api/cj-dropshipping/products/imported   // Produits importés
GET  /api/cj-dropshipping/favorites/status   // Statut favoris
GET  /api/cj-dropshipping/stores/:storeId/products // Produits magasin CJ
POST /api/cj-dropshipping/products/:pid/import // Importer un produit
```

### 🔄 Flux de Données

```
1. Chargement des magasins
   └─> apiClient.get('/stores')
       └─> GET /api/stores
           └─> Backend : StoresController.findAll()

2. Vérification CJ (si connecté)
   ├─> apiClient.get('/cj-dropshipping/config/status')
   ├─> apiClient.get('/cj-dropshipping/stats')
   ├─> apiClient.get('/cj-dropshipping/products/imported')
   └─> apiClient.get('/cj-dropshipping/favorites/status')
       └─> Création automatique des magasins CJ :
           ├─> "CJ Dropshipping" (id: 'cj-dropshipping')
           └─> "Favoris CJ Dropshipping" (id: 'cj-favorites')

3. Sélection d'un magasin
   └─> fetchStoreProducts(storeId)
       ├─> Si CJ : GET /api/cj-dropshipping/stores/:storeId/products
       │   └─> Lecture depuis CJProductStore (base de données)
       └─> Sinon : GET /api/stores/:storeId/products
           └─> Lecture depuis Store (base de données)

4. Import d'un produit
   └─> POST /api/cj-dropshipping/products/:pid/import
       └─> Sauvegarde dans CJProductStore
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/stores/stores.controller.ts` - Contrôleur magasins
- `server/src/stores/stores.service.ts` - Service magasins
- `server/src/cj-dropshipping/cj-dropshipping.controller.ts` - Endpoints CJ

**Base de données :**
- `Store` - Magasins génériques
- `CJProductStore` - Magasin CJ (utilisé pour les produits CJ)

---

## 🚚 3. Fournisseurs

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/suppliers/page.tsx`

### 🎯 Fonction Principale
Gestion des fournisseurs de produits (suppliers) connectés à la plateforme KAMRI. Permet d'ajouter, configurer et tester la connexion avec différents fournisseurs.

### 🔧 Fonctionnalités

#### 1. Liste des Fournisseurs
- Affichage de tous les fournisseurs configurés
- Statut de connexion (connected, disconnected, pending)
- Statistiques (nombre de produits, dernière synchronisation)

#### 2. Gestion des Fournisseurs
- Ajout d'un nouveau fournisseur (nom, description, API URL, API Key)
- Modification d'un fournisseur existant
- Suppression d'un fournisseur
- Test de connexion avec un fournisseur

#### 3. Produits d'un Fournisseur
- Visualisation des produits d'un fournisseur
- Import de produits depuis un fournisseur
- Filtres et recherche

### 📡 Appels API Backend

```typescript
GET    /api/suppliers                         // Liste des fournisseurs
POST   /api/suppliers                         // Créer un fournisseur
PUT    /api/suppliers/:id                     // Mettre à jour un fournisseur
DELETE /api/suppliers/:id                     // Supprimer un fournisseur
POST   /api/suppliers/:id/test                // Tester la connexion
GET    /api/suppliers/:id/products            // Produits d'un fournisseur
```

### 🔄 Flux de Données

```
1. Chargement des fournisseurs
   └─> apiClient.getSuppliers()
       └─> GET /api/suppliers
           └─> Backend : SuppliersController.findAll()
               └─> PrismaService.supplier.findMany()

2. Ajout d'un fournisseur
   └─> apiClient.createSupplier(data)
       └─> POST /api/suppliers
           └─> Backend : SuppliersService.create()
               └─> PrismaService.supplier.create()

3. Test de connexion
   └─> apiClient.testSupplierConnection(id)
       └─> POST /api/suppliers/:id/test
           └─> Backend : SuppliersService.testConnection()
               └─> Appel API du fournisseur pour vérifier la connexion

4. Import de produits
   └─> apiClient.importSupplierProducts(id)
       └─> POST /api/suppliers/:id/import
           └─> Backend : SuppliersService.importProducts()
               └─> Récupération produits depuis l'API du fournisseur
               └─> Sauvegarde dans Product (source: supplier)
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/suppliers/suppliers.controller.ts` - Contrôleur fournisseurs
- `server/src/suppliers/suppliers.service.ts` - Service fournisseurs

**Base de données :**
- `Supplier` - Fournisseurs configurés
- `Product` - Produits importés (relation avec Supplier)

**Note :** CJ Dropshipping est un fournisseur spécial qui utilise le module `cj-dropshipping` au lieu du module `suppliers` générique.

---

## 📁 4. Catégories

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/categories/page.tsx`

### 🎯 Fonction Principale
Gestion de la taxonomie des produits : création, modification, organisation des catégories, et mapping avec les catégories externes des fournisseurs.

### 🔧 Fonctionnalités

#### 1. Liste des Catégories
- Affichage de toutes les catégories KAMRI
- Icônes, couleurs, descriptions
- Indication des catégories par défaut (non supprimables)
- Nombre de produits par catégorie

#### 2. Gestion des Catégories
- Ajout d'une nouvelle catégorie (nom, description, icône, couleur)
- Modification d'une catégorie existante
- Suppression d'une catégorie (sauf les catégories par défaut)

#### 3. Mapping des Catégories
- Mapping entre catégories externes (fournisseurs) et catégories internes (KAMRI)
- Gestion des catégories non mappées
- Association d'une catégorie externe à une catégorie interne

### 📡 Appels API Backend

```typescript
GET    /api/categories                        // Liste des catégories
POST   /api/categories                        // Créer une catégorie
PUT    /api/categories/:id                   // Mettre à jour une catégorie
DELETE /api/categories/:id                   // Supprimer une catégorie
GET    /api/category-mappings                // Liste des mappings
POST   /api/category-mappings                 // Créer un mapping
DELETE /api/category-mappings/:id            // Supprimer un mapping
GET    /api/unmapped-external-categories     // Catégories non mappées
```

### 🔄 Flux de Données

```
1. Chargement des données
   ├─> apiClient.getCategories()
   │   └─> GET /api/categories
   │       └─> Backend : CategoriesController.findAll()
   ├─> apiClient.getCategoryMappings()
   │   └─> GET /api/category-mappings
   │       └─> Backend : CategoryMappingsController.findAll()
   ├─> apiClient.getSuppliers()
   │   └─> GET /api/suppliers
   └─> apiClient.getUnmappedExternalCategories()
       └─> GET /api/unmapped-external-categories
           └─> Backend : UnmappedExternalCategoriesController.findAll()

2. Création d'une catégorie
   └─> apiClient.createCategory(data)
       └─> POST /api/categories
           └─> Backend : CategoriesService.create()
               └─> PrismaService.category.create()

3. Création d'un mapping
   └─> apiClient.createCategoryMapping(data)
       └─> POST /api/category-mappings
           └─> Backend : CategoryMappingsService.create()
               └─> PrismaService.categoryMapping.create()
                   └─> Mapping : externalCategory → internalCategory
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/categories/categories.controller.ts` - Contrôleur catégories
- `server/src/categories/categories.service.ts` - Service catégories
- `server/src/common/common.module.ts` - Module pour les mappings

**Base de données :**
- `Category` - Catégories KAMRI
- `CategoryMapping` - Mapping catégories externes ↔ internes
- `UnmappedExternalCategory` - Catégories externes non mappées

**Utilisation :**
- Les produits importés utilisent le mapping pour associer leur catégorie externe à une catégorie KAMRI
- Permet la validation automatique des produits avec mapping existant

---

## ✅ 5. Validation

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/products/validation/page.tsx`

### 🎯 Fonction Principale
Validation et approbation des produits en attente (pending/draft), notamment ceux importés depuis CJ Dropshipping ou d'autres sources.

### 🔧 Fonctionnalités

#### 1. Liste des Produits en Attente
- Affichage des produits avec statut `pending` ou `draft`
- Filtrage par catégorie
- Affichage des informations produit (nom, prix, image, catégorie, fournisseur)
- Indication de la source (cj-dropshipping, dummy-json, manual)

#### 2. Validation des Produits
- **Approuver** : Change le statut de `pending` → `active`
  - Le produit devient visible dans le catalogue
  - Disponible pour les clients
- **Rejeter** : Change le statut de `pending` → `rejected`
  - Le produit est rejeté et non visible
- **Voir les détails** : Modal avec toutes les informations du produit

#### 3. Filtrage et Recherche
- Filtrage par catégorie
- Recherche par nom
- Affichage des produits avec mapping de catégorie prêt

### 📡 Appels API Backend

```typescript
GET  /api/products/admin/ready-for-validation // Produits prêts pour validation
GET  /api/categories                          // Liste des catégories
PATCH /api/products/:id/approve              // Approuver un produit
PATCH /api/products/:id/reject                // Rejeter un produit
GET  /api/products/:id                        // Détails d'un produit
```

### 🔄 Flux de Données

```
1. Chargement des produits en attente
   └─> apiClient.getProductsReadyForValidation(categoryId?)
       └─> GET /api/products/admin/ready-for-validation
           └─> Backend : ProductsService.getProductsReadyForValidation()
               └─> PrismaService.product.findMany({
                     where: { status: { in: ['pending', 'draft'] } },
                     include: { category, supplier, cjMapping }
                   })
               └─> Filtre : uniquement les produits avec mapping de catégorie

2. Approuver un produit
   └─> apiClient.approveProduct(id)
       └─> PATCH /api/products/:id/approve
           └─> Backend : ProductsService.approve(id)
               └─> PrismaService.product.update({
                     where: { id },
                     data: { status: 'active' }
                   })
               └─> Le produit devient visible dans le catalogue

3. Rejeter un produit
   └─> apiClient.rejectProduct(id)
       └─> PATCH /api/products/:id/reject
           └─> Backend : ProductsService.reject(id)
               └─> PrismaService.product.update({
                     where: { id },
                     data: { status: 'rejected' }
                   })
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/products/products.controller.ts` - Contrôleur produits
- `server/src/products/products.service.ts` - Service produits
  - `getProductsReadyForValidation()` - Produits avec mapping prêt
  - `approve()` - Approuver un produit
  - `reject()` - Rejeter un produit

**Base de données :**
- `Product` - Produits avec statut `pending`, `draft`, `active`, `rejected`
- `CategoryMapping` - Mapping nécessaire pour la validation

**Flux complet :**
```
Import CJ → CJProductStore → Product (draft) → Validation → Product (active)
```

---

## 📦 6. Produits (Section du Haut)

### 📍 Chemin du Fichier
**Page principale :** `apps/admin/src/app/admin/products/page.tsx`  
**Sous-pages :**
- `apps/admin/src/app/admin/products/validation/page.tsx` - Validation (détaillée ci-dessus)
- `apps/admin/src/app/admin/products/cj/` - Produits CJ spécifiques

### 🎯 Fonction Principale
Gestion complète du catalogue de produits KAMRI : liste, création, modification, suppression, et gestion des produits actifs.

### 🔧 Fonctionnalités

#### 1. Liste des Produits
- Affichage de tous les produits actifs (`status: 'active'`)
- Filtres : recherche, catégorie, fournisseur
- Tri : nom, prix, date de création
- Affichage : nom, prix, image, catégorie, fournisseur, statut, badge

#### 2. Gestion des Produits
- **Créer** : Ajout manuel d'un nouveau produit
- **Modifier** : Édition d'un produit existant
- **Supprimer** : Suppression d'un produit
- **Voir les détails** : Modal avec toutes les informations

#### 3. Filtres et Recherche
- Recherche par nom
- Filtrage par catégorie
- Filtrage par fournisseur
- Tri par différents critères

#### 4. Statistiques
- Nombre total de produits
- Produits par catégorie
- Produits par fournisseur
- Produits en promotion

### 📡 Appels API Backend

```typescript
GET    /api/products                          // Liste des produits actifs
GET    /api/products/admin/all                // Tous les produits (admin)
GET    /api/products/admin/pending            // Produits en attente
GET    /api/products/:id                     // Détails d'un produit
POST   /api/products                         // Créer un produit
PATCH  /api/products/:id                     // Mettre à jour un produit
DELETE /api/products/:id                     // Supprimer un produit
GET    /api/categories                       // Liste des catégories
GET    /api/suppliers                        // Liste des fournisseurs
```

### 🔄 Flux de Données

```
1. Chargement des produits
   └─> apiClient.getProducts()
       └─> GET /api/products
           └─> Backend : ProductsService.findAll()
               └─> PrismaService.product.findMany({
                     where: { status: 'active' },
                     include: { category, supplier, images }
                   })
               └─> Transformation des images et description

2. Création d'un produit
   └─> apiClient.createProduct(data)
       └─> POST /api/products
           └─> Backend : ProductsService.create()
               └─> PrismaService.product.create({
                     data: { ...data, status: 'active' }
                   })

3. Modification d'un produit
   └─> apiClient.updateProduct(id, data)
       └─> PATCH /api/products/:id
           └─> Backend : ProductsService.update()
               └─> PrismaService.product.update({
                     where: { id },
                     data
                   })

4. Suppression d'un produit
   └─> apiClient.deleteProduct(id)
       └─> DELETE /api/products/:id
           └─> Backend : ProductsService.remove()
               └─> PrismaService.product.delete({ where: { id } })
```

### 🔗 Liens avec Autres Fichiers

**Backend :**
- `server/src/products/products.controller.ts` - Contrôleur produits
- `server/src/products/products.service.ts` - Service produits
  - `findAll()` - Produits actifs
  - `findAllForAdmin()` - Tous les produits (admin)
  - `findOne()` - Détails d'un produit
  - `create()` - Créer un produit
  - `update()` - Mettre à jour
  - `remove()` - Supprimer
  - `processProductImages()` - Traitement des images

**Base de données :**
- `Product` - Catalogue principal
- `Category` - Catégories
- `Supplier` - Fournisseurs
- `Image` - Images des produits

**Relations :**
- Un produit appartient à une catégorie
- Un produit peut avoir un fournisseur
- Un produit peut avoir plusieurs images
- Un produit peut avoir un mapping CJ (`CJProductMapping`)

---

## 🔄 Relations entre les Sections

### Flux Global d'Import de Produits CJ

```
1. CJ Dropshipping (Section 1)
   └─> Recherche et import de produits CJ
       └─> Sauvegarde dans CJProductStore

2. Magasins (Section 2)
   └─> Visualisation des produits importés
       └─> Sélection pour import dans le catalogue

3. Fournisseurs (Section 3)
   └─> Configuration des fournisseurs
       └─> CJ Dropshipping est un fournisseur spécial

4. Catégories (Section 4)
   └─> Mapping des catégories externes
       └─> Nécessaire pour la validation

5. Validation (Section 5)
   └─> Approuver les produits importés
       └─> Passage de draft → active

6. Produits (Section 6)
   └─> Gestion du catalogue final
       └─> Produits actifs visibles par les clients
```

### Dépendances Critiques

1. **CJ Dropshipping → Magasins**
   - Les produits CJ sont stockés dans `CJProductStore`
   - Accessibles via la section Magasins

2. **Catégories → Validation**
   - Les produits doivent avoir un mapping de catégorie pour être validés
   - La section Catégories permet de créer ces mappings

3. **Validation → Produits**
   - Les produits validés passent de `pending`/`draft` → `active`
   - Deviennent visibles dans la section Produits

4. **Fournisseurs → Produits**
   - Les produits sont associés à un fournisseur
   - Permet de tracer l'origine des produits

---

## 📝 Notes Importantes

1. **Deux Tables pour les Produits CJ :**
   - `CJProductStore` : Magasin temporaire (avant validation)
   - `Product` : Catalogue KAMRI (produits validés)

2. **Statuts des Produits :**
   - `pending` : En attente de validation
   - `draft` : Brouillon (produits CJ importés)
   - `active` : Actif et visible
   - `inactive` : Désactivé
   - `rejected` : Rejeté

3. **Mapping des Catégories :**
   - Nécessaire pour la validation automatique
   - Lie les catégories externes (fournisseurs) aux catégories internes (KAMRI)

4. **Ordre Recommandé de Travail :**
   1. Configurer CJ Dropshipping (Section 1)
   2. Créer les catégories (Section 4)
   3. Mapper les catégories (Section 4)
   4. Importer les produits CJ (Section 1)
   5. Valider les produits (Section 5)
   6. Gérer le catalogue (Section 6)

---

**Dernière mise à jour :** Documentation complète des sections du dashboard admin

