import axios from 'axios';

export async function fetchSubcategories(categoryId) {
  try {
    const response = await axios.get(`/api/subcategories/${categoryId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
} 