async function testSupplierData() {
  console.log('🔍 Test des données fournisseur avec produits détaillés...\n');
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // Rechercher un fournisseur avec des produits CJ
    const supplier = await prisma.supplier.findFirst({
      where: {
        products: {
          some: {
            source: 'cj-dropshipping'
          }
        }
      },
      include: {
        products: {
          where: {
            source: 'cj-dropshipping'
          },
          take: 2
        }
      }
    });
    
    if (supplier) {
      console.log('✅ Fournisseur avec produits CJ trouvé:');
      console.log('Nom:', supplier.name);
      console.log('Nombre de produits CJ:', supplier.products.length);
      
      if (supplier.products.length > 0) {
        const product = supplier.products[0];
        console.log('\n📦 Premier produit CJ:');
        console.log('- Nom:', product.name);
        console.log('- SKU CJ:', product.productSku || 'N/A');
        console.log('- Poids:', product.productWeight || 'N/A');
        console.log('- Matériau:', product.materialNameEn || 'N/A');
        console.log('- Prix suggéré:', product.suggestSellPrice || 'N/A');
        
        if (product.variants) {
          try {
            const variants = JSON.parse(product.variants);
            console.log('- Variants:', variants.length + ' disponibles');
            
            const colors = [...new Set(variants.map(v => v.variantKey?.split('-')[0]).filter(Boolean))];
            const sizes = [...new Set(variants.map(v => v.variantKey?.split('-')[1]).filter(Boolean))];
            
            console.log('- Couleurs:', colors.slice(0, 3).join(', ') + (colors.length > 3 ? '...' : ''));
            console.log('- Tailles:', sizes.slice(0, 5).join(', ') + (sizes.length > 5 ? '...' : ''));
          } catch (e) {
            console.log('- Variants: Erreur parsing');
          }
        }
      }
    } else {
      console.log('❌ Aucun fournisseur avec produits CJ trouvé');
      
      // Vérifier s'il y a des produits CJ du tout
      const cjProducts = await prisma.product.count({
        where: { source: 'cj-dropshipping' }
      });
      console.log('Produits CJ total dans la DB:', cjProducts);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSupplierData();