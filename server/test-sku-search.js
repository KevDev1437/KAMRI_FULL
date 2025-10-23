const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const SKU = 'CJXX199380019SH';

async function searchSKU() {
  try {
    console.log('🔍 Recherche du SKU:', SKU);
    
    // Authentification
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 2s
    await new Promise(r => setTimeout(r, 2000));
    
    // Recherche
    const search = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
      headers: { 'CJ-Access-Token': token },
      params: {
        keyword: SKU,
        pageNum: 1,
        pageSize: 20,
        sortBy: 'relevance'
      }
    });
    
    console.log('📊 Résultats:', search.data.data?.total || 0, 'produits');
    
    if (search.data.data?.list?.length > 0) {
      search.data.data.list.forEach((p, i) => {
        console.log(`\nProduit ${i+1}:`);
        console.log('- Nom:', p.productName || p.productNameEn);
        console.log('- SKU:', p.productSku);
        console.log('- Prix:', p.productSellPrice);
        console.log('- Statut:', p.productStatus);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

searchSKU();
