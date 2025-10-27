const fetch = require('node-fetch');

async function testImportAPI() {
  try {
    console.log('🔍 Test de l\'API d\'importation...');
    
    const response = await fetch('http://localhost:3001/api/stores/cj-dropshipping/import-selected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('📊 Réponse brute:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n✅ Réponse JSON:');
        console.log(`   - Message: ${jsonData.message}`);
        console.log(`   - Importés: ${jsonData.imported}`);
        if (jsonData.products) {
          console.log(`   - Produits importés: ${jsonData.products.length}`);
        }
      } catch (parseError) {
        console.log('ℹ️  Réponse non-JSON:', data);
      }
    } else {
      console.log('❌ Erreur API:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message);
  }
}

testImportAPI();