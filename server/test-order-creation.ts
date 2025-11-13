import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrderCreation() {
  try {
    // Test avec un utilisateur existant
    const user = await prisma.user.findFirst({
      where: {
        email: 'test@kamri.com'
      }
    });

    if (!user) {
      console.error('❌ Utilisateur test@kamri.com introuvable');
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.id} (${user.email})`);

    // Test avec un produit existant
    const product = await prisma.product.findFirst({
      where: {
        status: 'active'
      },
      include: {
        productVariants: {
          where: {
            isActive: true
          },
          take: 1
        }
      }
    });

    if (!product) {
      console.error('❌ Aucun produit actif trouvé');
      return;
    }

    console.log(`✅ Produit trouvé: ${product.id} (${product.name})`);

    // Vérifier si le produit a des variants
    if (product.productVariants && product.productVariants.length > 0) {
      const variant = product.productVariants[0];
      console.log(`✅ Variant trouvé: ${variant.id} (cjVariantId: ${variant.cjVariantId || 'N/A'})`);

      // Tester la création avec variantId
      console.log('\n🧪 Test création commande AVEC variantId...');
      try {
        const orderWithVariant = await prisma.order.create({
          data: {
            userId: user.id,
            total: product.price * 1,
            items: {
              create: {
                productId: product.id,
                quantity: 1,
                price: product.price,
                variantId: variant.id
              }
            }
          }
        });
        console.log(`✅ Commande créée avec variantId: ${orderWithVariant.id}`);
        
        // Nettoyer
        await prisma.order.delete({ where: { id: orderWithVariant.id } });
        console.log('✅ Commande de test supprimée');
      } catch (error: any) {
        console.error(`❌ Erreur création avec variantId:`, error.message);
        console.error(`   Code: ${error.code}`);
        console.error(`   Meta:`, JSON.stringify(error.meta, null, 2));
      }
    } else {
      console.log('⚠️ Produit sans variants actifs');
    }

    // Tester la création SANS variantId
    console.log('\n🧪 Test création commande SANS variantId...');
    try {
      const orderWithoutVariant = await prisma.order.create({
        data: {
          userId: user.id,
          total: product.price * 1,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: product.price
              // Pas de variantId
            }
          }
        }
      });
      console.log(`✅ Commande créée sans variantId: ${orderWithoutVariant.id}`);
      
      // Nettoyer
      await prisma.order.delete({ where: { id: orderWithoutVariant.id } });
      console.log('✅ Commande de test supprimée');
    } catch (error: any) {
      console.error(`❌ Erreur création sans variantId:`, error.message);
      console.error(`   Code: ${error.code}`);
      console.error(`   Meta:`, JSON.stringify(error.meta, null, 2));
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreation();
