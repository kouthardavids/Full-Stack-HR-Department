// manage the attendance scan
import { findEmployeeByCode, getTodaysAttendance, createNewRecord, updateAttendance, getAllAttendance, createManualRecord } from "../models/attendanceModel.js";
import db from '../config/db.js';

export const handleAttendance = async (req, res) => {
  const { employeeId } = req.body;

  try {
    const employee = await findEmployeeByCode(employeeId);
    if (!employee) return res.status(400).json({ message: 'Employee not found' });

    const todaysRecord = await getTodaysAttendance(employee.id);

    if (!todaysRecord) {
      const newRecord = await createNewRecord(employee.id);
      return res.status(200).json({
        message: 'Clock-in successful',
        attendance: newRecord
      });
    }

    // need to wait 5 minutes before scanning again
    const firstScan = new Date(todaysRecord.time_in);
    const now = new Date();
    const diffTime = (now - firstScan) / 1000 / 60;

    if (diffTime < 2) {
      return res.status(400).json({
        message: `Please wait ${Math.ceil(2 - diffTime)} minute(s) before scanning again.`
      });
    }

    if (!todaysRecord.time_out) {
      const updatedRecord = await updateAttendance(todaysRecord.id);
      return res.status(200).json({
        message: 'Clock-out recorded',
        attendance: updatedRecord
      });
    }

    return res.status(400).json({
      message: 'Already clocked out today',
      attendance: todaysRecord
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const fetchAllAttendance = async (req, res) => {
  try {
    const { name, position, date, status } = req.query;
    const allAttendance = await getAllAttendance({ name, position, date, status });
    res.status(200).json(allAttendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
};

export const handleManualAttendance = async (req, res) => {
  const { employeeCode, status, date_in } = req.body;

  try {
    const employee = await findEmployeeByCode(employeeCode);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const result = await createManualRecord(
      employee.id,
      status,
      date_in
    );

    // Get the full record with employee details
    const [fullRecord] = await db.query(
      `SELECT 
         a.*, 
         e.name, 
         e.position, 
         e.department,
         e.employee_code
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [result.id]
    );

    return res.status(201).json({
      message: `${status} recorded for ${date_in}`,
      record: fullRecord[0]
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};
