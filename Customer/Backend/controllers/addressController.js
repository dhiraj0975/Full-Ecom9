const addressModel = require('../models/addressModel');

exports.getAddressesByCustomer = async (req, res) => {
  try {
    const customer_id = req.user && req.user.id;
    if (!customer_id) return res.status(401).json({ message: 'Unauthorized: customer_id missing' });
    const addresses = await addressModel.getAddressesByCustomer(customer_id);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await addressModel.getAddressById(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (address.customer_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching address', error });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const address = req.body;
    address.customer_id = req.user.id;
    const id = await addressModel.addAddress(address);
    res.status(201).json({ message: 'Address added', id });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const address = req.body;
    const existing = await addressModel.getAddressById(id);
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    if (existing.customer_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const affected = await addressModel.updateAddress(id, address);
    res.status(200).json({ message: 'Address updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await addressModel.getAddressById(id);
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    if (existing.customer_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const affected = await addressModel.deleteAddress(id);
    res.status(200).json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error });
  }
}; 