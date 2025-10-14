# 🚀 Installation du Dashboard Admin KAMRI

## ⚠️ Problème de Dépendances

Si vous rencontrez des erreurs "could not found" ou des problèmes d'installation, suivez ces étapes :

## 🔧 Solution Rapide

### Option 1 : Installation Automatique
```bash
# Double-cliquez sur le fichier :
install-and-run.bat
```

### Option 2 : Installation Manuelle
```bash
# 1. Aller dans le dossier admin
cd apps/admin

# 2. Copier le package.json simplifié
copy package-simple.json package.json

# 3. Installer les dépendances
npm install

# 4. Démarrer le dashboard
npm run dev
```

## 🌐 Accès au Dashboard

Une fois démarré, le dashboard sera accessible sur :
**http://localhost:3002**

## 📁 Structure du Dashboard

```
apps/admin/
├── src/
│   ├── app/admin/          # Pages du dashboard
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── products/       # Gestion produits
│   │   ├── categories/     # Gestion catégories
│   │   ├── suppliers/       # Gestion fournisseurs
│   │   ├── orders/         # Gestion commandes
│   │   ├── users/          # Gestion utilisateurs
│   │   └── settings/       # Paramètres
│   ├── components/         # Composants UI
│   └── lib/               # Utilitaires
├── package.json           # Dépendances
├── tailwind.config.js     # Configuration Tailwind
└── next.config.js         # Configuration Next.js
```

## 🎯 Fonctionnalités Disponibles

- ✅ **Dashboard** : Vue d'ensemble avec statistiques
- ✅ **Produits** : Gestion des produits importés
- ✅ **Catégories** : Mapping avec fournisseurs externes
- ✅ **Fournisseurs** : Configuration APIs (Temu, AliExpress, etc.)
- ✅ **Commandes** : Suivi des commandes multi-fournisseurs
- ✅ **Utilisateurs** : Gestion des utilisateurs
- ✅ **Paramètres** : Configuration de la plateforme

## 🎨 Design

- **Couleurs** : Palette KAMRI (vert #4CAF50)
- **Responsive** : Mobile, tablette, desktop
- **Composants** : Design cohérent avec le site principal

## 🚨 Dépannage

### Erreur "Module not found"
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Erreur de port
```bash
# Changer le port dans package.json
"dev": "next dev -p 3003"
```

### Erreur TypeScript
```bash
# Vérifier les types
npm run type-check
```

## 📞 Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que Node.js est installé
2. Vérifiez que npm fonctionne
3. Essayez avec `yarn` au lieu de `npm`
4. Redémarrez votre terminal

---

**KAMRI Admin Dashboard** - Prêt à l'emploi ! 🚀
