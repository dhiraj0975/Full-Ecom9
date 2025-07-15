try {
  console.log('Testing customerController import...');
  const customerController = require('./controllers/customerController');
  
  console.log('Available functions:', Object.keys(customerController));
  console.log('searchCustomers type:', typeof customerController.searchCustomers);
  console.log('getAllCustomers type:', typeof customerController.getAllCustomers);
  
  if (customerController.searchCustomers) {
    console.log('✅ searchCustomers function is available');
  } else {
    console.log('❌ searchCustomers function is missing');
  }
  
} catch (error) {
  console.error('Error loading customerController:', error.message);
} 