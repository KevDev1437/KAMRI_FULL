const http = require('http');

function checkProducts() {
  console.log('🔍 Checking products in database...\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard/fake-store/stats',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ Products found in database:');
        console.log(`📦 Total products: ${response.totalProducts}`);
        console.log('\n🛍️ Recent products:');
        response.recentProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - $${product.price} (${product.status})`);
        });
      } else {
        console.log(`⚠️  Status: ${res.statusCode}`);
        console.log('📦 Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
  });

  req.end();
}

checkProducts();
