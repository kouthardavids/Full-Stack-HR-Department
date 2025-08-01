import express from 'express';
import { handleAttendance, fetchAllAttendance, handleManualAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post('/attendance', handleAttendance);
router.get('/attendance', fetchAllAttendance);
router.post('/attendance/manual', handleManualAttendance);

export default router;