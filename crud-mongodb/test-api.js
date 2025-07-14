// Simple test script to demonstrate API usage
// Run this after starting the server with: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/users';

// Sample user data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    city: 'New York'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    city: 'Los Angeles'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 35,
    city: 'Chicago'
  }
];

async function testAPI() {
  try {
    console.log('🚀 Testing CRUD Operations...\n');

    // CREATE - Add new users
    console.log('📝 Creating users...');
    const createdUsers = [];
    for (let userData of sampleUsers) {
      const response = await axios.post(BASE_URL, userData);
      createdUsers.push(response.data.data);
      console.log(`✅ Created user: ${userData.name}`);
    }
    console.log('');

    // READ - Get all users
    console.log('📖 Getting all users...');
    const allUsersResponse = await axios.get(BASE_URL);
    console.log(`✅ Found ${allUsersResponse.data.count} users`);
    console.log('');

    // READ - Get single user
    if (createdUsers.length > 0) {
      const userId = createdUsers[0]._id;
      console.log(`📖 Getting user by ID: ${userId}`);
      const singleUserResponse = await axios.get(`${BASE_URL}/${userId}`);
      console.log(`✅ Found user: ${singleUserResponse.data.data.name}`);
      console.log('');

      // UPDATE - Update user
      console.log(`📝 Updating user: ${userId}`);
      const updateData = {
        name: 'John Updated',
        age: 31,
        city: 'San Francisco'
      };
      const updateResponse = await axios.put(`${BASE_URL}/${userId}`, updateData);
      console.log(`✅ Updated user: ${updateResponse.data.data.name}`);
      console.log('');

      // DELETE - Delete user
      console.log(`🗑️  Deleting user: ${userId}`);
      await axios.delete(`${BASE_URL}/${userId}`);
      console.log('✅ User deleted successfully');
      console.log('');
    }

    // GET final state
    console.log('📖 Final state - Getting all users...');
    const finalResponse = await axios.get(BASE_URL);
    console.log(`✅ Final count: ${finalResponse.data.count} users`);
    
    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testAPI();
