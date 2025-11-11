import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testCJVid() {
  console.log('🔍 === TEST VID CJ ===\n');
  
  // 1. Récupérer le token CJ
  const config = await prisma.cJConfig.findFirst();
  
  if (!config || !config.accessToken) {
    console.error('❌ Token CJ introuvable');
    return;
  }
  
  const token = config.accessToken;
  const productId = '2511110221331613900'; // Nordic product
  const variantId = '2511110221331614100'; // Variant qui échoue
  
  console.log(`📋 Test du produit: ${productId}`);
  console.log(`📋 Test du variant: ${variantId}\n`);
  
  // 2. Tester l'endpoint variant query (par PID pour récupérer tous les variants)
  try {
    console.log('📡 Test 1: Query variants du produit (par PID)...');
    const response1 = await axios.get(
      `https://developers.cjdropshipping.com/api2.0/v1/product/variant/query`,
      {
        headers: {
          'CJ-Access-Token': token
        },
        params: {
          pid: productId
        }
      }
    );
    
    console.log('✅ Réponse:', response1.data.result ? 'SUCCÈS' : 'ÉCHEC');
    console.log('   Code:', response1.data.code);
    console.log('   Message:', response1.data.message);
    
    if (response1.data.result && response1.data.data) {
      const variants = Array.isArray(response1.data.data) ? response1.data.data : [response1.data.data];
      console.log(`   - Variants disponibles: ${variants.length}`);
      
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
      console.log('   Data:', JSON.stringify(response1.data, null, 2));
    }
    
  } catch (error: any) {
    console.error('❌ Erreur query variants:', error.response?.data || error.message);
  }
  
  // 3. Tester l'endpoint variant query par VID
  try {
    console.log('\n📡 Test 2: Query variant details par VID...');
    const response2 = await axios.get(
      `https://developers.cjdropshipping.com/api2.0/v1/product/variant/queryByVid`,
      {
        headers: {
          'CJ-Access-Token': token
        },
        params: {
          vid: variantId
        }
      }
    );
    
    console.log('✅ Réponse:', response2.data.result ? 'SUCCÈS' : 'ÉCHEC');
    console.log('   Code:', response2.data.code);
    console.log('   Message:', response2.data.message);
    
    if (response2.data.result && response2.data.data) {
      const variant = response2.data.data;
      console.log(`\n✅ Variant ${variantId} trouvé !`);
      console.log(`   - VID: ${variant.vid}`);
      console.log(`   - SKU: ${variant.variantSku}`);
      console.log(`   - Prix: ${variant.variantSellPrice}`);
      console.log(`   - Stock: ${variant.stock || 'N/A'}`);
    } else {
      console.log('   Data:', JSON.stringify(response2.data, null, 2));
      console.log('\n⚠️ Le VID n\'existe peut-être plus ou n\'est pas valide');
    }
    
  } catch (error: any) {
    console.error('❌ Erreur query variant par VID:', error.response?.data || error.message);
    console.error('   Cela signifie que le VID n\'existe plus ou n\'est pas valide');
  }
  
  // 4. Tester la création d'une commande avec ce VID
  try {
    console.log('\n📡 Test 3: Test création commande...');
    
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
    
    const response3 = await axios.post(
      `https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3`,
      testOrderPayload,
      {
        headers: {
          'CJ-Access-Token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ SUCCÈS ! Commande test créée:', response3.data);
    
  } catch (error: any) {
    console.error('\n❌ Erreur création commande test:');
    console.error('   Status:', error.response?.status);
    console.error('   Code:', error.response?.data?.code);
    console.error('   Message:', error.response?.data?.message);
    console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testCJVid()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

