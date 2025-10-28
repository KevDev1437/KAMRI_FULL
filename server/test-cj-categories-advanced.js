const axios = require('axios');

// Configuration de base
const BASE_URL = 'http://localhost:3001/api/cj-dropshipping';

// Fonction utilitaire pour faire des requêtes
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Succès (${response.status}):`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log(`❌ Erreur (${error.response?.status || 'Network'}):`);
    console.log(error.response?.data || error.message);
    return null;
  }
}

// Tests des nouveaux endpoints de catégories
async function testCategoryEndpoints() {
  console.log('🚀 Test des endpoints de catégories avancés CJ Dropshipping');
  console.log('=' .repeat(60));

  // 1. Test de recherche de catégories
  console.log('\n📋 Test 1: Recherche de catégories');
  await makeRequest('/categories/search?keyword=electronics&page=1&pageSize=5');
  
  // 2. Test de recherche avec niveau spécifique
  console.log('\n📋 Test 2: Recherche par niveau');
  await makeRequest('/categories/search?level=1&pageSize=10');
  
  // 3. Test des catégories populaires
  console.log('\n⭐ Test 3: Catégories populaires');
  await makeRequest('/categories/popular?limit=8');
  
  // 4. Test des catégories populaires sans limite
  console.log('\n⭐ Test 4: Toutes les catégories populaires');
  await makeRequest('/categories/popular');
  
  // 5. Test des sous-catégories (avec un ID parent probable)
  console.log('\n🌳 Test 5: Sous-catégories');
  // Note: Vous devrez remplacer cet ID par un vrai parent ID de votre système
  await makeRequest('/categories/1/subcategories');
  
  // 6. Test du chemin de catégorie
  console.log('\n🗺️ Test 6: Chemin de catégorie');
  // Note: Vous devrez remplacer cet ID par un vrai category ID de votre système
  await makeRequest('/categories/1/path');
  
  // 7. Test avec des paramètres de recherche complexes
  console.log('\n🔍 Test 7: Recherche complexe');
  await makeRequest('/categories/search?keyword=phone&level=2&language=en&page=1&pageSize=3');
  
  // 8. Test des catégories de niveau 1 (catégories principales)
  console.log('\n🏠 Test 8: Catégories principales (niveau 1)');
  await makeRequest('/categories/search?level=1');
  
  // 9. Test avec une recherche vide (devrait retourner toutes les catégories)
  console.log('\n📂 Test 9: Toutes les catégories (recherche vide)');
  await makeRequest('/categories/search?pageSize=5');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✨ Tests des endpoints de catégories terminés');
}

// Tests des endpoints de cache
async function testCacheEndpoints() {
  console.log('\n💾 Test des endpoints de cache');
  console.log('=' .repeat(40));
  
  // Test des statistiques de cache
  console.log('\n📊 Test: Statistiques de cache');
  await makeRequest('/cache/stats');
  
  // Test du nettoyage du cache
  console.log('\n🧹 Test: Nettoyage du cache expiré');
  await makeRequest('/cache/clean', 'DELETE');
  
  console.log('\n' + '=' .repeat(40));
  console.log('💾 Tests du cache terminés');
}

// Fonction principale
async function runAllTests() {
  console.log('🎯 Démarrage des tests complets');
  console.log('🕐 ' + new Date().toLocaleString());
  
  try {
    // Test de connexion de base
    console.log('\n🔗 Test de connexion de base');
    const status = await makeRequest('/status');
    
    if (!status) {
      console.log('❌ Le serveur CJ n\'est pas accessible. Vérifiez que le serveur backend est démarré.');
      return;
    }
    
    // Tests des catégories
    await testCategoryEndpoints();
    
    // Tests du cache
    await testCacheEndpoints();
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message);
  }
  
  console.log('\n🏁 Tous les tests terminés');
  console.log('🕐 ' + new Date().toLocaleString());
}

// Fonction pour tester un endpoint spécifique
async function testSpecificEndpoint() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-cj-categories-advanced.js [endpoint]');
    console.log('Exemple: node test-cj-categories-advanced.js /categories/search?keyword=phone');
    return;
  }
  
  const endpoint = args[0];
  await makeRequest(endpoint);
}

// Exécution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    testSpecificEndpoint();
  } else {
    runAllTests();
  }
}

module.exports = {
  makeRequest,
  testCategoryEndpoints,
  testCacheEndpoints,
  runAllTests
};