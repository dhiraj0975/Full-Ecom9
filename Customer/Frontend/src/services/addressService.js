import axios from 'axios';

// Get address by ID
export const getAddressById = async (addressId) => {
  try {
    console.log('🌐 Making API call to fetch address:', addressId);
    const response = await axios.get(`/api/addresses/${addressId}`, {
      withCredentials: true
    });
    console.log('✅ Address API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Address API error:', error.response || error);
    throw error;
  }
};

// Get all addresses for current user
export const getMyAddresses = async () => {
  try {
    const response = await axios.get('/api/addresses', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 