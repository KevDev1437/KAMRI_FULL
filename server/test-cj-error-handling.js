const axios = require('axios');

// Test complet de la gestion d'erreurs CJ
const BASE_URL = 'http://localhost:3001';

// Codes d'erreur CJ à tester
const errorCodes = {
  1600200: 'Too much request (Rate limit)',
  1600201: 'Quota has been used up',
  1600001: 'Invalid API key or access token',
  1600003: 'Invalid Refresh token',
  1600300: 'Param error',
  1600101: 'Interface not found'
};

async function testErrorHandling() {
  console.log('🧪 Test de la Gestion d\'Erreurs CJ');
  console.log('===================================');
  
  // Test 1: Rate limit (1600200)
  console.log('\n🔴 Test 1: Rate Limit (1600200)');
  try {
    const promises = [];
    // Lancer 20 requêtes simultanées pour déclencher le rate limit
    for (let i = 0; i < 20; i++) {
      promises.push(
        axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
          keyword: 'test',
          pageSize: 1
        }).catch(error => ({
          error: true,
          code: error.response?.data?.code,
          message: error.response?.data?.message
        }))
      );
    }
    
    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.error && (r.code === 1600200 || r.code === 429));
    
    console.log(`📊 Requêtes lancées: ${results.length}`);
    console.log(`🚫 Rate limited: ${rateLimited.length}`);
    
    if (rateLimited.length > 0) {
      console.log('✅ Rate limiting détecté et géré');
    } else {
      console.log('⚠️ Aucun rate limiting détecté');
    }
    
  } catch (error) {
    console.log(`❌ Erreur test rate limit: ${error.message}`);
  }
  
  // Test 2: Paramètres invalides (1600300)
  console.log('\n🔴 Test 2: Paramètres Invalides (1600300)');
  try {
    const response = await axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
      keyword: '', // Mot-clé vide
      pageSize: -1, // PageSize invalide
      invalidParam: 'test' // Paramètre inexistant
    });
    
    console.log('✅ Paramètres invalides acceptés (inattendu)');
  } catch (error) {
    const errorCode = error.response?.data?.code;
    console.log(`📊 Code d'erreur: ${errorCode}`);
    console.log(`📝 Message: ${error.response?.data?.message}`);
    
    if (errorCode === 1600300) {
      console.log('✅ Erreur de paramètres correctement gérée');
    } else {
      console.log('⚠️ Code d\'erreur inattendu');
    }
  }
  
  // Test 3: Interface non trouvée (1600101)
  console.log('\n🔴 Test 3: Interface Non Trouvée (1600101)');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/invalid-endpoint`);
    console.log('✅ Interface invalide acceptée (inattendu)');
  } catch (error) {
    const errorCode = error.response?.data?.code;
    console.log(`📊 Code d'erreur: ${errorCode}`);
    console.log(`📝 Message: ${error.response?.data?.message}`);
    
    if (errorCode === 1600101 || error.response?.status === 404) {
      console.log('✅ Interface non trouvée correctement gérée');
    } else {
      console.log('⚠️ Gestion d\'erreur inattendue');
    }
  }
  
  // Test 4: Authentification (1600001)
  console.log('\n🔴 Test 4: Authentification (1600001)');
  try {
    // Test avec des credentials invalides
    const response = await axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
      keyword: 'test',
      pageSize: 1
    }, {
      headers: {
        'CJ-Access-Token': 'invalid-token'
      }
    });
    
    console.log('✅ Token invalide accepté (inattendu)');
  } catch (error) {
    const errorCode = error.response?.data?.code;
    console.log(`📊 Code d'erreur: ${errorCode}`);
    console.log(`📝 Message: ${error.response?.data?.message}`);
    
    if (errorCode === 1600001 || error.response?.status === 401) {
      console.log('✅ Erreur d\'authentification correctement gérée');
    } else {
      console.log('⚠️ Gestion d\'authentification inattendue');
    }
  }
  
  console.log('\n🎯 Tests terminés !');
  console.log('Vérifiez les logs du serveur pour voir la gestion des erreurs.');
}

// Test de récupération après erreurs
async function testRecovery() {
  console.log('\n🔄 Test de Récupération');
  console.log('======================');
  
  try {
    // Test normal après les erreurs
    const response = await axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
      keyword: 'phone',
      pageSize: 5
    });
    
    console.log(`✅ Récupération réussie: ${response.data.total} produits trouvés`);
  } catch (error) {
    console.log(`❌ Erreur de récupération: ${error.message}`);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testErrorHandling();
  await testRecovery();
}

runAllTests().catch(console.error);
