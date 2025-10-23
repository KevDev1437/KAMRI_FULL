const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';

// Mots-clés basés sur l'URL du produit
const SEARCH_KEYWORDS = [
  '3pcs womens clothing',
  'pajama set',
  'long sleeve crop tank',
  'drawstring shorts',
  'womens clothing set'
];

async function searchProductByName() {
  try {
    console.log('🔍 === RECHERCHE PAR NOM DE PRODUIT ===');
    console.log('🎯 Mots-clés de recherche:', SEARCH_KEYWORDS);
    
    // Authentification
    console.log('\n🔐 Étape 1: Authentification...');
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 5 secondes
    console.log('⏳ Attente 5 secondes...');
    await new Promise(r => setTimeout(r, 5000));
    
    // Recherche par mots-clés
    for (const keyword of SEARCH_KEYWORDS) {
      try {
        console.log(`\n🔍 Recherche avec: "${keyword}"`);
        
        const response = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
          headers: { 'CJ-Access-Token': token },
          params: {
            keyword: keyword,
            pageNum: 1,
            pageSize: 20,
            sortBy: 'relevance'
          }
        });
        
        if (response.data.code === 200) {
          const products = response.data.data?.list || [];
          const total = response.data.data?.total || 0;
          
          console.log(`✅ ${keyword} - ${total} produits trouvés`);
          console.log(`📦 ${products.length} produits retournés`);
          
          if (products.length > 0) {
            console.log('\n🔍 PRODUITS TROUVÉS:');
            products.forEach((product, index) => {
              console.log(`\n--- PRODUIT ${index + 1} ---`);
              console.log('🆔 PID:', product.pid);
              console.log('📝 Nom:', product.productName || product.productNameEn);
              console.log('🏷️ SKU Principal:', product.productSku);
              console.log('💰 Prix:', product.productSellPrice);
              console.log('📦 Statut:', product.productStatus);
              console.log('🏪 Catégorie:', product.categoryName);
              
              // Vérifier si c'est le produit recherché
              if (product.productName && product.productName.toLowerCase().includes('pajama')) {
                console.log('🎯 ✅ PRODUIT POTENTIEL TROUVÉ !');
              }
            });
          }
        } else {
          console.log(`❌ ${keyword} - Erreur:`, response.data.message);
        }
        
        // Attendre 3 secondes entre les recherches
        if (keyword !== SEARCH_KEYWORDS[SEARCH_KEYWORDS.length - 1]) {
          console.log('⏳ Attente 3 secondes...');
          await new Promise(r => setTimeout(r, 3000));
        }
        
      } catch (error) {
        if (error.response?.data?.code === 1600200) {
          console.log(`⏳ ${keyword} - Too Many Requests, attente...`);
          await new Promise(r => setTimeout(r, 10000)); // Attendre 10 secondes
        } else {
          console.log(`❌ ${keyword} - Erreur:`, error.response?.data?.message || error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

searchProductByName();
