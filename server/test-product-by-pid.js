const axios = require('axios');

const CJ_EMAIL = 'projectskevin834@gmail.com';
const CJ_API_KEY = '158334f3282c4e3f9b077193903daeca';
const TARGET_PID = 'E5204DA5-5559-42CC-801F-24207A2D2168'; // Le PID de l'URL
const TARGET_VARIANT_SKU = 'CJNSSYTZ00854-Black-3XL'; // Le SKU de variante que vous cherchez

async function getProductDetailsByPID() {
  try {
    console.log('🔍 === RECHERCHE PRODUIT PAR PID ===');
    console.log('🎯 PID ciblé:', TARGET_PID);
    console.log('🎯 SKU de variante ciblé:', TARGET_VARIANT_SKU);
    
    // Authentification
    console.log('\n🔐 Étape 1: Authentification...');
    const auth = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: CJ_EMAIL,
      apiKey: CJ_API_KEY
    });
    
    const token = auth.data.data.accessToken;
    console.log('✅ Token obtenu');
    
    // Attendre 3 secondes après l'auth pour respecter les limites
    console.log('⏳ Attente 3 secondes après authentification...');
    await new Promise(r => setTimeout(r, 3000));
    
    // 2. Obtenir les détails du produit par PID
    console.log('\n📦 Étape 2: Récupération des détails du produit par PID...');
    const productDetailResponse = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/detail', {
      headers: { 'CJ-Access-Token': token },
      params: {
        pid: TARGET_PID
      }
    });

    if (productDetailResponse.data.code !== 200) {
      throw new Error(`Erreur lors de la récupération des détails du produit: ${productDetailResponse.data.message}`);
    }

    const product = productDetailResponse.data.data;
    if (!product) {
      console.log('❌ Produit non trouvé pour le PID:', TARGET_PID);
      return;
    }

    console.log('✅ Détails du produit trouvés:');
    console.log('   - Nom:', product.productName);
    console.log('   - PID:', product.pid);
    console.log('   - Nombre de variantes:', product.productVariants?.length || 0);

    // 3. Rechercher le SKU de variante spécifique
    console.log('\n🔍 Étape 3: Recherche du SKU de variante spécifique...');
    
    if (product.productVariants && product.productVariants.length > 0) {
      const foundVariant = product.productVariants.find(variant => variant.variantSku === TARGET_VARIANT_SKU);

      if (foundVariant) {
        console.log('🎉 SKU de variante trouvé !');
        console.log('   - Nom de la variante:', foundVariant.variantName);
        console.log('   - SKU de la variante:', foundVariant.variantSku);
        console.log('   - Prix de la variante:', foundVariant.sellPrice);
        console.log('   - Poids de la variante:', foundVariant.variantWeight);
        console.log('   - Statut de la variante:', foundVariant.variantStatus);
      } else {
        console.log('❌ SKU de variante non trouvé parmi les variantes du produit.');
        console.log('   Variantes disponibles (premiers 10 SKUs):', 
          product.productVariants.slice(0, 10).map(v => v.variantSku));
      }
    } else {
      console.log('❌ Aucune variante trouvée pour ce produit');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response ? error.response.data : error.message);
  }
}

getProductDetailsByPID();
