import { apiGet, apiPost, apiPut, apiDelete } from './httpClient.js';
import { ENDPOINTS } from './config.js';

// Product API Functions

// Get all products (public)
export const getAllProducts = async () => {
  return await apiGet(ENDPOINTS.PRODUCT.ALL);
};

// Get product by ID (public)
export const getProductById = async (id) => {
  return await apiGet(ENDPOINTS.PRODUCT.BY_ID(id));
};

// Create new product (protected)
export const createProduct = async (productData) => {
  return await apiPost(ENDPOINTS.PRODUCT.CREATE, productData);
};

// Update product (protected)
export const updateProduct = async (id, productData) => {
  return await apiPut(ENDPOINTS.PRODUCT.UPDATE(id), productData);
};

// Delete product (protected)
export const deleteProduct = async (id) => {
  return await apiDelete(ENDPOINTS.PRODUCT.DELETE(id));
};

// Get retailer's products (protected)
export const getMyProducts = async () => {
  return await apiGet(ENDPOINTS.PRODUCT.MY_PRODUCTS);
};

// Get retailer's product statistics (protected)
export const getMyProductStats = async () => {
  return await apiGet(ENDPOINTS.PRODUCT.MY_STATS);
};

// Search products (if implemented in backend)
export const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query, ...filters });
  return await apiGet(`${ENDPOINTS.PRODUCT.ALL}?${params}`);
};

// Get products by category (if implemented in backend)
export const getProductsByCategory = async (categoryId) => {
  return await apiGet(`${ENDPOINTS.PRODUCT.ALL}?category=${categoryId}`);
};

// Get products by subcategory (if implemented in backend)
export const getProductsBySubcategory = async (subcategoryId) => {
  return await apiGet(`${ENDPOINTS.PRODUCT.ALL}?subcategory=${subcategoryId}`);
};

// Bulk operations (if implemented in backend)
export const bulkUpdateProducts = async (productIds, updateData) => {
  return await apiPut('/products/bulk-update', { productIds, updateData });
};

export const bulkDeleteProducts = async (productIds) => {
  return await apiDelete('/products/bulk-delete', { data: { productIds } });
}; 