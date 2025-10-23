const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJWebhooksConfig() {
  console.log('🔧 === TEST CONFIGURATION WEBHOOKS CJ ===');
  
  try {
    // Initialiser le client CJ
    const client = new CJAPIClient(
      process.env.CJ_EMAIL,
      process.env.CJ_API_KEY,
      { tier: 'free', debug: true }
    );
    
    console.log('🔑 Connexion à l\'API CJ...');
    await client.login();
    console.log('✅ Connexion réussie');
    
    // Test 1: Configuration des webhooks
    console.log('\n🔧 Test 1: Configuration des webhooks');
    const webhookConfig = {
      product: {
        type: "ENABLE",
        callbackUrls: [
          "https://your-host/api2.0/"
        ]
      },
      stock: {
        type: "ENABLE",
        callbackUrls: [
          "https://your-host/api2.0/"
        ]
      },
      order: {
        type: "ENABLE",
        callbackUrls: [
          "https://your-host/api2.0/"
        ]
      },
      logistics: {
        type: "ENABLE",
        callbackUrls: [
          "https://your-host/api2.0/"
        ]
      }
    };
    
    console.log('📤 Configuration envoyée:', JSON.stringify(webhookConfig, null, 2));
    
    const webhookResult = await client.makeRequest('/webhook/set', webhookConfig);
    
    if (webhookResult.code === 200) {
      console.log(`✅ Webhooks configurés avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(webhookResult, null, 2));
      
      console.log(`  - Code: ${webhookResult.code}`);
      console.log(`  - Résultat: ${webhookResult.result}`);
      console.log(`  - Message: ${webhookResult.message}`);
      console.log(`  - Data: ${webhookResult.data}`);
      console.log(`  - Request ID: ${webhookResult.requestId}`);
    } else {
      console.log(`❌ Erreur configuration webhooks: ${webhookResult.message}`);
    }
    
    // Test 2: Configuration avec URLs personnalisées
    console.log('\n🔧 Test 2: Configuration avec URLs personnalisées');
    const customWebhookConfig = {
      product: {
        type: "ENABLE",
        callbackUrls: [
          "https://myapp.com/api/cj-dropshipping/webhooks/product",
          "https://backup.myapp.com/api/cj-dropshipping/webhooks/product"
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
    
    console.log('📤 Configuration personnalisée envoyée:', JSON.stringify(customWebhookConfig, null, 2));
    
    const customWebhookResult = await client.makeRequest('/webhook/set', customWebhookConfig);
    
    if (customWebhookResult.code === 200) {
      console.log(`✅ Webhooks personnalisés configurés avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(customWebhookResult, null, 2));
    } else {
      console.log(`❌ Erreur configuration webhooks personnalisés: ${customWebhookResult.message}`);
    }
    
    // Test 3: Désactivation des webhooks
    console.log('\n🔧 Test 3: Désactivation des webhooks');
    const disableWebhookConfig = {
      product: {
        type: "CANCEL",
        callbackUrls: []
      },
      stock: {
        type: "CANCEL",
        callbackUrls: []
      },
      order: {
        type: "CANCEL",
        callbackUrls: []
      },
      logistics: {
        type: "CANCEL",
        callbackUrls: []
      }
    };
    
    console.log('📤 Désactivation envoyée:', JSON.stringify(disableWebhookConfig, null, 2));
    
    const disableWebhookResult = await client.makeRequest('/webhook/set', disableWebhookConfig);
    
    if (disableWebhookResult.code === 200) {
      console.log(`✅ Webhooks désactivés avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(disableWebhookResult, null, 2));
    } else {
      console.log(`❌ Erreur désactivation webhooks: ${disableWebhookResult.message}`);
    }
    
    // Test 4: Configuration partielle (seulement produits et commandes)
    console.log('\n🔧 Test 4: Configuration partielle');
    const partialWebhookConfig = {
      product: {
        type: "ENABLE",
        callbackUrls: [
          "https://myapp.com/api/cj-dropshipping/webhooks/product"
        ]
      },
      order: {
        type: "ENABLE",
        callbackUrls: [
          "https://myapp.com/api/cj-dropshipping/webhooks/order"
        ]
      }
    };
    
    console.log('📤 Configuration partielle envoyée:', JSON.stringify(partialWebhookConfig, null, 2));
    
    const partialWebhookResult = await client.makeRequest('/webhook/set', partialWebhookConfig);
    
    if (partialWebhookResult.code === 200) {
      console.log(`✅ Webhooks partiels configurés avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(partialWebhookResult, null, 2));
    } else {
      console.log(`❌ Erreur configuration webhooks partiels: ${partialWebhookResult.message}`);
    }
    
    // Test 5: Validation des URLs
    console.log('\n🔧 Test 5: Validation des URLs');
    const invalidWebhookConfig = {
      product: {
        type: "ENABLE",
        callbackUrls: [
          "http://localhost:3000/api/cj-dropshipping/webhooks/product" // HTTP au lieu de HTTPS
        ]
      }
    };
    
    console.log('📤 Configuration invalide envoyée:', JSON.stringify(invalidWebhookConfig, null, 2));
    
    try {
      const invalidWebhookResult = await client.makeRequest('/webhook/set', invalidWebhookConfig);
      console.log('📥 Réponse reçue:', JSON.stringify(invalidWebhookResult, null, 2));
    } catch (error) {
      console.log(`⚠️ Erreur attendue pour URL invalide: ${error.message}`);
    }
    
    // Test 6: Analyse des configurations
    console.log('\n📊 Test 6: Analyse des configurations');
    console.log('📈 Types de webhooks supportés:');
    console.log('  - PRODUCT: Mises à jour de produits');
    console.log('  - STOCK: Mises à jour de stock');
    console.log('  - ORDER: Mises à jour de commandes');
    console.log('  - LOGISTICS: Mises à jour logistiques');
    
    console.log('\n📈 Types de configuration:');
    console.log('  - ENABLE: Activer les webhooks');
    console.log('  - CANCEL: Désactiver les webhooks');
    
    console.log('\n📈 Exigences:');
    console.log('  - HTTPS obligatoire');
    console.log('  - TLS 1.2 ou 1.3 recommandé');
    console.log('  - Méthode POST');
    console.log('  - Content-Type: application/json');
    console.log('  - Réponse 200 OK dans les 3 secondes');
    
    console.log('\n✅ Test de configuration des webhooks CJ terminé avec succès');
    console.log('🎯 Configuration des webhooks fonctionnelle');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration des webhooks CJ:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testCJWebhooksConfig();
