import api from './axios';



export const addToCart = async (productId, quantity = 1, price) => {
  return api.post('/api/cart/add', { product_id: productId, quantity, price }, {
    withCredentials: true
  });
};

export const getCart = async () => {
  return api.get('/api/cart', {
    withCredentials: true
  });
};

export const removeFromCart = async (id) => {
  return api.delete(`/api/cart/remove/${id}`, {
    withCredentials: true
  });
};

export const updateCartQuantity = async (id, quantity) => {
  return api.put(`/api/cart/update/${id}`, { quantity }, {
    withCredentials: true
  });
}; 