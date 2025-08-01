// sign up employees
// login employees
// login admins
import db from '../config/db.js';

// find employee 
export const findEmployee = async (email) => {
    const [result] = await db.query(
        `SELECT * FROM employees WHERE email = ?`, [email]
    );

    return result;
}

// find admin by email
export const findAdmin = async (email) => {
    const [result] = await db.query(
        `SELECT * FROM admins WHERE email = ?`, [email]
    );

    return result;
}

// insert new employee
export const insertNewEmployee = async (
  name,
  email,
  passwordHashed,
  position,
  department,
  type,
  employeeCode
) => {
  const [result] = await db.query(
    `INSERT INTO employees (name, email, password_hash, position, department, type, employee_code)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHashed, position, department, type, employeeCode]
  );

  return result;
};

// find employee by id
export const findEmployeeById = async (id) => {
    const [result] = await db.query(
        `SELECT * FROM employees WHERE id = ?`, [id]
    );

    return result[0];
};

// find admin by id
export const findAdminById = async (id) => {
    const [result] = await db.query(
        `SELECT * FROM admins WHERE id = ?`, [id]
    );

    return result[0];
};

export const findAdminLogin = async (email) => {
    const [result] = await db.query(
        `SELECT * FROM admins WHERE email = ?`, [email]
    );

    return result[0];
};