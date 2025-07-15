const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  console.log('COOKIES:', req.cookies);
  console.log('AUTH HEADER:', req.headers['authorization']);
  try {
    // Get token from cookie first, then from header as fallback
    let token = req.cookies.jwt_token;
    
    // Fallback to header if cookie is not present
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Add user info to request
      req.user = user;
      next();
    });

  } catch (error) {
    // console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    // Get token from cookie first, then from header as fallback
    let token = req.cookies.jwt_token;
    
    // Fallback to header if cookie is not present
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (!err) {
          req.user = user;
        }
        next();
      });
    } else {
      next();
    }

  } catch (error) {
    // console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 