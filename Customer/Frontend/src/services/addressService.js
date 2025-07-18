import api from '../api/axios';

export const getAddress = async (addressId) => {
  const response = await api.get(`/api/addresses/${addressId}`);
  return response;
};

export const getAddresses = async () => {
  const response = await api.get('/api/addresses');
  return response;
}; 