const axios = require('axios');

// Test des rate limits CJ avec différents niveaux
const BASE_URL = 'http://localhost:3001';

async function testRateLimits() {
  console.log('🚀 Test des Rate Limits CJ Dropshipping');
  console.log('========================================');
  
  const testCases = [
    { tier: 'free', expectedDelay: 1200, description: 'Free (1 req/s)' },
    { tier: 'plus', expectedDelay: 600, description: 'Plus (2 req/s)' },
    { tier: 'prime', expectedDelay: 300, description: 'Prime (4 req/s)' },
    { tier: 'advanced', expectedDelay: 200, description: 'Advanced (6 req/s)' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Test niveau: ${testCase.description}`);
    console.log(`⏳ Délai attendu: ${testCase.expectedDelay}ms`);
    
    try {
      const startTime = Date.now();
      
      // Test de recherche avec le niveau spécifié
      const response = await axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
        keyword: 'phone',
        pageSize: 5,
        tier: testCase.tier
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      const endTime = Date.now();
      const actualDelay = endTime - startTime;
      
      console.log(`✅ Succès: ${response.data.total} produits trouvés`);
      console.log(`⏱️ Délai réel: ${actualDelay}ms`);
      console.log(`📊 Écart: ${Math.abs(actualDelay - testCase.expectedDelay)}ms`);
      
      if (Math.abs(actualDelay - testCase.expectedDelay) < 500) {
        console.log(`✅ Délai optimal pour ${testCase.tier}`);
      } else {
        console.log(`⚠️ Délai non optimal pour ${testCase.tier}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 429) {
        console.log(`🚫 Rate limit atteint pour ${testCase.tier}`);
      }
    }
    
    // Pause entre les tests
    console.log('⏳ Pause de 5s entre les tests...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n🎯 Tests terminés !');
  console.log('Vérifiez les logs du serveur pour voir les délais appliqués.');
}

// Test de stress pour vérifier les rate limits
async function stressTest() {
  console.log('\n🔥 Test de stress - Rate Limits');
  console.log('===============================');
  
  const requests = [];
  const startTime = Date.now();
  
  // Lancer 10 requêtes simultanées
  for (let i = 0; i < 10; i++) {
    requests.push(
      axios.post(`${BASE_URL}/cj-dropshipping/products/search`, {
        keyword: 'test',
        pageSize: 1
      }).catch(error => ({
        error: true,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      }))
    );
  }
  
  try {
    const results = await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Durée totale: ${duration}ms`);
    console.log(`📊 Requêtes réussies: ${results.filter(r => !r.error).length}`);
    console.log(`❌ Requêtes échouées: ${results.filter(r => r.error).length}`);
    
    const rateLimited = results.filter(r => r.error && r.status === 429);
    console.log(`🚫 Rate limited: ${rateLimited.length}`);
    
    if (rateLimited.length > 0) {
      console.log('✅ Rate limiting fonctionne correctement');
    } else {
      console.log('⚠️ Aucun rate limiting détecté');
    }
    
  } catch (error) {
    console.log(`❌ Erreur test de stress: ${error.message}`);
  }
}

// Exécuter les tests
async function runAllTests() {
  await testRateLimits();
  await stressTest();
}

runAllTests().catch(console.error);
