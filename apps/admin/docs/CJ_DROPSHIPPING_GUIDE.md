# Guide CJ Dropshipping - Dashboard Admin

## 🎯 Configuration Initiale

### 1. Obtenir les credentials CJ

1. **Créer un compte CJ Dropshipping**
   - Aller sur [https://cjdropshipping.com](https://cjdropshipping.com)
   - Créer un compte ou se connecter
   - Aller dans **Developer** > **API Key**
   - Générer une nouvelle API Key
   - Noter l'email et l'API Key

2. **Configurer dans KAMRI**
   - Aller dans **Admin** > **CJ Dropshipping** > **Configuration**
   - Entrer l'email et l'API Key
   - Sélectionner le tier (Free, Plus, Prime, Advanced)
   - Cliquer **"Tester la connexion"**
   - Si OK, cliquer **"Sauvegarder"**

### 2. Première connexion

1. **Page principale CJ Dropshipping**
   - Vérifier le statut de connexion
   - Voir les statistiques (produits, commandes, webhooks)
   - Accéder aux actions rapides

2. **Test de connexion**
   - Le bouton "Tester la connexion" vérifie les credentials
   - Affiche le statut : Connecté/Déconnecté
   - Montre les informations du compte

## 📦 Importer des Produits

### 1. Rechercher des produits

1. **Aller dans la page Produits**
   - Admin > CJ Dropshipping > Produits
   - Utiliser la barre de recherche

2. **Utiliser les filtres**
   - **Mot-clé** : Nom du produit (ex: "phone case")
   - **Prix min/max** : Filtrer par prix
   - **Pays** : Pour le stock (US, FR, DE, etc.)
   - **Catégorie** : Filtrer par catégorie CJ

3. **Lancer la recherche**
   - Cliquer "Rechercher"
   - Voir les résultats en grille
   - Chaque produit affiche : image, nom, prix, stock, note

### 2. Voir les détails d'un produit

1. **Cliquer sur "Détails"**
   - Voir toutes les variantes
   - Voir les avis clients
   - Voir les images supplémentaires
   - Voir les informations de livraison

2. **Informations importantes**
   - **SKU** : Identifiant unique
   - **Stock** : Disponibilité
   - **Prix** : Prix de vente CJ
   - **Note** : Avis clients
   - **Poids** : Pour le calcul de port

### 3. Importer un produit

1. **Cliquer "Importer"**
   - Le produit est ajouté à KAMRI
   - Un mapping CJ est créé
   - Le stock est synchronisé

2. **Configuration de l'import**
   - **Catégorie KAMRI** : Choisir la catégorie interne
   - **Marge** : Ajouter un pourcentage de marge
   - **Statut** : Produit actif/inactif

3. **Vérification**
   - Le produit apparaît dans la liste KAMRI
   - Badge "CJ" ajouté
   - Stock mis à jour automatiquement

## 🛒 Gestion des Commandes

### 1. Commandes automatiques

1. **Processus automatique**
   - Client commande un produit CJ sur KAMRI
   - Commande CJ créée automatiquement
   - Mapping entre KAMRI et CJ
   - Statut synchronisé en temps réel

2. **Suivi des commandes**
   - Admin > CJ Dropshipping > Commandes
   - Voir toutes les commandes CJ
   - Statuts en temps réel
   - Numéros de tracking

### 2. Synchronisation manuelle

1. **Synchroniser les statuts**
   - Cliquer "Synchroniser les commandes"
   - Met à jour tous les statuts
   - Récupère les numéros de tracking
   - Affiche les résultats

2. **Suivi des colis**
   - Entrer un numéro de tracking
   - Voir les informations de livraison
   - Statut en temps réel

### 3. Statuts des commandes

| Statut CJ | Statut KAMRI | Description |
|-----------|--------------|-------------|
| CREATED | PENDING | Commande créée |
| PAID | CONFIRMED | Commande payée |
| SHIPPED | SHIPPED | Commande expédiée |
| DELIVERED | DELIVERED | Commande livrée |
| CANCELLED | CANCELLED | Commande annulée |

## 🔔 Configuration des Webhooks

### 1. Activer les webhooks

1. **Aller dans Webhooks**
   - Admin > CJ Dropshipping > Webhooks
   - Cliquer "Activer les webhooks"
   - URL générée automatiquement

2. **Types d'événements**
   - **PRODUCT** : Changements de produits
   - **STOCK** : Mises à jour de stock
   - **ORDER** : Changements de statut
   - **LOGISTICS** : Informations de tracking

### 2. Surveiller les webhooks

1. **Logs des webhooks**
   - Voir tous les webhooks reçus
   - Statut : Traité/En attente/Erreur
   - Détails du payload
   - Timestamp

2. **Résolution des erreurs**
   - Identifier les webhooks en erreur
   - Voir le message d'erreur
   - Retraiter si nécessaire

### 3. Statistiques

- **Total reçus** : Nombre total de webhooks
- **Traités** : Webhooks traités avec succès
- **Erreurs** : Webhooks en erreur
- **Récents** : Webhooks des dernières 24h

## 📊 Statistiques et Monitoring

### 1. Tableau de bord principal

1. **Statut de connexion**
   - Connecté/Déconnecté
   - Tier d'abonnement
   - Dernière synchronisation

2. **Métriques clés**
   - Nombre de produits importés
   - Nombre de commandes
   - Webhooks reçus
   - Taux de succès

### 2. Actions rapides

1. **Rechercher des produits**
   - Accès direct à la recherche
   - Filtres prédéfinis

2. **Gérer les commandes**
   - Vue d'ensemble des commandes
   - Synchronisation rapide

3. **Configuration webhooks**
   - Activer/désactiver
   - Voir les logs

## 💡 Bonnes Pratiques

### 1. Gestion des produits

1. **Avant l'import**
   - Vérifier le stock disponible
   - Vérifier les avis clients
   - Calculer la marge nécessaire
   - Choisir la bonne catégorie

2. **Après l'import**
   - Surveiller les changements de prix
   - Synchroniser le stock régulièrement
   - Mettre à jour les descriptions
   - Gérer les variantes

### 2. Gestion des commandes

1. **Vérifications**
   - Adresse de livraison complète
   - Numéro de téléphone valide
   - Méthode de livraison appropriée
   - Produits disponibles

2. **Suivi**
   - Surveiller les statuts
   - Communiquer avec les clients
   - Gérer les retours
   - Optimiser les délais

### 3. Performance

1. **Synchronisation**
   - Activer la sync automatique
   - Surveiller les erreurs
   - Optimiser la fréquence
   - Gérer les rate limits

2. **Monitoring**
   - Vérifier les logs régulièrement
   - Surveiller les webhooks
   - Analyser les statistiques
   - Prévenir les problèmes

## 🚨 Résolution de Problèmes

### 1. Problèmes de connexion

**Symptômes** : Statut "Déconnecté", erreurs d'authentification

**Solutions** :
- Vérifier l'email et l'API Key
- Tester la connexion
- Vérifier le tier d'abonnement
- Contacter le support CJ si nécessaire

### 2. Produits non importés

**Symptômes** : Erreur lors de l'import, produit non visible

**Solutions** :
- Vérifier que le produit existe dans CJ
- Vérifier les permissions de l'API
- Vérifier les logs d'erreur
- Réessayer l'import

### 3. Commandes non créées

**Symptômes** : Commande KAMRI sans commande CJ

**Solutions** :
- Vérifier que les produits sont CJ
- Vérifier l'adresse de livraison
- Vérifier les méthodes de livraison
- Vérifier les logs d'erreur

### 4. Webhooks non reçus

**Symptômes** : Pas de notifications, statuts non mis à jour

**Solutions** :
- Vérifier l'URL des webhooks
- Vérifier que les webhooks sont activés
- Vérifier les logs de webhooks
- Tester la configuration

### 5. Synchronisation lente

**Symptômes** : Données non à jour, délais importants

**Solutions** :
- Vérifier le tier d'abonnement
- Optimiser la fréquence de sync
- Surveiller les rate limits
- Utiliser les webhooks

## 📞 Support

### 1. Documentation
- README du module backend
- Guide API CJ Dropshipping
- Documentation technique

### 2. Logs et debugging
- Logs de l'application
- Logs des webhooks
- Logs d'erreur
- Métriques de performance

### 3. Contact
- Support technique KAMRI
- Support CJ Dropshipping
- Documentation officielle CJ

---

**🎉 Félicitations ! Vous maîtrisez maintenant l'intégration CJ Dropshipping avec KAMRI.**

