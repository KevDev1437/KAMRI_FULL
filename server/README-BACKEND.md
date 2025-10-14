# 🚀 KAMRI Backend - API Dropshipping

## 📋 Vue d'ensemble

Backend NestJS complet pour la plateforme e-commerce KAMRI avec support dropshipping. API centrale pour le front-end, mobile et dashboard admin.

## 🏗️ Architecture

```
Backend API (NestJS)
├── 🔐 Authentification JWT
├── 🛍️ Gestion produits avec badges
├── 🏪 Fournisseurs (Temu, AliExpress, Shein)
├── 🗂️ Mapping catégories
├── 📊 Dashboard & Analytics
├── 👥 Gestion utilisateurs
├── ⚙️ Paramètres globaux
└── 💳 Paiements Stripe
```

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd server
npm install
```

### 2. Base de données
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:push

# Seeder avec des données de test
npm run db:seed
```

### 3. Démarrage
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 🌐 Accès

- **API** : http://localhost:3001
- **Documentation Swagger** : http://localhost:3001/api/docs
- **Base de données** : SQLite (dev) / PostgreSQL (prod)

## 📊 Endpoints Principaux

### 🔐 Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### 🛍️ Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails produit
- `POST /api/products` - Créer produit
- `PUT /api/products/:id` - Modifier produit
- `DELETE /api/products/:id` - Supprimer produit

### 🏪 Fournisseurs
- `GET /api/suppliers` - Liste des fournisseurs
- `POST /api/suppliers` - Ajouter fournisseur
- `POST /api/suppliers/:id/test` - Tester connexion
- `GET /api/suppliers/stats` - Statistiques fournisseurs

### 📊 Dashboard
- `GET /api/dashboard/stats` - Statistiques générales
- `GET /api/dashboard/activity` - Activité récente
- `GET /api/dashboard/sales-chart` - Graphique des ventes
- `GET /api/dashboard/top-categories` - Top catégories

### ⚙️ Paramètres
- `GET /api/settings` - Récupérer paramètres
- `PUT /api/settings` - Modifier paramètres

## 🧪 Test des Endpoints

```bash
# Installer axios si nécessaire
npm install axios

# Lancer les tests
node test-endpoints.js
```

## 🔧 Configuration

### Variables d'environnement
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="kamri-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Base de données
- **Développement** : SQLite
- **Production** : PostgreSQL
- **ORM** : Prisma
- **Migrations** : Automatiques

## 📈 Fonctionnalités Dropshipping

### 🏪 Gestion Fournisseurs
- **Temu** : Plateforme chinoise
- **AliExpress** : Marketplace international
- **Shein** : Mode rapide
- **Test de connexion** : Simulation API
- **Statut** : Connecté/Déconnecté

### 🗂️ Mapping Catégories
- **Catégories externes** → **Catégories internes**
- **Synchronisation automatique**
- **Statut de mapping** : Mappé/En attente/Échec

### 🛍️ Produits Avancés
- **Badges** : Promo, Tendances, Nouveau, Top-ventes
- **Fournisseurs** : Attribution automatique
- **Stock** : Gestion en temps réel
- **Ventes** : Statistiques de performance

## 📊 Données Mock

Le seeder crée automatiquement :
- **7 catégories** principales
- **3 fournisseurs** (Temu, AliExpress, Shein)
- **5 produits** avec badges et fournisseurs
- **2 utilisateurs** (admin + user)
- **2 commandes** avec items
- **Mappings** de catégories

## 🔐 Authentification

### JWT Token
```javascript
// En-tête requis
Authorization: Bearer <jwt_token>
```

### Rôles
- **admin** : Accès complet
- **user** : Accès limité

## 📚 Documentation API

La documentation Swagger est disponible sur `/api/docs` avec :
- **Description complète** de tous les endpoints
- **Exemples de requêtes/réponses**
- **Authentification** intégrée
- **Tests interactifs**

## 🚀 Déploiement

### Production
```bash
# Build
npm run build

# Démarrage
npm run start:prod
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 🎯 Prochaines Étapes

1. **Intégration APIs externes** (Temu, AliExpress)
2. **Synchronisation automatique** des produits
3. **Webhooks** pour les mises à jour
4. **Cache Redis** pour les performances
5. **Monitoring** et logs

---

**KAMRI Backend** - Prêt pour le dropshipping ! 🚀
