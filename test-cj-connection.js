const http = require('http');

console.log('🧪 Test de la connexion CJ Dropshipping...\n');

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

async function testCJConnection() {
  try {
    console.log('1️⃣ Test du statut de connexion CJ...');
    const statusResponse = await makeRequest('/status');
    console.log('✅ Statut CJ:', {
      status: statusResponse.status,
      connected: statusResponse.data.connected || false,
      message: statusResponse.data.message || 'Pas de message'
    });

    console.log('\n2️⃣ Test de recherche de produits...');
    const searchResponse = await makeRequest('/products/search?keyword=phone&pageSize=2');
    console.log('✅ Recherche produits:', {
      status: searchResponse.status,
      found: searchResponse.data.data?.length || 0,
      total: searchResponse.data.total || 0
    });

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      console.log('📦 Premier produit trouvé:', searchResponse.data.data[0].productName);
    }

    console.log('\n3️⃣ Test des catégories après recherche...');
    const categoriesResponse = await makeRequest('/categories');
    console.log('✅ Catégories après recherche:', {
      status: categoriesResponse.status,
      found: categoriesResponse.data.data?.length || 0,
      message: categoriesResponse.data.message || 'Pas de message'
    });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function main() {
  await testCJConnection();
  console.log('\n🎉 Test terminé !');
}

main().catch(console.error);