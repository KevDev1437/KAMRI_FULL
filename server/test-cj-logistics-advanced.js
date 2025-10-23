const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJLogisticsAdvanced() {
  console.log('🚚 === TEST LOGISTIQUES AVANCÉES CJ ===');
  
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
    
    // Test 1: Calcul de fret standard
    console.log('\n💰 Test 1: Calcul de fret standard');
    const freightParams = {
      startCountryCode: 'CN',
      endCountryCode: 'US',
      products: [
        {
          quantity: 2,
          vid: '439FC05B-1311-4349-87FA-1E1EF942C418'
        }
      ]
    };
    
    const freightResult = await client.makeRequest('/logistic/freightCalculate', freightParams);
    if (freightResult.code === 200) {
      console.log(`✅ ${freightResult.data.length} options de fret calculées`);
      freightResult.data.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.logisticName}: $${option.logisticPrice} (${option.logisticAging} jours)`);
      });
    }
    
    // Test 2: Calcul de fret avancé
    console.log('\n💡 Test 2: Calcul de fret avancé');
    const freightTipParams = {
      reqDTOS: [
        {
          srcAreaCode: 'CN',
          destAreaCode: 'US',
          length: 0.3,
          width: 0.4,
          height: 0.5,
          volume: 0.06,
          totalGoodsAmount: 123.2,
          productProp: ['COMMON'],
          freightTrialSkuList: [
            {
              skuQuantity: 1,
              sku: 'CJCF104237201AZ'
            }
          ],
          skuList: ['CJCF104237201AZ'],
          platforms: ['Shopify'],
          wrapWeight: 100,
          weight: 50
        }
      ]
    };
    
    const freightTipResult = await client.makeRequest('/logistic/freightCalculateTip', freightTipParams);
    if (freightTipResult.code === 200) {
      console.log(`✅ ${freightTipResult.data.length} conseils de fret calculés`);
      freightTipResult.data.forEach((tip, index) => {
        console.log(`  ${index + 1}. ${tip.option.enName}: $${tip.postage} (${tip.arrivalTime} jours)`);
        if (tip.message) {
          console.log(`     Message: ${tip.message}`);
        }
        if (tip.ruleTips && tip.ruleTips.length > 0) {
          console.log(`     Règles: ${tip.ruleTips.length} règles`);
        }
      });
    }
    
    // Test 3: Suivi des expéditions (nouveau)
    console.log('\n📦 Test 3: Suivi des expéditions');
    const trackingParams = {
      trackNumber: 'CJPKL7160102171YQ'
    };
    
    const trackingResult = await client.makeRequest('/logistic/trackInfo', trackingParams, 'GET');
    if (trackingResult.code === 200) {
      console.log(`✅ ${trackingResult.data.length} expéditions suivies`);
      trackingResult.data.forEach((tracking, index) => {
        console.log(`  ${index + 1}. ${tracking.trackingNumber}`);
        console.log(`     Logistique: ${tracking.logisticName}`);
        console.log(`     De: ${tracking.trackingFrom} → À: ${tracking.trackingTo}`);
        console.log(`     Statut: ${tracking.trackingStatus}`);
        console.log(`     Livraison: ${tracking.deliveryTime} (${tracking.deliveryDay} jours)`);
        if (tracking.lastMileCarrier) {
          console.log(`     Transporteur final: ${tracking.lastMileCarrier}`);
        }
        if (tracking.lastTrackNumber) {
          console.log(`     Numéro final: ${tracking.lastTrackNumber}`);
        }
      });
    }
    
    // Test 4: Analyse des options de fret
    console.log('\n📊 Test 4: Analyse des options de fret');
    if (freightResult.code === 200 && freightResult.data.length > 0) {
      const options = freightResult.data;
      const cheapest = options.reduce((min, option) => 
        parseFloat(option.logisticPrice) < parseFloat(min.logisticPrice) ? option : min
      );
      const fastest = options.reduce((min, option) => {
        const minDays = parseInt(option.logisticAging.split('-')[0]);
        const currentDays = parseInt(min.logisticAging.split('-')[0]);
        return minDays < currentDays ? option : min;
      });
      
      console.log('🏆 Meilleures options:');
      console.log(`  💰 Moins cher: ${cheapest.logisticName} - $${cheapest.logisticPrice} (${cheapest.logisticAging} jours)`);
      console.log(`  ⚡ Plus rapide: ${fastest.logisticName} - $${fastest.logisticPrice} (${fastest.logisticAging} jours)`);
      
      // Statistiques
      const totalOptions = options.length;
      const avgPrice = options.reduce((sum, option) => sum + parseFloat(option.logisticPrice), 0) / totalOptions;
      const priceRange = {
        min: Math.min(...options.map(o => parseFloat(o.logisticPrice))),
        max: Math.max(...options.map(o => parseFloat(o.logisticPrice)))
      };
      
      console.log('\n📈 Statistiques:');
      console.log(`  Total options: ${totalOptions}`);
      console.log(`  Prix moyen: $${avgPrice.toFixed(2)}`);
      console.log(`  Fourchette: $${priceRange.min} - $${priceRange.max}`);
      
      // Groupement par transporteur
      const byCarrier = {};
      options.forEach(option => {
        const carrier = option.logisticName.split(' ')[0]; // Premier mot
        if (!byCarrier[carrier]) {
          byCarrier[carrier] = [];
        }
        byCarrier[carrier].push(option);
      });
      
      console.log('\n🚛 Par transporteur:');
      Object.entries(byCarrier).forEach(([carrier, options]) => {
        console.log(`  ${carrier}: ${options.length} options`);
      });
    }
    
    console.log('\n✅ Test des logistiques avancées CJ terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des logistiques avancées CJ:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testCJLogisticsAdvanced();
