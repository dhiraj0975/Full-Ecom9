const { pool } = require('../Config/Db');

// Create bank account
async function createBankAccount(bankData) {
  const { retailer_id, bank_name, account_number, ifsc_code, account_holder_name } = bankData;
  
  const query = `
    INSERT INTO retailer_bank_accounts (retailer_id, bank_name, account_number, ifsc_code, account_holder_name) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.query(query, [retailer_id, bank_name, account_number, ifsc_code, account_holder_name]);
  return result.insertId;
}

// Get bank account by retailer ID
async function getBankAccountByRetailerId(retailer_id) {
  const [rows] = await pool.query('SELECT * FROM retailer_bank_accounts WHERE retailer_id = ?', [retailer_id]);
  return rows[0];
}

// Update bank account
async function updateBankAccount(retailer_id, bankData) {
  const { bank_name, account_number, ifsc_code, account_holder_name } = bankData;
  
  const query = `
    UPDATE retailer_bank_accounts 
    SET bank_name = ?, account_number = ?, ifsc_code = ?, account_holder_name = ?
    WHERE retailer_id = ?
  `;
  
  const [result] = await pool.query(query, [bank_name, account_number, ifsc_code, account_holder_name, retailer_id]);
  return result.affectedRows > 0;
}

// Delete bank account
async function deleteBankAccount(retailer_id) {
  const [result] = await pool.query('DELETE FROM retailer_bank_accounts WHERE retailer_id = ?', [retailer_id]);
  return result.affectedRows > 0;
}

// Check if bank account exists
async function bankAccountExists(retailer_id) {
  const [rows] = await pool.query('SELECT id FROM retailer_bank_accounts WHERE retailer_id = ?', [retailer_id]);
  return rows.length > 0;
}

module.exports = {
  createBankAccount,
  getBankAccountByRetailerId,
  updateBankAccount,
  deleteBankAccount,
  bankAccountExists
}; 