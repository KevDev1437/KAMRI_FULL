const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const TARGET_SKU = 'CJXX199380019SH';

async function patientSearchSKU() {
  try {
    console.log('🔍 === RECHERCHE PATIENTE DU SKU ===');
    console.log('🎯 SKU ciblé:', TARGET_SKU);
    console.log('⏳ Respect des limites de taux CJ...');
    
    // Authentification
    console.log('\n🔐 Étape 1: Authentification...');
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 5 secondes après l'auth
    console.log('⏳ Attente 5 secondes après authentification...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Recherche avec délai plus long
    console.log('\n🔍 Étape 2: Recherche du SKU...');
    const search = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: { 'CJ-Access-Token': token },
      params: {
        keyword: TARGET_SKU,
        pageNum: 1,
        pageSize: 50, // Plus de résultats par page
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
      const exactMatch = products.find(p => p.productSku === TARGET_SKU);
      
      if (exactMatch) {
        console.log('\n🎯 ✅ PRODUIT TROUVÉ !');
        console.log('📝 Nom:', exactMatch.productName || exactMatch.productNameEn);
        console.log('🏷️ SKU:', exactMatch.productSku);
        console.log('💰 Prix:', exactMatch.productSellPrice);
        console.log('📦 Statut:', exactMatch.productStatus);
        console.log('🏪 Catégorie:', exactMatch.categoryName);
        console.log('🖼️ Image:', exactMatch.productImage);
      } else {
        console.log('\n❌ SKU exact non trouvé dans les premiers résultats');
        console.log('🔍 SKUs trouvés (premiers 10):');
        products.slice(0, 10).forEach((p, i) => {
          console.log(`  ${i+1}. ${p.productSku} - ${p.productName || p.productNameEn}`);
        });
        
        console.log('\n💡 Le produit pourrait être:');
        console.log('   - Dans une page plus loin');
        console.log('   - N\'existe plus sur CJ');
        console.log('   - A changé de SKU');
      }
    } else {
      console.log('\n❌ Aucun produit trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response?.status === 429) {
      console.log('🚨 LIMITE DE TAUX DÉPASSÉE');
      console.log('💡 Attendez quelques minutes avant de réessayer');
    }
  }
}

patientSearchSKU();
