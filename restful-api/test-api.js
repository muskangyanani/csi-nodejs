const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  age: 25,
  city: 'Test City'
};

const testProduct = {
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  category: 'Test Category',
  inStock: true
};

async function testAPI() {
  try {
    console.log('🚀 Testing RESTful API...\n');

    // Test Health Check
    console.log('🔍 Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test Users API
    console.log('👤 Testing Users API...');
    
    // Get all users
    const usersResponse = await axios.get(`${BASE_URL}/api/users`);
    console.log(`✅ GET /api/users - Found ${usersResponse.data.count} users`);

    // Create a new user
    const createUserResponse = await axios.post(`${BASE_URL}/api/users`, testUser);
    const createdUser = createUserResponse.data.data;
    console.log(`✅ POST /api/users - Created user: ${createdUser.name}`);

    // Get user by ID
    const getUserResponse = await axios.get(`${BASE_URL}/api/users/${createdUser.id}`);
    console.log(`✅ GET /api/users/${createdUser.id} - Found user: ${getUserResponse.data.data.name}`);

    // Update user
    const updateUserData = { name: 'Updated Test User', age: 26 };
    const updateUserResponse = await axios.put(`${BASE_URL}/api/users/${createdUser.id}`, updateUserData);
    console.log(`✅ PUT /api/users/${createdUser.id} - Updated user: ${updateUserResponse.data.data.name}`);

    // Get user stats
    const userStatsResponse = await axios.get(`${BASE_URL}/api/users/stats`);
    console.log(`✅ GET /api/users/stats - Total users: ${userStatsResponse.data.data.totalUsers}`);

    // Delete user
    await axios.delete(`${BASE_URL}/api/users/${createdUser.id}`);
    console.log(`✅ DELETE /api/users/${createdUser.id} - User deleted`);
    console.log('');

    // Test Products API
    console.log('🛍️ Testing Products API...');

    // Get all products
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log(`✅ GET /api/products - Found ${productsResponse.data.count} products`);

    // Create a new product
    const createProductResponse = await axios.post(`${BASE_URL}/api/products`, testProduct);
    const createdProduct = createProductResponse.data.data;
    console.log(`✅ POST /api/products - Created product: ${createdProduct.name}`);

    // Get product by ID
    const getProductResponse = await axios.get(`${BASE_URL}/api/products/${createdProduct.id}`);
    console.log(`✅ GET /api/products/${createdProduct.id} - Found product: ${getProductResponse.data.data.name}`);

    // Update product
    const updateProductData = { name: 'Updated Test Product', price: 129.99 };
    const updateProductResponse = await axios.put(`${BASE_URL}/api/products/${createdProduct.id}`, updateProductData);
    console.log(`✅ PUT /api/products/${createdProduct.id} - Updated product: ${updateProductResponse.data.data.name}`);

    // Test product filtering
    const filterResponse = await axios.get(`${BASE_URL}/api/products?category=Electronics`);
    console.log(`✅ GET /api/products?category=Electronics - Found ${filterResponse.data.count} electronics`);

    // Get product stats
    const productStatsResponse = await axios.get(`${BASE_URL}/api/products/stats`);
    console.log(`✅ GET /api/products/stats - Total products: ${productStatsResponse.data.data.totalProducts}`);

    // Delete product
    await axios.delete(`${BASE_URL}/api/products/${createdProduct.id}`);
    console.log(`✅ DELETE /api/products/${createdProduct.id} - Product deleted`);
    console.log('');

    // Test error handling
    console.log('❌ Testing error handling...');
    
    try {
      await axios.get(`${BASE_URL}/api/users/invalid-id`);
    } catch (error) {
      console.log(`✅ 404 error handled correctly: ${error.response.data.message}`);
    }

    try {
      await axios.post(`${BASE_URL}/api/users`, { name: '' });
    } catch (error) {
      console.log(`✅ Validation error handled correctly: ${error.response.data.message}`);
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Install axios if not already installed
async function installAxios() {
  try {
    require('axios');
  } catch (error) {
    console.log('Installing axios...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
  }
}

// Run the test
installAxios().then(() => {
  testAPI();
}).catch((error) => {
  console.error('Error installing axios:', error);
});
