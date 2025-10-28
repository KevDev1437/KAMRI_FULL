const http = require('http');

console.log('🧪 Test des nouveaux endpoints de catégories avancés...\n');

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

async function testCategoryEndpoints() {
  try {
    // Test 1: Recherche de catégories
    console.log('1️⃣ Test de recherche de catégories...');
    const searchResponse = await makeRequest('/categories/search?keyword=phone&pageSize=5&pageNum=1');
    console.log('✅ Recherche de catégories:', {
      status: searchResponse.status,
      total: searchResponse.data.data?.total || 0,
      found: searchResponse.data.data?.list?.length || 0,
      pages: searchResponse.data.data?.totalPages || 0
    });

    // Test 2: Catégories populaires
    console.log('\n2️⃣ Test des catégories populaires...');
    const popularResponse = await makeRequest('/categories/popular?limit=5');
    console.log('✅ Catégories populaires:', {
      status: popularResponse.status,
      found: popularResponse.data.data?.length || 0,
      categories: popularResponse.data.data?.map(c => c.categoryName).slice(0, 3) || []
    });

    // Test 3: Recherche par niveau
    console.log('\n3️⃣ Test de recherche par niveau (niveau 1)...');
    const levelResponse = await makeRequest('/categories/search?level=1&pageSize=10');
    console.log('✅ Catégories niveau 1:', {
      status: levelResponse.status,
      found: levelResponse.data.data?.list?.length || 0,
      categories: levelResponse.data.data?.list?.map(c => c.categoryName).slice(0, 5) || []
    });

    // Test 4: Statistiques du cache
    console.log('\n4️⃣ Test des statistiques du cache...');
    const cacheResponse = await makeRequest('/cache/stats');
    console.log('✅ Statistiques du cache:', {
      status: cacheResponse.status,
      searchHits: cacheResponse.data.searchCache?.hits || 0,
      searchMisses: cacheResponse.data.searchCache?.misses || 0,
      categoriesHits: cacheResponse.data.categoriesCache?.hits || 0,
      categoriesMisses: cacheResponse.data.categoriesCache?.misses || 0,
    });

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

async function main() {
  await testCategoryEndpoints();
  console.log('\n🎉 Tests terminés !');
}

main().catch(console.error);