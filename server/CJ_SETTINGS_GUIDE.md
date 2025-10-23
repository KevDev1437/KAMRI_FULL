# 📊 Guide des Paramètres CJ Dropshipping

## 🎯 **Vue d'ensemble**

Ce guide explique comment utiliser les paramètres de compte CJ Dropshipping pour optimiser l'intégration et gérer les limites d'API.

## 🔧 **Endpoints Disponibles**

### **1. Paramètres du Compte**
```http
GET /cj-dropshipping/settings/account
```
Récupère tous les paramètres du compte CJ.

### **2. Limites de Quota**
```http
GET /cj-dropshipping/settings/quotas
```
Récupère les limites de quota par URL.

### **3. Limite QPS**
```http
GET /cj-dropshipping/settings/qps-limit
```
Récupère la limite de requêtes par seconde.

### **4. Statut Sandbox**
```http
GET /cj-dropshipping/settings/sandbox-status
```
Vérifie si le compte est en mode sandbox.

### **5. Niveau d'Accès**
```http
GET /cj-dropshipping/settings/account-level
```
Récupère le niveau d'accès du compte.

### **6. Paramètres de Callback**
```http
GET /cj-dropshipping/settings/callbacks
```
Récupère les paramètres de callback.

### **7. Statut des Webhooks**
```http
GET /cj-dropshipping/settings/webhooks-status
```
Vérifie si les webhooks sont activés.

### **8. URLs de Callback**
```http
GET /cj-dropshipping/settings/callback-urls
```
Récupère les URLs de callback configurées.

### **9. Analyse des Performances**
```http
GET /cj-dropshipping/settings/performance-analysis
```
Analyse complète des performances du compte.

### **10. Synchronisation en Base**
```http
POST /cj-dropshipping/settings/sync-to-database
```
Synchronise les paramètres en base de données.

### **11. Vérification des Limites**
```http
GET /cj-dropshipping/settings/limits-check
```
Vérifie si le compte respecte les limites.

## 📊 **Structure des Données**

### **Paramètres du Compte**
```json
{
  "openId": 123456789,
  "openName": "Nom du compte",
  "openEmail": "email@example.com",
  "setting": {
    "quotaLimits": [
      {
        "quotaUrl": "/api2.0/v1/setting/account/get",
        "quotaLimit": 74,
        "quotaType": 0
      }
    ],
    "qpsLimit": 100
  },
  "callback": {
    "product": {
      "type": "ENABLE",
      "urls": ["https://your-domain.com/api2.0/"]
    },
    "order": {
      "type": "CANCEL",
      "urls": []
    }
  },
  "root": "GENERAL",
  "isSandbox": false
}
```

### **Types de Quota**
| Type | Description |
|------|-------------|
| 0 | Total |
| 1 | Par an |
| 2 | Par trimestre |
| 3 | Par mois |
| 4 | Par jour |
| 5 | Par heure |

### **Niveaux d'Accès**
| Niveau | Description |
|--------|-------------|
| `NO_PERMISSION` | Non autorisé |
| `GENERAL` | Compte général |
| `VIP` | Compte VIP |
| `ADMIN` | Administrateur |

## 🚀 **Utilisation Pratique**

### **1. Vérifier les Limites**
```javascript
// Vérifier les limites du compte
const limits = await cjSettingsService.checkAccountLimits();
if (!limits.withinLimits) {
  console.log('⚠️ Limites dépassées:', limits.warnings);
}
```

### **2. Analyser les Performances**
```javascript
// Analyser les performances
const analysis = await cjSettingsService.analyzeAccountPerformance();
console.log('Recommandations:', analysis.recommendations);
```

### **3. Synchroniser les Paramètres**
```javascript
// Synchroniser en base de données
await cjSettingsService.syncSettingsToDatabase();
```

## 🔍 **Gestion des Erreurs**

### **Erreurs Courantes**
| Code | Description | Solution |
|------|-------------|----------|
| 1601000 | Utilisateur non trouvé | Vérifier les credentials |
| 1600001 | Token invalide | Renouveler le token |
| 1600200 | Trop de requêtes | Respecter les limites QPS |

### **Optimisation des Performances**
1. **Respecter les limites QPS** selon le niveau du compte
2. **Activer les webhooks** pour les mises à jour temps réel
3. **Surveiller les quotas** pour éviter les blocages
4. **Utiliser le sandbox** pour les tests

## 📈 **Monitoring**

### **Métriques Importantes**
- **QPS Limit**: Limite de requêtes par seconde
- **Quota Limits**: Limites par URL
- **Webhook Status**: Statut des webhooks
- **Account Level**: Niveau d'accès

### **Alertes Recommandées**
- Quota proche de la limite (80%)
- QPS élevé (>80% de la limite)
- Webhooks désactivés
- Compte sandbox en production

## 🛠️ **Configuration**

### **Variables d'Environnement**
```env
CJ_EMAIL=your-email@example.com
CJ_API_KEY=your-api-key
CJ_DEBUG=true
```

### **Configuration du Client**
```javascript
const client = new CJAPIClient(email, apiKey, {
  tier: 'free', // free, plus, prime, advanced
  debug: true
});
```

## 📚 **Exemples d'Utilisation**

### **Test des Paramètres**
```bash
cd server
node test-cj-settings.js
```

### **Récupération des Paramètres**
```javascript
const settings = await cjSettingsService.getAccountSettings();
console.log('Limite QPS:', settings.setting.qpsLimit);
```

### **Vérification des Webhooks**
```javascript
const webhooks = await cjSettingsService.areWebhooksEnabled();
console.log('Webhooks produits:', webhooks.product);
console.log('Webhooks commandes:', webhooks.order);
```

## 🎯 **Bonnes Pratiques**

1. **Surveiller régulièrement** les paramètres du compte
2. **Respecter les limites** pour éviter les blocages
3. **Activer les webhooks** pour les mises à jour temps réel
4. **Utiliser le sandbox** pour les tests
5. **Synchroniser les paramètres** en base de données
6. **Analyser les performances** régulièrement

## 🔗 **Liens Utiles**

- [Documentation CJ Dropshipping](https://developers.cjdropshipping.com/)
- [Guide des Limites d'API](https://developers.cjdropshipping.com/en/api/api2/api/auth.html#_1-1-get-access-token-post)
- [Configuration des Webhooks](https://developers.cjdropshipping.com/en/api/api2/api/webhook.html)

---

**Note**: Ce guide est basé sur la documentation officielle CJ Dropshipping et peut être mis à jour selon les évolutions de l'API.
