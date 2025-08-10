const Order = require('../models/orderModel');
const { updateProductQuantity } = require('../models/productModule');
const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');

exports.createOrder = async (req, res) => {
  const {
    customer_id,
    address_id,
    payment_id,
    order_status,
    total_amount,
    delivery_charge,
    discount,
    payment_method,
    order_items
  } = req.body;

  if (!customer_id || !total_amount) {
    return res.status(400).json({ success: false, message: 'customer_id and total_amount are required.' });
  }

  try {
    // Check stock before creating order
    if (order_items && Array.isArray(order_items) && order_items.length > 0) {
      for (const item of order_items) {
        const { product_id, quantity } = item;
        if (product_id && quantity) {
          const [productRows] = await pool.query('SELECT quantity FROM products WHERE id = ?', [product_id]);
          const product = productRows[0];
          
          if (!product) {
            return res.status(400).json({ 
              success: false, 
              message: `Product with ID ${product_id} not found` 
            });
          }
          
          if (product.quantity < quantity) {
            return res.status(400).json({ 
              success: false, 
              message: `Insufficient stock for product ID ${product_id}. Available: ${product.quantity}, Required: ${quantity}` 
            });
          }
        }
      }
    }

    // Create order directly with SQL query (without created_at)
    const [result] = await pool.query(
      `INSERT INTO orders (customer_id, address_id, payment_id, order_status, total_amount, delivery_charge, discount, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, address_id, payment_id, order_status || 'pending', total_amount, delivery_charge || 0, discount || 0, payment_method]
    );

    const orderId = result.insertId;

    // Update product quantities
    if (order_items && Array.isArray(order_items) && order_items.length > 0) {
      for (const item of order_items) {
        const { product_id, quantity } = item;
        if (product_id && quantity) {
          await pool.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ?',
            [quantity, product_id]
          );
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      order_id: orderId,
      message: 'Order created successfully' 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
};

// Get all orders
exports.getAllOrders = (req, res) => {
  Order.getAll((err, orders) => {
    if (err) {
      console.error('Get orders error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
    }
    res.json({ success: true, orders });
  });
};

// Get order by ID
exports.getOrderById = (req, res) => {
  const orderId = req.params.id;
  Order.getById(orderId, (err, order) => {
    if (err) {
      console.error('Get order error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch order', error: err.message });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  });
};

// Get orders by customer ID
exports.getOrdersByCustomerId = (req, res) => {
  const customerId = req.params.customer_id;
  Order.getByCustomerId(customerId, (err, orders) => {
    if (err) {
      console.error('Get customer orders error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: err.message });
    }
    res.json({ success: true, orders });
  });
};

// Update order
exports.updateOrder = (req, res) => {
  const orderId = req.params.id;
  const {
    customer_id,
    address_id,
    payment_id,
    order_status,
    total_amount,
    delivery_charge,
    discount,
    payment_method
  } = req.body;

  const orderData = {
    customer_id,
    address_id,
    payment_id,
    order_status,
    total_amount,
    delivery_charge,
    discount,
    payment_method
  };

  Order.update(orderId, orderData, (err, result) => {
    if (err) {
      console.error('Update order error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
    }
    res.json({ success: true, message: 'Order updated successfully' });
  });
};

// Update order status only
exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { order_status } = req.body;

  if (!order_status) {
    return res.status(400).json({ success: false, message: 'order_status is required' });
  }

  Order.updateStatus(orderId, order_status, (err, result) => {
    if (err) {
      console.error('Update order status error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
    }
    res.json({ success: true, message: 'Order status updated successfully' });
  });
};

// Delete order
exports.deleteOrder = (req, res) => {
  const orderId = req.params.id;
  Order.delete(orderId, (err, result) => {
    if (err) {
      console.error('Delete order error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete order', error: err.message });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  });
};

// Download Invoice as PDF
exports.downloadInvoice = async (req, res) => {
  const orderId = req.params.id;
  try {
    // Fetch order details
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orderRows[0];
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Fetch order items with product info
    const [items] = await pool.query(`
      SELECT oi.*, p.name, p.description 
      FROM order_items oi 
      LEFT JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `, [orderId]);
    // Fetch address
    const [addressRows] = await pool.query('SELECT * FROM customer_addresses WHERE id = ?', [order.address_id]);
    const address = addressRows[0] || {};
    // Fetch customer
    const [customerRows] = await pool.query('SELECT * FROM customers WHERE id = ?', [order.customer_id]);
    const customer = customerRows[0] || {};
    // Seller info (updated to Ecommerce)
    const seller = {
      name: 'Ecommerce Pvt. Ltd.',
      address: '123, E-Commerce Street, Surat, GUJARAT, 394210, IN',
      gst: '24CGQPS9404M1ZR',
      pan: 'CGQPS9404M',
    };
    // Billing/Shipping info from address
    const billing = {
      name: address.name || customer.name || 'N/A',
      phone: address.phone || 'N/A',
      address: address.address_line || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      pincode: address.pincode || '',
    };
    const shipping = billing; // Assuming same for now
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    
    // Header with Logo and Company Name
    doc.fontSize(28).fillColor('#232F3E').font('Helvetica-Bold').text('Ecommerce', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('#666').font('Helvetica').text('Your Trusted Online Shopping Destination', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#000').font('Helvetica').text('Tax Invoice/Bill of Supply/Cash Memo', { align: 'right' });
    doc.text('(Original for Recipient)', { align: 'right' });
    doc.moveDown(0.5);
    
    // Seller & Address Info
    doc.fontSize(10).font('Helvetica-Bold').text('Sold By :', 40, doc.y);
    doc.font('Helvetica').text(seller.name);
    doc.text(seller.address);
    doc.text('IN');
    doc.text(`PAN No: ${seller.pan}`);
    doc.text(`GST Registration No: ${seller.gst}`);
    doc.moveUp(6);
    doc.font('Helvetica-Bold').text('Billing Address :', 320, doc.y);
    doc.font('Helvetica').text(billing.name, 420, doc.y);
    doc.text(billing.address, 420, doc.y);
    doc.text(billing.city, 420, doc.y);
    doc.text('IN', 420, doc.y);
    doc.text(`State: ${billing.state}`, 420, doc.y);
    doc.text(`Pincode: ${billing.pincode}`, 420, doc.y);
    doc.text(`Phone: ${billing.phone}`, 420, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Shipping Address :', 320, doc.y);
    doc.font('Helvetica').text(shipping.name, 420, doc.y);
    doc.text(shipping.address, 420, doc.y);
    doc.text(shipping.city, 420, doc.y);
    doc.text('IN', 420, doc.y);
    doc.text(`State: ${shipping.state}`, 420, doc.y);
    doc.text(`Pincode: ${shipping.pincode}`, 420, doc.y);
    doc.text(`Phone: ${shipping.phone}`, 420, doc.y);
    doc.moveDown(1);
    
    // Order Info
    doc.font('Helvetica').fontSize(10);
    doc.text(`Order Number: ${order.id}`);
    doc.text(`Order Date: ${order.placed_at}`);
    doc.text(`Invoice Number: INV-${order.id}`);
    doc.text(`Invoice Date: ${order.placed_at}`);
    doc.moveDown(0.5);
    
    // Table Header
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Sl.', 40, doc.y, { continued: true });
    doc.text('Description', 70, doc.y, { continued: true });
    doc.text('Qty', 300, doc.y, { continued: true });
    doc.text('Unit Price', 340, doc.y, { continued: true });
    doc.text('Total', 420, doc.y);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    
    // Table Rows
    let y = doc.y + 2;
    items.forEach((item, idx) => {
      doc.font('Helvetica').fontSize(10);
      doc.text(`${idx + 1}`, 40, y, { continued: true });
      doc.text(item.name || 'Product', 70, y, { continued: true });
      doc.text(item.quantity, 300, y, { continued: true });
      doc.text(`₹${item.price}`, 340, y, { continued: true });
      doc.text(`₹${item.price * item.quantity}`, 420, y);
      y += 18;
    });
    doc.moveTo(40, y).lineTo(550, y).stroke();
    y += 10;
    
    // Summary
    doc.font('Helvetica-Bold').fontSize(11).text(`Grand Total: ₹${order.total_amount}`, 340, y);
    y += 20;
    
    // Thank you note
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#232F3E').text('Thank you for shopping with Ecommerce!', 40, y, { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor('#666').text('Visit us at: www.ecommerce.com', { align: 'center' });
    doc.text('Email: support@ecommerce.com | Phone: +91-1234567890', { align: 'center' });
    
    doc.end();
    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  
  try {
    // Get order details first
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orderRows[0];
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled. It may have already been shipped or delivered.' 
      });
    }
    
    // Update order status to cancelled
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', ['cancelled', orderId]);
    
    // Insert cancellation record
    await pool.query(
      'INSERT INTO order_cancellations (order_id, customer_id, reason) VALUES (?, ?, ?)',
      [orderId, order.customer_id, reason || 'No reason provided']
    );
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order', 
      error: error.message 
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  
  try {
    // Get order details first
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orderRows[0];
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled. It may have already been shipped or delivered.' 
      });
   }
    
    // Update order status to cancelled
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', ['cancelled', orderId]);
    
    // Insert cancellation record
    await pool.query(
      'INSERT INTO order_cancellations (order_id, customer_id, reason) VALUES (?, ?, ?)',
      [orderId, order.customer_id, reason || 'No reason provided']
    );
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order', 
      error: error.message 
    });
  }
};


// Cancel order
exports.cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  
  try {
    // Get order details first
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orderRows[0];
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled. It may have already been shipped or delivered.' 
      });
    }
    
    // Update order status to cancelled
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', ['cancelled', orderId]);
    
    // Insert cancellation record
    await pool.query(
      'INSERT INTO order_cancellations (order_id, customer_id, reason) VALUES (?, ?, ?)',
      [orderId, order.customer_id, reason || 'No reason provided']
    );
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order', 
      error: error.message 
    });
  }
};
