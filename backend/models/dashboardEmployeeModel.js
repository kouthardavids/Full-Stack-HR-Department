import db from '../config/db.js';

export const getEmployeeProfile = async (employeeId) => {
  const [result] = await db.query(`
    SELECT 
      employee_code,
      name,
      position,
      department,
      email,
      type,
      salary
    FROM employees
    WHERE id = ?
  `, [employeeId]);

  return result[0];
};

export const getEmployeeAttendance = async (employeeId) => {
  const [stats] = await db.query(`
    SELECT 
      (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100 AS attendanceRate
    FROM attendance
    WHERE employee_id = ?
  `, [employeeId]);

  const [recent] = await db.query(`
    SELECT 
      DATE(time_in) AS date,
      TIME(time_in) AS time_in,
      TIME(time_out) AS time_out,
      status
    FROM attendance
    WHERE employee_id = ?
    ORDER BY time_in DESC
    LIMIT 5
  `, [employeeId]);

  return {
    attendanceRate: Math.round(stats[0].attendanceRate || 0),
    recentRecords: recent
  };
};

// Get leave days used and remaining
export const getEmployeeLeaveDays = async (employeeId) => {
  const [used] = await db.query(`
    SELECT 
      SUM(DATEDIFF(end, start) + 1) AS usedDays
    FROM leave_requests
    WHERE employee_id = ?
    AND status = 'Approved'
  `, [employeeId]);

  const totalAllowed = 20;
  const usedDays = used[0].usedDays || 0;
  const remainingDays = totalAllowed - usedDays;

  return {
    used: usedDays,
    remaining: remainingDays > 0 ? remainingDays : 0,
    totalAllowed
  };
};

// For individual leave requests to appear when we hover
export const getEmployeeIndividualLeaveRequests = async (employeeId) => {
    const [rows] = await db.query(`
        SELECT
            id,
            start,
            end,
            reason,
            status,
            submission_date
        FROM leave_requests
        WHERE employee_id = ?
        ORDER BY submission_date DESC
    `, [employeeId]);
    return rows;
};

// NEW: Get employee's payroll data
export const getEmployeePayroll = async (employeeId) => {
    try {
        const [rows] = await db.query(`
            SELECT
                p.id AS payroll_id,
                e.employee_code,
                e.name,
                e.position,
                e.department,
                p.hours_worked,
                p.leave_deductions,
                p.final_salary,
                p.created_at
            FROM payroll p
            JOIN employees e ON p.employee_id = e.id
            WHERE p.employee_id = ?
            ORDER BY p.created_at DESC
            LIMIT 3
        `, [employeeId]);
        
        return rows;
    } catch (error) {
        console.error('Error fetching employee payroll:', error);
        return [];
    }
};