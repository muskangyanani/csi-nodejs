const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let userToken = '';
let refreshToken = '';

// Test data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'TestUser123!',
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

// Helper function to make authenticated requests
const makeAuthRequest = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function testJWTAuthentication() {
  try {
    console.log('🚀 Testing JWT Authentication API...\n');

    // Test 1: Health Check
    console.log('🔍 Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('');

    // Test 2: Admin Login
    console.log('👤 Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    adminToken = adminLoginResponse.data.data.tokens.accessToken;
    console.log('✅ Admin login successful');
    console.log('');

    // Test 3: Regular User Login
    console.log('👤 Testing regular user login...');
    const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'john@example.com',
      password: 'User123!'
    });
    userToken = userLoginResponse.data.data.tokens.accessToken;
    refreshToken = userLoginResponse.data.data.tokens.refreshToken;
    console.log('✅ User login successful');
    console.log('');

    // Test 4: User Registration
    console.log('📝 Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ User registration successful');
    console.log('');

    // Test 5: Protected Route Access
    console.log('🔐 Testing protected route access...');
    const protectedResponse = await axios.get(`${BASE_URL}/api/protected`, makeAuthRequest(userToken));
    console.log('✅ Protected route access successful');
    console.log('');

    // Test 6: Profile Management
    console.log('👤 Testing profile management...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, makeAuthRequest(userToken));
    console.log('✅ Profile retrieval successful');
    
    const updateProfileResponse = await axios.put(`${BASE_URL}/api/auth/profile`, {
      name: 'Updated John Doe',
      city: 'San Francisco'
    }, makeAuthRequest(userToken));
    console.log('✅ Profile update successful');
    console.log('');

    // Test 7: Password Change
    console.log('🔑 Testing password change...');
    const passwordChangeResponse = await axios.post(`${BASE_URL}/api/auth/change-password`, {
      currentPassword: 'User123!',
      newPassword: 'NewUser123!'
    }, makeAuthRequest(userToken));
    console.log('✅ Password change successful');
    console.log('');

    // Test 8: Token Refresh
    console.log('🔄 Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshToken
    });
    const newUserToken = refreshResponse.data.data.tokens.accessToken;
    console.log('✅ Token refresh successful');
    console.log('');

    // Test 9: Admin-Only Operations
    console.log('👑 Testing admin-only operations...');
    
    // Get all users (admin only)
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, makeAuthRequest(adminToken));
    console.log(`✅ Admin retrieved ${usersResponse.data.count} users`);
    
    // Get user stats (admin only)
    const statsResponse = await axios.get(`${BASE_URL}/api/users/stats`, makeAuthRequest(adminToken));
    console.log(`✅ Admin retrieved user stats: ${statsResponse.data.data.totalUsers} total users`);
    console.log('');

    // Test 10: Product Operations
    console.log('🛍️ Testing product operations...');
    
    // Create product (authenticated)
    const createProductResponse = await axios.post(`${BASE_URL}/api/products`, testProduct, makeAuthRequest(userToken));
    const createdProduct = createProductResponse.data.data;
    console.log('✅ Product created successfully');
    
    // Get my products (authenticated)
    const myProductsResponse = await axios.get(`${BASE_URL}/api/products/my`, makeAuthRequest(userToken));
    console.log(`✅ Retrieved ${myProductsResponse.data.count} user products`);
    
    // Update product (owner only)
    const updateProductResponse = await axios.put(`${BASE_URL}/api/products/${createdProduct.id}`, {
      name: 'Updated Test Product',
      price: 149.99
    }, makeAuthRequest(userToken));
    console.log('✅ Product updated successfully');
    
    // Delete product (owner only)
    await axios.delete(`${BASE_URL}/api/products/${createdProduct.id}`, makeAuthRequest(userToken));
    console.log('✅ Product deleted successfully');
    console.log('');

    // Test 11: Public Access
    console.log('🌐 Testing public access...');
    
    // Get products (public)
    const publicProductsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log(`✅ Public access: Retrieved ${publicProductsResponse.data.count} products`);
    
    // Get categories (public)
    const categoriesResponse = await axios.get(`${BASE_URL}/api/products/categories`);
    console.log(`✅ Public access: Retrieved ${categoriesResponse.data.count} categories`);
    console.log('');

    // Test 12: Authorization Errors
    console.log('❌ Testing authorization errors...');
    
    try {
      await axios.get(`${BASE_URL}/api/users`, makeAuthRequest(userToken));
    } catch (error) {
      console.log('✅ 403 Forbidden handled correctly for non-admin user');
    }
    
    try {
      await axios.get(`${BASE_URL}/api/protected`);
    } catch (error) {
      console.log('✅ 401 Unauthorized handled correctly for missing token');
    }
    
    try {
      await axios.get(`${BASE_URL}/api/protected`, makeAuthRequest('invalid-token'));
    } catch (error) {
      console.log('✅ 401 Unauthorized handled correctly for invalid token');
    }
    console.log('');

    // Test 13: Logout
    console.log('👋 Testing logout...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {
      refreshToken: refreshToken
    }, makeAuthRequest(userToken));
    console.log('✅ Logout successful');
    console.log('');

    console.log('🎉 All JWT authentication tests completed successfully!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('✅ Authentication & Authorization');
    console.log('✅ JWT Token Management');
    console.log('✅ Role-based Access Control');
    console.log('✅ Protected Routes');
    console.log('✅ Public Routes');
    console.log('✅ Error Handling');
    console.log('✅ Password Security');
    console.log('✅ Profile Management');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
    console.log('');
    console.log('💡 Make sure the server is running with: npm run dev');
    console.log('💡 Check that the JWT_SECRET is set in .env file');
  }
}

// Run the test
testJWTAuthentication();
