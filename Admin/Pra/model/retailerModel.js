const { pool } = require("../Config/Db");

class Retailer {
  constructor(retailer) {
    this.id = retailer.id;
    this.name = retailer.name;
    this.email = retailer.email;
    this.password = retailer.password;
    this.phone = retailer.phone;
    this.address = retailer.address;
    this.business_name = retailer.business_name;
    this.status = retailer.status;
    this.created_at = retailer.created_at;
    this.updated_at = retailer.updated_at;
  }

  // Get all retailers
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM retailers ORDER BY id DESC");
    return rows;
  }

  // Get retailer by ID
  static async getById(id) {
    const [rows] = await pool.query("SELECT * FROM retailers WHERE id = ?", [id]);
    return rows[0];
  }

  // Create retailer
  static async create(newRetailer) {
    const query = `INSERT INTO retailers (name, email, password, phone, address, business_name, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(query, [
      newRetailer.name,
      newRetailer.email,
      newRetailer.password,
      newRetailer.phone,
      newRetailer.address,
      newRetailer.business_name,
      newRetailer.status || 'pending'
    ]);
    return { id: result.insertId, ...newRetailer };
  }

  // Update retailer
  static async update(id, retailer) {
    const query = `UPDATE retailers SET name = ?, email = ?, phone = ?, address = ?, business_name = ?, status = ? WHERE id = ?`;
    await pool.query(query, [
      retailer.name,
      retailer.email,
      retailer.phone,
      retailer.address,
      retailer.business_name,
      retailer.status,
      id
    ]);
    return true;
  }

  // Delete retailer
  static async delete(id) {
    const [result] = await pool.query("DELETE FROM retailers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

   // Get all retailers with product count
  static async getAllWithProductCount() {
    const [rows] = await pool.query(`
      SELECT r.*, COUNT(p.id) as product_count
      FROM retailers r
      LEFT JOIN products p ON p.retailer_id = r.id
      GROUP BY r.id
      ORDER BY r.id DESC
    `);
    return rows;
  }
  
}

module.exports = Retailer; 