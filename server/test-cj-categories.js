const axios = require('axios');

async function testCJCategories() {
  console.log('🔍 === TEST DES CATÉGORIES CJ ===\n');

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

    // Test 1: Récupération des catégories
    console.log('🔍 Test 1: Récupération des catégories');
    try {
      const categoriesResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/category', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (categoriesResponse.data.code === 200) {
        const categories = categoriesResponse.data.data || [];
        console.log(`✅ ${categories.length} catégories trouvées`);
        
        if (categories.length > 0) {
          console.log(`📦 Premières catégories:`);
          categories.slice(0, 5).forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
          });
        }
      } else {
        console.log(`❌ Erreur catégories: ${categoriesResponse.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur catégories: ${error.message}`);
    }

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Recherche par catégorie spécifique
    console.log('🔍 Test 2: Recherche par catégorie spécifique');
    try {
      const searchResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          categoryId: '1000000001', // Women's Clothing
          pageNum: 1,
          pageSize: 5
        }
      });

      if (searchResponse.data.code === 200) {
        const products = searchResponse.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés dans la catégorie`);
        
        if (products.length > 0) {
          console.log(`📦 Premiers produits:`);
          products.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} (SKU: ${product.sku})`);
          });
        }
      } else {
        console.log(`❌ Erreur recherche: ${searchResponse.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur recherche: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJCategories();
