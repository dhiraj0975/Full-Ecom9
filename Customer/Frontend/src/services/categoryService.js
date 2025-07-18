import api from '../api/axios';

export const getCategories = async () => {
  const response = await api.get('/api/categories');
  return response;
}; 