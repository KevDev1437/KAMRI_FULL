import axios from 'axios';

/**
 * Script de test pour vérifier que l'endpoint webhook répond correctement
 * aux exigences de CJ Dropshipping
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://pinacoidal-pat-unlasting.ngrok-free.dev/api/cj-dropshipping/webhooks';

async function testWebhookEndpoint() {
  console.log('🧪 Test de l\'endpoint webhook CJ Dropshipping\n');
  console.log(`📍 URL: ${WEBHOOK_URL}\n`);

  // Test 1: Requête vide (test de connexion CJ)
  console.log('📋 Test 1: Requête vide (test de connexion)...');
  try {
    const startTime = Date.now();
    const response = await axios.post(WEBHOOK_URL, {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000 // 3 secondes max
    });
    const duration = Date.now() - startTime;

    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Temps de réponse: ${duration}ms`);
    console.log(`✅ Content-Type: ${response.headers['content-type']}`);
    console.log(`✅ Réponse:`, JSON.stringify(response.data, null, 2));

    if (duration > 3000) {
      console.error(`❌ ERREUR: Temps de réponse > 3 secondes (${duration}ms)`);
    } else {
      console.log(`✅ Temps de réponse OK (< 3s)\n`);
    }
  } catch (error: any) {
    console.error(`❌ Erreur:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 2: Webhook PRODUCT minimal
  console.log('\n📋 Test 2: Webhook PRODUCT minimal...');
  try {
    const startTime = Date.now();
    const webhookPayload = {
      messageId: 'test-' + Date.now(),
      type: 'PRODUCT',
      params: {
        pid: '1234567890',
        fields: ['productName'],
        productName: 'Test Product',
        productSellPrice: '10.00'
      }
    };

    const response = await axios.post(WEBHOOK_URL, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });
    const duration = Date.now() - startTime;

    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Temps de réponse: ${duration}ms`);
    console.log(`✅ Content-Type: ${response.headers['content-type']}`);
    console.log(`✅ Réponse:`, JSON.stringify(response.data, null, 2));

    if (duration > 3000) {
      console.error(`❌ ERREUR: Temps de réponse > 3 secondes (${duration}ms)`);
    } else {
      console.log(`✅ Temps de réponse OK (< 3s)\n`);
    }
  } catch (error: any) {
    console.error(`❌ Erreur:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n✨ Tests terminés');
}

testWebhookEndpoint();

