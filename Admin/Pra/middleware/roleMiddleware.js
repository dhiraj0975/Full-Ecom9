// middlewares/checkRole.js
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const userRoles = req.user.roles; // Assume JWT me roles hain

    if (!userRoles.includes(requiredRole)) {
      return res.status(403).json({ message: "Access denied." });
    }

    next();
  };
};

module.exports = checkRole;
