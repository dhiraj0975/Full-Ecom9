const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("./blacklistToken");

const auth = (req, res, next) => {
  try {
    // Check for token in Authorization header
    let token = req.header("Authorization")?.replace("Bearer ", "");
    
    // If not in header, check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been invalidated, please login again",
      });
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

module.exports = auth;