const express = require('express');
const customerAddressRoutes = express.Router();
const {
  createAddressHandler,
  getAddressesByCustomerIdHandler,
  getAddressByIdHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler
} = require('../controllers/customerAddressController');


// Create new address
customerAddressRoutes.post('/', createAddressHandler);
// Get all addresses for a customer
customerAddressRoutes.get('/customer/:customer_id', getAddressesByCustomerIdHandler);
// Get address by id
customerAddressRoutes.get('/:id', getAddressByIdHandler);
// Update address
customerAddressRoutes.put('/:id', updateAddressHandler);
// Delete address
customerAddressRoutes.delete('/:id', deleteAddressHandler);
// Set default address
customerAddressRoutes.patch('/:id/default', setDefaultAddressHandler);

module.exports = customerAddressRoutes; 