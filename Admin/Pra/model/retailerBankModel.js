const { pool } = require("../Config/Db");

class RetailerBank {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        r.id as retailer_id,
        r.name,
        r.email,
        r.phone,
        r.address,
        r.business_name,
        r.status,
        r.created_at AS retailer_created_at,
        r.updated_at AS retailer_updated_at,
        b.bank_name,
        b.account_number,
        b.ifsc_code,
        b.account_holder_name,
        b.created_at AS bank_created_at,
        b.id as bank_id
      FROM
        retailers r
      LEFT JOIN
        retailer_bank_accounts b
      ON
        r.id = b.retailer_id;
    `);
    return rows;
  }

  static async create(data) {
    const { retailer_id, bank_name, account_number, ifsc_code, account_holder_name } = data;
    const [result] = await pool.query(
      `INSERT INTO retailer_bank_accounts (retailer_id, bank_name, account_number, ifsc_code, account_holder_name)
       VALUES (?, ?, ?, ?, ?)`,
      [retailer_id, bank_name, account_number, ifsc_code, account_holder_name]
    );
    return { id: result.insertId, ...data };
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    for (const key of ['bank_name', 'account_number', 'ifsc_code', 'account_holder_name']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE retailer_bank_accounts SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM retailer_bank_accounts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = RetailerBank;
