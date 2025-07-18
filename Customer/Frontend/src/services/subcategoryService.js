import api from '../api/axios';

export const getSubcategories = async (categoryId) => {
  const response = await api.get(`/api/subcategories/${categoryId}`);
  return response;
}; 