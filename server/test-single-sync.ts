import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const PRODUCT_ID = 'cmhxf6r6o09rmjeroo0v2olrn'; // Le produit de l'utilisateur

async function testSync() {
  console.log('🔄 Test synchronisation pour:', PRODUCT_ID);
  console.log('');
  
  try {
    const response = await axios.post(
      `${API_URL}/cj-dropshipping/products/${PRODUCT_ID}/sync-variants-stock`,
      {},
      { timeout: 30000 }
    );
    
    console.log('✅ Réponse reçue:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testSync();

