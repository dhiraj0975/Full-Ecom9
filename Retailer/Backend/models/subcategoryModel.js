const { pool } = require('../Config/Db');

async function getAllSubcategories() {
  const [rows] = await pool.query('SELECT id, name FROM subcategories');
  return rows;
}

module.exports = { getAllSubcategories }; 