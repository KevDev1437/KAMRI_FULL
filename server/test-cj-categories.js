const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCJCategories() {
  console.log('🧪 === TEST RÉCUPÉRATION CATÉGORIES CJ ===');
  
  try {
    // Test 1: Récupérer toutes les catégories
    console.log('\n📋 Test 1: Récupération de toutes les catégories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/api/cj-dropshipping/categories`);
    
    if (categoriesResponse.data.success) {
      console.log(`✅ ${categoriesResponse.data.total} catégories récupérées`);
      console.log('📊 Structure des catégories:');
      console.log(JSON.stringify(categoriesResponse.data.categories.slice(0, 2), null, 2));
    } else {
      console.log('❌ Échec de la récupération des catégories');
      console.log('📝 Message:', categoriesResponse.data.message);
    }

    // Test 2: Récupérer l'arbre des catégories
    console.log('\n🌳 Test 2: Récupération de l\'arbre des catégories...');
    const treeResponse = await axios.get(`${BASE_URL}/api/cj-dropshipping/categories/tree`);
    
    if (treeResponse.data.success) {
      console.log('✅ Arbre des catégories récupéré');
      console.log('📊 Structure de l\'arbre:');
      console.log(JSON.stringify(treeResponse.data.tree.slice(0, 1), null, 2));
    } else {
      console.log('❌ Échec de la récupération de l\'arbre');
      console.log('📝 Message:', treeResponse.data.message);
    }

    // Test 3: Test de récupération des catégories
    console.log('\n🧪 Test 3: Test de récupération des catégories...');
    const testResponse = await axios.post(`${BASE_URL}/api/cj-dropshipping/categories/test`);
    
    if (testResponse.data.success) {
      console.log('✅ Test de récupération réussi');
      console.log(`📊 ${testResponse.data.categories.length} catégories trouvées`);
      console.log('📝 Message:', testResponse.data.message);
    } else {
      console.log('❌ Test de récupération échoué');
      console.log('📝 Message:', testResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
  
  console.log('\n🏁 === FIN TEST CATÉGORIES CJ ===');
}

// Exécuter le test
testCJCategories().catch(console.error);