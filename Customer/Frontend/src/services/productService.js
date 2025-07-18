import api from '../api/axios';

export const getProducts = async () => {
  const response = await api.get('/api/products');
  // If response.data is an array, return it; else return empty array
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.products) ? response.data.products : []);
};

export const getProductById = async (id) => {
  const response2 = await api.get(`/api/products/${id}`);
  return response2.data;
}; 