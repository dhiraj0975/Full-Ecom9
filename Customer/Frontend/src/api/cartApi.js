import axios from 'axios';

export const addToCart = async (productId, quantity = 1, price) => {
  return axios.post('/api/cart/add', { product_id: productId, quantity, price }, {
    withCredentials: true
  });
};

export const getCart = async () => {
  return axios.get('/api/cart', {
    withCredentials: true
  });
};

export const removeFromCart = async (id) => {
  return axios.delete(`/api/cart/remove/${id}`, {
    withCredentials: true
  });
};

export const updateCartQuantity = async (id, quantity) => {
  return axios.put(`/api/cart/update/${id}`, { quantity }, {
    withCredentials: true
  });
}; 