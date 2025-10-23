// server/test-cj-direct.js
require('dotenv').config();
const axios = require('axios');

console.log('🔗 TEST DIRECT API CJ');
console.log('=====================\n');

const email = process.env.CJ_EMAIL;
const apiKey = process.env.CJ_API_KEY;

console.log('1️⃣ CREDENTIALS:');
console.log('   Email:', email || '❌ MANQUANT');
console.log('   API Key:', apiKey ? apiKey.substring(0, 8) + '...' : '❌ MANQUANT');

if (!email || !apiKey) {
  console.log('❌ ARRÊT: Credentials manquants');
  process.exit(1);
}

async function testCJConnection() {
  try {
    console.log('\n2️⃣ TEST AUTHENTIFICATION CJ...');
    
    const authURL = 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken';
    
    const response = await axios.post(authURL, {
      email: email,
      apiKey: apiKey
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ SUCCÈS AUTHENTIFICATION!');
    console.log('   Code:', response.data.code);
    console.log('   Message:', response.data.message);
    console.log('   Access Token:', response.data.data.accessToken.substring(0, 20) + '...');
    console.log('   Expire:', response.data.data.accessTokenExpiryDate);
    
  } catch (error) {
    console.log('❌ ERREUR AUTHENTIFICATION:');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Code CJ:', error.response.data?.code);
      console.log('   Message:', error.response.data?.message);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   Erreur réseau:', error.message);
    } else {
      console.log('   Erreur:', error.message);
    }
  }
}

testCJConnection();