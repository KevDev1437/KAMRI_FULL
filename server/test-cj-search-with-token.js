const axios = require('axios');

async function testCJSearchWithToken() {
  console.log('🔍 Test de recherche CJ avec token existant...\n');
  
  // Utiliser le token obtenu précédemment
  const accessToken = 'API@CJ4832208@CJ:eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyOTE3NyIsInR5cGUiOiJBQ0NFU1NfVE9LRU4iLCJzdWIiOiJicUxvYnFRMGxtTm55UXB4UFdMWnlvQkRJRUhZajBMUndUc1VFVGFMZ2t2NzNmL2VYZkhWbjVzV0hRUTlyeTJ3cE42QmRybUI3VWNuaXRaZkZrNHNuNFh5YVpHblExUG1aUXBqWFNGWHZ2MUUvUy9tdldRODFSR2pmL0JLVjE3aWpXbjZsVUMzU2xPNGh3R3RxNUxTZXNweWw2bnBwR2FtaDVTTkRhYlBBdVRGYTFUb2orZTBjK28wMk9Jb3d5L3RhNkZYNlAvbDl6VC9DN3IwbnFRSnpLUE1RRWt2UUQ5N0IydmdZUzVoMzJHbGNsUm84TGZFUjB3Y3orM0JtZW93RVNRcmVQckdaSklydjNSTlZxNzczTlEzMDdTREdUT0hVY29ldURjdi8xTFVCQTB6aUJHVmZaOTlpYUl4d0EwQSIsImlhdCI6MTc2MTIwNTk5Nn0.955QTQD_gz-kfJgmqCq6rQvPLgAMIE0VEmrFEtJsZ4g';
  
  try {
    console.log('🔑 Utilisation du token existant...');
    console.log('🔑 Token:', accessToken.substring(0, 50) + '...');
    
    // Test de recherche
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
      console.log('\n📱 Premiers produits:');
      searchResponse.data.data.list.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productNameEn || product.productName}`);
        console.log(`      - SKU: ${product.productSku}`);
        console.log(`      - Prix: $${product.productPrice}`);
        console.log(`      - Catégorie: ${product.categoryName}`);
        console.log('');
      });
    }
    
    console.log('🎉 Test CJ Dropshipping réussi !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 1600001) {
      console.log('💡 Token expiré ou invalide');
    } else if (error.response?.data?.code === 1600200) {
      console.log('💡 Rate limit atteint - Attendez 5 minutes');
    }
  }
}

testCJSearchWithToken();
