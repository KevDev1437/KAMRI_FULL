const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCJProductDetails() {
  console.log('🔍 Test de récupération des détails d\'un produit CJ...\n');

  try {
    // 1. D'abord, récupérons un produit depuis la base pour avoir son PID
    const cjProduct = await prisma.cJProductStore.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!cjProduct) {
      console.log('❌ Aucun produit CJ trouvé dans la base');
      return;
    }

    console.log('📦 Produit trouvé dans la base:');
    console.log(`   - Nom: ${cjProduct.productName}`);
    console.log(`   - PID: ${cjProduct.pid}`);
    console.log(`   - SKU: ${cjProduct.productSku}`);
    console.log('');

    // 2. Testons l'appel direct à l'API backend
    console.log('🌐 Test de l\'appel API backend...');
    
    const response = await fetch(`http://localhost:3001/api/cj-dropshipping/product-details/${cjProduct.pid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiData = await response.json();
    
    console.log('✅ Réponse API reçue !');
    console.log('📋 Structure de la réponse:');
    console.log(JSON.stringify(apiData, null, 2));

    // 3. Analysons les champs critiques
    console.log('\n🔍 Analyse des champs critiques:');
    console.log(`   - pid: ${apiData.pid || 'MANQUANT'}`);
    console.log(`   - productName: ${apiData.productName || 'MANQUANT'}`);
    console.log(`   - productNameEn: ${apiData.productNameEn || 'MANQUANT'}`);
    console.log(`   - sellPrice: ${apiData.sellPrice || 'MANQUANT'}`);
    console.log(`   - suggestSellPrice: ${apiData.suggestSellPrice || 'MANQUANT'} (type: ${typeof apiData.suggestSellPrice})`);
    console.log(`   - productWeight: ${apiData.productWeight || 'MANQUANT'}`);
    console.log(`   - packingWeight: ${apiData.packingWeight || 'MANQUANT'}`);
    console.log(`   - productUnit: ${apiData.productUnit || 'MANQUANT'}`);
    console.log(`   - productType: ${apiData.productType || 'MANQUANT'}`);
    console.log(`   - entryCode: ${apiData.entryCode || 'MANQUANT'}`);
    console.log(`   - materialName: ${apiData.materialName || 'MANQUANT'}`);
    console.log(`   - materialNameEn: ${apiData.materialNameEn || 'MANQUANT'}`);
    console.log(`   - supplierName: ${apiData.supplierName || 'MANQUANT'}`);
    console.log(`   - listedNum: ${apiData.listedNum || 'MANQUANT'}`);
    console.log(`   - status: ${apiData.status || 'MANQUANT'}`);
    
    // 4. Vérifier les variants
    if (apiData.variants && Array.isArray(apiData.variants)) {
      console.log(`\n🔧 Variants trouvés: ${apiData.variants.length}`);
      if (apiData.variants.length > 0) {
        const firstVariant = apiData.variants[0];
        console.log('   Premier variant:');
        console.log(`     - vid: ${firstVariant.vid || 'MANQUANT'}`);
        console.log(`     - variantSku: ${firstVariant.variantSku || 'MANQUANT'}`);
        console.log(`     - variantSellPrice: ${firstVariant.variantSellPrice || 'MANQUANT'}`);
        console.log(`     - variantKey: ${firstVariant.variantKey || 'MANQUANT'}`);
        console.log(`     - variantWeight: ${firstVariant.variantWeight || 'MANQUANT'}`);
      }
    } else {
      console.log('\n❌ Aucun variant trouvé ou variants mal formatés');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testCJProductDetails();