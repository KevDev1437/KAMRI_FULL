const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const TARGET_SKU = 'CJNSSYTZ00854-Black-3XL';

async function deepSearchSKU() {
  try {
    console.log('🔍 === RECHERCHE APPROFONDIE DU SKU ===');
    console.log('🎯 SKU ciblé:', TARGET_SKU);
    
    // Authentification
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Recherche dans plusieurs pages
    const maxPages = 1000; // Limiter à 10 pages pour éviter les timeouts
    let found = false;
    
    for (let page = 1; page <= maxPages && !found; page++) {
      console.log(`\n📄 Recherche page ${page}/${maxPages}...`);
      
      // Attendre 2s entre les requêtes
      if (page > 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
      
      const search = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: { 'CJ-Access-Token': token },
        params: {
          keyword: TARGET_SKU,
          pageNum: page,
          pageSize: 20,
          sortBy: 'relevance'
        }
      });
      
      const products = search.data.data?.list || [];
      console.log(`📊 ${products.length} produits trouvés sur cette page`);
      
      // Chercher le SKU exact
      const exactMatch = products.find(p => p.productSku === TARGET_SKU);
      if (exactMatch) {
        console.log('\n🎯 ✅ PRODUIT TROUVÉ !');
        console.log('📝 Nom:', exactMatch.productName || exactMatch.productNameEn);
        console.log('🏷️ SKU:', exactMatch.productSku);
        console.log('💰 Prix:', exactMatch.productSellPrice);
        console.log('📦 Statut:', exactMatch.productStatus);
        console.log('🏪 Catégorie:', exactMatch.categoryName);
        console.log('🖼️ Image:', exactMatch.productImage);
        found = true;
        break;
      }
      
      // Afficher les SKUs de cette page pour debug
      console.log('🔍 SKUs de cette page:', products.map(p => p.productSku).slice(0, 5));
    }
    
    if (!found) {
      console.log('\n❌ Produit non trouvé dans les', maxPages, 'premières pages');
      console.log('💡 Suggestions:');
      console.log('   - Le produit n\'existe peut-être plus');
      console.log('   - Le SKU a peut-être changé de format');
      console.log('   - Essayez une recherche par nom de produit');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deepSearchSKU();
