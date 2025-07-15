import axios from 'axios';
import API_CONFIG, { HTTP_METHODS } from './config.js';

// Create axios instance with default config
const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  (config) => {
    // First try to get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If no token in localStorage, cookies will be automatically sent by browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      localStorage.removeItem('token');
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await httpClient(config);
  } catch (error) {
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && 
        (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Generic API request function
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  const config = {
    method,
    url: endpoint,
    ...options,
  };

  if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT || method === HTTP_METHODS.PATCH)) {
    config.data = data;
  }

  try {
    const response = await retryRequest(config);
    return {
      success: true,
      data: response.data, // Backend response is already in response.data
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

// Convenience methods
export const apiGet = (endpoint, options = {}) => apiRequest(HTTP_METHODS.GET, endpoint, null, options);
export const apiPost = (endpoint, data, options = {}) => apiRequest(HTTP_METHODS.POST, endpoint, data, options);
export const apiPut = (endpoint, data, options = {}) => apiRequest(HTTP_METHODS.PUT, endpoint, data, options);
export const apiDelete = (endpoint, options = {}) => apiRequest(HTTP_METHODS.DELETE, endpoint, null, options);
export const apiPatch = (endpoint, data, options = {}) => apiRequest(HTTP_METHODS.PATCH, endpoint, data, options);

export default httpClient; 