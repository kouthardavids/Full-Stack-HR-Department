import express from 'express';
import { getEmployeeDashboardData } from '../controllers/dashboardEmployeeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for employee dashboard data
router.get(
  '/employeesdash',
  authenticateToken,
  (req, res, next) => {
    console.log('User data from token in employeesdash route:', req.user);
    // Allow both Admin and employee roles to access this route
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'employee')) {
      next();
    } else {
      console.log('Access denied: User is not an admin or employee.');
      res.status(403).json({ message: 'Access denied. Employee or Admin rights required.' });
    }
  },
  getEmployeeDashboardData
);

export default router;