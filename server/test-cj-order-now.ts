/**
 * Script de test rapide pour créer une commande CJ
 * Usage: npx ts-node server/test-cj-order-now.ts [ORDER_ID]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreateCJOrder(orderId?: string) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   🧪 TEST CRÉATION COMMANDE CJ');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Vérifier la configuration CJ
    console.log('1️⃣ Vérification configuration CJ...');
    const config = await prisma.cJConfig.findFirst({
      where: { enabled: true },
    });

    if (!config) {
      console.log('❌ Configuration CJ non trouvée ou inactive');
      return;
    }

    console.log(`✅ Configuration active:`);
    console.log(`   Email: ${config.email}`);
    console.log(`   Tier: ${config.tier}`);
    console.log(`   Token valide: ${config.accessToken ? '✅' : '❌'}`);
    console.log(`   Token expire: ${config.tokenExpiry ? new Date(config.tokenExpiry).toLocaleString() : 'N/A'}`);
    
    if (config.tokenExpiry && new Date(config.tokenExpiry) < new Date()) {
      console.log('⚠️ Token expiré - sera renouvelé automatiquement');
    }
    console.log('');

    // 2. Trouver un produit CJ avec variant
    console.log('2️⃣ Recherche produit CJ avec variant...');
    const product = await prisma.product.findFirst({
      where: {
        source: 'cj-dropshipping',
        cjProductId: { not: null },
      },
      include: {
        productVariants: {
          where: {
            isActive: true,
            cjVariantId: { not: null },
          },
          take: 1,
        },
        cjMapping: true,
      },
    });

    if (!product) {
      console.log('❌ Aucun produit CJ trouvé');
      console.log('💡 Importez d\'abord un produit CJ via l\'admin');
      return;
    }

    if (product.productVariants.length === 0) {
      console.log('⚠️ Produit CJ trouvé mais sans variant actif');
      console.log(`   Product ID: ${product.id}`);
      console.log(`   CJ Product ID: ${product.cjProductId}`);
      console.log('💡 Le système utilisera cjProductId comme fallback (non idéal)');
    } else {
      console.log(`✅ Produit trouvé:`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Nom: ${product.name}`);
      console.log(`   CJ Product ID: ${product.cjProductId}`);
      console.log(`   Variant ID: ${product.productVariants[0].cjVariantId}`);
    }
    console.log('');

    // 3. Trouver un utilisateur avec adresse
    console.log('3️⃣ Recherche utilisateur avec adresse...');
    const user = await prisma.user.findFirst({
      where: {
        addresses: {
          some: {
            isDefault: true,
          },
        },
      },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    if (!user) {
      console.log('❌ Aucun utilisateur avec adresse trouvé');
      console.log('💡 Créez un utilisateur avec adresse par défaut');
      return;
    }

    const address = user.addresses[0];
    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Adresse: ${address.street}, ${address.city}, ${address.country}`);
    console.log('');

    // 4. Si ORDER_ID fourni, tester cette commande
    if (orderId) {
      console.log(`4️⃣ Test avec commande existante: ${orderId}...`);
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  cjMapping: true,
                  productVariants: {
                    where: {
                      isActive: true,
                      cjVariantId: { not: null },
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        console.log(`❌ Commande ${orderId} non trouvée`);
        return;
      }

      console.log(`✅ Commande trouvée:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Total: ${order.total}€`);
      console.log(`   Items: ${order.items.length}`);
      
      // Vérifier si mapping existe déjà
      const existingMapping = await prisma.cJOrderMapping.findUnique({
        where: { orderId: order.id },
      });

      if (existingMapping) {
        console.log(`\n⚠️ Commande CJ déjà créée:`);
        console.log(`   CJ Order ID: ${existingMapping.cjOrderId}`);
        console.log(`   Statut: ${existingMapping.status}`);
        console.log(`   Tracking: ${existingMapping.trackNumber || 'N/A'}`);
        console.log(`\n💡 Pour créer une nouvelle commande CJ, utilisez une commande différente`);
        return;
      }

      // Vérifier produits CJ
      const hasCJ = order.items.some(item => 
        item.product.cjMapping !== null || 
        (item.product.cjProductId !== null && item.product.source === 'cj-dropshipping')
      );

      if (!hasCJ) {
        console.log(`\n❌ Cette commande ne contient pas de produits CJ`);
        console.log(`💡 Créez une commande avec des produits CJ`);
        return;
      }

      console.log(`\n✅ Commande prête pour création CJ !`);
      console.log(`\n💡 Pour créer la commande CJ, utilisez:`);
      console.log(`   POST http://localhost:3001/api/orders/${order.id}/create-cj`);
      console.log(`   Headers: Authorization: Bearer YOUR_JWT_TOKEN`);
      
      return;
    }

    // 5. Afficher les instructions pour créer une commande
    console.log('4️⃣ Instructions pour créer une commande de test:\n');
    console.log('📝 Créez une commande via API ou frontend avec:');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Quantity: 1`);
    console.log(`   Price: ${product.price || 29.99}`);
    console.log('');
    console.log('📤 Exemple curl:');
    console.log(`curl -X POST http://localhost:3001/api/orders \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\`);
    console.log(`  -d '{`);
    console.log(`    "items": [{`);
    console.log(`      "productId": "${product.id}",`);
    console.log(`      "quantity": 1,`);
    console.log(`      "price": ${product.price || 29.99}`);
    console.log(`    }]`);
    console.log(`  }'`);
    console.log('');
    console.log('✅ La commande CJ sera créée automatiquement !');
    console.log('📋 Vérifiez les logs du serveur pour voir le processus.');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter
const orderId = process.argv[2];
testCreateCJOrder(orderId);

