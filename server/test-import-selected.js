const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImportSelectedProducts() {
  try {
    console.log('🔍 Test de l\'importation des produits sélectionnés...\n');
    
    // 1. Vérifier les produits sélectionnés
    const selectedProducts = await prisma.cJProductStore.findMany({
      where: { status: 'selected' }
    });
    
    console.log(`📦 Produits sélectionnés: ${selectedProducts.length}`);
    selectedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Status: ${product.status}`);
    });
    
    // 2. Vérifier le fournisseur CJ
    const cjSupplier = await prisma.supplier.findFirst({
      where: { name: 'CJ Dropshipping' }
    });
    
    if (cjSupplier) {
      console.log(`\n✅ Fournisseur CJ trouvé: ${cjSupplier.id}`);
    } else {
      console.log('\n❌ Fournisseur CJ non trouvé');
      return;
    }
    
    // 3. Vérifier les produits KAMRI existants
    const existingProducts = await prisma.product.findMany({
      where: { supplierId: cjSupplier.id }
    });
    
    console.log(`\n📋 Produits KAMRI existants du fournisseur CJ: ${existingProducts.length}`);
    existingProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Status: ${product.status}`);
    });
    
    // 4. Test d'importation simulé
    if (selectedProducts.length > 0) {
      console.log('\n🚀 Simulation d\'importation...');
      
      for (const cjProduct of selectedProducts) {
        console.log(`\n🔄 Traitement: ${cjProduct.name}`);
        console.log(`   - Prix: $${cjProduct.price}`);
        console.log(`   - Description: ${cjProduct.description?.substring(0, 100)}...`);
        console.log(`   - Catégorie: ${cjProduct.category}`);
        console.log(`   - Sera assigné au fournisseur: ${cjSupplier.id}`);
        
        // Vérifier si le produit existe déjà
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: cjProduct.name,
            supplierId: cjSupplier.id
          }
        });
        
        if (existingProduct) {
          console.log(`   ⚠️  Produit déjà existant avec ID: ${existingProduct.id}`);
        } else {
          console.log(`   ✅ Nouveau produit, prêt à être importé`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImportSelectedProducts();