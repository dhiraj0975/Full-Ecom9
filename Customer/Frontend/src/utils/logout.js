export default function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
} 