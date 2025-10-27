const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVariantDetails() {
  console.log('🔍 Test détaillé des variants CJ...\n');

  try {
    // 1. Récupérer un produit avec ses variants
    const cjProduct = await prisma.cJProductStore.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!cjProduct) {
      console.log('❌ Aucun produit CJ trouvé');
      return;
    }

    console.log('📦 Produit trouvé:');
    console.log(`   - Nom: ${cjProduct.name}`);
    console.log(`   - CJ Product ID: ${cjProduct.cjProductId}`);
    console.log('');

    // 2. Analyser les variants en détail
    if (cjProduct.variants) {
      const variants = typeof cjProduct.variants === 'string' 
        ? JSON.parse(cjProduct.variants) 
        : cjProduct.variants;
      
      console.log(`✅ Nombre de variants: ${variants.length}`);
      console.log('');

      // Afficher les 3 premiers variants avec tous leurs détails
      variants.slice(0, 3).forEach((variant, index) => {
        console.log(`📋 Variant ${index + 1}:`);
        console.log(`   - vid: ${variant.vid || 'N/A'}`);
        console.log(`   - variantSku: ${variant.variantSku || 'N/A'}`);
        console.log(`   - variantNameEn: ${variant.variantNameEn || 'N/A'}`);
        console.log(`   - variantKey: ${variant.variantKey || 'N/A'}`);
        console.log(`   - variantSellPrice: ${variant.variantSellPrice || 'N/A'}`);
        console.log(`   - variantWeight: ${variant.variantWeight || 'N/A'}`);
        console.log(`   - variantImage: ${variant.variantImage || 'N/A'}`);
        console.log(`   - variantLength: ${variant.variantLength || 'N/A'}`);
        console.log(`   - variantWidth: ${variant.variantWidth || 'N/A'}`);
        console.log(`   - variantHeight: ${variant.variantHeight || 'N/A'}`);
        console.log(`   - variantStandard: ${variant.variantStandard || 'N/A'}`);
        console.log(`   - variantSugSellPrice: ${variant.variantSugSellPrice || 'N/A'}`);
        console.log(`   - combineVariants: ${variant.combineVariants ? JSON.stringify(variant.combineVariants).slice(0, 50) + '...' : 'N/A'}`);
        console.log('');
      });

      // 3. Tester notre API
      console.log('🌐 Test de notre API...');
      const response = await fetch(`http://localhost:3001/api/cj-dropshipping/products/${cjProduct.cjProductId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiData = await response.json();
        console.log(`✅ API Response - Nom: ${apiData.productName}`);
        console.log(`✅ API Response - Variants: ${apiData.variants?.length || 0}`);
        
        if (apiData.variants && apiData.variants.length > 0) {
          console.log('\n📋 Premier variant depuis API:');
          const apiVariant = apiData.variants[0];
          Object.keys(apiVariant).forEach(key => {
            console.log(`   - ${key}: ${apiVariant[key] || 'N/A'}`);
          });
        }
      } else {
        console.log('❌ Erreur API:', response.status);
      }

    } else {
      console.log('❌ Aucun variant trouvé dans le produit');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantDetails();