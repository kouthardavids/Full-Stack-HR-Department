// models/employeesModel.js

import db from '../config/db.js';

// For the inputs
export const getAllEmployees = async () => {
    const [result] = await db.query(
        `SELECT id, employee_code, name, email, position, department, type, salary FROM employees`
    );
    return result;
};

// For rendering in the page
export const getAllEmployeesData= async () => {
   const [result] = await db.query(
       `SELECT id, name, position, email AS contact, salary, type FROM employees`
   );
   return result;
};

export const addEmployee = async (name, position, contact, salary, employmentType) => {
   const [result] = await db.query(
       `INSERT INTO employees (name, position, email, salary, type) VALUES (?, ?, ?, ?, ?)`,
       [name, position, contact, salary, employmentType]
   );
   return result;
};


export const updateEmployee = async (id, name, position, contact, salary, employmentType) => {
   const [result] = await db.query(
       `UPDATE employees SET name = ?, position = ?, email = ?, salary = ?, type = ? WHERE id = ?`,
       [name, position, contact, salary, employmentType, id]
   );
   return result;
};


export const deleteEmployee = async (id) => {
   const [result] = await db.query(
       `DELETE FROM employees WHERE id = ?`,
       [id]
   );
   return result;
};
