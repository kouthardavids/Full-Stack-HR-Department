// payrollRoutes.js
import express from 'express';
import {
    getAllPayrollData,
    addPayroll,
    deletePayroll,
    handleUpdatePayroll,
    getEmployeePayslip
} from '../controllers/payrollController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.get('/payroll', authenticateToken, getAllPayrollData);
router.post('/payroll', authenticateToken, addPayroll);
router.delete('/payroll/:id', authenticateToken, deletePayroll);
router.put('/payroll/:id', authenticateToken, handleUpdatePayroll);

// for employees to download their own payslip
router.get('/payroll/my-payslip', authenticateToken, getEmployeePayslip);

export default router;