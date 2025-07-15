const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');

// Create new order
const createOrder = async (req, res) => {
  try {
    const { 
      customer_id, 
      total_amount, 
      delivery_charge = 0.00,
      discount = 0.00,
      payment_method, 
      address_id = null,
      payment_id = null,
      items // Array of products with product_id, quantity, price
    } = req.body;

    // Validation
    if (!customer_id || !total_amount || !payment_method || !items || items.length === 0) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Validate that all products exist and belong to valid retailers
    for (const item of items) {
      const product = await productModel.getProductById(item.product_id);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product_id} not found` });
      }
      
      // Check if product belongs to an active retailer
      if (!product.retailer_id) {
        return res.status(400).json({ message: `Product ${product.name} is not assigned to any retailer` });
      }
    }

    // Create order
    const orderData = {
      customer_id,
      total_amount,
      delivery_charge,
      discount,
      payment_method,
      address_id,
      payment_id
    };

    const { orderId } = await orderModel.createOrder(orderData);

    // Add order items
    await orderModel.addOrderItems(orderId, items);

    // Update product quantities
    for (const item of items) {
      const product = await productModel.getProductById(item.product_id);
      const newQuantity = product.quantity - item.quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
      await productModel.updateProduct(item.product_id, { quantity: newQuantity });
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      affectedRetailers: [...new Set(items.map(item => item.retailer_id))] // List of retailers who will see this order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Test order creation (for demonstration)
const createTestOrder = async (req, res) => {
  try {
    const testOrder = {
      customer_id: 1,
      total_amount: 1500.00,
      delivery_charge: 50.00,
      discount: 100.00,
      payment_method: 'online',
      items: [
        {
          product_id: 1, // Make sure this product exists and belongs to a retailer
          quantity: 2,
          unit_price: 500.00,
          total_price: 1000.00
        },
        {
          product_id: 2, // Make sure this product exists and belongs to a retailer
          quantity: 1,
          unit_price: 500.00,
          total_price: 500.00
        }
      ]
    };

    const { 
      customer_id, 
      total_amount, 
      delivery_charge,
      discount,
      payment_method, 
      items
    } = testOrder;

    // Validate that all products exist and belong to valid retailers
    for (const item of items) {
      const product = await productModel.getProductById(item.product_id);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product_id} not found` });
      }
      
      // Check if product belongs to an active retailer
      if (!product.retailer_id) {
        return res.status(400).json({ message: `Product ${product.name} is not assigned to any retailer` });
      }
    }

    // Create order
    const orderData = {
      customer_id,
      total_amount,
      delivery_charge,
      discount,
      payment_method
    };

    const { orderId } = await orderModel.createOrder(orderData);

    // Add order items
    await orderModel.addOrderItems(orderId, items);

    // Update product quantities
    for (const item of items) {
      const product = await productModel.getProductById(item.product_id);
      const newQuantity = product.quantity - item.quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }
      await productModel.updateProduct(item.product_id, { quantity: newQuantity });
    }

    res.status(201).json({
      message: 'Test order created successfully',
      orderId,
      affectedRetailers: [...new Set(items.map(item => {
        const product = items.find(p => p.product_id === item.product_id);
        return product?.retailer_id;
      }))]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create test order', error: error.message });
  }
};

// Get all orders for the logged-in retailer
const getOrders = async (req, res) => {
  try {
    const retailerId = req.user?.id || 1; // Get retailer ID from auth
    const { status } = req.query;
    
    const orders = await orderModel.getAllOrders(retailerId, status);
    // For each order, fetch its items (with product image and name)
    for (const order of orders) {
      const items = await orderModel.getOrderItems(order.id, retailerId);
      order.items = items; // Each item already has product_name and image_url
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get order by ID (only if it belongs to the retailer)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth
    
    const order = await orderModel.getOrderById(id, retailerId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch only this retailer's order items for this order
    const orderItems = await orderModel.getOrderItems(id, retailerId);
    order.items = orderItems;

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Update order status (only if it belongs to the retailer)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Check if order exists and belongs to retailer
    const order = await orderModel.getOrderById(id, retailerId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const success = await orderModel.updateOrderStatus(id, status, retailerId);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update order status' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Update payment status (only if it belongs to the retailer)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth

    if (!payment_status) {
      return res.status(400).json({ message: 'Payment status is required' });
    }

    // Check if order exists and belongs to retailer
    const order = await orderModel.getOrderById(id, retailerId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const success = await orderModel.updatePaymentStatus(id, payment_status, retailerId);
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to update payment status' });
    }

    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

// Get order statistics for the logged-in retailer
const getOrderStatistics = async (req, res) => {
  try {
    const retailerId = req.user?.id || 1; // Get retailer ID from auth
    const statistics = await orderModel.getOrderStatistics(retailerId);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order statistics', error: error.message });
  }
};

// Search orders for the logged-in retailer
const searchOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth

    if (!search) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const orders = await orderModel.searchOrders(search, retailerId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search orders', error: error.message });
  }
};

// Delete order (only if it belongs to the retailer)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth

    // Check if order exists and belongs to retailer
    const order = await orderModel.getOrderById(id, retailerId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const success = await orderModel.deleteOrder(id, retailerId);
    
    if (!success) {
      return res.status(400).json({ message: 'Order cannot be deleted (not pending)' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

// Get orders by customer for the logged-in retailer
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const retailerId = req.user?.id || 1; // Get retailer ID from auth
    
    const orders = await orderModel.getOrdersByCustomer(customerId, retailerId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer orders', error: error.message });
  }
};

module.exports = {
  createOrder,
  createTestOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics,
  searchOrders,
  deleteOrder,
  getOrdersByCustomer
}; 