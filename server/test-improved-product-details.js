const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImprovedProductDetails() {
  console.log('🔍 Test de la nouvelle API de détails produit...\n');

  try {
    // 1. Récupérer un produit depuis la base
    const cjProduct = await prisma.cJProductStore.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!cjProduct) {
      console.log('❌ Aucun produit CJ trouvé dans la base');
      return;
    }

    console.log('📦 Produit trouvé dans la base:');
    console.log(`   - Nom: ${cjProduct.name}`);
    console.log(`   - CJ Product ID: ${cjProduct.cjProductId}`);
    console.log(`   - SKU: ${cjProduct.productSku}`);
    console.log('');

    // 2. Tester l'API avec le cjProductId
    console.log('🌐 Test avec cjProductId...');
    
    try {
      const response = await fetch(`http://localhost:3001/api/cj-dropshipping/products/${cjProduct.cjProductId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`Statut HTTP: ${response.status}`);
      
      if (response.ok) {
        const apiData = await response.json();
        
        console.log('✅ Réponse API réussie !');
        console.log('\n🔍 Analyse des champs critiques:');
        console.log(`   - pid: ${apiData.pid || 'MANQUANT'}`);
        console.log(`   - productName: ${apiData.productName || 'MANQUANT'}`);
        console.log(`   - sellPrice: ${apiData.sellPrice || 'MANQUANT'} $`);
        console.log(`   - suggestSellPrice: "${apiData.suggestSellPrice || 'MANQUANT'}" (type: ${typeof apiData.suggestSellPrice})`);
        console.log(`   - productWeight: ${apiData.productWeight || 'MANQUANT'}`);
        console.log(`   - packingWeight: ${apiData.packingWeight || 'MANQUANT'}`);
        console.log(`   - productUnit: ${apiData.productUnit || 'MANQUANT'}`);
        console.log(`   - productType: ${apiData.productType || 'MANQUANT'}`);
        console.log(`   - materialNameEn: ${apiData.materialNameEn || 'MANQUANT'}`);
        console.log(`   - packingNameEn: ${apiData.packingNameEn || 'MANQUANT'}`);
        console.log(`   - listedNum: ${apiData.listedNum || 'MANQUANT'}`);
        console.log(`   - supplierName: ${apiData.supplierName || 'MANQUANT'}`);
        console.log(`   - productKeyEn: ${apiData.productKeyEn || 'MANQUANT'}`);
        
        // Vérifier les variants
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

        // Vérifier les images
        if (apiData.images && Array.isArray(apiData.images)) {
          console.log(`\n🖼️ Images trouvées: ${apiData.images.length}`);
          console.log(`   - Image principale: ${apiData.productImage || 'MANQUANTE'}`);
        }

      } else {
        const errorText = await response.text();
        console.log(`❌ Erreur API: ${errorText}`);
      }
    } catch (apiError) {
      console.log(`❌ Erreur réseau: ${apiError.message}`);
    }

    // 3. Tester avec le SKU si différent
    if (cjProduct.productSku && cjProduct.productSku !== cjProduct.cjProductId) {
      console.log('\n🌐 Test avec productSku...');
      
      try {
        const response2 = await fetch(`http://localhost:3001/api/cj-dropshipping/products/${cjProduct.productSku}/details`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`Statut HTTP: ${response2.status}`);
        
        if (response2.ok) {
          const apiData2 = await response2.json();
          console.log('✅ Test SKU réussi !');
          console.log(`   - PID récupéré: ${apiData2.pid}`);
          console.log(`   - Prix: ${apiData2.sellPrice} $`);
        } else {
          console.log('❌ Test SKU échoué');
        }
      } catch (apiError2) {
        console.log(`❌ Erreur réseau test SKU: ${apiError2.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testImprovedProductDetails();