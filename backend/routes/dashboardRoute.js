import express from 'express';
import { handleDashboardCalculations } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/dashboardResults',
  authenticateToken,
  (req, res, next) => {
    console.log('User data from token in dashboardRoute:', req.user);
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      console.log('Access denied: User is not an admin or role is missing.');
      res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
  },
  handleDashboardCalculations
);

export default router;
