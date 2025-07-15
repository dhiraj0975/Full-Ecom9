import axios from 'axios';

export async function getAllProducts() {
  try {
    const response = await axios.get('/api/products', { withCredentials: true });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const response2 = await axios.get(`/api/products/${id}`, { withCredentials: true });
    const data2 = response2.data;
    return data2;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
} 