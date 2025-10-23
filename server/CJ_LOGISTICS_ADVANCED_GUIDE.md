# 🚚 Guide des Logistiques Avancées CJ Dropshipping

## 🎯 **Vue d'ensemble**

Ce guide explique comment utiliser les fonctionnalités avancées des logistiques CJ Dropshipping pour calculer les frais de port, suivre les expéditions et optimiser les coûts de livraison.

## 🔧 **Endpoints Disponibles**

### **1. Calcul de Fret Standard**
```http
POST /cj-dropshipping/logistics/calculate-freight
```
Calcule les options de fret pour des produits spécifiques.

### **2. Calcul de Fret Avancé**
```http
POST /cj-dropshipping/logistics/calculate-freight-tip
```
Calcule le fret avec conseils et recommandations.

### **3. Suivi des Expéditions**
```http
GET /cj-dropshipping/logistics/track-info
```
Récupère les informations de suivi des expéditions.

### **4. Options Logistiques**
```http
GET /cj-dropshipping/logistics/options
```
Récupère toutes les options logistiques disponibles.

## 📊 **Structure des Données**

### **Calcul de Fret Standard**
```json
{
  "startCountryCode": "CN",
  "endCountryCode": "US",
  "zip": "10001",
  "taxId": "TAX123",
  "houseNumber": "123",
  "iossNumber": "IOSS123",
  "products": [
    {
      "quantity": 2,
      "vid": "439FC05B-1311-4349-87FA-1E1EF942C418"
    }
  ]
}
```

### **Réponse Calcul de Fret**
```json
{
  "success": true,
  "freightOptions": [
    {
      "logisticAging": "2-5",
      "logisticPrice": 4.71,
      "logisticPriceCn": 30.54,
      "logisticName": "USPS+",
      "taxesFee": 0.50,
      "clearanceOperationFee": 0.25,
      "totalPostageFee": 5.46
    }
  ]
}
```

### **Calcul de Fret Avancé**
```json
{
  "reqDTOS": [
    {
      "srcAreaCode": "CN",
      "destAreaCode": "US",
      "length": 0.3,
      "width": 0.4,
      "height": 0.5,
      "volume": 0.06,
      "totalGoodsAmount": 123.2,
      "productProp": ["COMMON"],
      "freightTrialSkuList": [
        {
          "skuQuantity": 1,
          "sku": "CJCF104237201AZ"
        }
      ],
      "skuList": ["CJCF104237201AZ"],
      "platforms": ["Shopify"],
      "wrapWeight": 100,
      "weight": 50
    }
  ]
}
```

### **Réponse Calcul Avancé**
```json
{
  "success": true,
  "freightTips": [
    {
      "arrivalTime": "12-50",
      "discountFee": 4.09,
      "discountFeeCNY": 25.30,
      "postage": 3.55,
      "postageCNY": 22.00,
      "option": {
        "enName": "CJPacket Postal",
        "cnName": "CJ航空挂号小包"
      },
      "channel": {
        "enName": "燕文航空挂号小包特货",
        "cnName": "促佳燕文航空挂号小包特货"
      },
      "ruleTips": [
        {
          "type": "phone",
          "msgEn": "Must be a 6-32 digit number",
          "expression": "^[\\s\\d\\-（）()+]{6,32}$"
        }
      ],
      "message": "Hi, CJ will not accept any disputes..."
    }
  ]
}
```

## 🚀 **Utilisation Pratique**

### **1. Calcul de Fret Simple**
```javascript
const freightParams = {
  startCountryCode: 'CN',
  endCountryCode: 'US',
  products: [
    {
      quantity: 2,
      vid: '439FC05B-1311-4349-87FA-1E1EF942C418'
    }
  ]
};

const result = await cjLogisticsService.calculateFreight(freightParams);
console.log('Options de fret:', result.freightOptions);
```

### **2. Calcul de Fret Avancé**
```javascript
const freightTipParams = {
  reqDTOS: [
    {
      srcAreaCode: 'CN',
      destAreaCode: 'US',
      length: 0.3,
      width: 0.4,
      height: 0.5,
      volume: 0.06,
      totalGoodsAmount: 123.2,
      productProp: ['COMMON'],
      freightTrialSkuList: [
        {
          skuQuantity: 1,
          sku: 'CJCF104237201AZ'
        }
      ],
      skuList: ['CJCF104237201AZ'],
      platforms: ['Shopify'],
      wrapWeight: 100,
      weight: 50
    }
  ]
};

const result = await cjLogisticsService.calculateFreightTip(freightTipParams);
console.log('Conseils de fret:', result.freightTips);
```

### **3. Suivi des Expéditions**
```javascript
const trackingResult = await cjLogisticsService.getTrackInfo(['CJPKL7160102171YQ']);
console.log('Informations de suivi:', trackingResult.trackingInfo);
```

## 🔍 **Optimisation des Coûts**

### **Analyse des Options**
```javascript
// Trouver l'option la moins chère
const cheapest = options.reduce((min, option) => 
  parseFloat(option.logisticPrice) < parseFloat(min.logisticPrice) ? option : min
);

// Trouver l'option la plus rapide
const fastest = options.reduce((min, option) => {
  const minDays = parseInt(option.logisticAging.split('-')[0]);
  const currentDays = parseInt(min.logisticAging.split('-')[0]);
  return minDays < currentDays ? option : min;
});

// Calculer le prix moyen
const avgPrice = options.reduce((sum, option) => 
  sum + parseFloat(option.logisticPrice), 0) / options.length;
```

