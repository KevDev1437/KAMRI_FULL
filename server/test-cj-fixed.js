const axios = require('axios');

async function testCJFixed() {
  console.log('🔧 === TEST DE LA CORRECTION CJ ===\n');

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

    // Test 1: Recherche avec productName (CORRIGÉ)
    console.log('🔍 Test 1: Recherche avec productName (CORRIGÉ)');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          productName: 'T-Shirt', // ← CORRECTION: Utiliser productName
          pageNum: 1,
          pageSize: 5
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec productName`);
        
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

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Recherche avec keyword (ANCIEN - pour comparaison)
    console.log('🔍 Test 2: Recherche avec keyword (ANCIEN - pour comparaison)');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: 'T-Shirt', // ← ANCIEN: Utiliser keyword
          pageNum: 1,
          pageSize: 5
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec keyword`);
        
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

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJFixed();
