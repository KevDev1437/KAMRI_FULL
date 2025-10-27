const { PrismaClient } = require('@prisma/client');

async function testCJImportFromSuppliers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 === TEST IMPORT CJ DEPUIS FOURNISSEURS ===\n');
    
    // 1. Vérifier l'état avant import
    const cjSupplier = await prisma.supplier.findFirst({
      where: { name: 'CJ Dropshipping' }
    });
    console.log('🏢 Fournisseur CJ:', cjSupplier ? `ID: ${cjSupplier.id}` : 'NON TROUVÉ');
    
    // 2. Mettre quelques produits en statut 'available' pour simuler
    const availableProducts = await prisma.cJProductStore.updateMany({
      where: { status: 'imported' },
      data: { status: 'available' }
    });
    console.log(`✅ ${availableProducts.count} produits remis en statut 'available'`);
    
    // 3. Vérifier les produits disponibles
    const storeProducts = await prisma.cJProductStore.findMany({
      where: { status: 'available' },
      select: { id: true, name: true, category: true }
    });
    console.log(`\n📦 Produits disponibles dans le magasin: ${storeProducts.length}`);
    storeProducts.forEach(p => {
      console.log(`   - ${p.name} | Catégorie: "${p.category}"`);
    });
    
    // 4. Vérifier les mappings existants
    const mappings = await prisma.categoryMapping.findMany({
      where: { supplierId: cjSupplier.id }
    });
    console.log(`\n🔗 Mappings existants: ${mappings.length}`);
    mappings.forEach(m => {
      console.log(`   - "${m.externalCategory}" -> "${m.internalCategory}"`);
    });
    
    // 5. Compter les produits avant import
    const productsBefore = await prisma.product.count({
      where: { supplierId: cjSupplier.id }
    });
    console.log(`\n📊 Produits CJ dans Product avant import: ${productsBefore}`);
    
    console.log('\n🔄 Maintenant, allez sur la page fournisseurs et cliquez sur "Importer" pour CJ Dropshipping...');
    console.log('Puis relancez ce script pour voir les résultats.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCJImportFromSuppliers();