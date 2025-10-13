const http = require('http');

function testFrontendEndpoints() {
  console.log('🧪 Testing frontend endpoints...\n');

  // Test 1: Endpoint web
  console.log('1️⃣ Testing web products endpoint...');
  testEndpoint('/api/web/products', 'Web');

  // Test 2: Endpoint mobile  
  console.log('\n2️⃣ Testing mobile products endpoint...');
  testEndpoint('/api/mobile/products', 'Mobile');

  // Test 3: Endpoint shared
  console.log('\n3️⃣ Testing shared products endpoint...');
  testEndpoint('/api/shared/products', 'Shared');
}

function testEndpoint(path, platform) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: 'GET',
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 ${platform} Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${platform} endpoint working`);
          if (response.data && Array.isArray(response.data)) {
            console.log(`📦 Found ${response.data.length} products`);
            if (response.data.length > 0) {
              console.log(`🛍️ Sample: ${response.data[0].name} - $${response.data[0].price}`);
            }
          }
        } catch (e) {
          console.log(`📦 Response: ${data.substring(0, 200)}...`);
        }
      } else {
        console.log(`⚠️  ${platform} Status: ${res.statusCode}`);
        console.log(`📦 Response: ${data.substring(0, 200)}...`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`❌ ${platform} Request failed:`, err.message);
  });

  req.end();
}

testFrontendEndpoints();
