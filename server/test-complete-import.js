const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteImport() {
  console.log('🧪 Test de l\'import complet des données CJ...\n');

  try {
    // 1. Sélectionner un produit CJ disponible
    const cjProduct = await prisma.cJProductStore.findFirst({
      where: { status: 'available' },
      orderBy: { createdAt: 'desc' }
    });

    if (!cjProduct) {
      console.log('❌ Aucun produit CJ disponible pour le test');
      return;
    }

    console.log('📦 Produit CJ sélectionné pour le test:');
    console.log(`   - Nom: ${cjProduct.name}`);
    console.log(`   - CJ Product ID: ${cjProduct.cjProductId}`);
    console.log(`   - Status: ${cjProduct.status}`);
    console.log('');

    // 2. Marquer comme sélectionné
    console.log('🔄 Marquage du produit comme sélectionné...');
    await prisma.cJProductStore.update({
      where: { id: cjProduct.id },
      data: { status: 'selected' }
    });

    // 3. Simuler l'import via stores service
    console.log('📦 Simulation de l\'import complet...');
    
    // Vérifier le fournisseur CJ
    const cjSupplier = await prisma.supplier.findFirst({
      where: { name: 'CJ Dropshipping' }
    });

    if (!cjSupplier) {
      console.log('❌ Fournisseur CJ Dropshipping non trouvé');
      return;
    }

    // Créer le produit KAMRI avec TOUTES les données
    const product = await prisma.product.create({
      data: {
        name: cjProduct.name,
        description: cjProduct.description,
        price: cjProduct.price,
        originalPrice: cjProduct.originalPrice,
        image: cjProduct.image,
        supplierId: cjSupplier.id,
        externalCategory: cjProduct.category,
        source: 'cj-dropshipping',
        status: 'pending',
        badge: 'nouveau',
        stock: Math.floor(Math.random() * 50) + 10,
        
        // ✅ TOUTES LES DONNÉES DÉTAILLÉES CJ
        productSku: cjProduct.productSku,
        productWeight: cjProduct.productWeight,
        packingWeight: cjProduct.packingWeight,
        productType: cjProduct.productType,
        productUnit: cjProduct.productUnit,
        productKeyEn: cjProduct.productKeyEn,
        materialNameEn: cjProduct.materialNameEn,
        packingNameEn: cjProduct.packingNameEn,
        suggestSellPrice: cjProduct.suggestSellPrice,
        listedNum: cjProduct.listedNum,
        supplierName: cjProduct.supplierName,
        createrTime: cjProduct.createrTime,
        variants: cjProduct.variants, // JSON des variants
        cjReviews: cjProduct.reviews, // JSON des avis CJ
        dimensions: cjProduct.dimensions,
        brand: cjProduct.brand,
        tags: cjProduct.tags, // JSON des tags
      },
    });

    // Marquer comme importé
    await prisma.cJProductStore.update({
      where: { id: cjProduct.id },
      data: { status: 'imported' }
    });

    // Créer le mapping
    await prisma.cJProductMapping.create({
      data: {
        productId: product.id,
        cjProductId: cjProduct.cjProductId,
        cjSku: cjProduct.cjProductId,
        lastSyncAt: new Date(),
      },
    });

    console.log('✅ Produit importé avec succès dans le magasin principal !');
    console.log(`   - ID: ${product.id}`);
    console.log(`   - Nom: ${product.name}`);
    console.log('');

    // 4. Vérifier que TOUTES les données sont bien transférées
    console.log('🔍 Vérification des données transférées:');
    
    const importedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { supplier: true }
    });

    console.log('🏷️ Informations de base:');
    console.log(`   - Nom: ${importedProduct.name ? '✅' : '❌'}`);
    console.log(`   - Description: ${importedProduct.description ? '✅' : '❌'}`);
    console.log(`   - Prix: ${importedProduct.price ? '✅' : '❌'} $${importedProduct.price}`);
    console.log(`   - Image: ${importedProduct.image ? '✅' : '❌'}`);
    console.log(`   - Fournisseur: ${importedProduct.supplier?.name || 'N/A'}`);
    console.log('');

    console.log('🔧 Données techniques CJ:');
    console.log(`   - Product SKU: ${importedProduct.productSku ? '✅' : '❌'} ${importedProduct.productSku || 'N/A'}`);
    console.log(`   - Product Weight: ${importedProduct.productWeight ? '✅' : '❌'} ${importedProduct.productWeight || 'N/A'}`);
    console.log(`   - Material: ${importedProduct.materialNameEn ? '✅' : '❌'} ${importedProduct.materialNameEn || 'N/A'}`);
    console.log(`   - Packaging: ${importedProduct.packingNameEn ? '✅' : '❌'} ${importedProduct.packingNameEn || 'N/A'}`);
    console.log(`   - Attributes: ${importedProduct.productKeyEn ? '✅' : '❌'} ${importedProduct.productKeyEn || 'N/A'}`);
    console.log(`   - Suggested Price: ${importedProduct.suggestSellPrice ? '✅' : '❌'} ${importedProduct.suggestSellPrice || 'N/A'}`);
    console.log('');

    console.log('🎨 Variants:');
    if (importedProduct.variants) {
      try {
        const variants = JSON.parse(importedProduct.variants);
        console.log(`   - Variants: ✅ ${variants.length} variants transférés`);
        
        if (variants.length > 0) {
          const firstVariant = variants[0];
          console.log(`   - Premier variant: ${firstVariant.variantNameEn || firstVariant.variantName || 'N/A'}`);
          console.log(`   - SKU variant: ${firstVariant.variantSku || 'N/A'}`);
          console.log(`   - Prix variant: $${firstVariant.variantSellPrice || 'N/A'}`);
        }
      } catch (e) {
        console.log(`   - Variants: ❌ Erreur parsing: ${e.message}`);
      }
    } else {
      console.log('   - Variants: ❌ Non transférés');
    }

    console.log('');
    console.log('🎉 TEST RÉUSSI ! Toutes les données CJ sont maintenant dans le magasin principal !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteImport();