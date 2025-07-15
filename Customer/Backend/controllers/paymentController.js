const Payment = require('../models/paymentModel');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

exports.createPayment = (req, res) => {
  const {
    customer_id,
    amount,
    payment_method,
    payment_status = 'pending',
    upi_id,
    card_last4,
    transaction_id,
    order_id
  } = req.body;

  if (!customer_id || !amount || !payment_method) {
    return res.status(400).json({ success: false, message: 'customer_id, amount, and payment_method are required.' });
  }

  const paymentData = {
    customer_id,
    amount,
    payment_method,
    payment_status,
    upi_id,
    card_last4,
    transaction_id,
    order_id
  };

  Payment.create(paymentData, (err, result) => {
    if (err) {
      // console.error('Payment create error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create payment', error: err.message });
    }
    res.status(201).json({ success: true, payment_id: result.insertId });
  });
};

// Update payment
exports.updatePayment = (req, res) => {
  const paymentId = req.params.id;
  
  // Only update the fields that are provided in the request
  const updateData = {};
  
  if (req.body.order_id !== undefined) {
    updateData.order_id = req.body.order_id;
  }
  if (req.body.payment_status !== undefined) {
    updateData.payment_status = req.body.payment_status;
  }
  if (req.body.customer_id !== undefined) {
    updateData.customer_id = req.body.customer_id;
  }
  if (req.body.amount !== undefined) {
    updateData.amount = req.body.amount;
  }
  if (req.body.payment_method !== undefined) {
    updateData.payment_method = req.body.payment_method;
  }
  if (req.body.upi_id !== undefined) {
    updateData.upi_id = req.body.upi_id;
  }
  if (req.body.card_last4 !== undefined) {
    updateData.card_last4 = req.body.card_last4;
  }
  if (req.body.transaction_id !== undefined) {
    updateData.transaction_id = req.body.transaction_id;
  }

  Payment.update(paymentId, updateData, (err, result) => {
    if (err) {
      // console.error('Payment update error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update payment', error: err.message });
    }
    res.json({ success: true, message: 'Payment updated successfully' });
  });
};

// Get payment by ID
exports.getPaymentById = (req, res) => {
  const paymentId = req.params.id;
  Payment.getById(paymentId, (err, payment) => {
    if (err) {
      // console.error('Get payment error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch payment', error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, payment });
  });
};

exports.createOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  try {
    const options = {
      amount: amount * 100, // paise me
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    // console.error('Razorpay order creation error:', err);
    res.status(500).json({ error: 'Razorpay order creation failed', details: err.message });
  }
};

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    // Payment verified
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
}; 