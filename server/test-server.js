const http = require('http');

function testServer() {
  console.log('🧪 Testing server endpoints...\n');

  // Test 1: Vérifier que le serveur répond
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running on port 3001`);
    console.log(`📊 Status: ${res.statusCode}`);
    
    // Test 2: Tester l'endpoint Fake Store (sans auth pour l'instant)
    testFakeStoreEndpoint();
  });

  req.on('error', (err) => {
    console.error('❌ Server connection failed:', err.message);
  });

  req.end();
}

function testFakeStoreEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard/fake-store/test-connection',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Fake Store endpoint working');
        console.log('📦 Response:', data);
      } else if (res.statusCode === 401) {
        console.log('🔒 Endpoint requires authentication (JWT)');
        console.log('💡 This is expected - the endpoint is protected');
      } else {
        console.log(`⚠️  Unexpected status: ${res.statusCode}`);
        console.log('📦 Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Fake Store endpoint test failed:', err.message);
  });

  req.end();
}

testServer();
