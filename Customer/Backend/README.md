# Customer Management API

A comprehensive REST API for customer management with authentication, email functionality, and database operations.

## Features

- ✅ **Authentication System**
  - Customer registration with email verification
  - Login with JWT tokens
  - Password change functionality
  - Profile management
  - Customer state management (active/inactive/pending)

- ✅ **Email System**
  - Welcome emails for new registrations
  - Password reset emails
  - Custom email sending
  - Beautiful HTML email templates
  - Email connection testing

- ✅ **Database Operations**
  - MySQL database with connection pooling
  - Secure password hashing
  - Customer CRUD operations
  - State management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with Gmail SMTP
- **Security**: bcrypt for password hashing
- **Validation**: Input validation and sanitization

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Customer/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5002
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=customer_store
   DB_PORT=3306

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Database Setup**
   ```sql
   CREATE DATABASE customer_store;
   USE customer_store;

   CREATE TABLE customers (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL,
     phone VARCHAR(20),
     password VARCHAR(255) NOT NULL,
     address TEXT,
     city VARCHAR(50),
     state ENUM('active', 'inactive', 'pending') DEFAULT 'active',
     pincode VARCHAR(10),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

5. **Email Setup**
   - For Gmail: Enable 2-factor authentication and generate an App Password
   - For Outlook: Use your regular password or generate an App Password
   - Update the `.env` file with your email credentials

6. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication Routes
```
POST /api/customers/register     - Register new customer
POST /api/customers/login        - Login customer
GET  /api/customers/profile      - Get customer profile (protected)
PUT  /api/customers/profile      - Update customer profile (protected)
PUT  /api/customers/password     - Change password (protected)
GET  /api/customers              - Get all customers (protected)
PUT  /api/customers/:id/state    - Update customer state (protected)
```

### Email Routes
```
GET  /api/email/test             - Test email connection
POST /api/email/welcome          - Send welcome email
POST /api/email/reset-password   - Send password reset email
POST /api/email/custom           - Send custom email
```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in your `.env` file

### Email Templates
The system includes beautiful HTML email templates:
- **Welcome Email**: Sent automatically on registration
- **Password Reset**: Sent when user requests password reset
- **Custom Email**: For sending any custom HTML email

## Request Examples

### Register Customer
```bash
curl -X POST http://localhost:5002/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "address": "123 Main St",
    "city": "New York",
    "state": "active",
    "pincode": "10001"
  }'
```

### Login Customer
```bash
curl -X POST http://localhost:5002/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Send Password Reset Email
```bash
curl -X POST http://localhost:5002/api/email/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Test Email Connection
```bash
curl -X GET http://localhost:5002/api/email/test
```

## Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Conflict errors (409)
- Server errors (500)

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **CORS Protection**: Configured CORS for frontend integration
- **Environment Variables**: Sensitive data stored in environment variables

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT secret
3. Configure a production database
4. Set up a production email service
5. Use HTTPS in production
6. Configure proper CORS origins

## Troubleshooting

### Email Issues
- Check your email credentials in `.env`
- Ensure 2-factor authentication is enabled for Gmail
- Verify your app password is correct
- Check firewall settings for SMTP ports

### Database Issues
- Verify MySQL is running
- Check database credentials
- Ensure the database and table exist
- Check connection pool settings

### Authentication Issues
- Verify JWT secret is set
- Check token expiration settings
- Ensure proper CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 