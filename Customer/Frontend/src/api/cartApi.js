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
    
    // Handle both old and new response formats
    if (response.data && response.data.data) {
      return { data: response.data.data }; // New format
    } else if (Array.isArray(response.data)) {
      return { data: response.data }; // Old format
    } else {
      return { data: [] };
    }
  } catch (error) {
    console.error('❌ Error fetching cart:', error.response?.data || error.message);
    
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      console.log('🔐 User not authenticated, returning empty cart');
      return { data: [] };
    }
    
    // Check if it's a network error
    if (error.code === 'ERR_NETWORK') {
      console.log('🌐 Network error, returning empty cart');
      return { data: [] };
    }
    
    // Return empty cart for other errors
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