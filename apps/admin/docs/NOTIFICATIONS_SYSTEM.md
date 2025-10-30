# Système de Notifications - Produits Disponibles

## Vue d'ensemble

Le système de notifications affiche dans le header du dashboard le nombre total de produits disponibles à importer, groupés par magasin.

## Composants

### 1. `useStoreNotifications` Hook
**Fichier:** `apps/admin/src/hooks/useStoreNotifications.ts`

**Fonctionnalités:**
- Récupère tous les magasins et leurs produits
- Filtre les produits avec `status === 'available'`
- Calcule le total de produits disponibles
- Rafraîchit automatiquement toutes les 30 secondes
- Écoute l'événement `refreshStoreNotifications` pour mise à jour manuelle

**Utilisation:**
```typescript
const { notifications, loading, error, refresh } = useStoreNotifications();

// notifications.total: nombre total de produits
// notifications.stores: tableau des magasins avec compteurs
// refresh(): fonction pour forcer le rafraîchissement
```

### 2. `NotificationDropdown` Component
**Fichier:** `apps/admin/src/components/notifications/NotificationDropdown.tsx`

**Fonctionnalités:**
- Badge animé (pulse) sur l'icône Bell
- Dropdown avec liste des magasins
- Clic sur un magasin → redirection vers `/admin/stores?store={storeId}`
- Bouton refresh manuel
- États: chargement, vide, liste

### 3. Intégration Header
**Fichier:** `apps/admin/src/components/layout/header.tsx`

Remplace le badge factice par le composant dynamique `NotificationDropdown`.

## Déclencheurs de Rafraîchissement

Le système se rafraîchit automatiquement dans les cas suivants:

### Import de produits depuis Stores
**Fichier:** `apps/admin/src/app/admin/stores/page.tsx`
```typescript
// Après import réussi
window.dispatchEvent(new Event('refreshStoreNotifications'));
```

### Import depuis CJ Dropshipping
**Fichier:** `apps/admin/src/app/admin/cj-dropshipping/products/page.tsx`

**Déclencheurs:**
1. Import d'un seul produit (`handleImport`)
2. Import en lot (`handleBulkImport`)
3. Synchronisation des favoris CJ (`syncFavorites`)
4. Synchronisation générale des produits (`syncProducts`)

```typescript
// Déclencher manuellement le rafraîchissement
window.dispatchEvent(new Event('refreshStoreNotifications'));
```

## Tests Manuels

### Scénario 1: Import d'un produit CJ
1. Aller sur `/admin/cj-dropshipping/products`
2. Cliquer sur "Synchroniser les favoris CJ"
3. Observer le badge dans le header
4. ✅ Le compteur doit augmenter
5. Cliquer sur la cloche Bell
6. ✅ Le magasin CJ doit apparaître avec le compteur correct

### Scénario 2: Import depuis Stores
1. Aller sur `/admin/stores`
2. Sélectionner des produits disponibles
3. Cliquer sur "Importer les produits sélectionnés"
4. ✅ Le compteur dans le header doit diminuer

### Scénario 3: Refresh manuel
1. Cliquer sur l'icône Bell dans le header
2. Cliquer sur le bouton refresh (icône ⟳)
3. ✅ Les compteurs doivent se mettre à jour

### Scénario 4: Auto-refresh
1. Ouvrir le dashboard
2. Dans une autre fenêtre, ajouter des produits via API
3. Attendre 30 secondes
4. ✅ Le badge doit se mettre à jour automatiquement

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Header (Bell)                     │
│              Badge: Total produits (5)               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            useStoreNotifications Hook                │
│  • Fetch stores & products every 30s                │
│  • Listen to 'refreshStoreNotifications' event      │
│  • Filter by status === 'available'                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              API: GET /stores                        │
│         For each store: GET /stores/:id/products    │
│                                                      │
│  Returns: [                                          │
│    { storeId, storeName, availableProductsCount }   │
│  ]                                                   │
└─────────────────────────────────────────────────────┘
```

## API Endpoints Utilisés

### 1. Liste des magasins
```
GET /stores
Response: [{ id, name, ... }]
```

### 2. Produits d'un magasin
```
GET /stores/:storeId/products
Response: [{ id, status, ... }]
```

## Variables d'État

### NotificationSummary
```typescript
{
  total: number;           // Nombre total de produits disponibles
  stores: StoreNotification[];  // Détails par magasin
}
```

### StoreNotification
```typescript
{
  storeId: string;
  storeName: string;
  availableProductsCount: number;
}
```

## Événements Personnalisés

### `refreshStoreNotifications`
Déclenche un rafraîchissement immédiat des notifications.

**Usage:**
```typescript
window.dispatchEvent(new Event('refreshStoreNotifications'));
```

**Écouté par:** `useStoreNotifications` hook

## Performance

- **Intervalle de rafraîchissement:** 30 secondes
- **Nombre de requêtes:** 1 (stores) + N (produits par magasin)
- **Cache:** Aucun (toujours données fraîches)
- **Optimisation future:** Implémenter un endpoint backend agrégé `/stores/notifications` qui retourne directement les compteurs

## Améliorations Futures

1. **Endpoint agrégé backend:**
   ```
   GET /stores/notifications
   Response: {
     total: 5,
     stores: [
       { storeId, storeName, availableCount }
     ]
   }
   ```

2. **WebSocket pour mises à jour en temps réel:**
   - Éliminer le polling de 30s
   - Push instantané lors de changements de statut

3. **Badge sonore/visuel:**
   - Son notification optionnel
   - Animation plus marquée lors de nouveaux produits

4. **Filtres dans le dropdown:**
   - Trier par nombre de produits
   - Rechercher par nom de magasin

5. **Actions rapides:**
   - Bouton "Importer tout" dans le dropdown
   - Lien direct vers filtre status=available
