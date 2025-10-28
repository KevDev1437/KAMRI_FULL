const http = require('http');

console.log('🧪 Test de synchronisation des catégories CJ...\n');

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/cj-dropshipping${path}`,
      method: method
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

async function testCategoriesSync() {
  try {
    console.log('1️⃣ Test du statut de connexion...');
    const statusResponse = await makeRequest('/status');
    console.log('✅ Statut:', {
      status: statusResponse.status,
      connected: statusResponse.data.connected || false,
      email: statusResponse.data.email || 'N/A'
    });

    console.log('\n2️⃣ Test des catégories de base...');
    const categoriesResponse = await makeRequest('/categories');
    console.log('✅ Catégories de base:', {
      status: categoriesResponse.status,
      found: categoriesResponse.data.data?.length || 0,
      message: categoriesResponse.data.message || 'Pas de message'
    });

    if (categoriesResponse.data.data && categoriesResponse.data.data.length > 0) {
      console.log('📋 Première catégorie:', categoriesResponse.data.data[0]);
    }

    console.log('\n3️⃣ Test de synchronisation des catégories...');
    const syncResponse = await makeRequest('/categories/sync', 'POST');
    console.log('✅ Synchronisation:', {
      status: syncResponse.status,
      message: syncResponse.data.message || 'Pas de message'
    });

    console.log('\n4️⃣ Re-test des catégories après sync...');
    const categoriesAfterSync = await makeRequest('/categories');
    console.log('✅ Catégories après sync:', {
      status: categoriesAfterSync.status,
      found: categoriesAfterSync.data.data?.length || 0
    });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function main() {
  await testCategoriesSync();
  console.log('\n🎉 Test terminé !');
}

main().catch(console.error);