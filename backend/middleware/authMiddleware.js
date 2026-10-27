const jwt = require('jsonwebtoken');
const dbStore = require('../services/dbStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'staffsync_secret_jwt_key_2026_modern_hrm_secure_auth');

      const user = dbStore.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or authorization failed' });
      }

      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        avatar: user.avatar,
      };

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token expired or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
