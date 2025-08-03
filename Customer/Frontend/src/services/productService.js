import api from '../api/axios';

export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    console.log('📦 Products fetched successfully:', response.data);
    
    // Handle different response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.products)) {
      return response.data.products;
    } else {
      console.warn('⚠️ Unexpected products response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error.response?.data || error.message);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    console.log('📦 Product fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching product:', error.response?.data || error.message);
    throw error;
  }
}; 