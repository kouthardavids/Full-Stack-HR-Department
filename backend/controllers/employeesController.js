import { getAllEmployees, updateEmployee, deleteEmployee, getAllEmployeesData } from '../models/employeesModel.js';

export const handleGetAllEmployees = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

export const handleGetAllEmployeesData = async (req, res) => {
  try {
    const employees = await getAllEmployeesData();
    res.status(200).json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

export const handleUpdateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, contact, salary, employmentType } = req.body;
    const result = await updateEmployee(id, name, position, contact, salary, employmentType);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

export const handleDeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteEmployee(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};