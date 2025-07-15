const {
  createAddress,
  getAddressesByCustomerId,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../models/customerAddressModel');

// Create new address
const createAddressHandler = async (req, res) => {
  try {
    const { customer_id, name, phone, address_line, city, state, country, pincode, is_default } = req.body;
    if (!customer_id || !name || !phone || !address_line) {
      return res.status(400).json({ message: 'customer_id, name, phone, address_line are required' });
    }
    const addressId = await createAddress({ customer_id, name, phone, address_line, city, state, country, pincode, is_default });
    res.status(201).json({ message: 'Address created successfully', addressId });
  } catch (err) {
    console.error('Create address error:', err);
    res.status(500).json({ message: 'Failed to create address', error: err.message });
  }
};

// Get all addresses for a customer
const getAddressesByCustomerIdHandler = async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);
    if (!customer_id) {
      return res.status(400).json({ message: 'customer_id is required' });
    }
    const addresses = await getAddressesByCustomerId(customer_id);
    res.json({ message: 'Addresses retrieved successfully', addresses });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ message: 'Failed to get addresses', error: err.message });
  }
};

// Get address by id
const getAddressByIdHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Address id is required' });
    }
    const address = await getAddressById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json({ message: 'Address retrieved successfully', address });
  } catch (err) {
    console.error('Get address error:', err);
    res.status(500).json({ message: 'Failed to get address', error: err.message });
  }
};

// Update address
const updateAddressHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, phone, address_line, city, state, country, pincode, is_default } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Address id is required' });
    }
    const updated = await updateAddress(id, { name, phone, address_line, city, state, country, pincode, is_default });
    if (updated) {
      res.json({ message: 'Address updated successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ message: 'Failed to update address', error: err.message });
  }
};

// Delete address
const deleteAddressHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Address id is required' });
    }
    const deleted = await deleteAddress(id);
    if (deleted) {
      res.json({ message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ message: 'Failed to delete address', error: err.message });
  }
};

// Set default address
const setDefaultAddressHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Address id is required' });
    }
    const updated = await setDefaultAddress(id);
    if (updated) {
      res.json({ message: 'Default address set successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (err) {
    console.error('Set default address error:', err);
    res.status(500).json({ message: 'Failed to set default address', error: err.message });
  }
};

module.exports = {
  createAddressHandler,
  getAddressesByCustomerIdHandler,
  getAddressByIdHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler
}; 