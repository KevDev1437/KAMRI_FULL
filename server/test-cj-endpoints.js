const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const TARGET_PID = 'E5204DA5-5559-42CC-801F-24207A2D2168';

async function testCJEndpoints() {
  try {
    console.log('🔍 === TEST DES ENDPOINTS CJ ===');
    console.log('🎯 PID ciblé:', TARGET_PID);
    
    // Authentification
    console.log('\n🔐 Étape 1: Authentification...');
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 5 secondes
    console.log('⏳ Attente 5 secondes...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Test des différents endpoints possibles
    const endpoints = [
      '/product/detail',
      '/product/info',
      '/product/get',
      '/product/query',
      '/product/view'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Test de l'endpoint: ${endpoint}`);
        
        const response = await axios.get(`https://developers.cjdropshipping.com/api2.0/v1${endpoint}`, {
          headers: { 'CJ-Access-Token': token },
          params: { pid: TARGET_PID }
        });
        
        console.log(`✅ ${endpoint} fonctionne !`);
        console.log('   Code:', response.data.code);
        console.log('   Message:', response.data.message);
        
        if (response.data.data) {
          console.log('   Données trouvées:', Object.keys(response.data.data));
        }
        
        break; // Arrêter au premier endpoint qui fonctionne
        
      } catch (error) {
        if (error.response?.data?.code === 1600101) {
          console.log(`❌ ${endpoint} - Interface not found`);
        } else if (error.response?.data?.code === 1600200) {
          console.log(`⏳ ${endpoint} - Too Many Requests, attente...`);
          await new Promise(r => setTimeout(r, 10000)); // Attendre 10 secondes
        } else {
          console.log(`❌ ${endpoint} - Erreur:`, error.response?.data?.message || error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testCJEndpoints();
