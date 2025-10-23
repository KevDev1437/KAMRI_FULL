const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJSearchSpecific() {
  console.log('🔍 === TEST RECHERCHE CJ AVEC MOTS-CLÉS SPÉCIFIQUES ===');
  
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
    
    // Test avec différents mots-clés
    const keywords = [
      'phone',
      'smartphone',
      'case',
      'charger',
      'headphones',
      'watch',
      'bag',
      'shirt',
      'shoes',
      'laptop'
    ];
    
    for (const keyword of keywords) {
      console.log(`\n🔍 Test avec le mot-clé: "${keyword}"`);
      
      try {
        const results = await client.searchProducts(keyword, {
          pageSize: 5,
          countryCode: 'US'
        });
        
        console.log(`📊 Résultats pour "${keyword}":`);
        console.log(`  - Total: ${results.total || 0}`);
        console.log(`  - Produits trouvés: ${results.list?.length || 0}`);
        
        if (results.list && results.list.length > 0) {
          console.log(`  - Premier produit: ${results.list[0].productName || 'N/A'}`);
          console.log(`  - Prix: $${results.list[0].productSellPrice || 'N/A'}`);
        }
        
        // Pause entre les recherches pour respecter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Erreur pour "${keyword}": ${error.message}`);
      }
    }
    
    console.log('\n✅ Test de recherche spécifique terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testCJSearchSpecific();
