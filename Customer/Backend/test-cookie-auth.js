const axios = require('axios');

// Test cookie-based authentication
async function testCookieAuth() {
  try {
    // console.log('🧪 Testing Cookie-Based Authentication...');
    
    // Create axios instance with cookie support
    const client = axios.create({
      baseURL: 'http://localhost:5002/api/customers',
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Register a new user
    // console.log('\n📝 Test 1: Registering a new user...');
    const registerResponse = await client.post('/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456'
    });
    // console.log('✅ Registration successful:', registerResponse.data.message);

    // Test 2: Login (should set cookie)
    // console.log('\n🔐 Test 2: Logging in...');
    const loginResponse = await client.post('/login', {
      email: 'test@example.com',
      password: '123456'
    });
    // console.log('✅ Login successful:', loginResponse.data.message);
    // console.log('🍪 Cookie should be set automatically');

    // Test 3: Access protected route (should work with cookie)
    // console.log('\n🔒 Test 3: Accessing protected profile route...');
    const profileResponse = await client.get('/profile');
    // console.log('✅ Profile access successful:', profileResponse.data.data);

    // Test 4: Logout (should clear cookie)
    // console.log('\n🚪 Test 4: Logging out...');
    const logoutResponse = await client.post('/logout');
    // console.log('✅ Logout successful:', logoutResponse.data.message);
    // console.log('🍪 Cookie should be cleared');

    // Test 5: Try to access protected route after logout (should fail)
    // console.log('\n❌ Test 5: Trying to access protected route after logout...');
    try {
      await client.get('/profile');
    } catch (error) {
      // console.log('✅ Access denied as expected:', error.response.data.message);
    }

    // console.log('\n🎉 All cookie-based authentication tests passed!');

  } catch (error) {
    // console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test the function
testCookieAuth(); 