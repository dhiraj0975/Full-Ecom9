# Email Setup Guide for Customer Management System

## 🔧 Issue Resolution

The "Forgot Password" functionality was failing with a 500 error because:
1. Missing `.env` file with email configuration
2. Missing `getPasswordResetTemplate` function in email templates
3. Missing forgot password route in auth routes

## ✅ Fixed Issues

1. ✅ Added missing `getPasswordResetTemplate` function
2. ✅ Added forgot password route to auth routes
3. ✅ Created `env.sample` file with required configuration

## 📧 Email Configuration Setup

### Step 1: Create .env file
Copy `env.sample` to `.env` and configure your email settings:

```bash
# In Backend directory
cp env.sample .env
```

### Step 2: Configure Gmail SMTP

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update .env file**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-digit-app-password
   ```

### Step 3: Test Email Configuration

Run the email test script:
```bash
node test-email-issues.js
```

## 🚀 Available Email Endpoints

### 1. Password Reset (with reset link)
```
POST /api/email/reset-password
Body: { "email": "user@example.com" }
```

### 2. OTP Email (for forgot password)
```
POST /api/email/otp
Body: { "email": "user@example.com", "customerName": "User Name" }
```

### 3. Forgot Password (alternative endpoint)
```
POST /api/customers/forgot-password
Body: { "email": "user@example.com", "customerName": "User Name" }
```

### 4. Welcome Email
```
POST /api/email/welcome
Body: { "name": "User Name", "email": "user@example.com" }
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Ensure 2FA is enabled and app password is correct

2. **"Network error"**:
   - Check internet connection
   - Verify Gmail SMTP settings

3. **"500 Internal Server Error"**:
   - Check server logs for detailed error messages
   - Verify all environment variables are set

### Test Commands:

```bash
# Test email connection
curl -X GET http://localhost:5002/api/email/test

# Test OTP email
curl -X POST http://localhost:5002/api/email/otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","customerName":"Test User"}'

# Test password reset email
curl -X POST http://localhost:5002/api/email/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📱 Frontend Integration

The frontend is already configured to use:
- `http://localhost:5002/api/email/reset-password` for password reset
- The forgot password form will now work correctly

## 🔐 Security Notes

1. Never commit `.env` file to version control
2. Use strong, unique app passwords
3. Regularly rotate email credentials
4. Monitor email sending logs for suspicious activity

## 📞 Support

If you continue to have issues:
1. Check the server logs for detailed error messages
2. Verify your Gmail account settings
3. Test with the provided test scripts
4. Ensure all environment variables are properly configured 