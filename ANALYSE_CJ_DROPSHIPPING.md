# 📦 Analyse Complète - Gestion des Produits CJ Dropshipping

## 📋 Table des Matières

1. [Backend - Controllers](#backend---controllers)
2. [Backend - Services](#backend---services)
3. [Backend - Modèles Prisma](#backend---modèles-prisma)
4. [Admin Dashboard - Pages](#admin-dashboard---pages)
5. [Admin Dashboard - Composants](#admin-dashboard---composants)
6. [Admin Dashboard - Hooks & Utils](#admin-dashboard---hooks--utils)
7. [Flux de Données](#flux-de-données)
8. [Dépendances Critiques](#dépendances-critiques)

---

## 🔧 Backend - Controllers

### 1. CJDropshippingController

**Chemin :** `server/src/cj-dropshipping/cj-dropshipping.controller.ts`

**Fonction principale :** Contrôleur principal pour tous les endpoints CJ Dropshipping

**Endpoints exposés :**

#### Configuration
- `GET /api/cj-dropshipping/config` - Obtenir la configuration CJ
- `PUT /api/cj-dropshipping/config` - Mettre à jour la configuration
- `POST /api/cj-dropshipping/config/test` - Tester la connexion CJ
- `GET /api/cj-dropshipping/config/status` - Statut de connexion
- `GET /api/cj-dropshipping/status` - Alias pour statut

#### Produits
- `GET /api/cj-dropshipping/products/default` - Produits par défaut
- `GET /api/cj-dropshipping/products/search` - Rechercher des produits
- `GET /api/cj-dropshipping/products/:pid/details` - Détails d'un produit
- `GET /api/cj-dropshipping/products/:pid/variant-stock` - Stock des variantes
- `POST /api/cj-dropshipping/products/:pid/import` - Importer un produit
- `POST /api/cj-dropshipping/products/sync` - Synchroniser les produits
- `GET /api/cj-dropshipping/products/imported-favorites` - Produits favoris importés
- `GET /api/cj-dropshipping/stores/:storeId/products` - Produits d'un magasin CJ

#### Catégories
- `GET /api/cj-dropshipping/categories` - Toutes les catégories
- `GET /api/cj-dropshipping/categories/tree` - Arbre des catégories
- `GET /api/cj-dropshipping/categories/search` - Recherche avancée
- `GET /api/cj-dropshipping/categories/popular` - Catégories populaires
- `GET /api/cj-dropshipping/categories/:parentId/subcategories` - Sous-catégories
- `GET /api/cj-dropshipping/categories/:categoryId/path` - Chemin d'une catégorie
- `POST /api/cj-dropshipping/categories/sync` - Synchroniser les catégories

#### Favoris
- `POST /api/cj-dropshipping/sync-favorites` - Synchroniser les favoris
- `GET /api/cj-dropshipping/favorites/status` - Statut des favoris

#### Commandes
- `POST /api/cj-dropshipping/orders` - Créer une commande
- `GET /api/cj-dropshipping/orders/:orderId` - Statut d'une commande
- `POST /api/cj-dropshipping/orders/sync` - Synchroniser les statuts

#### Logistique
- `POST /api/cj-dropshipping/logistics/calculate` - Calculer les frais de port
- `GET /api/cj-dropshipping/logistics/tracking/:trackNumber` - Tracking

#### Webhooks
- `POST /api/cj-dropshipping/webhooks` - Recevoir les webhooks
- `POST /api/cj-dropshipping/webhooks/configure` - Configurer les webhooks
- `GET /api/cj-dropshipping/webhooks/logs` - Logs des webhooks

#### Cache
- `GET /api/cj-dropshipping/cache/stats` - Statistiques du cache
- `POST /api/cj-dropshipping/cache/clean` - Nettoyer le cache

#### Statistiques
- `GET /api/cj-dropshipping/stats` - Statistiques générales
- `GET /api/cj-dropshipping/stats/products` - Statistiques produits
- `GET /api/cj-dropshipping/stats/orders` - Statistiques commandes
- `GET /api/cj-dropshipping/stats/webhooks` - Statistiques webhooks

**Liens avec autres fichiers :**
- Utilise `CJMainService` pour la logique métier
- Utilise `CJWebhookService` pour les webhooks
- Utilise `PrismaService` pour l'accès à la base de données

---

## 🔧 Backend - Services

### 1. CJMainService

**Chemin :** `server/src/cj-dropshipping/services/cj-main.service.ts`

**Fonction principale :** Service principal qui délègue vers les services spécialisés

**Méthodes principales :**
- `getConfig()` - Délègue vers `CJConfigService`
- `updateConfig()` - Délègue vers `CJConfigService`
- `testConnection()` - Délègue vers `CJConfigService`
- `getDefaultProducts()` - Délègue vers `CJProductService`
- `searchProducts()` - Délègue vers `CJProductService`
- `getProductDetails()` - Délègue vers `CJProductService`
- `importProduct()` - Délègue vers `CJFavoriteService`
- `syncFavorites()` - Délègue vers `CJFavoriteService`
- `getStats()` - Statistiques globales
- `getCacheStats()` - Statistiques du cache

**Liens avec autres fichiers :**
- Injecte : `CJConfigService`, `CJProductService`, `CJFavoriteService`, `CJOrderService`, `CJWebhookService`
- Utilise `PrismaService` pour les statistiques

---

### 2. CJProductService

**Chemin :** `server/src/cj-dropshipping/services/cj-product.service.ts`

**Fonction principale :** Gestion des produits CJ (recherche, détails, cache)

**Méthodes principales :**
- `getDefaultProducts(query)` - Produits par défaut avec cache
- `searchProducts(query)` - Recherche avec filtres et cache
- `getProductDetails(pid)` - Détails avec priorité cache → DB → API
- `getProductVariantStock(pid, variantId, countryCode)` - Stock des variantes
- `getCategories()` - Toutes les catégories
- `getCategoriesTree()` - Arbre des catégories
- `searchCategories(params)` - Recherche avancée catégories
- `getPopularCategories(limit)` - Catégories populaires
- `getSubCategories(parentId)` - Sous-catégories
- `getCategoryPath(categoryId)` - Chemin d'une catégorie
- `getImportedProducts(filters)` - Produits importés depuis la DB
- `getCacheStats()` - Statistiques du cache
- `cleanExpiredCache()` - Nettoyer le cache expiré

**Stratégie de cache :**
- Cache mémoire avec TTL configurable (5-15 min)
- Priorité : Cache → Base locale → API CJ
- Statistiques de hit/miss

**Liens avec autres fichiers :**
- Utilise `CJAPIClient` pour les appels API
- Utilise `PrismaService` pour la base de données
- Utilise `DuplicatePreventionService` pour éviter les doublons

---

### 3. CJFavoriteService

**Chemin :** `server/src/cj-dropshipping/services/cj-favorite.service.ts`

**Fonction principale :** Gestion des favoris CJ et import de produits

**Méthodes principales :**
- `getMyProducts(params)` - Récupérer les favoris depuis l'API CJ
- `syncFavorites()` - Synchroniser les favoris avec la base de données
- `importProduct(pid, categoryId, margin, isFavorite)` - Importer un produit CJ vers KAMRI

**Processus d'import :**
1. Validation du PID
2. Récupération des détails depuis l'API CJ
3. Vérification des doublons via `DuplicatePreventionService`
4. Sauvegarde dans `CJProductStore` (magasin CJ)
5. Optionnel : Création dans `Product` (catalogue KAMRI)

**Liens avec autres fichiers :**
- Utilise `CJAPIClient` pour les appels API
- Utilise `DuplicatePreventionService` pour éviter les doublons
- Utilise `PrismaService` pour la base de données

---

### 4. CJConfigService

**Chemin :** `server/src/cj-dropshipping/services/cj-config.service.ts`

**Fonction principale :** Gestion de la configuration CJ Dropshipping

**Méthodes principales :**
- `getConfig()` - Obtenir la configuration
- `updateConfig(data)` - Mettre à jour la configuration
- `testConnection()` - Tester la connexion et charger les données initiales
- `getConnectionStatus()` - Statut de connexion avec limites API

**Liens avec autres fichiers :**
- Utilise `CJAPIClient` pour l'authentification
- Utilise `PrismaService` pour stocker la configuration

---

### 5. CJOrderService

**Chemin :** `server/src/cj-dropshipping/services/cj-order.service.ts`

**Fonction principale :** Gestion des commandes CJ Dropshipping

**Méthodes principales :**
- `createOrder(orderData)` - Créer une commande
- `getOrderStatus(orderId)` - Statut d'une commande
- `syncOrderStatuses()` - Synchroniser les statuts
- `calculateShipping(data)` - Calculer les frais de port
- `getTracking(trackNumber)` - Tracking d'un colis

---

### 6. CJWebhookService

**Chemin :** `server/src/cj-dropshipping/services/cj-webhook.service.ts`

**Fonction principale :** Traitement des webhooks CJ Dropshipping

**Méthodes principales :**
- `processWebhook(payload)` - Traiter un webhook
- `configureWebhooks(enable)` - Configurer les webhooks
- `getWebhookLogs(query)` - Logs des webhooks

---

### 7. DuplicatePreventionService

**Chemin :** `server/src/common/services/duplicate-prevention.service.ts`

**Fonction principale :** Prévention des doublons lors de l'import

**Méthodes principales :**
- `checkCJProductDuplicate(cjProductId, productSku, productData)` - Vérifier les doublons
  - Recherche par `cjProductId` (priorité)
  - Recherche par `productSku`
  - Recherche par similarité (nom + prix)
- `checkCJStoreDuplicate(cjProductId)` - Vérifier doublon dans le magasin CJ
- `upsertCJProduct(productData, duplicateCheck)` - Upsert intelligent
- `upsertCJStoreProduct(productData)` - Upsert dans le magasin CJ
- `getDuplicateStats()` - Statistiques de doublons

**Algorithme de détection :**
- Distance de Levenshtein pour la similarité
- Seuil de 80% de similitude pour les doublons

**Liens avec autres fichiers :**
- Utilisé par `CJFavoriteService` lors de l'import
- Utilisé par `CJProductService` pour la validation

---

## 🗄️ Backend - Modèles Prisma

### 1. Product

**Chemin :** `server/prisma/schema.prisma` (lignes 59-113)

**Fonction principale :** Modèle principal pour les produits KAMRI

**Champs CJ spécifiques :**
- `cjProductId` (String?, unique) - ID produit CJ unique
- `productSku` (String?) - SKU du produit CJ
- `productWeight`, `packingWeight` - Poids
- `productType`, `productUnit` - Type et unité
- `variants` (String?) - JSON des variants
- `importStatus` (String?) - new, updated, imported, duplicate
- `lastImportAt` (DateTime?) - Dernière date d'import
- `source` (String?) - cj-dropshipping, dummy-json, manual

**Relations :**
- `cjMapping` → `CJProductMapping` (1:1)
- `productVariants` → `ProductVariant[]` (1:N)
- `category` → `Category` (N:1)
- `supplier` → `Supplier` (N:1)

---

### 2. CJProductStore

**Chemin :** `server/prisma/schema.prisma` (lignes 363-398)

**Fonction principale :** Magasin des produits CJ importés (avant validation)

**Champs principaux :**
- `cjProductId` (String, unique) - ID produit CJ
- `name`, `description`, `price`, `originalPrice`
- `image` (String?) - URL de l'image
- `category` (String?) - Catégorie externe CJ
- `status` (String) - available, selected, imported
- `isFavorite` (Boolean) - Marquer comme favori CJ
- Tous les champs détaillés CJ (productSku, productWeight, variants, etc.)

**Utilisation :**
- Stockage temporaire des produits CJ importés
- Permet de gérer les produits avant validation
- Utilisé par le dashboard admin pour la gestion

---

### 3. CJProductMapping

**Chemin :** `server/prisma/schema.prisma` (lignes 401-414)

**Fonction principale :** Mapping entre produits KAMRI et produits CJ

**Champs principaux :**
- `productId` (String, unique) - ID produit KAMRI
- `cjProductId` (String) - PID CJ
- `cjSku` (String) - SKU CJ
- `lastSyncAt` (DateTime?) - Dernière synchronisation

**Relations :**
- `product` → `Product` (N:1)

**Utilisation :**
- Lien entre le catalogue KAMRI et CJ
- Suivi de la synchronisation
- Permet de retrouver le produit CJ depuis un produit KAMRI

---

### 4. CJConfig

**Chemin :** `server/prisma/schema.prisma` (lignes 346-360)

**Fonction principale :** Configuration de l'intégration CJ Dropshipping

**Champs principaux :**
- `email` (String) - Email du compte CJ
- `apiKey` (String) - Clé API CJ
- `tier` (String) - free, plus, prime, advanced
- `platformToken` (String?) - Token de plateforme
- `enabled` (Boolean) - Intégration activée
- `accessToken`, `refreshToken` (String?) - Tokens OAuth
- `tokenExpiry` (DateTime?) - Expiration du token

---

## 🎨 Admin Dashboard - Pages

### 1. StoresPage

**Chemin :** `apps/admin/src/app/admin/stores/page.tsx`

**Fonction principale :** Gestion des magasins (y compris CJ Dropshipping)

**Fonctionnalités :**
- Liste des magasins (CJ Dropshipping, CJ Favoris, autres)
- Affichage des statistiques par magasin
- Sélection d'un magasin pour voir ses produits
- Filtres : recherche, statut, catégorie
- Import/sélection de produits

**Appels API :**
- `GET /stores` - Liste des magasins
- `GET /cj-dropshipping/config/status` - Statut CJ
- `GET /cj-dropshipping/stats` - Statistiques CJ
- `GET /cj-dropshipping/products/imported` - Produits importés
- `GET /cj-dropshipping/favorites/status` - Statut favoris
- `GET /cj-dropshipping/stores/:storeId/products` - Produits d'un magasin
- `POST /cj-dropshipping/products/:pid/import` - Importer un produit

**Liens avec autres fichiers :**
- Utilise `apiClient` de `@/lib/apiClient`
- Utilise `useToast` pour les notifications

---

### 2. CJDropshippingPage

**Chemin :** `apps/admin/src/app/admin/cj-dropshipping/page.tsx`

**Fonction principale :** Page principale de gestion CJ Dropshipping

**Fonctionnalités :**
- Affichage du statut de connexion
- Statistiques (produits, commandes, webhooks)
- Test de connexion
- Configuration de l'intégration

**Appels API :**
- `GET /cj-dropshipping/config` - Configuration
- `GET /cj-dropshipping/stats` - Statistiques
- `GET /cj-dropshipping/config/status` - Statut
- `POST /cj-dropshipping/config/test` - Test connexion

**Liens avec autres fichiers :**
- Utilise `useCJDropshipping` hook
- Utilise `useToast` pour les notifications

---

### 3. CJProductsPage

**Chemin :** `apps/admin/src/app/admin/cj-dropshipping/products/page.tsx`

**Fonction principale :** Recherche et import de produits CJ

**Fonctionnalités :**
- Recherche de produits CJ avec filtres
- Affichage des produits avec pagination
- Import individuel ou en masse
- Modal de détails produit
- Synchronisation des favoris
- Mapping de catégories

**Appels API :**
- `POST /cj-dropshipping/config/test` - Test connexion
- `GET /cj-dropshipping/categories` - Catégories
- `GET /cj-dropshipping/products/default` - Produits par défaut
- `POST /cj-dropshipping/products/search` - Recherche produits
- `GET /cj-dropshipping/products/:pid/details` - Détails produit
- `POST /cj-dropshipping/products/:pid/import` - Importer produit
- `POST /cj-dropshipping/sync-favorites` - Synchroniser favoris

**Liens avec autres fichiers :**
- Utilise `useCJDropshipping` hook
- Utilise `ProductDetailsModal` composant
- Utilise `useToast` pour les notifications

---

### 4. CJConfigPage

**Chemin :** `apps/admin/src/app/admin/cj-dropshipping/config/page.tsx`

**Fonction principale :** Configuration de l'intégration CJ

**Fonctionnalités :**
- Formulaire de configuration (email, API key, tier)
- Test de connexion
- Activation/désactivation
- Affichage du statut

**Appels API :**
- `GET /cj-dropshipping/config` - Obtenir config
- `PUT /cj-dropshipping/config` - Mettre à jour config
- `POST /cj-dropshipping/config/test` - Test connexion

---

## 🎨 Admin Dashboard - Composants

### 1. ProductDetailsModal

**Chemin :** `apps/admin/src/components/cj/ProductDetailsModal.tsx`

**Fonction principale :** Modal affichant les détails complets d'un produit CJ

**Fonctionnalités :**
- Affichage des informations produit
- Images multiples
- Variants et stock
- Description formatée
- Bouton d'import

**Liens avec autres fichiers :**
- Utilisé par `CJProductsPage`
- Utilise `useCJDropshipping` hook

---

## 🎨 Admin Dashboard - Hooks & Utils

### 1. useCJDropshipping

**Chemin :** `apps/admin/src/hooks/useCJDropshipping.ts`

**Fonction principale :** Hook React pour gérer les appels API CJ

**Méthodes exposées :**
- `getConfig()` - Configuration
- `updateConfig(data)` - Mettre à jour config
- `testConnection()` - Test connexion
- `getConnectionStatus()` - Statut
- `getStats()` - Statistiques
- `getDefaultProducts(params)` - Produits par défaut
- `searchProducts(filters)` - Recherche
- `getProductDetails(pid)` - Détails produit
- `importProduct(pid, categoryId, margin)` - Importer
- `syncFavorites()` - Synchroniser favoris
- `getCategories()` - Catégories
- `syncCategories()` - Synchroniser catégories

**Liens avec autres fichiers :**
- Utilise `apiClient` de `@/lib/apiClient`
- Utilisé par toutes les pages CJ

---

### 2. apiClient

**Chemin :** `apps/admin/src/lib/apiClient.ts`

**Fonction principale :** Client API générique pour les appels HTTP

**Fonctionnalités :**
- Gestion automatique du token JWT
- Headers par défaut
- Gestion des erreurs
- Base URL configurable

**Utilisation :**
```typescript
const data = await apiClient<T>('/endpoint');
```

---

## 🔄 Flux de Données

### 1. Import d'un Produit CJ

```
1. Admin Dashboard
   └─> CJProductsPage
       └─> useCJDropshipping.importProduct(pid)
           └─> POST /api/cj-dropshipping/products/:pid/import

2. Backend Controller
   └─> CJDropshippingController.importProduct()
       └─> CJMainService.importProduct()
           └─> CJFavoriteService.importProduct()

3. CJFavoriteService
   ├─> initializeClient() - Authentification CJ
   ├─> client.getProductDetails(pid) - Récupération détails
   ├─> DuplicatePreventionService.checkCJStoreDuplicate() - Vérification doublons
   └─> DuplicatePreventionService.upsertCJStoreProduct() - Sauvegarde

4. Base de Données
   └─> CJProductStore.upsert() - Stockage dans le magasin CJ
```

### 2. Recherche de Produits CJ

```
1. Admin Dashboard
   └─> CJProductsPage
       └─> useCJDropshipping.searchProducts(filters)
           └─> GET /api/cj-dropshipping/products/search

2. Backend Controller
   └─> CJDropshippingController.searchProducts()
       └─> CJMainService.searchProducts()
           └─> CJProductService.searchProducts()

3. CJProductService
   ├─> Vérification cache mémoire
   ├─> Si cache expiré :
   │   ├─> initializeClient() - Authentification
   │   └─> client.searchProducts() - Appel API CJ
   └─> Mise en cache des résultats

4. Retour au Frontend
   └─> Affichage des produits dans CJProductsPage
```

### 3. Affichage des Produits du Magasin CJ

```
1. Admin Dashboard
   └─> StoresPage
       └─> fetchStoreProducts('cj-dropshipping')
           └─> GET /api/cj-dropshipping/stores/cj-dropshipping/products

2. Backend Controller
   └─> CJDropshippingController.getStoreProducts()
       └─> PrismaService.cJProductStore.findMany()
           └─> Lecture directe depuis la base de données

3. Retour au Frontend
   └─> Affichage des produits importés
```

### 4. Synchronisation des Favoris

```
1. Admin Dashboard
   └─> CJProductsPage
       └─> useCJDropshipping.syncFavorites()
           └─> POST /api/cj-dropshipping/sync-favorites

2. Backend Controller
   └─> CJDropshippingController.syncFavorites()
       └─> CJMainService.syncFavorites()
           └─> CJFavoriteService.syncFavorites()

3. CJFavoriteService
   ├─> client.getMyProducts() - Récupération favoris depuis API CJ
   ├─> Pour chaque favori :
   │   └─> importProduct(pid, undefined, 0, true) - Import avec isFavorite=true
   └─> Sauvegarde dans CJProductStore

4. Base de Données
   └─> CJProductStore - Produits marqués comme favoris
```

---

## 🔗 Dépendances Critiques

### Backend

```
CJDropshippingModule
├─> CJServicesModule
│   ├─> CommonModule (DuplicatePreventionService)
│   ├─> CJConfigService
│   ├─> CJProductService
│   ├─> CJFavoriteService
│   ├─> CJOrderService
│   ├─> CJWebhookService
│   └─> CJMainService
├─> CJAPIClient (singleton)
└─> PrismaService
```

**Ordre d'injection :**
1. `PrismaService` - Accès base de données
2. `CJAPIClient` - Client API CJ (singleton)
3. `DuplicatePreventionService` - Prévention doublons
4. Services spécialisés (Config, Product, Favorite, Order, Webhook)
5. `CJMainService` - Service principal (délègue vers spécialisés)
6. `CJDropshippingController` - Contrôleur (utilise CJMainService)

### Frontend Admin

```
Pages
├─> StoresPage
│   └─> apiClient
├─> CJDropshippingPage
│   └─> useCJDropshipping hook
├─> CJProductsPage
│   ├─> useCJDropshipping hook
│   └─> ProductDetailsModal
└─> CJConfigPage
    └─> useCJDropshipping hook

Hooks
└─> useCJDropshipping
    └─> apiClient
        └─> API_BASE_URL (constants)
```

**Ordre de chargement :**
1. `apiClient` - Client HTTP générique
2. `useCJDropshipping` - Hook React (utilise apiClient)
3. Pages - Utilisent le hook

---

## 📊 Relations entre Fichiers

### Backend → Base de Données

```
CJProductService
  └─> PrismaService
      ├─> CJProductStore (lecture/écriture)
      ├─> Product (lecture/écriture)
      └─> CJProductMapping (lecture/écriture)

CJFavoriteService
  └─> PrismaService
      ├─> CJProductStore (upsert)
      └─> CJConfig (lecture)

DuplicatePreventionService
  └─> PrismaService
      ├─> Product (recherche doublons)
      └─> CJProductStore (recherche doublons)
```

### Frontend → Backend

```
useCJDropshipping
  └─> apiClient
      └─> HTTP Requests
          └─> CJDropshippingController
              └─> CJMainService
                  └─> Services spécialisés
```

### Services → Services

```
CJMainService
  ├─> CJConfigService
  ├─> CJProductService
  │   ├─> CJAPIClient
  │   └─> DuplicatePreventionService
  ├─> CJFavoriteService
  │   ├─> CJAPIClient
  │   └─> DuplicatePreventionService
  ├─> CJOrderService
  └─> CJWebhookService
```

---

## 🎯 Points Critiques

### 1. Gestion des Doublons

**Fichier :** `server/src/common/services/duplicate-prevention.service.ts`

**Criticité :** ⚠️ HAUTE

**Raison :** 
- Évite les doublons lors de l'import
- Utilise plusieurs stratégies (cjProductId, SKU, similarité)
- Impact sur la qualité des données

**Dépendances :**
- Utilisé par `CJFavoriteService.importProduct()`
- Utilisé par `CJProductService` pour validation

---

### 2. Cache Multi-Niveaux

**Fichier :** `server/src/cj-dropshipping/services/cj-product.service.ts`

**Criticité :** ⚠️ MOYENNE

**Raison :**
- Réduit les appels API CJ (limites de taux)
- Améliore les performances
- TTL configurable par type de données

**Stratégie :**
1. Cache mémoire (5-15 min)
2. Base de données locale
3. API CJ (dernier recours)

---

### 3. Authentification CJ

**Fichier :** `server/src/cj-dropshipping/cj-api-client.ts`

**Criticité :** ⚠️ HAUTE

**Raison :**
- Tous les appels API nécessitent un token valide
- Gestion automatique du refresh
- Singleton pour éviter les connexions multiples

**Dépendances :**
- Utilisé par tous les services CJ
- Stocke les tokens en mémoire

---

### 4. Import de Produits

**Fichier :** `server/src/cj-dropshipping/services/cj-favorite.service.ts`

**Criticité :** ⚠️ HAUTE

**Raison :**
- Point d'entrée principal pour l'import
- Gère la validation, les doublons, la sauvegarde
- Impact direct sur le catalogue

**Flux :**
1. Validation PID
2. Récupération détails API
3. Vérification doublons
4. Sauvegarde dans CJProductStore
5. Optionnel : Création dans Product

---

## 📝 Notes Importantes

1. **Deux Tables pour les Produits CJ :**
   - `CJProductStore` : Magasin temporaire (avant validation)
   - `Product` : Catalogue KAMRI (produits validés)

2. **Mapping des Produits :**
   - `CJProductMapping` : Lien entre Product et CJ
   - Permet de retrouver le produit CJ depuis un produit KAMRI

3. **Cache Stratégique :**
   - Cache mémoire pour les recherches fréquentes
   - Base de données pour les produits importés
   - API CJ uniquement si nécessaire

4. **Gestion des Erreurs :**
   - Tous les services loggent les erreurs
   - Retour d'erreurs structurées au frontend
   - Gestion des timeouts API

5. **Sécurité :**
   - Tokens JWT pour l'authentification admin
   - Tokens OAuth pour l'API CJ
   - Validation des données d'entrée

---

## 🔍 Fichiers Clés à Surveiller

1. **`server/src/cj-dropshipping/services/cj-favorite.service.ts`** - Import de produits
2. **`server/src/common/services/duplicate-prevention.service.ts`** - Prévention doublons
3. **`server/src/cj-dropshipping/services/cj-product.service.ts`** - Cache et recherche
4. **`apps/admin/src/hooks/useCJDropshipping.ts`** - Interface frontend
5. **`server/prisma/schema.prisma`** - Modèles de données

---

**Dernière mise à jour :** Analyse complète du système CJ Dropshipping

