const Retailer = require('../model/retailerModel');
const bcrypt = require('bcrypt');

// Get all retailers
const getAllRetailers = async (req, res) => {
  try {
    const retailers = await Retailer.getAll();
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching retailers', error: err.message });
  }
};

// Get single retailer
const getRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.getById(req.params.id);
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    res.json(retailer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching retailer', error: err.message });
  }
};

// Create retailer
const createRetailer = async (req, res) => {
  try {
    const { name, email, password, phone, address, business_name, status } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const retailer = await Retailer.create({ name, email, password: hashedPassword, phone, address, business_name, status });
    res.status(201).json(retailer);
  } catch (err) {
    res.status(500).json({ message: 'Error creating retailer', error: err.message });
  }
};

// Update retailer
const updateRetailer = async (req, res) => {
  try {
    const { name, email, password, phone, address, business_name, status } = req.body;
    const retailer = await Retailer.getById(req.params.id);
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    let updateData = { name, email, phone, address, business_name, status };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await Retailer.update(req.params.id, updateData);
    res.json({ ...retailer, ...updateData });
  } catch (err) {
    res.status(500).json({ message: 'Error updating retailer', error: err.message });
  }
};

// Delete retailer
const deleteRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.getById(req.params.id);
    if (!retailer) return res.status(404).json({ message: 'Retailer not found' });
    await Retailer.delete(req.params.id);
    res.json({ message: 'Retailer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting retailer', error: err.message });
  }
};

// Get all retailers with product count
const getAllRetailersWithProductCount = async (req, res) => {
  try {
    const retailers = await Retailer.getAllWithProductCount();
    res.json({ success: true, data: retailers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching retailers with product count', error: err.message });
  }
};

module.exports = { getAllRetailers, getRetailer, createRetailer, updateRetailer, deleteRetailer, getAllRetailersWithProductCount };