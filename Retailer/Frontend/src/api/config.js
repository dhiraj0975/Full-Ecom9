// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL + "/api" || "http://localhost:5001/api" || "http://localhost:3001/api" || " http://localhost:5173/" ,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  // Retailer endpoints
  RETAILER: {
    REGISTER: "/retailers/register",
    LOGIN: "/retailers/login",
    LOGOUT: "/retailers/logout",
    PROFILE: "/retailers/profile",
    UPDATE_PROFILE: "/retailers/profile",
    GET_BANK_DETAILS: "/retailers/bank-details",
    UPDATE_BANK_DETAILS: "/retailers/bank-details",
    UPDATE: (id) => `/retailers/update/${id}`,
    DELETE: (id) => `/retailers/delete/${id}`,
  },

  // Product endpoints
  PRODUCT: {
    ALL: "/products",
    BY_ID: (id) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    MY_PRODUCTS: "/products/my/products",
    MY_STATS: "/products/my/stats",
  },

  // Subcategory endpoints
  SUBCATEGORY: {
    ALL: "/subcategories",
    BY_ID: (id) => `/subcategories/${id}`,
  },

  // Future endpoints (for scalability)
  ORDER: {
    ALL: "/orders",
    BY_ID: (id) => `/orders/${id}`,
    MY_ORDERS: "/orders/my/orders",
    CREATE: "/orders",
    UPDATE: (id) => `/orders/${id}`,
  },

  CUSTOMER: {
    ALL: "/customers",
    BY_ID: (id) => `/customers/${id}`,
    MY_CUSTOMERS: "/customers/my/customers",
  },

  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    SALES: "/analytics/sales",
    PRODUCTS: "/analytics/products",
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

export default API_CONFIG;
