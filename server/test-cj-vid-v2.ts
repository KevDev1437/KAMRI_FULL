import { PrismaClient } from '@prisma/client';
import { CJAPIClient } from './src/cj-dropshipping/cj-api-client';

const prisma = new PrismaClient();

async function testCJVidV2() {
  console.log('🔍 === TEST VID CJ (VERSION 2 avec CJAPIClient) ===\n');
  
  // 1. Récupérer la config CJ
  const config = await prisma.cJConfig.findFirst();
  
  if (!config || !config.accessToken) {
    console.error('❌ Token CJ introuvable');
    return;
  }
  
  const productId = '2511110221331613900'; // Nordic product
  const variantId = '2511110221331614100'; // Variant qui échoue
  
  console.log(`📋 Test du produit: ${productId}`);
  console.log(`📋 Test du variant: ${variantId}\n`);
  
  try {
    // Initialiser le client API CJ
    const client = new CJAPIClient(config.email || '', config.apiKey || '');
    await (client as any).login();
    
    // 1. Tester la récupération des variants du produit
    console.log('📡 Test 1: Récupération des variants du produit...');
    try {
      const variants = await client.getProductVariants(productId);
      
      if (variants && variants.length > 0) {
        console.log(`✅ ${variants.length} variant(s) trouvé(s) pour le produit`);
        
        // Chercher notre variant
        const variant = variants.find((v: any) => v.vid === variantId || String(v.vid) === variantId);
        
        if (variant) {
          console.log(`\n✅ Variant ${variantId} TROUVÉ !`);
          console.log(`   - VID: ${variant.vid}`);
          console.log(`   - SKU: ${variant.variantSku}`);
          console.log(`   - Prix: ${variant.variantSellPrice}`);
          console.log(`   - Stock: ${variant.stock || 'N/A'}`);
        } else {
          console.log(`\n❌ Variant ${variantId} INTROUVABLE dans ce produit`);
          console.log(`\n📋 Variants disponibles (5 premiers):`);
          variants.slice(0, 5).forEach((v: any) => {
            console.log(`   - VID: ${v.vid}, SKU: ${v.variantSku || 'N/A'}`);
          });
        }
      } else {
        console.log('❌ Aucun variant trouvé pour ce produit');
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération variants:', error.message);
    }
    
    // 2. Tester la récupération d'un variant spécifique par VID
    console.log('\n📡 Test 2: Récupération du variant par VID...');
    try {
      const variant = await client.getVariantById(variantId);
      
      if (variant) {
        console.log(`✅ Variant ${variantId} trouvé !`);
        console.log(`   - VID: ${variant.vid}`);
        console.log(`   - SKU: ${variant.variantSku}`);
        console.log(`   - Prix: ${variant.variantSellPrice}`);
        console.log(`   - Stock: ${variant.stock || 'N/A'}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération variant par VID:', error.message);
      console.error('   Cela signifie que le VID n\'existe plus ou n\'est pas valide');
    }
    
    // 3. Tester la création d'une commande avec ce VID
    console.log('\n📡 Test 3: Test création commande avec ce VID...');
    try {
      const testOrderPayload = {
        orderNumber: `TEST-${Date.now()}`,
        shippingCountryCode: 'FR',
        shippingCountry: 'France',
        shippingProvince: 'Île-de-France',
        shippingCity: 'Paris',
        shippingAddress: '123 Test Street',
        shippingZip: '75001',
        shippingCustomerName: 'Test User',
        shippingPhone: '+33123456789',
        email: 'test@example.com',
        logisticName: 'Colissimo',
        fromCountryCode: 'CN',
        platform: 'kamri',
        shopAmount: '10.00',
        products: [
          {
            vid: variantId,
            quantity: 1,
            productionImgList: [] // Toujours envoyer même vide
          }
        ]
      };
      
      console.log('📦 Payload:', JSON.stringify(testOrderPayload, null, 2));
      
      const cjOrder = await client.createOrderV3(testOrderPayload);
      
      console.log('\n✅ SUCCÈS ! Commande test créée:');
      console.log(`   - Order ID: ${cjOrder.orderId}`);
      console.log(`   - Order Number: ${cjOrder.orderNumber}`);
      console.log(`   - Status: ${cjOrder.orderStatus}`);
      
    } catch (error: any) {
      console.error('\n❌ Erreur création commande test:');
      console.error('   Message:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erreur initialisation client:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCJVidV2()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

