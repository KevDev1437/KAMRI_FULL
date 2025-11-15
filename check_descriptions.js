const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n📝 === ANALYSE DES DESCRIPTIONS DE PRODUITS ===\n');
    
    // 1. Récupérer tous les produits CJ
    const products = await prisma.product.findMany({
      where: {
        cjProductId: { not: null }
      },
      select: {
        id: true,
        name: true,
        description: true,
        cjProductId: true,
        supplier: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total produits CJ: ${products.length}\n`);
    
    // 2. Analyser chaque produit
    let withDesc = 0;
    let withoutDesc = 0;
    let shortDesc = 0;
    let longDesc = 0;
    
    products.forEach((p, i) => {
      console.log(`\n${i+1}. ${p.name.substring(0, 60)}${p.name.length > 60 ? '...' : ''}`);
      console.log(`   Fournisseur: ${p.supplier?.name || 'N/A'}`);
      console.log(`   CJ PID: ${p.cjProductId}`);
      
      if (p.description && p.description.length > 0) {
        withDesc++;
        const length = p.description.length;
        
        if (length < 50) {
          shortDesc++;
          console.log(`   ⚠️  Description COURTE: ${length} caractères`);
        } else if (length < 200) {
          console.log(`   ✅ Description OK: ${length} caractères`);
        } else {
          longDesc++;
          console.log(`   ✅ Description LONGUE: ${length} caractères`);
        }
        
        const preview = p.description.substring(0, 150).replace(/\n/g, ' ').replace(/\s+/g, ' ');
        console.log(`   📄 "${preview}${length > 150 ? '...' : ''}"`);
      } else {
        withoutDesc++;
        console.log(`   ❌ SANS DESCRIPTION`);
      }
    });
    
    // 3. Statistiques globales
    console.log('\n\n==============================================');
    console.log('📊 STATISTIQUES GLOBALES');
    console.log('==============================================');
    console.log(`Total: ${products.length} produits`);
    console.log(`✅ Avec description: ${withDesc} (${Math.round(withDesc/products.length*100)}%)`);
    console.log(`   - Descriptions courtes (<50 car): ${shortDesc}`);
    console.log(`   - Descriptions normales (50-200): ${withDesc - shortDesc - longDesc}`);
    console.log(`   - Descriptions longues (>200): ${longDesc}`);
    console.log(`❌ Sans description: ${withoutDesc} (${Math.round(withoutDesc/products.length*100)}%)`);
    console.log('==============================================\n');
    
    await prisma.$disconnect();
  } catch (e) {
    console.error('❌ Erreur:', e.message);
    console.error(e.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

