# ⚖️ Guide des Disputes CJ Dropshipping

## 🎯 **Vue d'ensemble**

Ce guide explique comment gérer les litiges et réclamations avec l'API CJ Dropshipping pour résoudre les problèmes de commandes, produits défectueux, et autres réclamations clients.

## 🔧 **Endpoints Disponibles**

### **1. Produits en Litige**
```http
GET /cj-dropshipping/disputes/products/:orderId
```
Récupère la liste des produits en litige pour une commande spécifique.

### **2. Confirmer un Litige**
```http
POST /cj-dropshipping/disputes/confirm
```
Confirme un litige et récupère les informations de confirmation.

### **3. Créer un Litige**
```http
POST /cj-dropshipping/disputes/create
```
Crée un nouveau litige avec les détails de la réclamation.

### **4. Annuler un Litige**
```http
POST /cj-dropshipping/disputes/cancel
```
Annule un litige existant.

### **5. Liste des Litiges**
```http
GET /cj-dropshipping/disputes/list
```
Récupère la liste de tous les litiges avec filtres.

### **6. Analytics des Litiges**
```http
GET /cj-dropshipping/disputes/analytics
```
Récupère les statistiques et analytics des litiges.

## 📊 **Structure des Données**

### **Produits en Litige**
```json
{
  "success": true,
  "disputeProducts": {
    "orderId": "75727832844206081",
    "orderNumber": "1627572766607937536",
    "productInfoList": [
      {
        "lineItemId": "27572784056172547",
        "cjProductId": "70030020423733248",
        "cjVariantId": "70030020612476928",
        "canChoose": true,
        "price": 23.00,
        "quantity": 1,
        "cjProductName": "Hellpoo",
        "cjImage": "http://d847fcac-392f-4168-8b06-a580a8368dff.jpg",
        "sku": "CJSJ1041743",
        "supplierName": "banggood"
      }
    ]
  }
}
```

### **Confirmation de Litige**
```json
{
  "success": true,
  "disputeInfo": {
    "orderId": "265062501897420801",
    "orderNumber": "1626506237791440896",
    "maxProductPrice": 23.00,
    "maxPostage": 0.00,
    "maxIossTaxAmount": 0,
    "maxIossHandTaxAmount": 0,
    "maxAmount": 23.00,
    "expectResultOptionList": ["1"],
    "productInfoList": [
      {
        "lineItemId": "1626506252349808640",
        "cjProductId": "1570030020423733248",
        "cjVariantId": "1570030020612476928",
        "canChoose": false,
        "price": 23.00,
        "quantity": 1,
        "cjProductName": "Hellpoo",
        "cjImage": "https://d847fcac-392f-4168-8b06-a580a8368dff.jpg",
        "sku": "CJSJ1041743-A",
        "supplierName": "banggood"
      }
    ],
    "disputeReasonList": [
      {
        "disputeReasonId": 1,
        "reasonName": "Unfulfilled Order Cancellation"
      }
    ]
  }
}
```

### **Création de Litige**
```json
{
  "orderId": "275727832844206081",
  "businessDisputeId": "0000001266",
  "disputeReasonId": 1,
  "expectType": 1,
  "refundType": 1,
  "messageText": "Produit défectueux reçu",
  "imageUrl": [],
  "videoUrl": [],
  "productInfoList": [
    {
      "lineItemId": "1627572784056172547",
      "quantity": "1",
      "price": 23.00
    }
  ]
}
```

## 🚀 **Utilisation Pratique**

### **1. Récupérer les Produits en Litige**
```javascript
const disputeProducts = await cjDisputesService.getDisputeProducts('CJPKL7160102171YQ');
console.log('Produits en litige:', disputeProducts.disputeProducts.productInfoList);
```

### **2. Confirmer un Litige**
```javascript
const confirmParams = {
  orderId: '62650625018974208',
  productInfoList: [
    {
      lineItemId: '1626506252349808640',
      quantity: '1'
    }
  ]
};

const disputeInfo = await cjDisputesService.confirmDispute(confirmParams);
console.log('Informations de confirmation:', disputeInfo.disputeInfo);
```

### **3. Créer un Litige**
```javascript
const createParams = {
  orderId: '275727832844206081',
  businessDisputeId: '0000001266',
  disputeReasonId: 1,
  expectType: 1, // 1: Refund, 2: Reissue
  refundType: 1, // 1: balance, 2: platform
  messageText: 'Produit défectueux reçu',
  imageUrl: ['https://example.com/image1.jpg'],
  productInfoList: [
    {
      lineItemId: '1627572784056172547',
      quantity: '1',
      price: 23.00
    }
  ]
};

const result = await cjDisputesService.createDispute(createParams);
console.log('Litige créé:', result.disputeId);
```

### **4. Annuler un Litige**
```javascript
const cancelParams = {
  orderId: 'J1623672949997490176',
  disputeId: 'SH1623673863466725376'
};

const result = await cjDisputesService.cancelDispute(cancelParams);
console.log('Litige annulé:', result.success);
```

### **5. Liste des Litiges**
```javascript
const disputes = await cjDisputesService.getDisputeList({
  pageNum: 1,
  pageSize: 10
});
console.log('Litiges:', disputes.disputes);
```

## 📈 **Analytics et Reporting**

### **Statistiques des Litiges**
```javascript
const analytics = await cjDisputesService.getDisputeAnalytics();
console.log('Analytics:', analytics.analytics);

// Exemple de sortie
{
  "total": 150,
  "byStatus": {
    "pending": 25,
    "resolved": 100,
    "rejected": 25
  },
  "byReason": {
    "Unfulfilled Order Cancellation": 50,
    "Product Quality Issue": 30,
    "Shipping Delay": 20
  },
  "bySupplier": {
    "banggood": 40,
    "aliexpress": 35,
    "amazon": 25
  },
  "totalRefundAmount": 2500.00,
  "totalReissueAmount": 500.00
}
```

### **Analyse des Tendances**
```javascript
function analyzeDisputeTrends(disputes) {
  const trends = {
    monthly: {},
    byProduct: {},
    bySupplier: {},
    resolutionTime: {}
  };
  
  disputes.forEach(dispute => {
    // Analyse mensuelle
    const month = new Date(dispute.createDate).toISOString().substring(0, 7);
    trends.monthly[month] = (trends.monthly[month] || 0) + 1;
    
    // Analyse par produit
    if (dispute.productList) {
      dispute.productList.forEach(product => {
        const productName = product.productName;
        trends.byProduct[productName] = (trends.byProduct[productName] || 0) + 1;
      });
    }
    
    // Analyse par fournisseur
    if (dispute.productList) {
      dispute.productList.forEach(product => {
        const supplier = product.supplierName;
        trends.bySupplier[supplier] = (trends.bySupplier[supplier] || 0) + 1;
      });
    }
  });
  
  return trends;
}
```

## 🔍 **Gestion des Types de Litiges**

### **Types d'Attente (expectType)**
- `1`: Remboursement (Refund)
- `2`: Réexpédition (Reissue)

### **Types de Remboursement (refundType)**
- `1`: Solde (balance)
- `2`: Plateforme (platform)

### **Raisons de Litige Courantes**
- `1`: Annulation de commande non honorée
- `2`: Problème de qualité du produit
- `3`: Retard de livraison
- `4`: Produit manquant
- `5`: Produit endommagé

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

### **Test des Disputes**
```bash
cd server
node test-cj-disputes.js
```

### **Gestion Complète d'un Litige**
```javascript
async function handleDisputeComplete(orderId, businessDisputeId) {
  try {
    // 1. Récupérer les produits en litige
    const disputeProducts = await cjDisputesService.getDisputeProducts(orderId);
    
    // 2. Confirmer le litige
    const confirmParams = {
      orderId: orderId,
      productInfoList: disputeProducts.disputeProducts.productInfoList.map(product => ({
        lineItemId: product.lineItemId,
        quantity: product.quantity.toString()
      }))
    };
    
    const disputeInfo = await cjDisputesService.confirmDispute(confirmParams);
    
    // 3. Créer le litige
    const createParams = {
      orderId: orderId,
      businessDisputeId: businessDisputeId,
      disputeReasonId: 1, // Raison par défaut
      expectType: 1, // Remboursement
      refundType: 1, // Solde
      messageText: 'Litige automatique créé',
      productInfoList: disputeInfo.disputeInfo.productInfoList.map(product => ({
        lineItemId: product.lineItemId,
        quantity: product.quantity.toString(),
        price: product.price
      }))
    };
    
    const result = await cjDisputesService.createDispute(createParams);
    
    return {
      success: true,
      disputeId: result.disputeId,
      message: 'Litige géré avec succès'
    };
    
  } catch (error) {
    console.error('Erreur gestion litige:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 🎯 **Bonnes Pratiques**

1. **Vérifier les produits** avant de créer un litige
2. **Utiliser des images** pour appuyer les réclamations
3. **Choisir la bonne raison** de litige
4. **Surveiller les tendances** pour identifier les problèmes récurrents
5. **Analyser les fournisseurs** problématiques
6. **Gérer les délais** de résolution
7. **Documenter les litiges** pour améliorer le service

## 🔗 **Liens Utiles**

- [Documentation CJ Dropshipping](https://developers.cjdropshipping.com/)
- [Guide des Disputes](https://developers.cjdropshipping.com/en/api/api2/api/dispute.html)
- [Codes d'Erreur](https://developers.cjdropshipping.com/en/api/api2/api/error.html)

---

**Note**: Ce guide est basé sur la documentation officielle CJ Dropshipping et peut être mis à jour selon les évolutions de l'API.
