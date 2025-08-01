// upload to attendance scan
import db from '../config/db.js';

// find the employee by employeeCode to check if the person scanning exists
export const findEmployeeByCode = async (employeeCode) => {
  const [result] = await db.query(
    `SELECT * FROM employees WHERE employee_code = ?`, [employeeCode]
  );
  return result[0];
};


// Get todays attendance for employee
export const getTodaysAttendance = async (employeeID) => {
  const [rows] = await db.query(
    `SELECT 
       a.id, 
       a.employee_id, 
       a.time_in, 
       a.time_out,
       CASE 
         WHEN a.time_in IS NOT NULL THEN 'present'
         ELSE COALESCE(a.status, 'absent')
       END as status,
       a.date,
       e.name,
       e.position,
       e.department,
       e.employee_code
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.employee_id = ? AND a.date = CURDATE()
     ORDER BY a.time_in DESC
     LIMIT 1`,
    [employeeID]
  );
  return rows[0];
};

// Create new attendance record for time in
export const createNewRecord = async (employeeID, timeIn = null) => {
  const status = 'present'; // always present if time_in is set (even via NOW())
  
  const [result] = await db.query(
    `INSERT INTO attendance (employee_id, time_in, time_out, date, status)
     VALUES (?, COALESCE(?, NOW()), NULL, CURDATE(), ?)`,
    [employeeID, timeIn, status]
  );

  const [rows] = await db.query(
    `SELECT id, employee_id, time_in, time_out, date, status
     FROM attendance
     WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
};



// update the attendance for time out
export const updateAttendance = async (attendanceID, timeOut = null) => {
  // First get the current record to check if we need to update status
  const [currentRecord] = await db.query(
    `SELECT time_in FROM attendance WHERE id = ?`,
    [attendanceID]
  );

  let status = null;
  if (currentRecord[0] && currentRecord[0].time_in) {
    status = 'present';
  }

  const [result] = await db.query(
    `UPDATE attendance
     SET time_out = COALESCE(?, NOW()),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [timeOut, status, attendanceID]
  );

  const [rows] = await db.query(
    `SELECT id, employee_id, time_in, time_out, status
     FROM attendance
     WHERE id = ?`,
    [attendanceID]
  );
  return rows[0];
};

// attendanceModel.js
export const getAllAttendance = async (filters = {}) => {
  let query = `
    SELECT 
      e.name,
      e.position,
      e.department,
      e.employee_code,
      a.id,
      a.employee_id,
      a.time_in,
      a.time_out,
      CASE 
        WHEN a.time_in IS NOT NULL THEN 'present'
        ELSE COALESCE(a.status, 'absent')
      END as status,
      a.date
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE 1=1
  `;
  
  // Rest of the filtering logic remains the same
  const params = [];
  
  if (filters.name) {
    query += ` AND e.name LIKE ?`;
    params.push(`%${filters.name}%`);
  }
  
  if (filters.position) {
    query += ` AND e.position LIKE ?`;
    params.push(`%${filters.position}%`);
  }
  
  if (filters.date) {
    query += ` AND a.date = ?`;
    params.push(filters.date);
  }
  
  if (filters.status) {
    // For status filter, we need to check both the actual status and time_in
    if (filters.status === 'present') {
      query += ` AND (a.time_in IS NOT NULL OR a.status = 'present')`;
    } else {
      query += ` AND (a.time_in IS NULL AND a.status = ?)`;
      params.push(filters.status);
    }
  }
  
  const [result] = await db.query(query, params);
  return result;
};
// Add this new function to check for existing attendance
export const checkExistingAttendance = async (employeeID, date) => {
  const [rows] = await db.query(
    `SELECT id FROM attendance 
     WHERE employee_id = ? AND date = ?`,
    [employeeID, date]
  );
  return rows.length > 0;
};

// creating a manual record for employees
export const createManualRecord = async (employeeID, status, date) => {
  const exists = await checkExistingAttendance(employeeID, date);
  if (exists) {
    throw new Error('Attendance record already exists for this date');
  }

  let timeIn = null;
  let timeOut = null;

  if (status === "present") {
    // For present, we might want to set default working hours
    timeIn = `${date} 09:00:00`;
    timeOut = `${date} 17:00:00`;
    // Ensure status is present when time_in exists
    status = 'present';
  }

  const [result] = await db.query(
    `INSERT INTO attendance (employee_id, status, date, time_in, time_out)
     VALUES (?, ?, ?, ?, ?)`,
    [employeeID, status, date, timeIn, timeOut]
  );

  const [rows] = await db.query(
    `SELECT * FROM attendance WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
};