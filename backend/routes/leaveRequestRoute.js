// leaveRequestRoute.js
import express from 'express';
import {
  handleLeaveRequestSubmission,
  getLeaveRequests,
  updateLeaveRequestStatus,
  clearAllLeaveRequests
} from '../controllers/leaveRequestController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All users can submit and view leave requests (filtered by role in controller)
router.post('/leave-requests', authenticateToken, handleLeaveRequestSubmission);
router.get('/leave-requests', authenticateToken, getLeaveRequests);

// Only admins can update status and clear requests
router.put('/leave-requests/:id', authenticateToken, updateLeaveRequestStatus);
router.delete('/leave-requests', authenticateToken, authorizeRole(['admin']), clearAllLeaveRequests);

export default router;