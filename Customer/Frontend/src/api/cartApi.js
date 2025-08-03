import api from './axios';

export const addToCart = async (productId, quantity = 1, price) => {
  try {
    const response = await api.post('/api/cart/add', { product_id: productId, quantity, price }, {
      withCredentials: true
    });
    console.log('🛒 Added to cart successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error adding to cart:', error.response?.data || error.message);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const response = await api.get('/api/cart', {
      withCredentials: true
    });
    console.log('🛒 Cart fetched successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error fetching cart:', error.response?.data || error.message);
    // Return empty cart instead of throwing error
    return { data: [] };
  }
};

export const removeFromCart = async (id) => {
  try {
    const response = await api.delete(`/api/cart/remove/${id}`, {
      withCredentials: true
    });
    console.log('🛒 Removed from cart successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error removing from cart:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCartQuantity = async (id, quantity) => {
  try {
    const response = await api.put(`/api/cart/update/${id}`, { quantity }, {
      withCredentials: true
    });
    console.log('🛒 Cart quantity updated successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error updating cart quantity:', error.response?.data || error.message);
    throw error;
  }
}; 