const axios = require('axios');

async function testCJCategoriesURL() {
  console.log('🧪 === TEST URL COMPLÈTE CATÉGORIES CJ ===');
  
  try {
    // 1. Authentification
    console.log('🔑 Authentification...');
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'projectskevin834@gmail.com',
      apiKey: '158334f3282c4e3f9b077193903daeca',
    });
    
    const accessToken = authResponse.data.data.accessToken;
    console.log('✅ Token obtenu:', accessToken.substring(0, 20) + '...');
    
    // 2. Appel des catégories avec l'URL complète
    console.log('\n🏷️ Appel de l\'URL complète des catégories...');
    console.log('URL:', 'https://developers.cjdropshipping.com/api2.0/v1/product/getCategory');
    
    const categoriesResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/getCategory', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Réponse reçue');
    console.log('📊 Code:', categoriesResponse.data.code);
    console.log('📊 Message:', categoriesResponse.data.message);
    console.log('📊 Nombre de catégories:', categoriesResponse.data.data?.length || 0);
    
    if (categoriesResponse.data.data && categoriesResponse.data.data.length > 0) {
      console.log('\n📋 Premières catégories:');
      categoriesResponse.data.data.slice(0, 5).forEach((category, index) => {
        console.log(`${index + 1}. ${category.categoryFirstName || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testCJCategoriesURL();
