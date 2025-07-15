const RetailerBank = require('../model/retailerBankModel');

const getAllRetailersWithBank = async (req, res) => {
  try {
    const data = await RetailerBank.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching retailer bank details", error: err.message });
  }
};

const createBankAccount = async (req, res) => {
  try {
    const { retailer_id, bank_name, account_number, ifsc_code, account_holder_name } = req.body;

    // Validation
    if (!retailer_id || !bank_name || !account_number || !ifsc_code || !account_holder_name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const data = await RetailerBank.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating bank account", error: err.message });
  }
};

const updateBankAccount = async (req, res) => {
  try {
    const updated = await RetailerBank.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Bank account not found or nothing to update" });
    }
    res.json({ success: true, message: "Bank account updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating bank account", error: err.message });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const deleted = await RetailerBank.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Bank account not found" });
    }
    res.json({ success: true, message: "Bank account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting bank account", error: err.message });
  }
};

module.exports = {
  getAllRetailersWithBank,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
