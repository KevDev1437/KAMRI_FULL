const axios = require('axios');

async function testCJSimple() {
  console.log('🔍 === TEST SIMPLE API CJ ===\n');

  try {
    // Test 1: Vérification de l'endpoint d'authentification
    console.log('🔐 Test 1: Vérification endpoint d\'authentification');
    try {
      const response = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/login', {
        email: process.env.CJ_EMAIL,
        password: process.env.CJ_API_KEY
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`📊 Code de réponse: ${response.status}`);
      console.log(`📊 Code CJ: ${response.data.code}`);
      console.log(`📊 Message: ${response.data.message}`);
      console.log(`📊 Données:`, JSON.stringify(response.data.data, null, 2));

    } catch (error) {
      console.log(`❌ Erreur authentification: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Data:`, JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n⏳ Attente 5 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 2: Vérification de l'endpoint de produits
    console.log('🔍 Test 2: Vérification endpoint de produits');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        params: {
          pageNum: 1,
          pageSize: 5
        }
      });

      console.log(`📊 Code de réponse: ${response.status}`);
      console.log(`📊 Code CJ: ${response.data.code}`);
      console.log(`📊 Message: ${response.data.message}`);
      console.log(`📊 Données:`, JSON.stringify(response.data.data, null, 2));

    } catch (error) {
      console.log(`❌ Erreur produits: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Data:`, JSON.stringify(error.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJSimple();
