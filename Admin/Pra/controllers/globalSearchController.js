const { pool } = require("../Config/Db");

const globalSearch = async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : "";
  if (!q) return res.json({ results: [] });

  try {
    // Search Retailers
    const [retailers] = await pool.query(
      `SELECT id, name, email, business_name FROM retailers WHERE name LIKE ? OR email LIKE ? OR business_name LIKE ? LIMIT 5`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    // Search Products
    const [products] = await pool.query(
      `SELECT id, name, description FROM products WHERE name LIKE ? OR description LIKE ? LIMIT 5`,
      [`%${q}%`, `%${q}%`]
    );
    // Search Users
    const [users] = await pool.query(
      `SELECT id, name, email FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 5`,
      [`%${q}%`, `%${q}%`]
    );
    // Search Roles
    const [roles] = await pool.query(
      `SELECT role_id as id, role_name as name FROM admin_roles WHERE role_name LIKE ? LIMIT 5`,
      [`%${q}%`]
    );
    // Search Categories
    const [categories] = await pool.query(
      `SELECT id, name FROM categories WHERE name LIKE ? LIMIT 5`,
      [`%${q}%`]
    );
    // Search Subcategories
    const [subcategories] = await pool.query(
      `SELECT id, name FROM subcategories WHERE name LIKE ? LIMIT 5`,
      [`%${q}%`]
    );
    // Search Banks
    const [banks] = await pool.query(
      `SELECT id, bank_name as name, account_number FROM retailer_bank_accounts WHERE bank_name LIKE ? OR account_number LIKE ? LIMIT 5`,
      [`%${q}%`, `%${q}%`]
    );

    const results = [
      ...retailers.map(r => ({ type: "retailer", id: r.id, name: r.name, extra: r.business_name || r.email })),
      ...products.map(p => ({ type: "product", id: p.id, name: p.name, extra: p.description })),
      ...users.map(u => ({ type: "user", id: u.id, name: u.name, extra: u.email })),
      ...roles.map(r => ({ type: "role", id: r.id, name: r.name })),
      ...categories.map(c => ({ type: "category", id: c.id, name: c.name })),
      ...subcategories.map(s => ({ type: "subcategory", id: s.id, name: s.name })),
      ...banks.map(b => ({ type: "bank", id: b.id, name: b.name, extra: b.account_number })),
    ];

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

module.exports = { globalSearch }; 