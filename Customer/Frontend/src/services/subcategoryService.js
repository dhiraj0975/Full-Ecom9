import api from '../api/axios';

export const getSubcategories = async (categoryId) => {
  const response = await api.get(`/api/subcategories/${categoryId}`);
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : []);
}; 