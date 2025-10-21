const axios = require('axios');

async function testCJConnection() {
  console.log('🔍 Test de connexion CJ Dropshipping...\n');
  
  try {
    // Test 1: Vérifier si le serveur backend fonctionne
    console.log('1️⃣ Test du serveur backend...');
    const backendResponse = await axios.get('http://localhost:3001/api/cj-dropshipping/config');
    console.log('✅ Backend accessible');
    console.log('📊 Configuration actuelle:', backendResponse.data);
    
    // Test 2: Tester la connexion CJ
    console.log('\n2️⃣ Test de la connexion CJ...');
    const testResponse = await axios.post('http://localhost:3001/api/cj-dropshipping/config/test');
    console.log('📋 Résultat du test:', testResponse.data);
    
    if (testResponse.data.success) {
      console.log('✅ Connexion CJ réussie !');
    } else {
      console.log('❌ Connexion CJ échouée:', testResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solution: Vérifiez que vous êtes connecté en tant qu\'admin');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Solution: Vérifiez que le serveur backend est démarré');
    }
  }
}

testCJConnection();
