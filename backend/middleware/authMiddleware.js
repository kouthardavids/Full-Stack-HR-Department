// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Store user data (including role) in the request for later use
    req.user = userData;
    next();
  });
};

// New middleware for admin-specific routes
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};