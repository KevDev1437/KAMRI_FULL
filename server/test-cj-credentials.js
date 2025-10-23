const axios = require('axios');

async function testCredentials() {
  console.log('🔍 Test des credentials CJ Dropshipping...\n');
  
  // Test avec les credentials actuels
  console.log('📧 Email:', 'projectskevin834@gmail.com');
  console.log('🔑 API Key:', '158334f3282c4e3f9b077193903daeca');
  
  try {
    const response = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'projectskevin834@gmail.com',
      apiKey: '158334f3282c4e3f9b077193903daeca'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Réponse reçue:');
    console.log('📊 Code:', response.data.code);
    console.log('📊 Result:', response.data.result);
    console.log('📊 Message:', response.data.message);
    console.log('📊 Data:', response.data.data);
    
    if (response.data.code === 200 && response.data.result === true) {
      console.log('🎉 Authentification réussie !');
      console.log('🔑 Access Token:', response.data.data.accessToken);
      console.log('🔄 Refresh Token:', response.data.data.refreshToken);
    } else {
      console.log('❌ Authentification échouée');
      console.log('💡 Vérifiez vos credentials dans le dashboard CJ');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 1601000) {
      console.log('💡 Solution: Email incorrect ou compte inexistant');
    } else if (error.response?.data?.code === 1600001) {
      console.log('💡 Solution: API Key incorrecte ou expirée');
    } else if (error.response?.data?.code === 1600101) {
      console.log('💡 Solution: Interface not found - Vérifiez vos credentials');
    }
  }
}

testCredentials();
