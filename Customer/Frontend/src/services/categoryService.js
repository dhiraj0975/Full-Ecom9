import api from '../api/axios';

export const getCategories = async () => {
  const response = await api.get('/api/categories');
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : []);
}; 