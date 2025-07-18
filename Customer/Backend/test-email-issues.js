const axios = require('axios');

// Test email issues comprehensively
async function testEmailIssues() {
  try {
    console.log('Testing Email Issues...');
    
    // Create axios instance
    const client = axios.create({
      baseURL: 'https://customer-backend-one.vercel.app/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Check if server is running
    console.log('\nTest 1: Checking server connection...');
    try {
      const serverResponse = await client.get('/');
      console.log('Server is running:', serverResponse.data);
    } catch (error) {
      console.log('Server not running:', error.message);
      return;
    }

    // Test 2: Test email connection
    console.log('\nTest 2: Testing email connection...');
    try {
      const emailTestResponse = await client.get('/email/test');
      console.log('Email connection test:', emailTestResponse.data);
    } catch (error) {
      console.log('Email connection failed:', error.response?.data || error.message);
    }

    // Test 3: Send OTP email with detailed error handling
    console.log('\nTest 3: Sending OTP email...');
    try {
      const otpResponse = await client.post('/email/otp', {
        email: 'test@example.com',
        customerName: 'Test User'
      });
      
      if (otpResponse.data.success) {
        console.log('OTP email sent successfully!');
        console.log('Generated OTP:', otpResponse.data.otp);
        console.log('Message ID:', otpResponse.data.messageId);
        
        // Test 4: Verify OTP and reset password
        console.log('\nTest 4: Verifying OTP and resetting password...');
        try {
          const verifyResponse = await client.post('/customers/verify-otp-reset', {
            email: 'test@example.com',
            otp: otpResponse.data.otp,
            newPassword: 'newpassword123'
          });
          
          if (verifyResponse.data.success) {
            console.log('Password reset successful!');
            console.log('Message:', verifyResponse.data.message);
          } else {
            console.log('Password reset failed:', verifyResponse.data.message);
          }
        } catch (verifyError) {
          console.log('OTP verification failed:', verifyError.response?.data || verifyError.message);
        }
        
      } else {
        console.log('OTP email failed:', otpResponse.data.message);
        console.log('Error details:', otpResponse.data.error);
      }
      
    } catch (otpError) {
      console.log('OTP email request failed:', otpError.response?.data || otpError.message);
      
      // Check if it's an email configuration issue
      if (otpError.response?.data?.error) {
        const errorMsg = otpError.response.data.error;
        if (errorMsg.includes('Invalid login') || errorMsg.includes('authentication')) {
          console.log('Issue: Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env file');
        } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('network')) {
          console.log('Issue: Network connectivity problem');
        } else if (errorMsg.includes('ECONNREFUSED')) {
          console.log('Issue: Email server connection refused');
        } else {
          console.log('Issue: Unknown email error -', errorMsg);
        }
      }
    }

    // Test 5: Test with different email template
    console.log('\nTest 5: Testing welcome email...');
    try {
      const welcomeResponse = await client.post('/email/welcome', {
        name: 'Test User',
        email: 'test@example.com'
      });
      
      if (welcomeResponse.data.success) {
        console.log('Welcome email sent successfully!');
      } else {
        console.log('Welcome email failed:', welcomeResponse.data.message);
      }
    } catch (welcomeError) {
      console.log('Welcome email failed:', welcomeError.response?.data || welcomeError.message);
    }

    console.log('\nEmail testing completed!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test the function
testEmailIssues(); 