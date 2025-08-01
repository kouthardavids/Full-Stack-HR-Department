import db from '../config/db.js';

export const allEmployeePayrollData = async () => {
  const query = `
    SELECT
        p.id AS payroll_id,
        e.employee_code,
        e.name,
        e.position,
        e.department,
        p.hours_worked,
        p.leave_deductions,
        p.final_salary
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    ORDER BY p.id DESC;
  `;

  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    throw error;
  }
};

// want to delete a payroll
export const deletePayrollById = async (id) => {
  const [result] = await db.query(`DELETE FROM payroll WHERE id = ?`, [id]);
  return result;
}

// want to update a payroll
// first need to get one employee, when we click
export const getPayrollById = async (id) => {
  const [rows] = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
  return rows[0];
};

// then we update the row
export const updatePayroll = async (id, updateData) => {
  const fields = Object.keys(updateData);
  const values = Object.values(updateData);

  if (fields.length === 0) throw new Error('No update data provided');

  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  const sql = `UPDATE payroll SET ${setClause} WHERE id = ?`;

  values.push(id);

  const [result] = await db.query(sql, values);
  return result;
};

// payrollModel.js
export const newPayroll = async (employee_code, payrollData) => {
  try {
    // Check if the employee exists
    const [employee] = await db.query(
      `SELECT id FROM employees WHERE employee_code = ? LIMIT 1`,
      [employee_code]
    );

    if (!employee.length) {
      throw new Error('Employee not found');
    }

    const employee_id = employee[0].id;

    // Insert only the columns that exist in your table
    const [result] = await db.query(
      `INSERT INTO payroll (employee_id, hours_worked, leave_deductions, final_salary)
       VALUES (?, ?, ?, ?)`,
      [
        employee_id,
        payrollData.hours_worked,
        payrollData.leave_deductions,
        payrollData.final_salary
      ]
    );

    // Return the complete payroll record by joining with employees table
    const [newPayroll] = await db.query(
      `SELECT 
        p.id AS payroll_id,
        e.employee_code,
        e.name,
        e.position,
        e.department,
        p.hours_worked,
        p.leave_deductions,
        p.final_salary
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return newPayroll[0];

  } catch (error) {
    console.error('Error in addPayroll:', error);
    throw error;
  }
};

export const getPayrollByEmployeeId = async (employeeId) => {
    const query = `
        SELECT
            p.id AS payroll_id,
            e.employee_code,
            e.name,
            e.position,
            e.department,
            p.hours_worked,
            p.leave_deductions,
            p.final_salary
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.employee_id = ?
        ORDER BY p.id DESC;
    `; // Assuming you want the latest payslip, hence ORDER BY id DESC

    try {
        const [rows] = await db.query(query, [employeeId]);
        return rows;
    } catch (error) {
        console.error('Error fetching payroll data by employee ID:', error);
        throw error;
    }
};