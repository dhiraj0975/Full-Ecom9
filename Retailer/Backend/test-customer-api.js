// Test file for customer API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
let authToken = '';

// Test data
const testCustomer = {
  name: 'Test Customer',
  email: 'test.customer@email.com',
  phone: '9876543200',
  address: 'Test Address',
  city: 'Test City',
  state: 'Test State',
  pincode: '123456'
};

// Helper function to get auth token
async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/retailers/login`, {
      email: 'test@retailer.com',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test functions
async function testCreateCustomer() {
  try {
    console.log('\n🧪 Testing Create Customer...');
    const response = await axios.post(`${BASE_URL}/customers`, testCustomer, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Create Customer Success:', response.data);
    return response.data.customerId;
  } catch (error) {
    console.error('❌ Create Customer Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetAllCustomers() {
  try {
    console.log('\n🧪 Testing Get All Customers...');
    const response = await axios.get(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get All Customers Success:', response.data);
  } catch (error) {
    console.error('❌ Get All Customers Failed:', error.response?.data || error.message);
  }
}

async function testGetCustomerById(customerId) {
  try {
    console.log('\n🧪 Testing Get Customer by ID...');
    const response = await axios.get(`${BASE_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Customer by ID Success:', response.data);
  } catch (error) {
    console.error('❌ Get Customer by ID Failed:', error.response?.data || error.message);
  }
}

async function testUpdateCustomer(customerId) {
  try {
    console.log('\n🧪 Testing Update Customer...');
    const updateData = {
      ...testCustomer,
      name: 'Updated Test Customer',
      email: 'updated.test@email.com'
    };
    const response = await axios.put(`${BASE_URL}/customers/${customerId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Update Customer Success:', response.data);
  } catch (error) {
    console.error('❌ Update Customer Failed:', error.response?.data || error.message);
  }
}

async function testGetCustomerStats() {
  try {
    console.log('\n🧪 Testing Get Customer Stats...');
    const response = await axios.get(`${BASE_URL}/customers/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Customer Stats Success:', response.data);
  } catch (error) {
    console.error('❌ Get Customer Stats Failed:', error.response?.data || error.message);
  }
}

async function testDeleteCustomer(customerId) {
  try {
    console.log('\n🧪 Testing Delete Customer...');
    const response = await axios.delete(`${BASE_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Delete Customer Success:', response.data);
  } catch (error) {
    console.error('❌ Delete Customer Failed:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Customer API Tests...');
  
  // Get auth token
  authToken = await getAuthToken();
  if (!authToken) {
    console.error('❌ Authentication failed. Please check your credentials.');
    return;
  }
  
  console.log('✅ Authentication successful');
  
  // Run tests
  const customerId = await testCreateCustomer();
  await testGetAllCustomers();
  await testGetCustomerStats();
  
  if (customerId) {
    await testGetCustomerById(customerId);
    await testUpdateCustomer(customerId);
    await testDeleteCustomer(customerId);
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCreateCustomer,
  testGetAllCustomers,
  testGetCustomerById,
  testUpdateCustomer,
  testGetCustomerStats,
  testDeleteCustomer
}; 