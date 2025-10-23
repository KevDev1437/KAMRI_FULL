const axios = require('axios');

async function testCJMultiPages() {
  console.log('🔧 === TEST SOLUTION MULTI-PAGES CJ ===\n');

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

    // Test: Récupération de plusieurs pages
    console.log('🔍 Test: Récupération de plusieurs pages');
    const allProducts = [];
    const maxPages = 3;
    
    for (let page = 1; page <= maxPages; page++) {
      console.log(`📄 Récupération page ${page}/${maxPages}...`);
      
      try {
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
          headers: {
            'CJ-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          params: {
            pageNum: page,
            pageSize: 200,
            countryCode: 'US'
          }
        });

        if (response.data.code === 200) {
          const products = response.data.data.list || [];
          allProducts.push(...products);
          console.log(`📦 Page ${page}: ${products.length} produits récupérés`);
          
          if (products.length < 200) {
            console.log('📄 Dernière page atteinte');
            break;
          }
        } else {
          console.log(`❌ Erreur page ${page}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Erreur page ${page}: ${error.message}`);
      }
      
      // Attendre entre les pages
      if (page < maxPages) {
        console.log('⏳ Attente 2 secondes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📦 Total reçu : ${allProducts.length} produits`);
    
    // Test de filtrage côté serveur
    console.log('\n🔍 Test de filtrage côté serveur...');
    const keyword = 'T-Shirt';
    const filteredProducts = allProducts.filter(product => {
      const name = (product.productName || '').toLowerCase();
      const nameEn = (product.productNameEn || '').toLowerCase();
      const sku = (product.productSku || '').toLowerCase();
      const category = (product.categoryName || '').toLowerCase();
      
      return name.includes(keyword.toLowerCase()) ||
             nameEn.includes(keyword.toLowerCase()) ||
             sku.includes(keyword.toLowerCase()) ||
             category.includes(keyword.toLowerCase());
    });
    
    console.log(`✅ ${filteredProducts.length} produits trouvés avec "${keyword}"`);
    
    if (filteredProducts.length > 0) {
      console.log(`📦 Premiers produits trouvés:`);
      filteredProducts.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.productName || product.productNameEn} (SKU: ${product.productSku})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCJMultiPages();
