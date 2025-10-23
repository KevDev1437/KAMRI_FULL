const axios = require('axios');

async function testCJDirect() {
  console.log('🔍 Test direct de l\'API CJ Dropshipping...\n');
  
  try {
    // 1. TEST D'AUTHENTIFICATION AVEC LE BON ENDPOINT
    console.log('1️⃣ Tentative d\'authentification...');
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'kamridev2.0@gmail.com',
      apiKey: 'd86440263e26415f8dad82f0829f3a7d'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      timeout: 30000
    });
    
    console.log('✅ Réponse authentification:', authResponse.status);
    console.log('📊 Données:', JSON.stringify(authResponse.data, null, 2));
    
    // Vérifier si l'authentification a réussi
    if (authResponse.data.code !== 200 || !authResponse.data.data?.accessToken) {
      console.log('❌ Authentification échouée:', authResponse.data.message);
      return;
    }
    
    const accessToken = authResponse.data.data.accessToken;
    console.log('🔑 Access Token obtenu:', accessToken.substring(0, 20) + '...');
    
    // 2. TEST DE L'API PRODUCTS AVEC LE TOKEN
    console.log('\n2️⃣ Test de l\'API produits...');
    const productResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'KAMRI-CJ-Client/1.0'
      },
      params: {
        pageNum: 1,
        pageSize: 5, // Réduit pour le test
        productName: 'phone' // Utiliser productName au lieu de keyword
      },
      timeout: 30000
    });
    
    console.log('✅ API produits accessible:', productResponse.status);
    console.log('📊 Réponse produits:', JSON.stringify(productResponse.data, null, 2));
    
    if (productResponse.data.code === 200) {
      console.log('🎉 SUCCÈS COMPLET !');
      console.log('📦 Produits trouvés:', productResponse.data.data?.list?.length || 0);
    } else {
      console.log('❌ API produits échouée:', productResponse.data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur détaillée:');
    
    if (error.response) {
      // Erreur avec réponse du serveur
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Données:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n💡 Solution: Clé API invalide - Régénérez une nouvelle clé sur CJ');
      } else if (error.response.status === 403) {
        console.log('\n💡 Solution: Compte limité ou suspendu');
      } else if (error.response.status === 404) {
        console.log('\n💡 Solution: Endpoint incorrect - Vérifiez la documentation CJ');
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      console.log('Aucune réponse du serveur:', error.message);
      console.log('\n💡 Solution: Vérifiez votre connexion internet ou firewall');
    } else {
      // Erreur de configuration
      console.log('Erreur de configuration:', error.message);
    }
    
    // Test alternatif avec différentes URLs
    await testAlternativeURLs();
  }
}

async function testAlternativeURLs() {
  console.log('\n🔧 Test des URLs alternatives...');
  
  const testConfigs = [
    {
      name: 'API Production',
      baseURL: 'https://api.cjdropshipping.com/api2.0/v1',
      authEndpoint: '/authentication/getAccessToken'
    },
    {
      name: 'API Developers',
      baseURL: 'https://developers.cjdropshipping.com/api2.0/v1', 
      authEndpoint: '/authentication/getAccessToken'
    },
    {
      name: 'API China',
      baseURL: 'https://developers.cjdropshipping.cn/api2.0/v1',
      authEndpoint: '/authentication/getAccessToken'
    }
  ];
  
  for (const config of testConfigs) {
    try {
      console.log(`\n🔍 Test ${config.name}: ${config.baseURL}`);
      
      const response = await axios.post(config.baseURL + config.authEndpoint, {
        email: 'kamridev2.0@gmail.com',
        apiKey: '5f6cc92235ba45b1845f6d89135482ac'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: () => true // Accepter tous les status
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Code CJ: ${response.data?.code}`);
      console.log(`   Message: ${response.data?.message}`);
      
      if (response.data?.code === 200) {
        console.log(`   🎉 ${config.name} FONCTIONNE !`);
        break;
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }
}

// Exécuter le test
testCJDirect();