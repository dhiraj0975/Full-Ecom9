# API Structure Documentation

## Overview
This directory contains a dynamic and scalable API structure for the Retailer Dashboard frontend. The API is designed to be maintainable, consistent, and easily extensible.

## File Structure

```
api/
├── config.js          # Centralized API configuration and endpoints
├── httpClient.js      # HTTP client with interceptors and error handling
├── retailerApi.jsx    # Retailer-specific API functions
├── productApi.jsx     # Product-specific API functions
├── orderApi.jsx       # Order-specific API functions (future)
├── analyticsApi.jsx   # Analytics-specific API functions (future)
├── index.js          # Main export file
└── README.md         # This documentation
```

## Key Features

### 1. Centralized Configuration (`config.js`)
- Environment-based API base URL
- Centralized endpoint definitions
- HTTP method constants
- Easy to modify and extend

### 2. Advanced HTTP Client (`httpClient.js`)
- Automatic token management
- Request/response interceptors
- Retry mechanism for failed requests
- Comprehensive error handling
- Automatic logout on 401 errors

### 3. Consistent API Functions
- All functions return standardized response format
- Built-in error handling
- Type-safe function signatures
- Easy to test and debug

## Usage Examples

### Basic API Call
```javascript
import { getAllProducts } from '../api';

const fetchProducts = async () => {
  const response = await getAllProducts();
  if (response.success) {
    console.log('Products:', response.data);
  } else {
    console.error('Error:', response.error);
  }
};
```

### Authentication
```javascript
import { loginRetailer, isAuthenticated, getCurrentUser } from '../api';

// Login
const login = async (email, password) => {
  const response = await loginRetailer({ email, password });
  if (response.success) {
    // Token is automatically stored
    console.log('Logged in:', response.data.retailer);
  }
};

// Check authentication
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Current user:', user);
}
```

### Error Handling
```javascript
import { handleApiError, formatApiResponse } from '../api';

const handleResponse = (response) => {
  const formatted = formatApiResponse(response);
  if (!formatted.success) {
    const error = handleApiError(formatted);
    // Handle error appropriately
  }
};
```

## Environment Configuration

Create a `.env` file in the Frontend root:

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_APP_NAME=Retailer Dashboard
VITE_DEBUG_MODE=true
```

## Available Endpoints

### Retailer Endpoints
- `POST /retailers/register` - Register new retailer
- `POST /retailers/login` - Login retailer
- `PUT /retailers/update/:id` - Update retailer profile
- `DELETE /retailers/delete/:id` - Delete retailer

### Product Endpoints
- `GET /products` - Get all products (public)
- `GET /products/:id` - Get product by ID (public)
- `POST /products` - Create product (protected)
- `PUT /products/:id` - Update product (protected)
- `DELETE /products/:id` - Delete product (protected)
- `GET /products/my/products` - Get retailer's products (protected)
- `GET /products/my/stats` - Get product statistics (protected)

### Future Endpoints
- Order management
- Customer management
- Analytics and reporting
- Bulk operations

## Best Practices

1. **Always check response.success** before accessing data
2. **Use the centralized error handling** for consistent UX
3. **Import from the index file** for cleaner imports
4. **Add new endpoints to config.js** for consistency
5. **Test API functions** before using in components

## Extending the API

To add new API endpoints:

1. Add endpoint to `config.js` ENDPOINTS object
2. Create API functions in appropriate module
3. Export from `index.js`
4. Update this documentation

Example:
```javascript
// In config.js
ANALYTICS: {
  DASHBOARD: '/analytics/dashboard',
  SALES: '/analytics/sales',
}

// In analyticsApi.jsx
export const getDashboardAnalytics = async () => {
  return await apiGet(ENDPOINTS.ANALYTICS.DASHBOARD);
};

// In index.js
export { getDashboardAnalytics } from './analyticsApi.jsx';
``` 