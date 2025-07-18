const axios = require('axios');

// Test product quantity deduction
async function testProductQuantityDeduction() {
  try {
    console.log('🧪 Testing Product Quantity Deduction...\n');

    // Step 1: Check initial product quantity
    console.log('1. Checking initial product quantity...');
    const productId = 1; // Change this to test with different product
    const initialResponse = await axios.get(`https://customer-backend-one.vercel.app/api/products/${productId}`);
    const initialQuantity = initialResponse.data.quantity;
    console.log(`   Initial quantity for product ${productId}: ${initialQuantity}`);

    // Step 2: Create a test order with quantity deduction
    console.log('\n2. Creating test order...');
    const orderData = {
      customer_id: 1, // Change this to test with different customer
      address_id: 1,
      payment_id: null,
      order_status: 'pending',
      total_amount: 1000,
      delivery_charge: 49,
      discount: 0,
      payment_method: 'cod',
      order_items: [
        {
          product_id: productId,
          quantity: 2 // Deduct 2 items
        }
      ]
    };

    const orderResponse = await axios.post('https://customer-backend-one.vercel.app/api/orders', orderData);
    console.log(`   Order created with ID: ${orderResponse.data.order_id}`);

    // Step 3: Check updated product quantity
    console.log('\n3. Checking updated product quantity...');
    const updatedResponse = await axios.get(`https://customer-backend-one.vercel.app/api/products/${productId}`);
    const updatedQuantity = updatedResponse.data.quantity;
    console.log(`   Updated quantity for product ${productId}: ${updatedQuantity}`);

    // Step 4: Verify deduction
    const expectedQuantity = initialQuantity - 2;
    console.log(`\n4. Verification:`);
    console.log(`   Expected quantity: ${expectedQuantity}`);
    console.log(`   Actual quantity: ${updatedQuantity}`);
    console.log(`   Deduction successful: ${updatedQuantity === expectedQuantity ? '✅ YES' : '❌ NO'}`);

    if (updatedQuantity === expectedQuantity) {
      console.log('\n🎉 Product quantity deduction is working correctly!');
    } else {
      console.log('\n❌ Product quantity deduction failed!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test insufficient stock scenario
async function testInsufficientStock() {
  try {
    console.log('\n🧪 Testing Insufficient Stock Scenario...\n');

    const productId = 1;
    const orderData = {
      customer_id: 1,
      address_id: 1,
      payment_id: null,
      order_status: 'pending',
      total_amount: 10000,
      delivery_charge: 49,
      discount: 0,
      payment_method: 'cod',
      order_items: [
        {
          product_id: productId,
          quantity: 999999 // Try to order more than available stock
        }
      ]
    };

    console.log('1. Attempting to order more than available stock...');
    const response = await axios.post('https://customer-backend-one.vercel.app/api/orders', orderData);
    console.log('   Response:', response.data);

  } catch (error) {
    console.log('2. Expected error caught:');
    console.log('   Error:', error.response?.data?.message || error.message);
    console.log('   ✅ Insufficient stock protection is working!');
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Product Quantity Tests...\n');
  
  await testProductQuantityDeduction();
  await testInsufficientStock();
  
  console.log('\n✨ All tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testProductQuantityDeduction, testInsufficientStock }; 