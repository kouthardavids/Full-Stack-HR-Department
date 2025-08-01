// leaveRequestController.js
import db from '../config/db.js';

export const handleLeaveRequestSubmission = async (req, res) => {
  const { startDate, endDate, reason } = req.body;

  try {
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employeeId = req.user.id;
    const status = "Pending";

    const [result] = await db.query(
      `INSERT INTO leave_requests (employee_id, start, end, reason, status, submission_date) VALUES (?, ?, ?, ?, ?, NOW())`,
      [employeeId, startDate, endDate, reason, status]
    );

    const [newRequest] = await db.query(
      `SELECT
            l.id,
            e.name AS employee_name,
            e.department,
            l.start,
            l.end,
            l.reason,
            l.status,
            l.submission_date
        FROM leave_requests l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Error inserting leave request:', error);
    return res.status(500).json({ message: 'Server error submitting leave request' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    console.log('User from token:', req.user); // Debug log
    
    let query = `
      SELECT
        l.id,
        e.name AS employee_name,
        e.department,
        l.start,
        l.end,
        l.reason,
        l.status,
        l.submission_date
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
    `;

    let queryParams = [];

    // If user is not admin, only show their own requests
    if (req.user.role.toLowerCase() !== 'admin') {
  query += ` WHERE l.employee_id = ?`;
  queryParams.push(req.user.id);
}

    query += ` ORDER BY l.submission_date DESC`;

    console.log('Executing query:', query);
    console.log('With params:', queryParams);

    const [rows] = await db.query(query, queryParams);
    
    console.log('Query results:', rows);
    console.log('Number of rows returned:', rows.length);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return res.status(500).json({ message: 'Server error while fetching leave requests' });
  }
};

export const updateLeaveRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Check if user is admin
  if (req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only administrators can approve or deny leave requests.' });
}

  if (!['Approved', 'Denied'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided. Must be Approved or Denied.' });
  }

  try {
    // Fetch current request status and details
    const [requestToUpdate] = await db.query(
      `SELECT employee_id, start, end, reason, status FROM leave_requests WHERE id = ?`,
      [id]
    );

    if (requestToUpdate.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const currentRequest = requestToUpdate[0];

    if (currentRequest.status === status) {
      return res.status(200).json({ message: `Leave request is already ${status}.` });
    }

    const [result] = await db.query(
      `UPDATE leave_requests SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    // Fetch employee details for notification
    const [employeeResult] = await db.query(
      `SELECT email, name FROM employees WHERE id = ?`,
      [currentRequest.employee_id]
    );

    if (employeeResult.length > 0) {
      const employee = employeeResult[0];
      const startDate = new Date(currentRequest.start).toLocaleDateString();
      const endDate = new Date(currentRequest.end).toLocaleDateString();
      const reason = currentRequest.reason;

      const subject = `Your Leave Request Status Update: ${status}`;
      const message = `Dear ${employee.name},\n\nYour leave request for the period from ${startDate} to ${endDate} (Reason: ${reason}) has been ${status.toLowerCase()}.\n\nRegards,\nYour HR Team`;

      console.log(`Sending notification to ${employee.email}: ${message}`);
    }

    return res.status(200).json({ message: 'Leave request status updated successfully.' });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return res.status(500).json({ message: 'Server error updating leave request status.' });
  }
};

export const clearAllLeaveRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only administrators can clear leave requests.' });
    }

    const [result] = await db.query(`DELETE FROM leave_requests`);
    return res.status(200).json({ message: `Cleared ${result.affectedRows} leave requests.` });
  } catch (error) {
    console.error('Error clearing all leave requests:', error);
    return res.status(500).json({ message: 'Server error clearing leave requests.' });
  }
};