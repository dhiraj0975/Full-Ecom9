// Product utility functions

// Get status display text
export const getStatusText = (status) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
    default:
      return status;
  }
};

// Get status color classes
export const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'unavailable':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get status icon
export const getStatusIcon = (status) => {
  switch (status) {
    case 'available':
      return '✅';
    case 'unavailable':
      return '❌';
    default:
      return '❓';
  }
};

// Format price
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

// Get stock status
export const getStockStatus = (quantity) => {
  if (quantity === 0) {
    return { text: 'Out of Stock', color: 'text-red-600', icon: '❌' };
  } else if (quantity < 10) {
    return { text: 'Low Stock', color: 'text-yellow-600', icon: '⚠️' };
  } else {
    return { text: 'In Stock', color: 'text-green-600', icon: '✅' };
  }
}; 