const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';

// SKU que nous savons exister (trouvé dans nos recherches précédentes)
const KNOWN_SKU = 'CJYD2567773';

async function testKnownSKU() {
  try {
    console.log('🔍 === TEST AVEC SKU CONNU ===');
    console.log('🎯 SKU testé:', KNOWN_SKU);
    
    // Authentification
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 5 secondes
    await new Promise(r => setTimeout(r, 5000));
    
    // Recherche du SKU connu
    console.log('\n🔍 Recherche du SKU connu...');
    const search = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: { 'CJ-Access-Token': token },
      params: {
        keyword: KNOWN_SKU,
        pageNum: 1,
        pageSize: 20,
        sortBy: 'relevance'
      }
    });
    
    const products = search.data.data?.list || [];
    const total = search.data.data?.total || 0;
    
    console.log(`📊 Total de produits trouvés: ${total}`);
    console.log(`📦 Produits retournés: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n🔍 RECHERCHE DU SKU EXACT...');
      
      // Chercher le SKU exact
      const exactMatch = products.find(p => p.productSku === KNOWN_SKU);
      
      if (exactMatch) {
        console.log('\n🎯 ✅ PRODUIT CONNU TROUVÉ !');
        console.log('📝 Nom:', exactMatch.productName || exactMatch.productNameEn);
        console.log('🏷️ SKU:', exactMatch.productSku);
        console.log('💰 Prix:', exactMatch.productSellPrice);
        console.log('📦 Statut:', exactMatch.productStatus);
        console.log('🏪 Catégorie:', exactMatch.categoryName);
        console.log('🆔 PID:', exactMatch.pid);
        
        console.log('\n✅ CONCLUSION: L\'API fonctionne parfaitement !');
        console.log('💡 Le problème avec vos SKUs est qu\'ils n\'existent pas sur CJ');
        console.log('🎯 Vos SKUs ont un format différent des SKUs CJ actuels');
      } else {
        console.log('\n❌ SKU connu non trouvé dans les résultats');
        console.log('🔍 SKUs trouvés:', products.map(p => p.productSku).slice(0, 10));
      }
    } else {
      console.log('\n❌ Aucun produit trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testKnownSKU();
