const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const TARGET_PID = 'E5204DA5-5559-42CC-801F-24207A2D2168';

async function testCJParams() {
  try {
    console.log('🔍 === TEST DES PARAMÈTRES CJ ===');
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
    
    // Test des différents paramètres possibles
    const paramTests = [
      { name: 'pid', value: TARGET_PID },
      { name: 'productId', value: TARGET_PID },
      { name: 'id', value: TARGET_PID },
      { name: 'product_id', value: TARGET_PID },
      { name: 'productId', value: TARGET_PID },
      { name: 'productCode', value: TARGET_PID },
      { name: 'code', value: TARGET_PID }
    ];
    
    for (const paramTest of paramTests) {
      try {
        console.log(`\n🔍 Test avec paramètre: ${paramTest.name}=${paramTest.value}`);
        
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/detail', {
          headers: { 'CJ-Access-Token': token },
          params: { [paramTest.name]: paramTest.value }
        });
        
        console.log(`✅ ${paramTest.name} fonctionne !`);
        console.log('   Code:', response.data.code);
        console.log('   Message:', response.data.message);
        
        if (response.data.data) {
          console.log('   Données trouvées:', Object.keys(response.data.data));
          if (response.data.data.productVariants) {
            console.log('   Nombre de variantes:', response.data.data.productVariants.length);
          }
        }
        
        break; // Arrêter au premier paramètre qui fonctionne
        
      } catch (error) {
        if (error.response?.data?.code === 1600101) {
          console.log(`❌ ${paramTest.name} - Interface not found`);
        } else if (error.response?.data?.code === 1600200) {
          console.log(`⏳ ${paramTest.name} - Too Many Requests, attente...`);
          await new Promise(r => setTimeout(r, 10000)); // Attendre 10 secondes
        } else {
          console.log(`❌ ${paramTest.name} - Erreur:`, error.response?.data?.message || error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testCJParams();
