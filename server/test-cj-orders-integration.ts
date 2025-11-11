/**
 * Script de test pour l'intégration CJ Orders
 * 
 * Usage:
 *   npx ts-node server/test-cj-orders-integration.ts
 * 
 * Ou via NestJS:
 *   npm run start:dev
 *   # Puis appeler les endpoints via Postman/curl
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test 1: Vérifier qu'un produit CJ avec variant existe
 */
async function test1_CheckCJProduct() {
  console.log('\n🧪 TEST 1: Vérification produit CJ avec variant\n');
  
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
    console.log('❌ Aucun produit CJ trouvé avec variant');
    console.log('💡 Créez d\'abord un produit CJ avec variant via l\'admin');
    return null;
  }

  if (product.productVariants.length === 0) {
    console.log('⚠️ Produit CJ trouvé mais sans variant actif');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   CJ Product ID: ${product.cjProductId}`);
    console.log('💡 Assurez-vous que le produit a au moins un variant avec cjVariantId');
    return null;
  }

  console.log('✅ Produit CJ trouvé:');
  console.log(`   Product ID: ${product.id}`);
  console.log(`   Nom: ${product.name}`);
  console.log(`   CJ Product ID: ${product.cjProductId}`);
  console.log(`   Variant ID: ${product.productVariants[0].id}`);
  console.log(`   CJ Variant ID (vid): ${product.productVariants[0].cjVariantId}`);
  console.log(`   SKU: ${product.productVariants[0].sku || 'N/A'}`);

  return {
    productId: product.id,
    variantId: product.productVariants[0].id,
    cjVariantId: product.productVariants[0].cjVariantId,
  };
}

/**
 * Test 2: Vérifier qu'un utilisateur avec adresse existe
 */
async function test2_CheckUserWithAddress() {
  console.log('\n🧪 TEST 2: Vérification utilisateur avec adresse\n');
  
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
        where: {
          isDefault: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    console.log('❌ Aucun utilisateur trouvé avec adresse par défaut');
    console.log('💡 Créez d\'abord un utilisateur avec adresse via l\'admin');
    return null;
  }

  const address = user.addresses[0];
  console.log('✅ Utilisateur avec adresse trouvé:');
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nom: ${user.firstName} ${user.lastName}`);
  console.log(`   Adresse: ${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);
  console.log(`   Pays: ${address.country}`);

  return {
    userId: user.id,
    addressId: address.id,
  };
}

/**
 * Test 3: Vérifier la configuration CJ
 */
async function test3_CheckCJConfig() {
  console.log('\n🧪 TEST 3: Vérification configuration CJ\n');
  
  const config = await prisma.cJConfig.findFirst({
    where: {
      enabled: true,
    },
  });

  if (!config) {
    console.log('❌ Aucune configuration CJ active trouvée');
    console.log('💡 Configurez CJ Dropshipping via /admin/cj-dropshipping/config');
    return null;
  }

  console.log('✅ Configuration CJ trouvée:');
  console.log(`   Email: ${config.email}`);
  console.log(`   Tier: ${config.tier}`);
  console.log(`   Enabled: ${config.enabled}`);
  console.log(`   Access Token: ${config.accessToken ? '✅ Présent' : '❌ Manquant'}`);
  console.log(`   Token Expiry: ${config.tokenExpiry ? config.tokenExpiry.toISOString() : 'N/A'}`);

  if (config.tokenExpiry && config.tokenExpiry < new Date()) {
    console.log('⚠️ Token CJ expiré ! Il sera renouvelé automatiquement au prochain appel.');
  }

  return config;
}

/**
 * Test 4: Vérifier les commandes existantes avec mapping CJ
 */
async function test4_CheckExistingCJOrders() {
  console.log('\n🧪 TEST 4: Vérification commandes CJ existantes\n');
  
  const mappings = await prisma.cJOrderMapping.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (mappings.length === 0) {
    console.log('ℹ️ Aucune commande CJ trouvée');
    console.log('💡 Créez une commande avec produits CJ pour tester');
    return;
  }

  console.log(`✅ ${mappings.length} commande(s) CJ trouvée(s):\n`);
  
  for (const mapping of mappings) {
    console.log(`   Commande KAMRI: ${mapping.orderId}`);
    console.log(`   Commande CJ: ${mapping.cjOrderId}`);
    console.log(`   Statut CJ: ${mapping.status}`);
    console.log(`   Tracking: ${mapping.trackNumber || 'N/A'}`);
    console.log(`   Créée le: ${mapping.createdAt.toISOString()}`);
    console.log('');
  }
}

/**
 * Test 5: Simuler une vérification de produits CJ dans une commande
 */
async function test5_SimulateHasCJProducts(orderId: string) {
  console.log(`\n🧪 TEST 5: Simulation vérification produits CJ pour commande ${orderId}\n`);
  
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

  console.log(`📦 Commande: ${order.id}`);
  console.log(`   Total: ${order.total}€`);
  console.log(`   Statut: ${order.status}`);
  console.log(`   Items: ${order.items.length}\n`);

  let hasCJ = false;
  for (const item of order.items) {
    const isCJ = item.product.cjMapping !== null || 
                 (item.product.cjProductId !== null && item.product.source === 'cj-dropshipping');
    
    console.log(`   Item: ${item.product.name}`);
    console.log(`     - Produit CJ: ${isCJ ? '✅ OUI' : '❌ NON'}`);
    console.log(`     - CJ Product ID: ${item.product.cjProductId || 'N/A'}`);
    console.log(`     - Source: ${item.product.source || 'N/A'}`);
    console.log(`     - Variants CJ: ${item.product.productVariants.length}`);
    
    if (isCJ) {
      hasCJ = true;
      if (item.product.productVariants.length > 0) {
        console.log(`     - VID: ${item.product.productVariants[0].cjVariantId}`);
      } else {
        console.log(`     ⚠️ Pas de variant CJ trouvé (utilisera cjProductId comme fallback)`);
      }
    }
    console.log('');
  }

  console.log(`\n${hasCJ ? '✅' : '❌'} Produits CJ trouvés: ${hasCJ}`);
  
  if (hasCJ) {
    console.log('💡 Cette commande peut créer une commande CJ');
  } else {
    console.log('💡 Cette commande ne créera PAS de commande CJ (skip)');
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   🧪 TESTS D\'INTÉGRATION CJ ORDERS');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Test 1: Produit CJ
    const productInfo = await test1_CheckCJProduct();
    
    // Test 2: Utilisateur avec adresse
    const userInfo = await test2_CheckUserWithAddress();
    
    // Test 3: Configuration CJ
    const config = await test3_CheckCJConfig();
    
    // Test 4: Commandes existantes
    await test4_CheckExistingCJOrders();

    // Résumé
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`✅ Produit CJ: ${productInfo ? 'Trouvé' : '❌ Manquant'}`);
    console.log(`✅ Utilisateur avec adresse: ${userInfo ? 'Trouvé' : '❌ Manquant'}`);
    console.log(`✅ Configuration CJ: ${config ? 'Active' : '❌ Inactive'}`);

    if (productInfo && userInfo && config) {
      console.log('\n✅ Tous les prérequis sont remplis !');
      console.log('\n💡 Pour tester la création de commande:');
      console.log(`   POST http://localhost:3001/api/orders`);
      console.log(`   Body: {`);
      console.log(`     "items": [{`);
      console.log(`       "productId": "${productInfo.productId}",`);
      console.log(`       "quantity": 1,`);
      console.log(`       "price": 29.99`);
      console.log(`     }]`);
      console.log(`   }`);
      console.log(`   Headers: Authorization: Bearer YOUR_JWT_TOKEN`);
    } else {
      console.log('\n⚠️ Certains prérequis manquent. Configurez-les avant de tester.');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

export { test1_CheckCJProduct, test2_CheckUserWithAddress, test3_CheckCJConfig, test5_SimulateHasCJProducts };

