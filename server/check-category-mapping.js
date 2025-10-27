const { PrismaClient } = require('@prisma/client');

async function checkCategoryMapping() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 === VÉRIFICATION MAPPING CATÉGORIES ===\n');
    
    // 1. Vérifier le fournisseur CJ
    const cjSupplier = await prisma.supplier.findFirst({
      where: { name: 'CJ Dropshipping' }
    });
    console.log('🏢 Fournisseur CJ Dropshipping:', cjSupplier ? `ID: ${cjSupplier.id}` : 'NON TROUVÉ');
    
    // 2. Vérifier les produits CJ dans le magasin
    const cjStoreProducts = await prisma.cJProductStore.findMany({
      select: { id: true, name: true, category: true, status: true }
    });
    console.log(`\n📦 Produits dans CJProductStore: ${cjStoreProducts.length}`);
    cjStoreProducts.slice(0, 3).forEach(p => {
      console.log(`   - ${p.name} | Catégorie: "${p.category}" | Status: ${p.status}`);
    });
    
    // 3. Vérifier les produits CJ importés dans Product
    const cjProducts = await prisma.product.findMany({
      where: cjSupplier ? { supplierId: cjSupplier.id } : { supplierId: 'cj-dropshipping' },
      select: { id: true, name: true, categoryId: true, source: true },
      take: 5
    });
    console.log(`\n�️ Produits CJ importés dans Product: ${cjProducts.length}`);
    cjProducts.forEach(p => {
      console.log(`   - ${p.name} | Catégorie ID: ${p.categoryId || 'NULL'} | Source: ${p.source}`);
    });
    
    // 4. Vérifier les catégories non mappées
    const unmappedCategories = await prisma.unmappedExternalCategory.findMany({
      where: cjSupplier ? { supplierId: cjSupplier.id } : { supplierId: 'cj-dropshipping' }
    });
    console.log(`\n🏷️ Catégories non mappées pour CJ: ${unmappedCategories.length}`);
    unmappedCategories.forEach(cat => {
      console.log(`   - "${cat.externalCategory}" | Produits: ${cat.productCount} | Supplier ID: ${cat.supplierId}`);
    });
    
    // 5. Vérifier TOUTES les catégories non mappées (au cas où il y aurait un problème d'ID)
    const allUnmappedCategories = await prisma.unmappedExternalCategory.findMany();
    console.log(`\n📋 TOUTES les catégories non mappées: ${allUnmappedCategories.length}`);
    allUnmappedCategories.forEach(cat => {
      console.log(`   - "${cat.externalCategory}" | Produits: ${cat.productCount} | Supplier ID: ${cat.supplierId}`);
    });
    
    // 6. Vérifier les mappings existants
    const existingMappings = await prisma.categoryMapping.findMany({
      where: cjSupplier ? { supplierId: cjSupplier.id } : { supplierId: 'cj-dropshipping' }
    });
    console.log(`\n🔗 Mappings existants pour CJ: ${existingMappings.length}`);
        console.log(`   - Créé: ${product.createdAt}`);
        console.log('   ---');
      });
    }
    
    // 2. Vérifier les produits CJ avec différentes variations de cette catégorie
    const cjProducts = await prisma.cJProductStore.findMany({
      where: {
        category: {
          contains: "Men's Clothing"
        }
      }
    });
    
    console.log(`\n📦 Produits CJ avec catégorie similaire: ${cjProducts.length}`);
    
    if (cjProducts.length > 0) {
      console.log('\n📋 Détails des produits CJ:');
      cjProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name.substring(0, 50)}...`);
        console.log(`   - Status: ${product.status}`);
        console.log(`   - Catégorie: ${product.category}`);
        console.log(`   - Créé: ${product.createdAt}`);
        console.log('   ---');
      });
    }
    
    // 3. Vérifier tous les produits par status
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Répartition des produits par status:');
    statusCounts.forEach(group => {
      console.log(`   - ${group.status}: ${group._count.id} produits`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryMapping();