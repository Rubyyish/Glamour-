// Quick test script to verify API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Testing Glamouré API...\n');

  // Test 1: Check if server is running
  try {
    const response = await axios.get('http://localhost:5001');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.error('❌ Server not reachable:', error.message);
    return;
  }

  // Test 2: Register a test user
  console.log('\n📝 Testing Registration...');
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123'
  };

  try {
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('   User:', registerResponse.data.user);
    console.log('   Token:', registerResponse.data.token ? 'Generated ✓' : 'Missing ✗');
  } catch (error) {
    if (error.response?.data?.message === 'User already exists') {
      console.log('ℹ️  User already exists (this is okay)');
    } else {
      console.error('❌ Registration failed:', error.response?.data || error.message);
    }
  }

  // Test 3: Login with the test user
  console.log('\n🔐 Testing Login...');
  const loginCredentials = {
    email: 'test@example.com',
    password: 'test123'
  };

  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginCredentials);
    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.user);
    console.log('   Token:', loginResponse.data.token ? 'Generated ✓' : 'Missing ✗');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }

  // Test 4: Try login with wrong password
  console.log('\n🔒 Testing Invalid Login...');
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    console.log('❌ Should have failed but succeeded!');
  } catch (error) {
    console.log('✅ Correctly rejected invalid credentials');
    console.log('   Error:', error.response?.data?.message);
  }

  console.log('\n✨ API Tests Complete!\n');
}

testAPI();