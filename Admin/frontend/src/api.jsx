import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
  withCredentials: true,
});

// ========== Admin User APIs ==========
export const loginAdmin = (data) => API.post('/auth/login', data);                    // POST => /api/adminuser/login
export const logoutAdmin = () => API.post('/auth/logout');                             // ✅ POST method (as per REST practice)
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getAdminUsers = () => API.get('/users');                                // GET  => /api/adminuser
export const createAdminUser = (data) => API.post('/users', data);                // POST => /api/users
export const updateAdminUser = (id, data) => API.put(`/users/${id}`, data);       // PUT  => /api/adminuser/:id
export const deleteAdminUser = (id) => API.delete(`/users/${id}`);                // DELETE => /api/adminuser/:id
export const updateUserStatus = (id, status) => API.patch(`/users/${id}/status`, { status });

// ========== Admin Profile ==========
  export const getAdminProfile = () => API.get('/profile');

// ========== Roles ==========
export const getAllRoles = () => API.get('/roles');
export const createRole = (data) => API.post('/roles', data);
export const updateRole = (id, data) => API.put(`/roles/${id}`, data);
export const deleteRole = (id) => API.delete(`/roles/${id}`);
export const updateRoleStatus = (id, status) => API.patch(`/roles/${id}/status`, { status });

// ========== User Roles ==========
export const getUserRoles = () => API.get('/user-roles/assigned-users');
export const createUserRole = (data) => API.post('/user-roles', data);
export const updateUserRole = (id, data) => API.put(`/user-roles/${id}`, data);
export const deleteUserRole = (id) => API.delete(`/user-roles/${id}`);

// ✅ Multiple Role Assignment
export const assignMultipleRoles = (data) => API.post('/user-roles/assign-multiple', data);
export const getUserRolesByUserId = (userId) => API.get(`/user-roles/user-roles/${userId}`);
export const addRoleToUser = (data) => API.post('/user-roles/add-role', data);
export const removeRoleFromUser = (data) => API.post('/user-roles/remove-role', data);



// ==========  Category ==========
export const getProductCategories = () => API.get('/categories');
export const createProductCategory = (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProductCategory = (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProductCategory = (id) => API.delete(`/categories/${id}`);

// ========== Sub Category ==========
export const getProductSubCategories = () => API.get('/subcategories');
export const createProductSubCategory = (data) => API.post('/subcategories', data);
export const updateProductSubCategory = (id, data) => API.put(`/subcategories/${id}`, data);
export const deleteProductSubCategory = (id) => API.delete(`/subcategories/${id}`);

// ========== Products ==========
export const getAllProducts = () => API.get('/products');
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ========== Retailers ==========
export const getAllRetailers = () => API.get('/retailers');
export const createRetailer = (data) => API.post('/retailers', data);
export const updateRetailer = (id, data) => API.put(`/retailers/${id}`, data);
export const deleteRetailer = (id) => API.delete(`/retailers/${id}`);
export const getAllRetailersWithProductCount = () => API.get('/retailers/with-product-count');

// ========== Retailer Banks ==========
export const getAllRetailerBanks = () => API.get('/retailer-banks');
export const createRetailerBank = (data) => API.post('/retailer-banks', data);
export const updateRetailerBank = (id, data) => API.put(`/retailer-banks/${id}`, data);
export const deleteRetailerBank = (id) => API.delete(`/retailer-banks/${id}`);
