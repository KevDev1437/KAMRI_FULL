// Script de test pour les webhooks CJ
const axios = require('axios');

const baseUrl = 'http://localhost:3001';

// Test webhook PRODUCT
async function testProductWebhook() {
  console.log('🧪 Test webhook PRODUCT...');
  
  const payload = {
    "messageId": "ca72a4834cd14b9588e88ce206f614a0",
    "type": "PRODUCT",
    "params": {
      "categoryId": null,
      "categoryName": null,
      "pid": "1424608189734850560",
      "productDescription": "Test product description updated via webhook",
      "productImage": null,
      "productName": "Test Product Webhook",
      "productNameEn": "Test Product Webhook EN",
      "productProperty1": null,
      "productProperty2": null,
      "productProperty3": null,
      "productSellPrice": 29.99,
      "productSku": "TEST-WEBHOOK-001",
      "productStatus": "available",
      "fields": [
        "productDescription",
        "productName",
        "productSellPrice"
      ]
    }
  };

  try {
    const response = await axios.post(`${baseUrl}/api/cj-dropshipping/webhooks`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Réponse webhook PRODUCT:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur webhook PRODUCT:', error.response?.data || error.message);
    return null;
  }
}

// Test webhook VARIANT
async function testVariantWebhook() {
  console.log('🧪 Test webhook VARIANT...');
  
  const payload = {
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "VARIANT",
    "params": {
      "vid": "1424608152007086080",
      "variantName": "Test Variant",
      "variantWeight": 0.5,
      "variantLength": 15,
      "variantWidth": 10,
      "variantHeight": 5,
      "variantImage": null,
      "variantSku": "TEST-VAR-001",
      "variantKey": "color-size",
      "variantSellPrice": 25.99,
      "variantStatus": "available",
      "variantValue1": "Red",
      "variantValue2": "Medium",
      "variantValue3": null,
      "fields": [
        "variantLength",
        "variantWeight",
        "variantSellPrice"
      ]
    }
  };

  try {
    const response = await axios.post(`${baseUrl}/api/cj-dropshipping/webhooks`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Réponse webhook VARIANT:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur webhook VARIANT:', error.response?.data || error.message);
    return null;
  }
}

// Test des statistiques de doublons
async function testDuplicateStats() {
  console.log('🧪 Test statistiques doublons...');
  
  try {
    const response = await axios.get(`${baseUrl}/api/products/duplicate-stats`);
    console.log('✅ Statistiques doublons:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur statistiques:', error.response?.data || error.message);
    return null;
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 === TESTS WEBHOOKS CJ DROPSHIPPING ===\n');
  
  // Test 1: Webhook PRODUCT
  await testProductWebhook();
  console.log('');
  
  // Test 2: Webhook VARIANT (nécessite un produit parent)
  await testVariantWebhook();
  console.log('');
  
  // Test 3: Statistiques
  await testDuplicateStats();
  console.log('');
  
  console.log('✨ Tests terminés !');
}

// Exécuter les tests
runTests().catch(console.error);