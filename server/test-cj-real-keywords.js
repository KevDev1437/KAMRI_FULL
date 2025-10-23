const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJRealKeywords() {
  console.log('🔍 === TEST RECHERCHE CJ AVEC MOTS-CLÉS RÉELS ===');
  
  try {
    // Initialiser le client CJ
    const client = new CJAPIClient(
      process.env.CJ_EMAIL,
      process.env.CJ_API_KEY,
      { tier: 'plus', debug: true }
    );
    
    console.log('🔑 Connexion à l\'API CJ...');
    await client.login();
    console.log('✅ Connexion réussie');
    
    // Test avec des mots-clés réels de produits populaires
    const realKeywords = [
      'iPhone case',
      'phone case',
      'bluetooth headphones',
      'wireless charger',
      'smart watch',
      'laptop stand',
      'desk lamp',
      'coffee mug',
      't-shirt',
      'sneakers',
      'backpack',
      'sunglasses',
      'keychain',
      'sticker',
      'poster'
    ];
    
    for (const keyword of realKeywords) {
      console.log(`\n🔍 Test avec le mot-clé: "${keyword}"`);
      
      try {
        const results = await client.searchProducts(keyword, {
          pageSize: 5,
          pageNum: 1
        });
        
        console.log(`📊 Résultats pour "${keyword}":`);
        console.log(`  - Total: ${results.total || 0}`);
        console.log(`  - Produits trouvés: ${results.list?.length || 0}`);
        
        if (results.list && results.list.length > 0) {
          console.log(`  - Premier produit: ${results.list[0].productName || 'N/A'}`);
          console.log(`  - Prix: $${results.list[0].productSellPrice || 'N/A'}`);
          console.log(`  - SKU: ${results.list[0].productSku || 'N/A'}`);
        }
        
        // Pause entre les recherches pour respecter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Erreur pour "${keyword}": ${error.message}`);
      }
    }
    
    console.log('\n✅ Test de recherche avec mots-clés réels terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testCJRealKeywords();
