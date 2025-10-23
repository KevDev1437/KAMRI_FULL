const { CJAPIClient } = require('./src/cj-dropshipping/cj-api-client');

async function testCJSettings() {
  console.log('🧪 === TEST PARAMÈTRES CJ ===');
  
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
    
    // Test 1: Récupérer les paramètres du compte
    console.log('\n📊 Test 1: Paramètres du compte');
    const settings = await client.makeRequest('/setting/get', {}, 'GET');
    console.log('Paramètres du compte:', JSON.stringify(settings, null, 2));
    
    // Test 2: Analyser les performances
    console.log('\n📈 Test 2: Analyse des performances');
    if (settings.code === 200) {
      const data = settings.data;
      console.log(`ID du compte: ${data.openId}`);
      console.log(`Nom du compte: ${data.openName}`);
      console.log(`Email: ${data.openEmail}`);
      console.log(`Limite QPS: ${data.setting.qpsLimit}`);
      console.log(`Niveau d'accès: ${data.root}`);
      console.log(`Compte sandbox: ${data.isSandbox}`);
      
      // Analyser les quotas
      console.log('\n📊 Quotas:');
      data.setting.quotaLimits.forEach(quota => {
        console.log(`- ${quota.quotaUrl}: ${quota.quotaLimit} (type: ${quota.quotaType})`);
      });
      
      // Analyser les callbacks
      console.log('\n🔔 Callbacks:');
      console.log(`- Produits: ${data.callback.product.type} (URLs: ${data.callback.product.urls.length})`);
      console.log(`- Commandes: ${data.callback.order.type} (URLs: ${data.callback.order.urls.length})`);
      
      // Recommandations
      console.log('\n💡 Recommandations:');
      if (data.root === 'NO_PERMISSION') {
        console.log('⚠️ Compte non autorisé - Contacter le support CJ');
      } else if (data.root === 'GENERAL') {
        console.log('✅ Compte général - Fonctionnalités de base disponibles');
      } else if (data.root === 'VIP') {
        console.log('⭐ Compte VIP - Fonctionnalités avancées disponibles');
      } else if (data.root === 'ADMIN') {
        console.log('👑 Compte administrateur - Accès complet');
      }
      
      if (data.setting.qpsLimit < 10) {
        console.log('🐌 Limite QPS faible - Optimiser les requêtes');
      } else if (data.setting.qpsLimit >= 100) {
        console.log('🚀 Limite QPS élevée - Bonnes performances');
      }
      
      if (data.callback.product.type !== 'ENABLE') {
        console.log('🔔 Activer les webhooks produits pour les mises à jour temps réel');
      }
      if (data.callback.order.type !== 'ENABLE') {
        console.log('🔔 Activer les webhooks commandes pour le suivi des commandes');
      }
      
      if (data.isSandbox) {
        console.log('🧪 Compte sandbox - Utiliser pour les tests uniquement');
      }
    }
    
    console.log('\n✅ Test des paramètres CJ terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des paramètres CJ:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testCJSettings();
