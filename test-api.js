const http = require('http');

console.log('🧪 Test de l\'API KAMRI...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📦 Response:', data);
    if (res.statusCode === 200) {
      console.log('🎉 API fonctionne correctement !');
    } else {
      console.log('❌ Erreur API:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur de connexion:', e.message);
});

req.end();
