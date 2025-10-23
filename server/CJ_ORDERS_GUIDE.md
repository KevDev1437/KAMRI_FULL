# 🛒 Guide des Commandes CJ Dropshipping

## 🎯 **Vue d'ensemble**

Ce guide explique comment utiliser l'API des commandes CJ Dropshipping pour gérer les commandes, les paiements et le suivi des expéditions.

## 🔧 **Endpoints Disponibles**

### **1. Création de Commandes**
```http
POST /cj-dropshipping/orders/create-v2
POST /cj-dropshipping/orders/create-v3
```
Crée une nouvelle commande (V2 ou V3).

### **2. Gestion du Panier**
```http
POST /cj-dropshipping/orders/add-cart
POST /cj-dropshipping/orders/confirm-cart
POST /cj-dropshipping/orders/save-parent-order
```
Gère le panier et les commandes groupées.

### **3. Liste et Détails**
```http
GET /cj-dropshipping/orders/list
GET /cj-dropshipping/orders/details/:orderId
```
Récupère la liste des commandes et les détails.

### **4. Gestion des Commandes**
```http
DELETE /cj-dropshipping/orders/:orderId
PATCH /cj-dropshipping/orders/:orderId/confirm
```
Supprime ou confirme une commande.

### **5. Paiements**
```http
GET /cj-dropshipping/orders/balance
POST /cj-dropshipping/orders/pay-balance
POST /cj-dropshipping/orders/pay-balance-v2
```
Gère les paiements avec le solde du compte.

### **6. Suivi et Analytics**
```http
GET /cj-dropshipping/orders/status/:orderId
GET /cj-dropshipping/orders/tracking/:orderId
GET /cj-dropshipping/orders/analytics/summary
```
Suivi des commandes et analytics.

## 📊 **Structure des Données**

### **Création de Commande**
```json
{
  "orderNumber": "ORDER-123",
  "shippingCountry": "United States",
  "shippingCountryCode": "US",
  "shippingProvince": "California",
  "shippingCity": "Los Angeles",
  "shippingCustomerName": "John Doe",
  "shippingAddress": "123 Main St",
  "shippingPhone": "+1234567890",
  "logisticName": "DHL",
  "fromCountryCode": "CN",
  "products": [
    {
      "vid": "92511400-C758-4474-93CA-66D442F5F787",
      "quantity": 1,
      "storeLineItemId": "line-item-123"
    }
  ]
}
```

### **Réponse de Commande**
```json
{
  "success": true,
  "orderId": "210823100016290555",
  "message": "Commande créée avec succès",
  "data": {
    "orderId": "210823100016290555",
    "orderNumber": "ORDER-123",
    "orderStatus": "CREATED",
    "orderAmount": 25.99,
    "productAmount": 20.99,
    "postageAmount": 5.00,
    "logisticName": "DHL",
    "createDate": "2024-01-15 10:30:00"
  }
}
```

### **Statuts des Commandes**
| Statut | Description |
|--------|-------------|
| `CREATED` | Commande créée, en attente de confirmation |
| `IN_CART` | Dans le panier, en attente de confirmation |
| `UNPAID` | Commande confirmée, en attente de paiement |
| `UNSHIPPED` | Payée, en attente d'expédition |
| `SHIPPED` | Expédiée, en transit |
| `DELIVERED` | Livrée |
| `CANCELLED` | Annulée |

## 🚀 **Utilisation Pratique**

### **1. Créer une Commande**
```javascript
const orderData = {
  orderNumber: 'ORDER-123',
  shippingCountry: 'United States',
  shippingCountryCode: 'US',
  shippingProvince: 'California',
  shippingCity: 'Los Angeles',
  shippingCustomerName: 'John Doe',
  shippingAddress: '123 Main St',
  shippingPhone: '+1234567890',
  logisticName: 'DHL',
  fromCountryCode: 'CN',
  products: [
    {
      vid: '92511400-C758-4474-93CA-66D442F5F787',
      quantity: 1,
      storeLineItemId: 'line-item-123'
    }
  ]
};

const result = await cjOrdersService.createOrderV2(orderData);
console.log('Commande créée:', result.orderId);
```

### **2. Récupérer les Commandes**
```javascript
const orders = await cjOrdersService.getOrders({
  pageNum: 1,
  pageSize: 20,
  status: 'SHIPPED'
});
console.log(`${orders.total} commandes trouvées`);
```

