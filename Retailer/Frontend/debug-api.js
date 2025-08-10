// Debug script to test API endpoints
const API_BASE = import.meta.env.VITE_API_BASE_URL ;

async function testAPI() {
  console.log('🔍 Testing API endpoints...');
  
  // Test 1: Get all products (public)
  try {
    console.log('\n📦 Testing GET /products (public)...');
    const response = await fetch(`${API_BASE}/products`);
    const data = await response.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: Get my products (protected - should fail without token)
  try {
    console.log('\n📦 Testing GET /products/my/products (protected)...');
    const response = await fetch(`${API_BASE}/products/my/products`);
    const data = await response.json();
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: Check if backend is running
  try {
    console.log('\n🔍 Testing backend health...');
    const response = await fetch(`${API_BASE}/products`);
    console.log('✅ Backend is running, status:', response.status);
  } catch (error) {
    console.error('❌ Backend not accessible:', error.message);
  }
}

// Run the test
testAPI(); 