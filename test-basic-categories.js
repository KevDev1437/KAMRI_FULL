const http = require('http');

console.log('🧪 Test de base des catégories CJ...\n');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/cj-dropshipping${path}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testBasicCategories() {
  try {
    console.log('1️⃣ Test de l\'endpoint de base des catégories...');
    const response = await makeRequest('/categories');
    console.log('✅ Catégories de base:', {
      status: response.status,
      found: response.data.data?.length || 0,
      message: response.data.message || 'Pas de message'
    });

    if (response.data.data && response.data.data.length > 0) {
      console.log('📋 Premières catégories:');
      response.data.data.slice(0, 5).forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.categoryName} (ID: ${cat.categoryId})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function main() {
  await testBasicCategories();
  console.log('\n🎉 Test terminé !');
}

main().catch(console.error);