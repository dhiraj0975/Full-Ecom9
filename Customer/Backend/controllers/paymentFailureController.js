const PaymentFailure = require('../models/paymentFailureModel');

exports.recordPaymentFailure = (req, res) => {
  const {
    customer_id,
    amount,
    payment_method,
    failure_reason,
    failure_code,
    error_message,
    failure_type,
    cart_items,
    total_items,
    delivery_charge,
    discount,
    upi_id,
    card_last4,
    transaction_id,
    razorpay_payment_id,
    razorpay_order_id
  } = req.body;

  if (!customer_id || !amount || !payment_method) {
    return res.status(400).json({ 
      success: false, 
      message: 'customer_id, amount, and payment_method are required.' 
    });
  }

  const failureData = {
    customer_id,
    amount,
    payment_method,
    failure_reason,
    failure_code,
    error_message,
    failure_type,
    cart_items,
    total_items,
    delivery_charge,
    discount,
    upi_id,
    card_last4,
    transaction_id,
    razorpay_payment_id,
    razorpay_order_id,
    user_agent: req.headers['user-agent'],
    ip_address: req.ip || req.connection.remoteAddress
  };

  PaymentFailure.create(failureData, (err, result) => {
    if (err) {
      console.error('Payment failure record error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to record payment failure', 
        error: err.message 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      failure_id: result.insertId,
      message: 'Payment failure recorded'
    });
  });
};

exports.getCustomerFailures = (req, res) => {
  const customerId = req.params.customerId;
  
  PaymentFailure.getByCustomer(customerId, (err, failures) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payment failures', 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: failures 
    });
  });
};

exports.getFailureStats = (req, res) => {
  PaymentFailure.getFailureStats((err, stats) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch failure stats', 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: stats 
    });
  });
};