# 🔧 Guide de Configuration des Webhooks CJ Dropshipping

## 🎯 **Vue d'ensemble**

Ce guide explique comment configurer et gérer les webhooks CJ Dropshipping pour recevoir des mises à jour en temps réel sur les produits, stock, commandes et logistiques.

## 🔧 **Endpoints Disponibles**

### **1. Configuration des Webhooks**
```http
POST /cj-dropshipping/webhooks/configure
```
Configure les webhooks CJ avec des paramètres personnalisés.

### **2. Configuration par Défaut**
```http
POST /cj-dropshipping/webhooks/setup-default?baseUrl=https://your-domain.com
```
Configure tous les webhooks avec des URLs par défaut.

### **3. Désactivation des Webhooks**
```http
POST /cj-dropshipping/webhooks/disable-all
```
Désactive tous les webhooks CJ.

### **4. Statut des Webhooks**
```http
GET /cj-dropshipping/webhooks/status
```
Récupère le statut des webhooks (limité par l'API CJ).

## 📊 **Structure des Données**

### **Configuration des Webhooks**
```json
{
  "product": {
    "type": "ENABLE",
    "callbackUrls": [
      "https://your-domain.com/api/cj-dropshipping/webhooks/product"
    ]
  },
  "stock": {
    "type": "ENABLE",
    "callbackUrls": [
      "https://your-domain.com/api/cj-dropshipping/webhooks/stock"
    ]
  },
  "order": {
    "type": "ENABLE",
    "callbackUrls": [
      "https://your-domain.com/api/cj-dropshipping/webhooks/order"
    ]
  },
  "logistics": {
    "type": "ENABLE",
    "callbackUrls": [
      "https://your-domain.com/api/cj-dropshipping/webhooks/logistic"
    ]
  }
}
```

### **Réponse de Configuration**
```json
{
  "code": 200,
  "result": true,
  "message": "Success",
  "data": true,
  "requestId": "97367e0f-cf3a-4c9b-acea-a36fb56f81b8"
}
```

## 🚀 **Utilisation Pratique**

### **1. Configuration Complète**
```javascript
const webhookConfig = {
  product: {
    type: "ENABLE",
    callbackUrls: [
      "https://myapp.com/api/cj-dropshipping/webhooks/product"
    ]
  },
  stock: {
    type: "ENABLE",
    callbackUrls: [
      "https://myapp.com/api/cj-dropshipping/webhooks/stock"
    ]
  },
  order: {
    type: "ENABLE",
    callbackUrls: [
      "https://myapp.com/api/cj-dropshipping/webhooks/order"
    ]
  },
  logistics: {
    type: "ENABLE",
    callbackUrls: [
      "https://myapp.com/api/cj-dropshipping/webhooks/logistic"
    ]
  }
};

const result = await cjWebhookService.configureWebhooks(webhookConfig);
console.log('Webhooks configurés:', result.success);
```

### **2. Configuration par Défaut**
```javascript
const baseUrl = 'https://myapp.com';
const result = await cjWebhookService.setupDefaultWebhooks(baseUrl);
console.log('Webhooks par défaut configurés:', result.success);
```

### **3. Désactivation des Webhooks**
```javascript
const result = await cjWebhookService.disableAllWebhooks();
console.log('Webhooks désactivés:', result.success);
```

### **4. Configuration Partielle**
```javascript
// Seulement les produits et commandes
const partialConfig = {
  product: {
    type: "ENABLE",
    callbackUrls: ["https://myapp.com/api/cj-dropshipping/webhooks/product"]
  },
  order: {
    type: "ENABLE",
    callbackUrls: ["https://myapp.com/api/cj-dropshipping/webhooks/order"]
  }
};

const result = await cjWebhookService.configureWebhooks(partialConfig);
```

## 🔍 **Types de Webhooks**

### **1. Webhook Produit (PRODUCT)**
- **URL**: `/cj-dropshipping/webhooks/product`
- **Déclencheur**: Création, mise à jour, suppression de produits
- **Données**: Informations produit, prix, statut, images

### **2. Webhook Stock (STOCK)**
- **URL**: `/cj-dropshipping/webhooks/stock`
- **Déclencheur**: Changements de stock
- **Données**: Quantités, entrepôts, pays

### **3. Webhook Commande (ORDER)**
- **URL**: `/cj-dropshipping/webhooks/order`
- **Déclencheur**: Création, mise à jour, statut de commandes
- **Données**: Numéro commande, statut, dates

### **4. Webhook Logistique (LOGISTIC)**
- **URL**: `/cj-dropshipping/webhooks/logistic`
- **Déclencheur**: Mises à jour de suivi
- **Données**: Numéro de suivi, statut, événements

## 🛠️ **Configuration des URLs**

### **URLs Recommandées**
```javascript
const webhookUrls = {
  product: 'https://your-domain.com/api/cj-dropshipping/webhooks/product',
  stock: 'https://your-domain.com/api/cj-dropshipping/webhooks/stock',
  order: 'https://your-domain.com/api/cj-dropshipping/webhooks/order',
  logistics: 'https://your-domain.com/api/cj-dropshipping/webhooks/logistic'
};
```

### **URLs de Backup**
```javascript
const webhookConfig = {
  product: {
    type: "ENABLE",
    callbackUrls: [
      "https://primary.myapp.com/api/cj-dropshipping/webhooks/product",
      "https://backup.myapp.com/api/cj-dropshipping/webhooks/product"
    ]
  }
};
```

## 📈 **Gestion des Erreurs**

### **Codes d'Erreur Courants**
- `1601000`: Utilisateur non trouvé
- `1600100`: Interface hors ligne
- `1600101`: Interface non trouvée
- `1600200`: Trop de requêtes
- `1600300`: Erreur de paramètre

### **Gestion des Erreurs**
```javascript
try {
  const result = await cjWebhookService.configureWebhooks(config);
  console.log('Succès:', result.success);
} catch (error) {
  console.error('Erreur configuration webhooks:', error.message);
  
  // Gestion spécifique des erreurs
  if (error.message.includes('1601000')) {
    console.log('Erreur d\'authentification - Vérifiez vos credentials');
  } else if (error.message.includes('1600100')) {
    console.log('Interface hors ligne - Réessayez plus tard');
  }
}
```

## 🔒 **Exigences de Sécurité**

### **1. HTTPS Obligatoire**
- ✅ Utilisez HTTPS pour toutes les URLs
- ❌ HTTP non autorisé
- ✅ Certificats SSL valides

### **2. TLS Recommandé**
- ✅ TLS 1.2 minimum
- ✅ TLS 1.3 recommandé
- ✅ Chiffrement fort

### **3. Réponse Rapide**
- ✅ Réponse dans les 3 secondes
- ✅ Code de statut 200 OK
- ✅ Éviter les traitements longs

### **4. Validation des Données**
```javascript
function validateWebhookUrl(url) {
  // Vérifier HTTPS
  if (!url.startsWith('https://')) {
    throw new Error('URL doit commencer par https://');
  }
  
  // Vérifier le domaine
  const domain = new URL(url).hostname;
  if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
    throw new Error('URLs localhost non autorisées');
  }
  
  return true;
}
```

## 🧪 **Test des Webhooks**

### **Test de Configuration**
```bash
cd server
node test-cj-webhooks-config.js
```

### **Test des Endpoints**
```javascript
// Test de réception des webhooks
app.post('/cj-dropshipping/webhooks/product', (req, res) => {
  console.log('Webhook produit reçu:', req.body);
  res.status(200).json({ success: true });
});
```

### **Simulation de Webhooks**
```javascript
// Simuler un webhook produit
const mockWebhook = {
  messageId: 'test-123',
  type: 'PRODUCT',
  params: {
    pid: '123456',
    productName: 'Test Product',
    productSellPrice: 29.99,
    productStatus: 3
  }
};

// Envoyer au service
await cjWebhookService.handleProductUpdate(mockWebhook);
```

## 📊 **Monitoring et Analytics**

### **Surveillance des Webhooks**
```javascript
async function monitorWebhooks() {
  const stats = {
    totalReceived: 0,
    byType: {},
    errors: 0,
    lastReceived: null
  };
  
  // Logique de surveillance
  return stats;
}
```

### **Analytics des Webhooks**
```javascript
function analyzeWebhookData(webhooks) {
  const analytics = {
    total: webhooks.length,
    byType: {},
    byHour: {},
    errorRate: 0
  };
  
  webhooks.forEach(webhook => {
    analytics.byType[webhook.type] = (analytics.byType[webhook.type] || 0) + 1;
    
    const hour = new Date(webhook.timestamp).getHours();
    analytics.byHour[hour] = (analytics.byHour[hour] || 0) + 1;
  });
  
  return analytics;
}
```

## 🎯 **Bonnes Pratiques**

1. **Utiliser HTTPS** pour toutes les URLs
2. **Configurer des URLs de backup** pour la redondance
3. **Tester les webhooks** avant la mise en production
4. **Monitorer les performances** des webhooks
5. **Gérer les erreurs** gracieusement
6. **Valider les données** reçues
7. **Loguer les webhooks** pour le debugging
8. **Implémenter la retry logic** pour les échecs

## 🔗 **Liens Utiles**

- [Documentation CJ Dropshipping](https://developers.cjdropshipping.com/)
- [Guide des Webhooks](https://developers.cjdropshipping.com/en/api/api2/api/webhook.html)
- [Codes d'Erreur](https://developers.cjdropshipping.com/en/api/api2/api/error.html)

---

**Note**: Ce guide est basé sur la documentation officielle CJ Dropshipping et peut être mis à jour selon les évolutions de l'API.
