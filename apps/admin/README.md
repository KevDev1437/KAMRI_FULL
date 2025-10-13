# KAMRI Admin

Interface d'administration pour la gestion des catégories de produits KAMRI.

## 🚀 Démarrage rapide

### Installation
```bash
cd apps/admin
npm install
```

### Développement
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3002](http://localhost:3002)

### Production
```bash
npm run build
npm start
```

## 🎯 Fonctionnalités

### 📊 Dashboard
- **Statistiques de catégorisation** : Vue d'ensemble des produits catégorisés
- **Taux de confiance** : Suivi de la qualité du mapping automatique
- **Produits à faible confiance** : Liste des produits nécessitant une correction manuelle

### 🏷️ Gestion des catégories
- **Correction manuelle** : Interface pour corriger les catégorisations incorrectes
- **Analytics** : Suivi des performances du système de catégorisation
- **Re-catégorisation** : Possibilité de relancer la catégorisation automatique

## 🔧 Configuration

L'application se connecte automatiquement au backend KAMRI sur `http://localhost:3001`.

### Variables d'environnement
Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Interface

L'interface est optimisée pour :
- **Desktop** : Interface complète avec tableaux détaillés
- **Tablet** : Interface adaptée avec cartes responsives
- **Mobile** : Interface simplifiée pour consultation

## 🛠️ Technologies

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Lucide React** : Icônes modernes
- **Fetch API** : Communication avec le backend

## 📚 API Endpoints

L'application utilise les endpoints suivants :

- `GET /api/admin/categories/stats` - Statistiques de catégorisation
- `GET /api/admin/categories/low-confidence` - Produits à faible confiance
- `PUT /api/admin/categories/:productId/correct` - Corriger une catégorisation
- `POST /api/admin/categories/recategorize` - Re-catégoriser tous les produits
