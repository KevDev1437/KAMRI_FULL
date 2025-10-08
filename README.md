# KAMRI - Fullstack E-commerce Monorepo

Un monorepo complet pour une plateforme e-commerce moderne avec support web, mobile et backend.

## 🏗️ Architecture

```
kamri/
├── apps/
│   ├── mobile/          # Application Expo (iOS & Android)
│   └── web/             # Application Next.js (Web)
├── packages/
│   ├── ui/              # Composants React partagés
│   └── lib/             # Logique métier partagée
├── server/              # Backend NestJS + Prisma + Stripe
├── pnpm-workspace.yaml  # Configuration pnpm
├── turbo.json          # Configuration Turborepo
└── tsconfig.base.json   # Configuration TypeScript partagée
```

## 🚀 Technologies

### Frontend
- **Next.js 14** - Framework React pour le web
- **Expo** - Framework React Native pour mobile
- **TailwindCSS** - Framework CSS
- **TypeScript** - Langage de programmation

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM et gestion de base de données
- **PostgreSQL** - Base de données
- **Stripe** - Paiements
- **Supabase** - Authentification

### Outils
- **pnpm** - Gestionnaire de paquets
- **Turborepo** - Build system pour monorepo
- **ESLint + Prettier** - Linting et formatage

## 📦 Installation

### Prérequis
- Node.js 18+
- pnpm 8+
- PostgreSQL
- Compte Stripe
- Compte Supabase

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/KevDev1437/KAMRI_FULL.git
cd KAMRI_FULL
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Éditez le fichier `.env` avec vos clés :
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kamri_db"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

4. **Configurer la base de données**
```bash
# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# Peupler avec des données de test
pnpm db:seed
```

## 🎯 Commandes de développement

### Développement complet
```bash
# Démarrer tous les services
pnpm dev:all
```

### Services individuels
```bash
# Backend uniquement
pnpm dev:server

# Web uniquement  
pnpm dev:web

# Mobile uniquement
pnpm dev:mobile
```

### Autres commandes utiles
```bash
# Build complet
pnpm build

# Linting
pnpm lint

# Type checking
pnpm type-check

# Nettoyer les caches
pnpm clean
```

## 🌐 URLs de développement

- **Web** : http://localhost:3000
- **Backend API** : http://localhost:3001
- **Documentation API** : http://localhost:3001/api/docs
- **Mobile** : Expo DevTools

## 📱 Applications

### Web (Next.js)
- Interface e-commerce responsive
- Intégration Stripe pour les paiements
- Gestion des produits et panier
- Authentification Supabase

### Mobile (Expo)
- Application React Native
- Support iOS et Android
- Web support avec react-native-web
- Partage des composants UI

### Backend (NestJS)
- API REST complète
- Authentification JWT
- Intégration Stripe
- Base de données PostgreSQL
- Documentation Swagger

## 🗄️ Base de données

### Modèles principaux
- **User** - Utilisateurs
- **Product** - Produits
- **Category** - Catégories
- **Cart** - Panier
- **Order** - Commandes
- **Address** - Adresses
- **Review** - Avis

### Scripts Prisma
```bash
# Générer le client
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# Créer une migration
pnpm db:migrate

# Peupler la base
pnpm db:seed

# Interface graphique
pnpm db:studio
```

## 💳 Paiements Stripe

### Configuration
1. Créer un compte Stripe
2. Récupérer les clés API
3. Configurer les webhooks
4. Ajouter les clés dans `.env`

### Endpoints
- `POST /api/payments/create-intent` - Créer un PaymentIntent
- `POST /api/payments/webhook` - Webhook Stripe

## 🔐 Authentification Supabase

### Configuration
1. Créer un projet Supabase
2. Récupérer les clés API
3. Configurer l'authentification
4. Ajouter les clés dans `.env`

## 🚀 Déploiement

### Web (Vercel)
```bash
# Build et déploiement automatique
vercel --prod
```

### Backend (Render/Supabase)
```bash
# Configuration des variables d'environnement
# Déploiement automatique via Git
```

### Mobile (Expo)
```bash
# Build pour production
expo build:android
expo build:ios
```

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests e2e
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📁 Structure détaillée

### Apps
- **mobile/** - Application Expo avec navigation, composants et assets
- **web/** - Application Next.js avec pages, composants et styles

### Packages
- **ui/** - Composants React réutilisables (Button, Card, Input, Modal)
- **lib/** - Types, validation, API client, utilitaires

### Server
- **src/** - Code source NestJS
- **prisma/** - Schéma et migrations de base de données

## 🔧 Développement

### Ajouter un nouveau composant UI
1. Créer dans `packages/ui/src/components/`
2. Exporter dans `packages/ui/src/index.ts`
3. Utiliser dans les apps avec `@kamri/ui`

### Ajouter une nouvelle API
1. Créer le module dans `server/src/`
2. Ajouter le contrôleur et service
3. Documenter avec Swagger

### Ajouter une nouvelle page web
1. Créer dans `apps/web/src/app/`
2. Utiliser les composants partagés
3. Intégrer avec l'API backend

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**KAMRI** - Plateforme e-commerce moderne et scalable 🚀

