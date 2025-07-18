import api from '../api/axios';

export const getProducts = async () => {
  const response = await api.get('/api/products');
  return response;
};

export const getProductById = async (id) => {
  const response2 = await api.get(`/api/products/${id}`);
  return response2;
}; 