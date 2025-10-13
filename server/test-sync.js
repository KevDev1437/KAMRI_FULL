const http = require('http');

function testSyncEndpoint() {
  console.log('🧪 Testing Fake Store sync endpoint...\n');

  const postData = JSON.stringify({});

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard/fake-store/sync/all',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Sync endpoint working');
        console.log('📦 Response:', data);
      } else {
        console.log(`⚠️  Status: ${res.statusCode}`);
        console.log('📦 Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
  });

  req.write(postData);
  req.end();
}

testSyncEndpoint();
