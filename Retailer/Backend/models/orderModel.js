const { pool } = require('../Config/Db');

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

// Create new order
async function createOrder(orderData) {
  const { customer_id, total_amount, delivery_charge = 0.00, discount = 0.00, payment_method, address_id = null, payment_id = null } = orderData;
  
  const query = `
    INSERT INTO orders (customer_id, total_amount, delivery_charge, discount, payment_method, address_id, payment_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.query(query, [
    customer_id, total_amount, delivery_charge, discount, payment_method, address_id, payment_id
  ]);
  
  return { orderId: result.insertId };
}

// Add order items
async function addOrderItems(orderId, items) {
  // First validate that all products belong to valid retailers
  for (const item of items) {
    const [productRows] = await pool.query(
      'SELECT retailer_id FROM products WHERE id = ?',
      [item.product_id]
    );
    
    if (productRows.length === 0) {
      throw new Error(`Product ${item.product_id} not found`);
    }
    
    if (!productRows[0].retailer_id) {
      throw new Error(`Product ${item.product_id} is not assigned to any retailer`);
    }
  }

  const values = items.map(item => [
    orderId, 
    item.product_id, 
    item.quantity, 
    item.unit_price, 
    item.total_price
  ]);
  
  const query = `
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
    VALUES ?
  `;
  
  const [result] = await pool.query(query, [values]);
  return result.affectedRows;
}

// Get order by ID with full details
async function getOrderById(orderId, retailerId = null) {
  let query = `
    SELECT o.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
  `;
  
  const params = [orderId];
  
  // If retailerId is provided, filter by retailer's products
  if (retailerId) {
    query += `
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND p.retailer_id = ?
    `;
    params.push(retailerId);
  } else {
    query += ` WHERE o.id = ?`;
  }
  
  const [rows] = await pool.query(query, params);
  return rows[0];
}

// Get order items
async function getOrderItems(orderId, retailerId = null) {
  let query = `
    SELECT oi.*, p.name as product_name, p.image_url, p.retailer_id
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;
  const params = [orderId];
  if (retailerId) {
    query += ' AND p.retailer_id = ?';
    params.push(retailerId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
}

// Get all orders for a specific retailer
async function getAllOrders(retailerId, status = null) {
  let query = `
    SELECT DISTINCT o.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.retailer_id = ?
  `;
  
  const params = [retailerId];
  
  if (status) {
    query += ` AND o.order_status = ? ORDER BY o.placed_at DESC`;
    params.push(status);
  } else {
    query += ` ORDER BY o.placed_at DESC`;
  }
  
  const [rows] = await pool.query(query, params);
  return rows;
}

// Update order status (only if order belongs to retailer)
async function updateOrderStatus(orderId, status, retailerId = null) {
  let query = `UPDATE orders SET order_status = ? WHERE id = ?`;
  const params = [status, orderId];
  
  // If retailerId is provided, ensure order belongs to retailer
  if (retailerId) {
    query = `
      UPDATE orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      SET o.order_status = ?
      WHERE o.id = ? AND p.retailer_id = ?
    `;
    params.push(retailerId);
  }
  
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

// Add order status history
async function addOrderStatusHistory(orderId, status, notes) {
  const query = `
    INSERT INTO order_status_history (order_id, status, notes) 
    VALUES (?, ?, ?)
  `;
  
  await pool.query(query, [orderId, status, notes]);
}

// Get order status history
async function getOrderStatusHistory(orderId) {
  const query = `
    SELECT * FROM order_status_history 
    WHERE order_id = ? 
    ORDER BY created_at ASC
  `;
  
  const [rows] = await pool.query(query, [orderId]);
  return rows;
}

// Update payment status (only if order belongs to retailer)
async function updatePaymentStatus(orderId, paymentStatus, retailerId = null) {
  let query = `UPDATE orders SET payment_status = ? WHERE id = ?`;
  const params = [paymentStatus, orderId];
  
  // If retailerId is provided, ensure order belongs to retailer
  if (retailerId) {
    query = `
      UPDATE orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      SET o.payment_status = ?
      WHERE o.id = ? AND p.retailer_id = ?
    `;
    params.push(retailerId);
  }
  
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

// Get order statistics for a specific retailer
async function getOrderStatistics(retailerId) {
  const query = `
    SELECT 
      COUNT(DISTINCT o.id) as total_orders,
      SUM(CASE WHEN o.order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN o.order_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
      SUM(CASE WHEN o.order_status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
      SUM(CASE WHEN o.order_status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
      SUM(CASE WHEN o.order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
      SUM(o.total_amount) as total_revenue,
      AVG(o.total_amount) as avg_order_value
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.retailer_id = ? AND o.order_status != 'cancelled'
  `;
  
  const [rows] = await pool.query(query, [retailerId]);
  return rows[0];
}

// Search orders for a specific retailer
async function searchOrders(searchTerm, retailerId) {
  const query = `
    SELECT DISTINCT o.*, c.name as customer_name, c.email as customer_email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.retailer_id = ? 
    AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)
    ORDER BY o.placed_at DESC
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const [rows] = await pool.query(query, [retailerId, searchPattern, searchPattern, searchPattern]);
  return rows;
}

// Delete order (only if pending and belongs to retailer)
async function deleteOrder(orderId, retailerId = null) {
  let query = `DELETE FROM orders WHERE id = ? AND order_status = 'pending'`;
  const params = [orderId];
  
  // If retailerId is provided, ensure order belongs to retailer
  if (retailerId) {
    query = `
      DELETE o FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.order_status = 'pending' AND p.retailer_id = ?
    `;
    params.push(retailerId);
  }
  
  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

// Get orders by customer for a specific retailer
async function getOrdersByCustomer(customerId, retailerId) {
  const query = `
    SELECT DISTINCT o.* 
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.customer_id = ? AND p.retailer_id = ?
    ORDER BY o.placed_at DESC
  `;
  
  const [rows] = await pool.query(query, [customerId, retailerId]);
  return rows;
}

module.exports = {
  createOrder,
  addOrderItems,
  getOrderById,
  getOrderItems,
  getAllOrders,
  updateOrderStatus,
  addOrderStatusHistory,
  getOrderStatusHistory,
  updatePaymentStatus,
  getOrderStatistics,
  searchOrders,
  deleteOrder,
  getOrdersByCustomer
}; 