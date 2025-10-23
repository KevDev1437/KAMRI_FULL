const axios = require('axios');

async function testCJGlobal() {
  console.log('🌍 Test de recherche CJ GLOBALE (tous les pays)...\n');
  
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
    
    // 2. Test de recherche GLOBALE (sans filtre pays)
    console.log('\n🌍 Test de recherche GLOBALE (tous les pays)...');
    const searchResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 50,
        keyword: 'phone',
        // PAS de countryCode = recherche dans tous les pays
        sortBy: 'relevance',
        searchType: 0, // All products
        productType: 'ORDINARY_PRODUCT', // Produits ordinaires
        isFreeShipping: 1, // Livraison gratuite
        verifiedWarehouse: 1, // Inventaire vérifié
        sort: 'desc', // Tri décroissant
        orderBy: 'createAt', // Trier par date de création
      },
      timeout: 30000
    });
    
    console.log('✅ Recherche GLOBALE réussie');
    console.log('📊 Code:', searchResponse.data.code);
    console.log('📊 Result:', searchResponse.data.result);
    console.log('📊 Message:', searchResponse.data.message);
    console.log('📊 Total produits:', searchResponse.data.data?.total || 0);
    console.log('📊 Produits retournés:', searchResponse.data.data?.list?.length || 0);
    
    if (searchResponse.data.data?.list?.length > 0) {
      console.log('\n📱 Premiers produits (GLOBAUX):');
      searchResponse.data.data.list.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productNameEn || product.productName}`);
        console.log(`      - SKU: ${product.productSku}`);
        console.log(`      - Prix: $${product.sellPrice || 'N/A'}`);
        console.log(`      - Catégorie: ${product.categoryName}`);
        console.log(`      - Type: ${product.productType || 'N/A'}`);
        console.log(`      - Livraison gratuite: ${product.isFreeShipping ? 'Oui' : 'Non'}`);
        console.log('');
      });
    }
    
    console.log('🎉 Test CJ Dropshipping GLOBAL réussi !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 1600001) {
      console.log('💡 Token expiré ou invalide');
    } else if (error.response?.data?.code === 1600200) {
      console.log('💡 Rate limit atteint - Attendez 5 minutes');
    }
  }
}

testCJGlobal();
