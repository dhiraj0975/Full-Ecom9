const isAdmin = (req, res, next) => {
  try {
    // Token se mila hua decoded user
    const user = req.user;

    if (user && Array.isArray(user.roles)) {
      // Check if 'admin' role exists (case insensitive)
      const isAdminRole = user.roles.some(role =>
        typeof role === 'string' && role.toLowerCase() === 'admin'
      );

      if (isAdminRole) {
        return next(); // ✅ Admin allowed
      }
    }

    // ❌ Not admin
    return res.status(403).json({
      success: false,
      message: "Access denied: Admins only"
    });

  } catch (err) {
    console.error("isAdmin Middleware Error:", err);
    return res.status(500).json({
      success: false,
      message: "Admin check failed",
      error: err.message
    });
  }
};

module.exports = isAdmin;
