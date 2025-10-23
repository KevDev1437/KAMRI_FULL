const axios = require('axios');

// Test des logistiques CJ
const BASE_URL = 'http://localhost:3001';

async function testLogistics() {
  console.log('🚚 Test des Logistiques CJ Dropshipping');
  console.log('======================================');
  
  // Test 1: Toutes les logistiques
  console.log('\n📦 Test 1: Toutes les logistiques');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics`);
    console.log(`✅ ${response.data.total} logistiques trouvées`);
    console.log(`📊 Premières logistiques:`, response.data.logistics.slice(0, 3).map(l => `${l.id}: ${l.englishName}`));
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 2: Logistiques par pays
  console.log('\n🌍 Test 2: Logistiques par pays');
  const countries = ['US', 'DE', 'FR', 'GB', 'CA'];
  
  for (const country of countries) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/country/${country}`);
      console.log(`✅ ${country}: ${response.data.total} logistiques disponibles`);
    } catch (error) {
      console.log(`❌ ${country}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 3: Logistiques express
  console.log('\n⚡ Test 3: Logistiques express');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/express`);
    console.log(`✅ ${response.data.total} logistiques express trouvées`);
    console.log(`📊 Logistiques express:`, response.data.logistics.slice(0, 5).map(l => `${l.id}: ${l.englishName} (${l.arrivalTime}j)`));
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 4: Logistiques sensibles
  console.log('\n🔋 Test 4: Logistiques sensibles');
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/sensitive`);
    console.log(`✅ ${response.data.total} logistiques sensibles trouvées`);
    console.log(`📊 Logistiques sensibles:`, response.data.logistics.slice(0, 3).map(l => `${l.id}: ${l.englishName}`));
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 5: Recherche de logistiques
  console.log('\n🔍 Test 5: Recherche de logistiques');
  const searchTerms = ['DHL', 'CJ', 'Express', 'Post'];
  
  for (const term of searchTerms) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/search?q=${term}`);
      console.log(`✅ "${term}": ${response.data.total} résultats`);
    } catch (error) {
      console.log(`❌ "${term}": ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 6: Logistiques recommandées
  console.log('\n🎯 Test 6: Logistiques recommandées');
  const testCountries = [
    { country: 'US', sensitive: false },
    { country: 'DE', sensitive: false },
    { country: 'FR', sensitive: true }
  ];
  
  for (const test of testCountries) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/recommended?country=${test.country}&sensitive=${test.sensitive}`);
      console.log(`✅ ${test.country} (sensible: ${test.sensitive}): ${response.data.total} recommandations`);
      if (response.data.logistics.length > 0) {
        const top = response.data.logistics[0];
        console.log(`   🥇 Meilleure: ${top.englishName} (${top.arrivalTime}j)`);
      }
    } catch (error) {
      console.log(`❌ ${test.country}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 7: Calcul de coût
  console.log('\n💰 Test 7: Calcul de coût de livraison');
  const costTests = [
    { logisticsId: 21, weight: 100, country: 'US' }, // DHL
    { logisticsId: 50, weight: 500, country: 'DE' }, // CJPacket
    { logisticsId: 53, weight: 200, country: 'FR' }  // DHL Official
  ];
  
  for (const test of costTests) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/calculate-cost?logisticsId=${test.logisticsId}&weight=${test.weight}&country=${test.country}`);
      const cost = response.data.cost;
      console.log(`✅ Logistique ${test.logisticsId} (${test.weight}g, ${test.country}): $${cost.cost} ${cost.currency} (${cost.estimatedDays}j)`);
    } catch (error) {
      console.log(`❌ Logistique ${test.logisticsId}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Test 8: Délai maximum
  console.log('\n⏰ Test 8: Logistiques par délai maximum');
  const maxDays = [7, 15, 30];
  
  for (const days of maxDays) {
    try {
      const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/delivery-time?maxDays=${days}`);
      console.log(`✅ Délai max ${days}j: ${response.data.total} logistiques`);
    } catch (error) {
      console.log(`❌ Délai ${days}j: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('\n🎯 Tests terminés !');
  console.log('Vérifiez les logs du serveur pour voir le traitement des logistiques.');
}

// Test de synchronisation
async function testSync() {
  console.log('\n🔄 Test de synchronisation');
  console.log('==========================');
  
  try {
    const response = await axios.get(`${BASE_URL}/cj-dropshipping/logistics/sync`);
    console.log(`✅ ${response.data.message}`);
  } catch (error) {
    console.log(`❌ Erreur synchronisation: ${error.response?.data?.message || error.message}`);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testLogistics();
  await testSync();
}

runAllTests().catch(console.error);
