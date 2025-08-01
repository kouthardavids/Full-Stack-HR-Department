import express from 'express';
import { addNewEmployee, loginEmployee, loginAdmin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sendPasswordResetEmail, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', addNewEmployee);
router.post('/login/employee', loginEmployee);
router.post('/login/admin', loginAdmin);
router.get('/verify-token', authenticateToken);

router.post('/forgot-password', sendPasswordResetEmail);
router.post('/reset-password/:token', resetPassword);

export default router;