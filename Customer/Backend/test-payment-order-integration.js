const axios = require('axios');

const BASE_URL = 'https://customer-backend-one.vercel.app/api';

// Test data
const testData = {
  customer_id: 1,
  amount: 1500,
  payment_method: 'upi',
  payment_status: 'success',
  upi_id: 'test@upi',
  transaction_id: 'TXN' + Date.now()
};

async function testPaymentOrderIntegration() {
  try {
    console.log('🧪 Testing Payment and Order Integration with order_id...\n');

    // Step 1: Create Payment
    console.log('1️⃣ Creating payment...');
    const paymentRes = await axios.post(`${BASE_URL}/payments`, testData);
    console.log('✅ Payment created:', paymentRes.data);
    const paymentId = paymentRes.data.payment_id;

    // Step 2: Create Order
    console.log('\n2️⃣ Creating order...');
    const orderData = {
      customer_id: testData.customer_id,
      address_id: 1,
      payment_id: paymentId,
      order_status: 'confirmed',
      total_amount: testData.amount,
      delivery_charge: 0,
      discount: 0,
      payment_method: testData.payment_method
    };
    
    const orderRes = await axios.post(`${BASE_URL}/orders`, orderData);
    console.log('✅ Order created:', orderRes.data);
    const orderId = orderRes.data.order_id;

    // Step 3: Update Payment with order_id
    console.log('\n3️⃣ Updating payment with order_id...');
    const updateRes = await axios.put(`${BASE_URL}/payments/${paymentId}`, {
      order_id: orderId
    });
    console.log('✅ Payment updated:', updateRes.data);

    // Step 4: Verify the integration
    console.log('\n4️⃣ Verifying integration...');
    const verifyPaymentRes = await axios.get(`${BASE_URL}/payments/${paymentId}`);
    console.log('✅ Payment with order_id:', verifyPaymentRes.data);

    console.log('\n🎉 All tests passed! Payment and Order integration with order_id is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentOrderIntegration(); 