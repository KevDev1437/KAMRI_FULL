const axios = require('axios');

async function testCJAPI() {
  console.log('🧪 Test de l\'API CJ Dropshipping...');
  
  // Test avec différentes clés API
  const testKeys = [
    'd3c83f6d8fc14eb4aaa6ff8db1fb8c4e', // Clé actuelle
    '158334f3282c4e3f9b077193903daeca', // Ancienne clé
    'test-key-invalid' // Clé de test
  ];
  
  for (const apiKey of testKeys) {
    console.log(`\n🔑 Test avec la clé: ${apiKey.substring(0, 8)}...`);
    
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'KAMRI-Test/1.0'
        },
        params: {
          pageNum: 1,
          pageSize: 1
        },
        timeout: 10000
      });
      
      console.log('✅ Succès! Réponse:', response.data);
      break;
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur API:', error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. Connectez-vous à https://developers.cjdropshipping.com');
  console.log('2. Allez dans "API Management" ou "Developer Center"');
  console.log('3. Générez une nouvelle clé API');
  console.log('4. Remplacez la clé dans start-with-cj.bat');
}

testCJAPI().catch(console.error);
