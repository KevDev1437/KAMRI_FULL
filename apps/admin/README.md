# KAMRI Admin Dashboard

Dashboard administrateur pour la plateforme KAMRI (dropshipping).

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
pnpm install

# Démarrage en mode développement
pnpm dev

# Le dashboard sera accessible sur http://localhost:3002
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- **Dashboard** : Vue d'ensemble avec statistiques et graphiques
- **Produits** : Gestion des produits importés avec filtres
- **Catégories** : Mapping des catégories avec fournisseurs externes
- **Fournisseurs** : Configuration des APIs (Temu, AliExpress, Shein, etc.)
- **Commandes** : Suivi des commandes multi-fournisseurs
- **Utilisateurs** : Gestion des utilisateurs et administrateurs
- **Paramètres** : Configuration de la plateforme

### 🎨 Design System
- **Couleurs** : Palette KAMRI (vert #4CAF50)
- **Composants** : Design cohérent avec le site principal
- **Responsive** : Adapté mobile, tablette, desktop
- **Animations** : Transitions fluides avec Framer Motion

## 📁 Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── admin/           # Pages du dashboard
│   │   │   ├── page.tsx     # Dashboard principal
│   │   │   ├── products/    # Gestion produits
│   │   │   ├── categories/  # Gestion catégories
│   │   │   ├── suppliers/   # Gestion fournisseurs
│   │   │   ├── orders/      # Gestion commandes
│   │   │   ├── users/       # Gestion utilisateurs
│   │   │   └── settings/    # Paramètres
│   │   └── layout.tsx       # Layout principal
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Layout
│   │   └── ui/             # Composants UI réutilisables
│   └── lib/
│       └── utils.ts        # Utilitaires
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Technologies

- **Next.js 14** : Framework React
- **TailwindCSS** : Styling
- **Shadcn/UI** : Composants UI
- **Lucide React** : Icônes
- **Framer Motion** : Animations
- **Recharts** : Graphiques (à implémenter)

## 📊 Données Mock

Le dashboard utilise des données factices pour les tests :
- **Produits** : 5 produits d'exemple avec différents fournisseurs
- **Commandes** : 4 commandes avec statuts variés
- **Utilisateurs** : 5 utilisateurs (admin + users)
- **Fournisseurs** : 4 plateformes (Temu, AliExpress, Shein, Amazon)

## 🎯 Prochaines Étapes

1. **Intégration API** : Connexion au backend réel
2. **Graphiques** : Implémentation Recharts
3. **Tests** : Tests unitaires et d'intégration
4. **Authentification** : Système d'auth complet
5. **Déploiement** : Configuration production

## 🚀 Déploiement

```bash
# Build de production
pnpm build

# Démarrage en production
pnpm start
```

## 📱 URLs

- **Développement** : http://localhost:3002
- **Production** : admin.kamri.com (à configurer)

---

**KAMRI Admin** - Dashboard dropshipping moderne et efficace 🚀
