import { apiGet } from './httpClient.js';
import { ENDPOINTS } from './config.js';

// Subcategory API Functions

// Get all subcategories (public)
export const getAllSubcategories = async () => {
  return await apiGet(ENDPOINTS.SUBCATEGORY.ALL);
};

// Get subcategory by ID (public)
export const getSubcategoryById = async (id) => {
  return await apiGet(ENDPOINTS.SUBCATEGORY.BY_ID(id));
}; 