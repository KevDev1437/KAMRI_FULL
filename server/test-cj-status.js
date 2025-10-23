const axios = require('axios');

async function testCJStatus() {
  console.log('🔍 === TEST STATUT CONNEXION CJ ===');
  
  try {
    // Test de l'endpoint de statut
    const response = await axios.get('http://localhost:3001/api/cj-dropshipping/status', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Réponse reçue:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Vérifier le statut de connexion
    if (response.data.connected) {
      console.log('🎉 Statut: CONNECTÉ');
    } else {
      console.log('❌ Statut: DÉCONNECTÉ');
    }
    
    console.log(`📊 Tier: ${response.data.tier}`);
    console.log(`⏱️ Dernière sync: ${response.data.lastSync || 'Jamais'}`);
    console.log(`🚀 Limites API: ${response.data.apiLimits.qps}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Données:', error.response.data);
    }
  }
}

// Exécuter le test
testCJStatus();
