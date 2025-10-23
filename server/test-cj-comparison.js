const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';

// SKU que vous avez trouvé sur le site web
const WEB_SKU = 'CJNSSYTZ00854-Black-3XL';

async function compareWebVsAPI() {
  try {
    console.log('🔍 === COMPARAISON SITE WEB vs API ===');
    console.log('🎯 SKU du site web:', WEB_SKU);
    
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
    
    // Test 1: Recherche exacte par SKU
    console.log('\n🔍 Test 1: Recherche exacte par SKU');
    try {
      const exactSearch = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        headers: { 'CJ-Access-Token': token },
        params: {
          keyword: WEB_SKU,
          pageNum: 1,
          pageSize: 50,
          sortBy: 'relevance'
        }
      });
      
      const exactProducts = exactSearch.data.data?.list || [];
      console.log(`📊 Recherche exacte: ${exactProducts.length} produits trouvés`);
      
      if (exactProducts.length > 0) {
        const found = exactProducts.find(p => p.productSku === WEB_SKU);
        if (found) {
          console.log('✅ SKU exact trouvé !');
          console.log('   Nom:', found.productName);
          console.log('   SKU:', found.productSku);
        } else {
          console.log('❌ SKU exact non trouvé dans les résultats');
        }
      }
    } catch (error) {
      console.log('❌ Erreur recherche exacte:', error.response?.data?.message);
    }
    
    // Attendre 3 secondes
    await new Promise(r => setTimeout(r, 3000));
    
    // Test 2: Recherche par parties du SKU
    console.log('\n🔍 Test 2: Recherche par parties du SKU');
    const skuParts = [
      'CJNSSYTZ00854',
      'CJNSSYTZ',
      '00854',
      'Black',
      '3XL'
    ];
    
    for (const part of skuParts) {
      try {
        console.log(`\n   Recherche: "${part}"`);
        const partSearch = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
          headers: { 'CJ-Access-Token': token },
          params: {
            keyword: part,
            pageNum: 1,
            pageSize: 20,
            sortBy: 'relevance'
          }
        });
        
        const partProducts = partSearch.data.data?.list || [];
        console.log(`   📊 ${partProducts.length} produits trouvés`);
        
        if (partProducts.length > 0) {
          const found = partProducts.find(p => p.productSku === WEB_SKU);
          if (found) {
            console.log('   ✅ SKU trouvé avec cette partie !');
            break;
          }
        }
        
        // Attendre 2 secondes entre les recherches
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (error) {
        console.log(`   ❌ Erreur avec "${part}":`, error.response?.data?.message);
      }
    }
    
    // Test 3: Recherche avec différents paramètres
    console.log('\n🔍 Test 3: Recherche avec différents paramètres');
    const searchParams = [
      { keyword: WEB_SKU, searchType: 0 },
      { keyword: WEB_SKU, searchType: 1 },
      { keyword: WEB_SKU, productType: 'ORDINARY_PRODUCT' },
      { keyword: WEB_SKU, productType: 'ALL' }
    ];
    
    for (const params of searchParams) {
      try {
        console.log(`\n   Paramètres:`, params);
        const paramSearch = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
          headers: { 'CJ-Access-Token': token },
          params: {
            ...params,
            pageNum: 1,
            pageSize: 20,
            sortBy: 'relevance'
          }
        });
        
        const paramProducts = paramSearch.data.data?.list || [];
        console.log(`   📊 ${paramProducts.length} produits trouvés`);
        
        if (paramProducts.length > 0) {
          const found = paramProducts.find(p => p.productSku === WEB_SKU);
          if (found) {
            console.log('   ✅ SKU trouvé avec ces paramètres !');
            break;
          }
        }
        
        // Attendre 2 secondes entre les recherches
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (error) {
        console.log(`   ❌ Erreur avec ces paramètres:`, error.response?.data?.message);
      }
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('Si aucun test ne trouve le SKU, cela confirme que:');
    console.log('1. Le site web et l\'API utilisent des données différentes');
    console.log('2. L\'API a des restrictions que le site web n\'a pas');
    console.log('3. Il y a un délai de synchronisation entre les deux');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

compareWebVsAPI();

