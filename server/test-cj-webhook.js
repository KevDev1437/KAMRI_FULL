const axios = require('axios');

// Test des webhooks CJ
const BASE_URL = 'http://localhost:3001';

// Payload de test pour un webhook produit
const testProductWebhook = {
  messageId: "test-product-123",
  type: "PRODUCT",
  params: {
    categoryId: "123",
    categoryName: "Electronics",
    pid: "1424608189734850560",
    productDescription: "Test product description",
    productImage: "https://example.com/image.jpg",
    productName: "Test Product",
    productNameEn: "Test Product EN",
    productProperty1: "Color",
    productProperty2: "Size",
    productProperty3: "Material",
    productSellPrice: 29.99,
    productSku: "TEST-SKU-001",
    productStatus: 3, // On Sale
    fields: ["productDescription", "productSellPrice"]
  }
};

// Payload de test pour un webhook stock
const testStockWebhook = {
  messageId: "test-stock-123",
  type: "STOCK",
  params: {
    "1424608152007086080": [
      {
        vid: "1424608152007086080",
        areaId: "2",
        areaEn: "US Warehouse",
        countryCode: "US",
        storageNum: 150
      }
    ]
  }
};

// Payload de test pour un webhook commande
const testOrderWebhook = {
  messageId: "test-order-123",
  type: "ORDER",
  params: {
    orderNumber: "TEST_ORDER_001",
    cjOrderId: 210823100016290555,
    orderStatus: "CREATED",
    logisticName: "CJPacket Ordinary",
    trackNumber: null,
    createDate: "2021-08-23 11:31:45",
    updateDate: "2021-08-23 11:31:45",
    payDate: null,
    deliveryDate: null,
    completeDate: null
  }
};

async function testWebhook(endpoint, payload, description) {
  try {
    console.log(`\n🧪 Test: ${description}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/cj-dropshipping/webhooks/${endpoint}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log(`✅ Succès:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Erreur:`, error.response?.data || error.message);
    return false;
  }
}

async function runWebhookTests() {
  console.log('🚀 Test des Webhooks CJ Dropshipping');
  console.log('=====================================');
  
  // Test 1: Webhook Produit
  await testWebhook('product', testProductWebhook, 'Webhook Produit');
  
  // Test 2: Webhook Stock
  await testWebhook('stock', testStockWebhook, 'Webhook Stock');
  
  // Test 3: Webhook Commande
  await testWebhook('order', testOrderWebhook, 'Webhook Commande');
  
  console.log('\n🎯 Tests terminés !');
  console.log('Vérifiez les logs du serveur pour voir le traitement des webhooks.');
}

// Exécuter les tests
runWebhookTests().catch(console.error);
