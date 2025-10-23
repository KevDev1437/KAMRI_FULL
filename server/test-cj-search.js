const axios = require('axios');

async function testCJSearch() {
  console.log('🔍 Test de recherche CJ Dropshipping...\n');
  
  try {
    // 1. Authentification
    console.log('🔑 Authentification...');
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'projectskevin834@gmail.com',
      apiKey: '158334f3282c4e3f9b077193903daeca'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      timeout: 30000
    });
    
    if (authResponse.data.code !== 200) {
      throw new Error('Authentification échouée: ' + authResponse.data.message);
    }
    
    const accessToken = authResponse.data.data.accessToken;
    console.log('✅ Authentification réussie');
    console.log('🔑 Access Token:', accessToken.substring(0, 50) + '...');
    
    // 2. Test de recherche
    console.log('\n🔍 Test de recherche "phone"...');
    const searchResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 10,
        keyword: 'phone',
        countryCode: 'US',
        sortBy: 'relevance'
      },
      timeout: 30000
    });
    
    console.log('✅ Recherche réussie');
    console.log('📊 Code:', searchResponse.data.code);
    console.log('📊 Result:', searchResponse.data.result);
    console.log('📊 Message:', searchResponse.data.message);
    console.log('📊 Total produits:', searchResponse.data.data?.total || 0);
    console.log('📊 Produits retournés:', searchResponse.data.data?.list?.length || 0);
    
    if (searchResponse.data.data?.list?.length > 0) {
      console.log('\n📱 Premier produit:');
      const firstProduct = searchResponse.data.data.list[0];
      console.log('   - Nom:', firstProduct.productNameEn || firstProduct.productName);
      console.log('   - SKU:', firstProduct.productSku);
      console.log('   - Prix:', firstProduct.productPrice);
      console.log('   - Catégorie:', firstProduct.categoryName);
    }
    
    console.log('\n🎉 Test CJ Dropshipping réussi !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testCJSearch();
