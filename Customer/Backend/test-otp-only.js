const axios = require('axios');

// Test OTP-only email functionality
async function testOTPOnly() {
  try {
    console.log('🧪 Testing OTP-Only Email Functionality...');
    
    // Create axios instance
    const client = axios.create({
      baseURL: import.meta.env.VITE_API_URL +'/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Send OTP email (OTP only, no reset button)
    console.log('\n📧 Test 1: Sending OTP-only email...');
    const otpResponse = await client.post('/email/otp', {
      email: 'test@example.com',
      customerName: 'Test User'
    });
    
    if (otpResponse.data.success) {
      console.log('✅ OTP email sent successfully!');
      console.log('🔢 Generated OTP:', otpResponse.data.otp);
      console.log('📨 Message ID:', otpResponse.data.messageId);
      
      // Test 2: Verify OTP and reset password
      console.log('\n🔐 Test 2: Verifying OTP and resetting password...');
      const verifyResponse = await client.post('/customers/verify-otp-reset', {
        email: 'test@example.com',
        otp: otpResponse.data.otp,
        newPassword: 'newpassword123'
      });
      
      if (verifyResponse.data.success) {
        console.log('✅ Password reset successful!');
        console.log('📝 Message:', verifyResponse.data.message);
      } else {
        console.log('❌ Password reset failed:', verifyResponse.data.message);
      }
      
    } else {
      console.log('❌ OTP email failed:', otpResponse.data.message);
    }

    console.log('\n🎉 OTP-only functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test the function
testOTPOnly(); 