// routes/dashboardEmployeeRoutes.js
import express from 'express';
import { getEmployeeDashboardData } from '../controllers/dashboardEmployeeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Import your middleware
import { handleGetAllEmployees, handleUpdateEmployee, handleDeleteEmployee, handleGetAllEmployeesData } from '../controllers/employeesController.js'; // Import new handlers

const router = express.Router();

// Protect this route and ensure only employees can access it
router.get(
  '/employeesdash',
  authenticateToken, // First, authenticate the token
  (req, res, next) => {
    // Log user data to debug if needed
    console.log('User data from token in employeeDashRoute:', req.user);

    // Check if the authenticated user has the 'employee' role (case-sensitive)
    if (req.user && req.user.role === 'employee') { // Ensure this matches the case in your token ('employee' lowercase)
      next(); // Proceed to the controller if the user is an employee
    } else {
      console.log('Access denied: User is not an employee or role is missing/incorrect.');
      res.status(403).json({ message: 'Access denied. Employee rights required.' });
    }
  },
  getEmployeeDashboardData // The controller to handle employee dashboard data
);

router.get('/employees', handleGetAllEmployees);
router.get('/all/employees', handleGetAllEmployeesData);
router.put('/employees/:id', handleUpdateEmployee);
router.delete('/employees/:id', handleDeleteEmployee);


export default router;