const axios = require('axios');

// Configuration
const CJ_EMAIL = process.env.CJ_EMAIL || 'projectskevin834@gmail.com';
const CJ_API_KEY = process.env.CJ_API_KEY || '158334f3282c4e3f9b077193903daeca';
const SKU_TO_SEARCH = 'CJXX199380019SH';

console.log('🔍 === RECHERCHE PRODUIT SPÉCIFIQUE CJ ===');
console.log('📝 SKU recherché:', SKU_TO_SEARCH);
console.log('📧 Email CJ:', CJ_EMAIL);
console.log('🔑 API Key:', CJ_API_KEY.substring(0, 10) + '...');

async function searchSpecificProduct() {
  try {
    // 1. Authentification
    console.log('\n🔐 Étape 1: Authentification...');
    const authResponse = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });

    if (authResponse.data.code !== 200) {
      throw new Error(`Erreur d'authentification: ${authResponse.data.message}`);
    }

    const { accessToken } = authResponse.data.data;
    console.log('✅ Authentification réussie');
    console.log('🎫 Access Token:', accessToken.substring(0, 20) + '...');

    // Attendre 2 secondes pour respecter les limites de taux
    console.log('⏳ Attente 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Recherche par SKU
    console.log('\n🔍 Étape 2: Recherche par SKU...');
    const searchParams = {
      keyword: SKU_TO_SEARCH,
      pageNum: 1,
      pageSize: 20,
      sortBy: 'relevance',
      searchType: 0,
      productType: 'ORDINARY_PRODUCT',
      sort: 'desc',
      orderBy: 'createAt'
    };

    console.log('📊 Paramètres de recherche:', JSON.stringify(searchParams, null, 2));

    const searchResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: {
        'CJ-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      params: searchParams
    });

    console.log('📡 Réponse API reçue');
    console.log('📊 Code de réponse:', searchResponse.data.code);
    console.log('📊 Résultat:', searchResponse.data.result);

    if (searchResponse.data.code === 200) {
      const products = searchResponse.data.data?.list || [];
      const total = searchResponse.data.data?.total || 0;
      
      console.log('\n🎉 RÉSULTATS DE LA RECHERCHE:');
      console.log('📊 Total de produits trouvés:', total);
      console.log('📦 Nombre de produits retournés:', products.length);

      if (products.length > 0) {
        console.log('\n🔍 PRODUITS TROUVÉS:');
        products.forEach((product, index) => {
          console.log(`\n--- PRODUIT ${index + 1} ---`);
          console.log('🆔 PID:', product.pid);
          console.log('📝 Nom:', product.productName || product.productNameEn);
          console.log('🏷️ SKU:', product.productSku);
          console.log('💰 Prix:', product.productSellPrice);
          console.log('🖼️ Image:', product.productImage);
          console.log('📦 Statut:', product.productStatus);
          console.log('🏪 Catégorie:', product.categoryName);
          
          // Vérifier si c'est le produit recherché
          if (product.productSku === SKU_TO_SEARCH) {
            console.log('🎯 ✅ PRODUIT EXACT TROUVÉ !');
          }
        });

        // Recherche spécifique du SKU
        const exactMatch = products.find(p => p.productSku === SKU_TO_SEARCH);
        if (exactMatch) {
          console.log('\n🎯 PRODUIT EXACT TROUVÉ:');
          console.log('📝 Nom:', exactMatch.productName || exactMatch.productNameEn);
          console.log('💰 Prix:', exactMatch.productSellPrice);
          console.log('📦 Statut:', exactMatch.productStatus);
          console.log('🏪 Catégorie:', exactMatch.categoryName);
          console.log('🖼️ Image:', exactMatch.productImage);
        } else {
          console.log('\n❌ Produit exact non trouvé dans les résultats');
          console.log('🔍 SKUs trouvés:', products.map(p => p.productSku));
        }
      } else {
        console.log('\n❌ Aucun produit trouvé');
      }
    } else {
      console.log('❌ Erreur API:', searchResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error.message);
    if (error.response) {
      console.error('📊 Code d\'erreur:', error.response.status);
      console.error('📊 Données d\'erreur:', error.response.data);
    }
  }
}

// Exécuter la recherche
searchSpecificProduct();
