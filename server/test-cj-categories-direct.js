const axios = require('axios');

// Configuration CJ Dropshipping
const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

async function testCJCategories() {
  console.log('🧪 === TEST DIRECT API CJ DROPSHIPPING ===');
  
  try {
    // 1. Authentification
    console.log('🔑 Authentification avec CJ...');
    const authResponse = await axios.post(`${CJ_BASE_URL}/authentication/getAccessToken`, {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY,
    });
    
    console.log('✅ Authentification réussie');
    const accessToken = authResponse.data.data.accessToken;
    console.log('🔑 Token:', accessToken.substring(0, 20) + '...');
    
    // 2. Récupérer les catégories
    console.log('\n🏷️ Récupération des catégories CJ...');
    const categoriesResponse = await axios.get(`${CJ_BASE_URL}/product/getCategory`, {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Catégories récupérées');
    console.log('📊 Structure de la réponse:', {
      code: categoriesResponse.data.code,
      result: categoriesResponse.data.result,
      message: categoriesResponse.data.message,
      dataType: typeof categoriesResponse.data.data,
      dataLength: Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data.length : 'N/A'
    });
    
    if (categoriesResponse.data.code === 200 && Array.isArray(categoriesResponse.data.data)) {
      const categories = categoriesResponse.data.data;
      console.log(`\n🎉 ${categories.length} catégories CJ récupérées !`);
      
      // Afficher les premières catégories
      console.log('\n📋 Premières catégories:');
      categories.slice(0, 5).forEach((category, index) => {
        console.log(`${index + 1}. ${category.categoryFirstName || 'N/A'}`);
        if (category.categoryFirstList && category.categoryFirstList.length > 0) {
          console.log(`   Sous-catégories: ${category.categoryFirstList.slice(0, 3).map(sub => sub.categorySecondName).join(', ')}...`);
        }
      });
      
      return categories;
    } else {
      console.log('❌ Erreur dans la réponse API:', categoriesResponse.data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    return null;
  }
}

// Exécuter le test
testCJCategories().then(categories => {
  if (categories) {
    console.log('\n✅ Test réussi ! Les catégories CJ sont accessibles.');
  } else {
    console.log('\n❌ Test échoué ! Problème avec l\'API CJ.');
  }
  process.exit(0);
});
