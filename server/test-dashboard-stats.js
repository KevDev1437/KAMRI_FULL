const fetch = require('node-fetch');

async function testDashboardStats() {
  try {
    console.log('🔍 Test de l\'API dashboard stats...');
    
    const response = await fetch('http://localhost:3001/api/dashboard/stats');
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📊 Réponse:', data);
    
    if (response.ok) {
      const stats = JSON.parse(data);
      console.log('\n✅ Statistiques dashboard:');
      console.log(`   - Produits: ${stats.totalProducts}`);
      console.log(`   - Commandes: ${stats.totalOrders}`);
      console.log(`   - Fournisseurs connectés: ${stats.connectedSuppliers}`);
      console.log(`   - Utilisateurs: ${stats.totalUsers}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testDashboardStats();