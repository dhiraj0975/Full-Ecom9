import api from '../api/axios';

export const getAddress = async (addressId) => {
  const response = await api.get(`/api/addresses/${addressId}`);
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get('/api/addresses');
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : []);
}; 