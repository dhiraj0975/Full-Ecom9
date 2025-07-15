import axios from 'axios';

export async function fetchCategories() {
  try {
    const response = await axios.get('/api/categories', { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
} 