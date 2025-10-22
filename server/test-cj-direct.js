const axios = require('axios');

async function testCJDirect() {
  console.log('🔍 Test direct de l\'API CJ Dropshipping...\n');
  
  try {
    // Test direct de l'API CJ avec l'endpoint d'authentification
    const authResponse = await axios.post('https://developers.cjdropshipping.cn/api2.0/v1/auth', {
      email: 'kamridev2.0@gmail.com',
      apiKey: 'd86440263e26415f8dad82f0829f3a7d'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Authentification réussie');
    console.log('📊 Réponse auth complète:', JSON.stringify(authResponse.data, null, 2));
    console.log('🔑 Access Token:', authResponse.data.data?.accessToken);
    
    // Maintenant tester avec l'access token
    const response = await axios.get('https://developers.cjdropshipping.cn/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': authResponse.data.data.accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 1,
        keyword: 'test'
      },
      timeout: 30000
    });
    
    console.log('✅ API CJ accessible');
    console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    
    if (response.data.result) {
      console.log('✅ Authentification CJ réussie !');
      console.log('🔑 Access Token:', response.data.data.accessToken);
    } else {
      console.log('❌ Authentification CJ échouée:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test direct:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solution: Vérifiez vos credentials CJ Dropshipping');
    } else if (error.response?.status === 403) {
      console.log('\n💡 Solution: Votre compte CJ pourrait être suspendu ou limité');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Solution: Problème de connexion internet');
    }
  }
}

testCJDirect();
