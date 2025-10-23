const axios = require('axios');

async function testCJKeywordFix() {
  console.log('🔧 === TEST CORRECTION KEYWORD CJ ===\n');

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

    // Test: Recherche avec keyword
    console.log('🔍 Test: Recherche avec keyword "phone"');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: 'phone', // ← Keyword passé
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec keyword "phone"`);
        
        if (products.length > 0) {
          console.log(`📦 Premiers produits trouvés:`);
          products.slice(0, 5).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.productName || product.productNameEn}`);
            console.log(`      🏷️ SKU: ${product.productSku}`);
            console.log(`      🆔 PID: ${product.pid}`);
            console.log(`      💰 Prix: ${product.sellPrice}`);
            console.log(`      🏪 Catégorie: ${product.categoryName}`);
            console.log('');
          });
        }
      } else {
        console.log(`❌ Erreur: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur requête: ${error.message}`);
    }

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test: Recherche SANS keyword
    console.log('🔍 Test: Recherche SANS keyword (pour comparaison)');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          // Pas de keyword
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés SANS keyword`);
        
        if (products.length > 0) {
          console.log(`📦 Premiers produits trouvés:`);
          products.slice(0, 5).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.productName || product.productNameEn}`);
            console.log(`      🏷️ SKU: ${product.productSku}`);
            console.log(`      🆔 PID: ${product.pid}`);
            console.log(`      💰 Prix: ${product.sellPrice}`);
            console.log(`      🏪 Catégorie: ${product.categoryName}`);
            console.log('');
          });
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

testCJKeywordFix();
