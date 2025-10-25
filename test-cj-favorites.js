const axios = require('axios');

// 🔑 Configuration CJ Dropshipping
const CJ_CONFIG = {
  email: 'projectskevin834@gmail.com',
  apiKey: '158334f3282c4e3f9b077193903daeca',
  baseUrl: 'https://developers.cjdropshipping.com/api2.0/v1'
};

// 🔐 Fonction d'authentification
async function authenticateCJ() {
  console.log('🔑 === AUTHENTIFICATION CJ ===');
  console.log(`📧 Email: ${CJ_CONFIG.email}`);
  console.log(`🔑 API Key: ${CJ_CONFIG.apiKey.substring(0, 8)}...`);
  
  try {
    const response = await fetch(`${CJ_CONFIG.baseUrl}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: CJ_CONFIG.email,
        apiKey: CJ_CONFIG.apiKey
      })
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      console.log('✅ Authentification réussie');
      console.log(`🎫 Token: ${data.data.accessToken.substring(0, 20)}...`);
      return data.data.accessToken;
    } else {
      throw new Error(`Erreur auth: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Erreur authentification:', error.message);
    throw error;
  }
}

// 📦 Fonction pour récupérer les favoris
async function getFavorites(token, pageNumber = 1, pageSize = 10) {
  console.log(`\n📦 === RÉCUPÉRATION PAGE ${pageNumber} ===`);
  console.log(`📄 Page: ${pageNumber}, Taille: ${pageSize}`);
  
  try {
    const response = await axios.get(`${CJ_CONFIG.baseUrl}/product/myProduct/query`, {
      headers: {
        'CJ-Access-Token': token
      },
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize
      }
    });
    
    if (response.data.code === 200) {
      const data = response.data.data;
      console.log(`✅ Page ${pageNumber} récupérée`);
      console.log(`📊 Total: ${data.totalRecords}, Pages: ${data.totalPages}`);
      console.log(`📦 Produits: ${data.content.length}`);
      
      // 🔍 Analyser les produits
      if (data.content.length > 0) {
        console.log(`\n🔍 === ANALYSE DES PRODUITS PAGE ${pageNumber} ===`);
        data.content.forEach((product, index) => {
          console.log(`${index + 1}. PID: ${product.productId}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   Nom: ${product.nameEn}`);
          console.log(`   Prix: ${product.sellPrice}`);
          console.log(`   Image: ${product.bigImage ? '✅' : '❌'}`);
          console.log('');
        });
      }
      
      return data;
    } else {
      throw new Error(`Erreur API: ${response.data.message}`);
    }
  } catch (error) {
    console.error(`❌ Erreur page ${pageNumber}:`, error.message);
    throw error;
  }
}

// 🔍 Fonction pour détecter les doublons
function detectDuplicates(allProducts) {
  console.log('\n🔍 === DÉTECTION DES DOUBLONS ===');
  
  const pids = allProducts.map(p => p.productId);
  const uniquePids = [...new Set(pids)];
  
  console.log(`📊 Total produits: ${allProducts.length}`);
  console.log(`📊 PIDs uniques: ${uniquePids.length}`);
  console.log(`📊 Doublons: ${allProducts.length - uniquePids.length}`);
  
  if (pids.length !== uniquePids.length) {
    console.log('⚠️ DOUBLONS DÉTECTÉS !');
    const duplicates = pids.filter((pid, index) => pids.indexOf(pid) !== index);
    console.log(`🔄 PIDs dupliqués: ${duplicates.join(', ')}`);
  } else {
    console.log('✅ Aucun doublon détecté');
  }
}

// 🚀 Fonction principale
async function main() {
  console.log('🚀 === SCRIPT DE TEST CJ FAVORITES ===');
  console.log('📅 Date:', new Date().toISOString());
  
  try {
    // 1. Authentification
    const token = await authenticateCJ();
    
    // 2. Récupérer page 1
    const page1 = await getFavorites(token, 1, 10);
    
    // 3. Récupérer page 2
    const page2 = await getFavorites(token, 2, 10);
    
    // 4. Analyser les doublons
    const allProducts = [...page1.content, ...page2.content];
    detectDuplicates(allProducts);
    
    // 5. Résumé final
    console.log('\n📊 === RÉSUMÉ FINAL ===');
    console.log(`📦 Page 1: ${page1.content.length} produits`);
    console.log(`📦 Page 2: ${page2.content.length} produits`);
    console.log(`📦 Total: ${allProducts.length} produits`);
    console.log(`📊 Total API: ${page1.totalRecords} favoris`);
    console.log(`📊 Pages API: ${page1.totalPages} pages`);
    
  } catch (error) {
    console.error('💥 Erreur script:', error.message);
    process.exit(1);
  }
}

// 🎯 Exécution
main();