### **Recommandations Intelligentes**
```javascript
function getBestOption(options, criteria) {
  switch (criteria) {
    case 'cheapest':
      return options.reduce((min, option) => 
        parseFloat(option.logisticPrice) < parseFloat(min.logisticPrice) ? option : min
      );
    
    case 'fastest':
      return options.reduce((min, option) => {
        const minDays = parseInt(option.logisticAging.split('-')[0]);
        const currentDays = parseInt(min.logisticAging.split('-')[0]);
        return minDays < currentDays ? option : min;
      });
    
    case 'balanced':
      return options.find(option => {
        const price = parseFloat(option.logisticPrice);
        const days = parseInt(option.logisticAging.split('-')[0]);
        return price < 10 && days < 15; // Critères équilibrés
      });
  }
}
```

## 📈 **Analytics et Reporting**

### **Statistiques de Fret**
```javascript
function analyzeFreightOptions(options) {
  const stats = {
    total: options.length,
    avgPrice: 0,
    priceRange: { min: 0, max: 0 },
    byCarrier: {},
    byDeliveryTime: {}
  };
  
  // Prix moyen
  stats.avgPrice = options.reduce((sum, option) => 
    sum + parseFloat(option.logisticPrice), 0) / options.length;
  
  // Fourchette de prix
  const prices = options.map(o => parseFloat(o.logisticPrice));
  stats.priceRange.min = Math.min(...prices);
  stats.priceRange.max = Math.max(...prices);
  
  // Par transporteur
  options.forEach(option => {
    const carrier = option.logisticName.split(' ')[0];
    if (!stats.byCarrier[carrier]) {
      stats.byCarrier[carrier] = 0;
    }
    stats.byCarrier[carrier]++;
  });
  
  return stats;
}
```

### **Suivi des Performances**
```javascript
function trackShippingPerformance(trackingInfo) {
  const performance = {
    totalShipments: trackingInfo.length,
    delivered: 0,
    inTransit: 0,
    delayed: 0,
    avgDeliveryTime: 0
  };
  
  trackingInfo.forEach(tracking => {
    if (tracking.trackingStatus === 'Delivered') {
      performance.delivered++;
    } else if (tracking.trackingStatus === 'In transit') {
      performance.inTransit++;
    }
    
    if (tracking.deliveryDay) {
      performance.avgDeliveryTime += parseInt(tracking.deliveryDay);
    }
  });
  
  performance.avgDeliveryTime /= performance.totalShipments;
  
  return performance;
}
```

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

### **Test des Logistiques Avancées**
```bash
cd server
node test-cj-logistics-advanced.js
```

### **Calcul de Fret Complet**
```javascript
async function calculateCompleteFreight(orderData) {
  // 1. Calculer le fret standard
  const standardFreight = await cjLogisticsService.calculateFreight({
    startCountryCode: orderData.fromCountry,
    endCountryCode: orderData.toCountry,
    products: orderData.products
  });
  
  // 2. Calculer le fret avancé pour plus de détails
  const advancedFreight = await cjLogisticsService.calculateFreightTip({
    reqDTOS: [{
      srcAreaCode: orderData.fromCountry,
      destAreaCode: orderData.toCountry,
      length: orderData.dimensions.length,
      width: orderData.dimensions.width,
      height: orderData.dimensions.height,
      volume: orderData.dimensions.volume,
      totalGoodsAmount: orderData.totalAmount,
      productProp: orderData.productProperties,
      freightTrialSkuList: orderData.products.map(p => ({
        skuQuantity: p.quantity,
        sku: p.sku
      })),
      skuList: orderData.products.map(p => p.sku),
      platforms: ['Shopify'],
      wrapWeight: orderData.wrapWeight,
      weight: orderData.totalWeight
    }]
  });
  
  // 3. Analyser et recommander
  const recommendation = analyzeAndRecommend(standardFreight, advancedFreight);
  
  return {
    standard: standardFreight,
    advanced: advancedFreight,
    recommendation: recommendation
  };
}
```

## 🎯 **Bonnes Pratiques**

1. **Utiliser le calcul avancé** pour des recommandations précises
2. **Analyser les règles** pour éviter les erreurs de validation
3. **Surveiller les performances** de livraison
4. **Optimiser les coûts** en comparant les options
5. **Gérer les exceptions** (produits sensibles, pays spéciaux)
6. **Mettre en cache** les résultats pour améliorer les performances
7. **Surveiller les changements** de tarifs et de délais

## 🔗 **Liens Utiles**

- [Documentation CJ Dropshipping](https://developers.cjdropshipping.com/)
- [Guide des Logistiques](https://developers.cjdropshipping.com/en/api/api2/api/logistic.html)
- [Codes d'Erreur](https://developers.cjdropshipping.com/en/api/api2/api/error.html)

---

**Note**: Ce guide est basé sur la documentation officielle CJ Dropshipping et peut être mis à jour selon les évolutions de l'API.
