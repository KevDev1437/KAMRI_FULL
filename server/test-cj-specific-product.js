const axios = require('axios');

async function testCJSpecificProduct() {
  console.log('🔍 === RECHERCHE PRODUIT SPÉCIFIQUE CJ ===\n');
  console.log('📱 Produit recherché: Leather Pattern Phone Case Retro Advanced');
  console.log('🏷️ SKU: CJJT191105330DW');
  console.log('📋 Liste: 23\n');

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

    // Test 1: Recherche par SKU exact
    console.log('🔍 Test 1: Recherche par SKU exact');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: 'CJJT191105330DW', // SKU exact
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec SKU exact`);
        
        if (products.length > 0) {
          console.log(`📦 Produits trouvés:`);
          products.forEach((product, index) => {
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
      console.log(`❌ Erreur requête SKU: ${error.message}`);
    }

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Recherche par nom de produit
    console.log('🔍 Test 2: Recherche par nom de produit');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: 'Leather Pattern Phone Case', // Nom partiel
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec nom partiel`);
        
        if (products.length > 0) {
          console.log(`📦 Produits trouvés:`);
          products.forEach((product, index) => {
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
      console.log(`❌ Erreur requête nom: ${error.message}`);
    }

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 3: Recherche par mots-clés
    console.log('🔍 Test 3: Recherche par mots-clés');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          keyword: 'Leather Phone Case', // Mots-clés
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés avec mots-clés`);
        
        if (products.length > 0) {
          console.log(`📦 Produits trouvés:`);
          products.forEach((product, index) => {
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
      console.log(`❌ Erreur requête mots-clés: ${error.message}`);
    }

    console.log('\n⏳ Attente 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 4: Recherche par catégorie (Phone Cases)
    console.log('🔍 Test 4: Recherche par catégorie Phone Cases');
    try {
      const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: {
          'CJ-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        params: {
          categoryId: '1000000001', // Phone Cases category
          pageNum: 1,
          pageSize: 20
        }
      });

      if (response.data.code === 200) {
        const products = response.data.data.list || [];
        console.log(`✅ ${products.length} produits trouvés dans la catégorie Phone Cases`);
        
        if (products.length > 0) {
          console.log(`📦 Produits trouvés:`);
          products.forEach((product, index) => {
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
      console.log(`❌ Erreur requête catégorie: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJSpecificProduct();
