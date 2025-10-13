const fetch = require('node-fetch');

async function testFakeStoreAPI() {
  console.log('🧪 Testing Fake Store API integration...\n');

  try {
    // Test 1: Test de connexion
    console.log('1️⃣ Testing connection...');
    const connectionTest = await fetch('https://fakestoreapi.com/products?limit=1');
    if (connectionTest.ok) {
      console.log('✅ Connection successful');
    } else {
      console.log('❌ Connection failed');
      return;
    }

    // Test 2: Récupérer tous les produits
    console.log('\n2️⃣ Fetching all products...');
    const productsResponse = await fetch('https://fakestoreapi.com/products');
    const products = await productsResponse.json();
    console.log(`✅ Found ${products.length} products`);
    console.log(`📦 Sample product: ${products[0].title} - $${products[0].price}`);

    // Test 3: Récupérer les catégories
    console.log('\n3️⃣ Fetching categories...');
    const categoriesResponse = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await categoriesResponse.json();
    console.log(`✅ Found ${categories.length} categories:`, categories.join(', '));

    // Test 4: Récupérer un produit spécifique
    console.log('\n4️⃣ Fetching specific product...');
    const productResponse = await fetch('https://fakestoreapi.com/products/1');
    const product = await productResponse.json();
    console.log(`✅ Product details: ${product.title} - Rating: ${product.rating.rate}/5`);

    // Test 5: Récupérer par catégorie
    console.log('\n5️⃣ Fetching products by category...');
    const categoryResponse = await fetch('https://fakestoreapi.com/products/category/electronics');
    const categoryProducts = await categoryResponse.json();
    console.log(`✅ Found ${categoryProducts.length} electronics products`);

    console.log('\n🎉 All tests passed! Fake Store API is working correctly.');
    console.log('\n📋 Available endpoints for your API:');
    console.log('   GET    /api/dashboard/fake-store/test-connection');
    console.log('   GET    /api/dashboard/fake-store/products');
    console.log('   GET    /api/dashboard/fake-store/products/:id');
    console.log('   GET    /api/dashboard/fake-store/categories');
    console.log('   POST   /api/dashboard/fake-store/sync/all');
    console.log('   POST   /api/dashboard/fake-store/sync/product/:id');
    console.log('   GET    /api/dashboard/fake-store/stats');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFakeStoreAPI();
