const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJOrders() {
  console.log('🛒 === TEST COMMANDES CJ ===');
  
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
    
    // Test 1: Récupérer le solde
    console.log('\n💰 Test 1: Solde du compte');
    const balance = await client.makeRequest('/shopping/pay/getBalance', {}, 'GET');
    if (balance.code === 200) {
      console.log(`Solde disponible: $${balance.data.amount}`);
      console.log(`Montant non retirable: $${balance.data.noWithdrawalAmount || 0}`);
      console.log(`Montant gelé: $${balance.data.freezeAmount || 0}`);
    }
    
    // Test 2: Liste des commandes
    console.log('\n📋 Test 2: Liste des commandes');
    const orders = await client.makeRequest('/shopping/order/list', {
      pageNum: 1,
      pageSize: 5
    }, 'GET');
    
    if (orders.code === 200) {
      console.log(`Total commandes: ${orders.data.total}`);
      console.log(`Commandes récupérées: ${orders.data.list.length}`);
      
      if (orders.data.list.length > 0) {
        const firstOrder = orders.data.list[0];
        console.log('\n📦 Première commande:');
        console.log(`- ID: ${firstOrder.orderId}`);
        console.log(`- Numéro: ${firstOrder.orderNum}`);
        console.log(`- Statut: ${firstOrder.orderStatus}`);
        console.log(`- Montant: $${firstOrder.orderAmount || 0}`);
        console.log(`- Date création: ${firstOrder.createDate}`);
        console.log(`- Pays: ${firstOrder.shippingCountryCode}`);
        console.log(`- Client: ${firstOrder.shippingCustomerName}`);
        
        // Test 3: Détails de la commande
        console.log('\n🔍 Test 3: Détails de la commande');
        const orderDetails = await client.makeRequest('/shopping/order/getOrderDetail', {
          orderId: firstOrder.orderId
        }, 'GET');
        
        if (orderDetails.code === 200) {
          console.log('Détails de la commande:');
          console.log(`- Adresse: ${orderDetails.data.shippingAddress}`);
          console.log(`- Téléphone: ${orderDetails.data.shippingPhone}`);
          console.log(`- Logistique: ${orderDetails.data.logisticName}`);
          console.log(`- Numéro de suivi: ${orderDetails.data.trackNumber || 'Non disponible'}`);
          console.log(`- URL de suivi: ${orderDetails.data.trackingUrl || 'Non disponible'}`);
          
          if (orderDetails.data.productList && orderDetails.data.productList.length > 0) {
            console.log('\n📦 Produits:');
            orderDetails.data.productList.forEach((product, index) => {
              console.log(`  ${index + 1}. VID: ${product.vid}`);
              console.log(`     Quantité: ${product.quantity}`);
              console.log(`     Prix: $${product.sellPrice}`);
            });
          }
        }
      }
    }
    
    // Test 4: Analytics des commandes
    console.log('\n📊 Test 4: Analytics des commandes');
    if (orders.code === 200 && orders.data.list.length > 0) {
      const analytics = {
        total: orders.data.total,
        byStatus: {},
        totalAmount: 0,
        byCountry: {},
        byMonth: {}
      };
      
      orders.data.list.forEach(order => {
        const status = order.orderStatus || 'UNKNOWN';
        analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;
        analytics.totalAmount += parseFloat(order.orderAmount || 0);
        
        const country = order.shippingCountryCode || 'UNKNOWN';
        analytics.byCountry[country] = (analytics.byCountry[country] || 0) + 1;
        
        if (order.createDate) {
          const month = order.createDate.substring(0, 7); // YYYY-MM
          analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
        }
      });
      
      console.log('📈 Analytics:');
      console.log(`- Total commandes: ${analytics.total}`);
      console.log(`- Montant total: $${analytics.totalAmount.toFixed(2)}`);
      console.log(`- Moyenne par commande: $${(analytics.totalAmount / orders.data.list.length).toFixed(2)}`);
      
      console.log('\n📊 Par statut:');
      Object.entries(analytics.byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      console.log('\n🌍 Par pays:');
      Object.entries(analytics.byCountry).forEach(([country, count]) => {
        console.log(`  ${country}: ${count}`);
      });
      
      console.log('\n📅 Par mois:');
      Object.entries(analytics.byMonth).forEach(([month, count]) => {
        console.log(`  ${month}: ${count}`);
      });
    }
    
    console.log('\n✅ Test des commandes CJ terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des commandes CJ:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testCJOrders();
