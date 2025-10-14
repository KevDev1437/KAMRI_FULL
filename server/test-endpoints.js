const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@kamri.com',
  name: 'Test User',
  password: 'password123',
  role: 'admin'
};

let authToken = '';

async function testEndpoints() {
  console.log('🧪 Testing KAMRI API Endpoints...\n');

  try {
    // 1. Test Auth - Register
    console.log('1️⃣ Testing Auth - Register...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Register successful');
      authToken = registerResponse.data.access_token;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('déjà')) {
        console.log('⚠️ User already exists, trying login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.access_token;
        console.log('✅ Login successful');
      } else {
        throw error;
      }
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Test Dashboard Stats
    console.log('\n2️⃣ Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log('✅ Dashboard stats:', statsResponse.data);

    // 3. Test Products
    console.log('\n3️⃣ Testing Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, { headers });
    console.log('✅ Products retrieved:', productsResponse.data.length, 'products');

    // 4. Test Suppliers
    console.log('\n4️⃣ Testing Suppliers...');
    const suppliersResponse = await axios.get(`${BASE_URL}/suppliers`, { headers });
    console.log('✅ Suppliers retrieved:', suppliersResponse.data.length, 'suppliers');

    // 5. Test Categories
    console.log('\n5️⃣ Testing Categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    console.log('✅ Categories retrieved:', categoriesResponse.data.length, 'categories');

    // 6. Test Orders
    console.log('\n6️⃣ Testing Orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders`, { headers });
    console.log('✅ Orders retrieved:', ordersResponse.data.length, 'orders');

    // 7. Test Settings
    console.log('\n7️⃣ Testing Settings...');
    const settingsResponse = await axios.get(`${BASE_URL}/settings`, { headers });
    console.log('✅ Settings retrieved:', settingsResponse.data);

    // 8. Test Dashboard Activity
    console.log('\n8️⃣ Testing Dashboard Activity...');
    const activityResponse = await axios.get(`${BASE_URL}/dashboard/activity`, { headers });
    console.log('✅ Activity retrieved');

    // 9. Test Sales Chart
    console.log('\n9️⃣ Testing Sales Chart...');
    const salesResponse = await axios.get(`${BASE_URL}/dashboard/sales-chart`, { headers });
    console.log('✅ Sales chart data retrieved');

    // 10. Test Top Categories
    console.log('\n🔟 Testing Top Categories...');
    const topCategoriesResponse = await axios.get(`${BASE_URL}/dashboard/top-categories`, { headers });
    console.log('✅ Top categories retrieved');

    console.log('\n🎉 All endpoints tested successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Products: ${productsResponse.data.length}`);
    console.log(`- Suppliers: ${suppliersResponse.data.length}`);
    console.log(`- Categories: ${categoriesResponse.data.length}`);
    console.log(`- Orders: ${ordersResponse.data.length}`);
    console.log(`- Total Revenue: €${statsResponse.data.totalRevenue}`);
    console.log(`- Connected Suppliers: ${statsResponse.data.connectedSuppliers}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testEndpoints();
