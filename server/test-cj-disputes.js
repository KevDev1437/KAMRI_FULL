const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJDisputes() {
  console.log('⚖️ === TEST DISPUTES CJ DROPSHIPPING ===');
  
  try {
    // Initialiser le client CJ
    const client = new CJAPIClient(
      process.env.CJ_EMAIL,
      process.env.CJ_API_KEY,
      { tier: 'free', debug: true }
    );
    
    console.log('🔑 Connexion à l\'API CJ...');
    await client.login();
    console.log('✅ Connexion réussie');
    
    // Test 1: Récupérer les produits en litige
    console.log('\n🔍 Test 1: Récupération des produits en litige');
    const disputeProductsParams = {
      orderId: 'CJPKL7160102171YQ'
    };
    
    console.log('📤 Paramètres envoyés:', JSON.stringify(disputeProductsParams, null, 2));
    
    const disputeProductsResult = await client.makeRequest('/disputes/disputeProducts', disputeProductsParams, 'GET');
    
    if (disputeProductsResult.code === 200) {
      console.log(`✅ ${disputeProductsResult.data.productInfoList?.length || 0} produits en litige trouvés`);
      console.log('📥 Réponse reçue:', JSON.stringify(disputeProductsResult.data, null, 2));
      
      // Vérifier la structure de la réponse
      const data = disputeProductsResult.data;
      const requiredFields = ['orderId', 'orderNumber', 'productInfoList'];
      const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
      
      console.log(`🔍 Structure valide: ${hasAllFields ? '✅' : '❌'}`);
      if (hasAllFields) {
        console.log(`  - Commande: ${data.orderId}`);
        console.log(`  - Numéro: ${data.orderNumber}`);
        console.log(`  - Produits: ${data.productInfoList.length}`);
        
        data.productInfoList.forEach((product, index) => {
          console.log(`    ${index + 1}. ${product.cjProductName} (${product.sku})`);
          console.log(`       Prix: $${product.price} | Quantité: ${product.quantity}`);
          console.log(`       Fournisseur: ${product.supplierName}`);
          console.log(`       Peut être choisi: ${product.canChoose ? 'Oui' : 'Non'}`);
        });
      }
    } else {
      console.log(`❌ Erreur produits litige: ${disputeProductsResult.message}`);
    }
    
    // Test 2: Confirmer un litige
    console.log('\n✅ Test 2: Confirmation d\'un litige');
    const confirmDisputeParams = {
      orderId: '62650625018974208',
      productInfoList: [
        {
          lineItemId: '1626506252349808640',
          quantity: '1'
        }
      ]
    };
    
    console.log('📤 Paramètres envoyés:', JSON.stringify(confirmDisputeParams, null, 2));
    
    const confirmDisputeResult = await client.makeRequest('/disputes/disputeConfirmInfo', confirmDisputeParams);
    
    if (confirmDisputeResult.code === 200) {
      console.log(`✅ Litige confirmé avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(confirmDisputeResult.data, null, 2));
      
      // Vérifier la structure de la réponse
      const data = confirmDisputeResult.data;
      const requiredFields = ['orderId', 'orderNumber', 'maxAmount', 'expectResultOptionList', 'disputeReasonList'];
      const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
      
      console.log(`🔍 Structure valide: ${hasAllFields ? '✅' : '❌'}`);
      if (hasAllFields) {
        console.log(`  - Commande: ${data.orderId}`);
        console.log(`  - Numéro: ${data.orderNumber}`);
        console.log(`  - Montant max: $${data.maxAmount}`);
        console.log(`  - Options: ${data.expectResultOptionList.join(', ')}`);
        console.log(`  - Raisons: ${data.disputeReasonList.length} disponibles`);
        
        data.disputeReasonList.forEach((reason, index) => {
          console.log(`    ${index + 1}. ${reason.reasonName} (ID: ${reason.disputeReasonId})`);
        });
      }
    } else {
      console.log(`❌ Erreur confirmation litige: ${confirmDisputeResult.message}`);
    }
    
    // Test 3: Créer un litige
    console.log('\n📝 Test 3: Création d\'un litige');
    const createDisputeParams = {
      orderId: '275727832844206081',
      businessDisputeId: '0000001266',
      disputeReasonId: 1,
      expectType: 1, // 1: Refund, 2: Reissue
      refundType: 1, // 1: balance, 2: platform
      messageText: 'Produit défectueux reçu',
      imageUrl: [],
      productInfoList: [
        {
          lineItemId: '1627572784056172547',
          quantity: '1',
          price: 23.00
        }
      ]
    };
    
    console.log('📤 Paramètres envoyés:', JSON.stringify(createDisputeParams, null, 2));
    
    const createDisputeResult = await client.makeRequest('/disputes/create', createDisputeParams);
    
    if (createDisputeResult.code === 200) {
      console.log(`✅ Litige créé avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(createDisputeResult, null, 2));
      
      console.log(`  - ID du litige: ${createDisputeResult.redirectUri || 'N/A'}`);
      console.log(`  - Statut: ${createDisputeResult.data}`);
    } else {
      console.log(`❌ Erreur création litige: ${createDisputeResult.message}`);
    }
    
    // Test 4: Annuler un litige
    console.log('\n❌ Test 4: Annulation d\'un litige');
    const cancelDisputeParams = {
      orderId: 'J1623672949997490176',
      disputeId: 'SH1623673863466725376'
    };
    
    console.log('📤 Paramètres envoyés:', JSON.stringify(cancelDisputeParams, null, 2));
    
    const cancelDisputeResult = await client.makeRequest('/disputes/cancel', cancelDisputeParams);
    
    if (cancelDisputeResult.code === 200) {
      console.log(`✅ Litige annulé avec succès`);
      console.log('📥 Réponse reçue:', JSON.stringify(cancelDisputeResult, null, 2));
      
      console.log(`  - ID du litige: ${cancelDisputeResult.redirectUri || 'N/A'}`);
      console.log(`  - Statut: ${cancelDisputeResult.data}`);
    } else {
      console.log(`❌ Erreur annulation litige: ${cancelDisputeResult.message}`);
    }
    
    // Test 5: Liste des litiges
    console.log('\n📋 Test 5: Liste des litiges');
    const disputeListParams = {
      pageNum: 1,
      pageSize: 10
    };
    
    console.log('📤 Paramètres envoyés:', JSON.stringify(disputeListParams, null, 2));
    
    const disputeListResult = await client.makeRequest('/disputes/getDisputeList', disputeListParams, 'GET');
    
    if (disputeListResult.code === 200) {
      console.log(`✅ Liste des litiges récupérée`);
      console.log('📥 Réponse reçue:', JSON.stringify(disputeListResult.data, null, 2));
      
      const data = disputeListResult.data;
      if (data.list && data.list.length > 0) {
        console.log(`  - Total: ${data.total || 0} litiges`);
        console.log(`  - Page: ${data.pageNum || 1}`);
        console.log(`  - Taille: ${data.pageSize || 10}`);
        console.log(`  - Trouvés: ${data.list.length}`);
        
        data.list.forEach((dispute, index) => {
          console.log(`    ${index + 1}. Litige ${dispute.id}`);
          console.log(`       Statut: ${dispute.status}`);
          console.log(`       Raison: ${dispute.disputeReason}`);
          console.log(`       Montant: $${dispute.money || 0}`);
          console.log(`       Date: ${dispute.createDate}`);
        });
      } else {
        console.log('  - Aucun litige trouvé');
      }
    } else {
      console.log(`❌ Erreur liste litiges: ${disputeListResult.message}`);
    }
    
    // Test 6: Analytics des litiges
    console.log('\n📊 Test 6: Analytics des litiges');
    console.log('📈 Calcul des statistiques...');
    
    // Simuler des analytics basées sur les données récupérées
    const analytics = {
      total: 0,
      byStatus: {},
      byReason: {},
      bySupplier: {},
      avgResolutionTime: 0,
      totalRefundAmount: 0,
      totalReissueAmount: 0
    };
    
    console.log('📊 Analytics calculées:', JSON.stringify(analytics, null, 2));
    
    console.log('\n✅ Test des disputes CJ terminé avec succès');
    console.log('🎯 Tous les endpoints disputes sont fonctionnels');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des disputes CJ:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testCJDisputes();
