const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// console.log('Email Setup for Customer Management System');
// console.log('=============================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envSamplePath = path.join(__dirname, 'env.sample');

if (!fs.existsSync(envPath)) {
  // console.log('.env file not found!');
  
  if (fs.existsSync(envSamplePath)) {
    // console.log('Creating .env file from env.sample...');
    
    try {
      const envSample = fs.readFileSync(envSamplePath, 'utf8');
      fs.writeFileSync(envPath, envSample);
      // console.log('.env file created successfully!');
      // console.log('Please update the EMAIL_USER and EMAIL_PASS in the .env file');
    } catch (error) {
      // console.error('Failed to create .env file:', error.message);
      process.exit(1);
    }
  } else {
    // console.error('env.sample file not found!');
    process.exit(1);
  }
} else {
  // console.log('.env file already exists');
}

// console.log('\nEmail Configuration Instructions:');
// console.log('====================================');
// console.log('1. Open your .env file in the Backend directory');
// console.log('2. Update the following variables:');
// console.log('   - EMAIL_USER: Your Gmail address');
// console.log('   - EMAIL_PASS: Your Gmail app password (16 characters)');
// console.log('\n3. To get a Gmail app password:');
// console.log('   - Enable 2-Factor Authentication on your Gmail account');
// console.log('   - Go to Google Account Settings → Security → 2-Step Verification');
// console.log('   - Click on "App passwords" and generate one for "Mail"');
// console.log('\n4. Test the configuration by running:');
// console.log('   node test-email-issues.js');

// console.log('\nAvailable Email Endpoints:');
// console.log('=============================');
// console.log('• POST /api/email/reset-password - Send password reset email');
// console.log('• POST /api/email/otp - Send OTP email');
// console.log('• POST /api/customers/forgot-password - Alternative forgot password endpoint');
// console.log('• GET /api/email/test - Test email connection');

// console.log('\nTroubleshooting:');
// console.log('==================');
// console.log('• If you get "Invalid login" error: Check EMAIL_USER and EMAIL_PASS');
// console.log('• If you get "Network error": Check internet connection');
// console.log('• If you get "500 error": Check server logs for details');

// console.log('\nSetup complete! Your forgot password functionality should now work.');
// console.log('The frontend will automatically use the correct endpoints.');

rl.close(); 