### **3. Suivre une Commande**
```javascript
const tracking = await cjOrdersService.getOrderDetails(orderId, ['LOGISTICS_TIMELINESS']);
console.log('Numéro de suivi:', tracking.order.trackNumber);
console.log('URL de suivi:', tracking.order.trackingUrl);
```

### **4. Payer avec le Solde**
```javascript
// Vérifier le solde
const balance = await cjOrdersService.getBalance();
console.log('Solde disponible:', balance.balance.amount);

// Payer la commande
await cjOrdersService.payWithBalance(orderId);
```

## 🔍 **Gestion des Erreurs**

### **Erreurs Courantes**
| Code | Description | Solution |
|------|-------------|----------|
| 1603000 | Échec création commande | Vérifier les paramètres |
| 1603001 | Échec confirmation commande | Vérifier le statut |
| 1603002 | Échec suppression commande | Vérifier les permissions |
| 1603003 | Commande existe déjà | Utiliser un numéro unique |
| 1604000 | Solde insuffisant | Recharger le compte |
| 1604001 | Paiement restreint | Contacter le support |

### **Validation des Données**
1. **Numéro de commande unique** - Éviter les doublons
2. **Adresse complète** - Tous les champs requis
3. **Produits valides** - VID ou SKU corrects
4. **Logistique disponible** - Vérifier la disponibilité
5. **Pays supporté** - Utiliser les codes ISO

## 📈 **Optimisation des Performances**

### **Bonnes Pratiques**
1. **Utiliser la pagination** pour les grandes listes
2. **Mettre en cache** les détails des commandes
3. **Surveiller les quotas** pour éviter les blocages
4. **Gérer les erreurs** gracieusement
5. **Utiliser les webhooks** pour les mises à jour temps réel

### **Limites d'API**
- **Requêtes par seconde**: Selon le niveau du compte
- **Taille des pages**: Maximum 200 commandes
- **Fréquence des requêtes**: Respecter les délais
- **Données de commande**: Limite de 500 caractères pour les remarques

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

### **Test des Commandes**
```bash
cd server
node test-cj-orders.js
```

### **Création de Commande Complète**
```javascript
// 1. Créer la commande
const order = await cjOrdersService.createOrderV2({
  orderNumber: `ORDER-${Date.now()}`,
  shippingCountry: 'France',
  shippingCountryCode: 'FR',
  shippingProvince: 'Île-de-France',
  shippingCity: 'Paris',
  shippingCustomerName: 'Jean Dupont',
  shippingAddress: '123 Rue de la Paix',
  shippingPhone: '+33123456789',
  logisticName: 'DHL',
  fromCountryCode: 'CN',
  products: [
    {
      vid: '92511400-C758-4474-93CA-66D442F5F787',
      quantity: 2,
      storeLineItemId: 'line-item-123'
    }
  ]
});

// 2. Confirmer la commande
await cjOrdersService.confirmOrder(order.orderId);

// 3. Payer avec le solde
await cjOrdersService.payWithBalance(order.orderId);
```

### **Suivi des Commandes**
```javascript
// Récupérer les commandes en transit
const orders = await cjOrdersService.getOrders({
  status: 'SHIPPED',
  pageSize: 50
});

// Suivre chaque commande
for (const order of orders.orders) {
  const tracking = await cjOrdersService.getOrderDetails(order.orderId);
  console.log(`${order.orderNumber}: ${tracking.order.trackNumber}`);
}
```

## 🎯 **Bonnes Pratiques**

1. **Valider les données** avant création
2. **Gérer les erreurs** de manière appropriée
3. **Surveiller les statuts** des commandes
4. **Utiliser les webhooks** pour les mises à jour
5. **Maintenir un solde** suffisant
6. **Documenter les commandes** avec des remarques
7. **Surveiller les performances** de l'API

## 🔗 **Liens Utiles**

- [Documentation CJ Dropshipping](https://developers.cjdropshipping.com/)
- [Guide des Commandes](https://developers.cjdropshipping.com/en/api/api2/api/shopping.html)
- [Codes d'Erreur](https://developers.cjdropshipping.com/en/api/api2/api/error.html)

---

**Note**: Ce guide est basé sur la documentation officielle CJ Dropshipping et peut être mis à jour selon les évolutions de l'API.
