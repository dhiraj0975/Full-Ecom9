# Full-Ecom9 - Complete E-commerce Solution

A comprehensive e-commerce platform with three main components: Admin Panel, Customer Portal, and Retailer Dashboard.

## 🏗️ Project Structure

```
Full-Ecom9/
├── Admin/           # Admin Panel (Frontend + Backend)
├── Customer/        # Customer Portal (Frontend + Backend)
└── Retailer/        # Retailer Dashboard (Frontend + Backend)
```

## 📁 Components

### 1. Admin Panel (`/Admin`)
- **Frontend**: React.js admin dashboard
- **Backend**: Node.js API for admin operations
- **Features**: User management, product management, order management, analytics

### 2. Customer Portal (`/Customer`)
- **Frontend**: React.js customer interface
- **Backend**: Node.js API for customer operations
- **Features**: Product browsing, shopping cart, checkout, order tracking

### 3. Retailer Dashboard (`/Retailer`)
- **Frontend**: React.js retailer interface
- **Backend**: Node.js API for retailer operations
- **Features**: Product management, order fulfillment, customer management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhiraj0975/Full-Ecom9.git
   cd Full-Ecom9
   ```

2. **Install dependencies for each component**

   **Admin Panel:**
   ```bash
   cd Admin/frontend && npm install
   cd ../Pra && npm install
   ```

   **Customer Portal:**
   ```bash
   cd Customer/Frontend && npm install
   cd ../Backend && npm install
   ```

   **Retailer Dashboard:**
   ```bash
   cd Retailer/Frontend && npm install
   cd ../Backend && npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in each backend directory
   - Configure your environment variables

4. **Start the applications**

   **Admin Panel:**
   ```bash
   # Backend
   cd Admin/Pra && npm start
   # Frontend (in new terminal)
   cd Admin/frontend && npm run dev
   ```

   **Customer Portal:**
   ```bash
   # Backend
   cd Customer/Backend && npm start
   # Frontend (in new terminal)
   cd Customer/Frontend && npm run dev
   ```

   **Retailer Dashboard:**
   ```bash
   # Backend
   cd Retailer/Backend && npm start
   # Frontend (in new terminal)
   cd Retailer/Frontend && npm run dev
   ```

## 🔧 Configuration

Each component has its own configuration files:
- Database connection settings
- API endpoints
- Authentication settings
- Payment gateway configuration

## 📝 Features

### Admin Panel
- User management and role assignment
- Product and category management
- Order monitoring and analytics
- System configuration

### Customer Portal
- Product catalog and search
- Shopping cart functionality
- Secure checkout process
- Order history and tracking

### Retailer Dashboard
- Product inventory management
- Order processing and fulfillment
- Customer relationship management
- Sales analytics

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Environment variable protection

## 📦 Dependencies

### Frontend (React)
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- React Hook Form for forms

### Backend (Node.js)
- Express.js framework
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Dhiraj** - [GitHub](https://github.com/dhiraj0975)

## 🙏 Acknowledgments

- React.js community
- Node.js ecosystem
- MongoDB team
- All contributors and supporters 