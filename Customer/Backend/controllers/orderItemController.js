const OrderItem = require('../models/orderItemModel');

// Create order item(s)
exports.createOrderItems = (req, res) => {
  console.log('OrderItems Controller - Received data:', req.body);
  const items = req.body.items; // Expecting array of items
  if (!Array.isArray(items) || items.length === 0) {
    console.log('OrderItems Controller - No items provided or invalid format');
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }
  console.log('OrderItems Controller - Processing items:', items);
  let inserted = 0;
  let errors = [];
  items.forEach((item, idx) => {
    console.log('OrderItems Controller - Creating item:', item);
    OrderItem.create(item, (err, result) => {
      if (err) {
        console.log('OrderItems Controller - Error creating item:', err);
        errors.push({ idx, err });
      }
      inserted++;
      if (inserted === items.length) {
        if (errors.length > 0) {
          console.log('OrderItems Controller - Some items failed:', errors);
          return res.status(500).json({ success: false, message: 'Some items failed', errors });
        }
        console.log('OrderItems Controller - All items created successfully');
        return res.status(201).json({ success: true, message: 'Order items created' });
      }
    });
  });
};

// Get all items for an order
exports.getOrderItemsByOrderId = (req, res) => {
  const order_id = req.params.order_id;
  const sql = `
    SELECT oi.*, p.name, p.image_url, p.description 
    FROM order_items oi 
    LEFT JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?
  `;
  OrderItem.pool.query(sql, [order_id])
    .then(([rows]) => res.json({ success: true, items: rows }))
    .catch(err => res.status(500).json({ success: false, message: 'Error fetching order items', error: err }));
};

// Update an order item
exports.updateOrderItem = (req, res) => {
  const id = req.params.id;
  const { quantity, price } = req.body;
  const sql = 'UPDATE order_items SET quantity = ?, price = ? WHERE id = ?';
  OrderItem.pool.query(sql, [quantity, price, id])
    .then(([result]) => res.json({ success: true, message: 'Order item updated' }))
    .catch(err => res.status(500).json({ success: false, message: 'Error updating order item', error: err }));
};

// Delete an order item
exports.deleteOrderItem = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM order_items WHERE id = ?';
  OrderItem.pool.query(sql, [id])
    .then(([result]) => res.json({ success: true, message: 'Order item deleted' }))
    .catch(err => res.status(500).json({ success: false, message: 'Error deleting order item', error: err }));
}; 