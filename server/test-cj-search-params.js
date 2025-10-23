const axios = require('axios');

async function testCJSearchParams() {
  console.log('🔍 === TEST DES PARAMÈTRES DE RECHERCHE CJ ===\n');

  try {
    // Étape 1: Authentification
    console.log('🔐 Étape 1: Authentification...');
    const loginResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/login', {
      email: process.env.CJ_EMAIL,
      password: process.env.CJ_API_KEY
    });

    if (loginResponse.data.code !== 200) {
      throw new Error(`Erreur d'authentification: ${loginResponse.data.message}`);
    }

    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Token obtenu');
    console.log('⏳ Attente 5 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 1: Recherche avec différents paramètres
    const searchTests = [
      {
        name: 'Recherche par nom exact',
        params: {
          keyword: 'T-Shirt',
          pageNum: 1,
          pageSize: 5
        }
      },
      {
        name: 'Recherche par catégorie',
        params: {
          categoryId: '1000000001', // Women's Clothing
          pageNum: 1,
          pageSize: 5
        }
      },
      {
        name: 'Recherche par prix',
        params: {
          minPrice: 10,
          maxPrice: 50,
          pageNum: 1,
          pageSize: 5
        }
      },
      {
        name: 'Recherche par SKU',
        params: {
          keyword: 'CJWS2568020',
          pageNum: 1,
          pageSize: 5
        }
      },
      {
        name: 'Recherche sans paramètres',
        params: {
          pageNum: 1,
          pageSize: 5
        }
      }
    ];

    for (const test of searchTests) {
      console.log(`🔍 Test: ${test.name}`);
      console.log(`📋 Paramètres:`, JSON.stringify(test.params, null, 2));
      
      try {
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
          headers: {
            'CJ-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          params: test.params
        });

        if (response.data.code === 200) {
          const products = response.data.data.list || [];
          console.log(`✅ ${products.length} produits trouvés`);
          
          if (products.length > 0) {
            console.log(`📦 Premier produit:`);
            console.log(`   🆔 PID: ${products[0].pid}`);
            console.log(`   📝 Nom: ${products[0].name}`);
            console.log(`   🏷️ SKU: ${products[0].sku}`);
            console.log(`   💰 Prix: ${products[0].price}`);
            console.log(`   🏪 Catégorie: ${products[0].category}`);
          }
        } else {
          console.log(`❌ Erreur: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Erreur requête: ${error.message}`);
      }
      
      console.log('⏳ Attente 3 secondes...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJSearchParams();
