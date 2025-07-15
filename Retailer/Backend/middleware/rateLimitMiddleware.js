const rateLimit = require('express-rate-limit');

const customerRegisterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const customerLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  customerRegisterLimiter,
  customerLoginLimiter
}; 