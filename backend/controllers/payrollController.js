import { allEmployeePayrollData, deletePayrollById, getPayrollById, updatePayroll, newPayroll, getPayrollByEmployeeId } from "../models/payrollModel.js";
import PDFDocument from 'pdfkit';

// handle the request and response
export const getAllPayrollData = async (req, res) => {
    try {
        // Fetch all payroll data
        const payrollData = await allEmployeePayrollData();
        // Return the payroll data
        return res.status(200).json(payrollData);
    } catch (error) {
        console.error('Error in getAllPayrollData:', error)
        return res.status(500).json({ message: 'Server error' });
    }
}

// adding another payroll to our database table
export const addPayroll = async (req, res) => {
    try {
        const { employee_code, hours_worked = 0, leave_deductions = 0, final_salary = 0 } = req.body;

        // Validate required fields
        if (!employee_code) {
            return res.status(400).json({
                success: false,
                message: 'Employee code is required'
            });
        }

        // Use the model function
        const result = await newPayroll(employee_code, {
            hours_worked,
            leave_deductions,
            final_salary
        });

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error creating payroll:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payroll record'
        });
    }
};

export const deletePayroll = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await deletePayrollById(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payroll not found" });
        }

        res.status(200).json({ message: "Payroll deleted successfully" });
    } catch (error) {
        console.error("Error deleting payroll:", error);
        res.status(500).json({ message: "Error deleting payroll" });
    }
}

export const handleUpdatePayroll = async (req, res) => {
    const payrollId = req.params.id;
    const updateData = req.body;

    try {
        const existing = await getPayrollById(payrollId);
        if (!existing) return res.status(404).json({ message: 'Payroll not found' });

        await updatePayroll(payrollId, updateData);
        res.status(200).json({ message: 'Payroll updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Failed to update payroll' });
    }
};

export const getEmployeePayslip = async (req, res) => {
    try {
        const employeeId = req.user.id;
        
        if (!employeeId) {
            return res.status(400).json({ 
                success: false,
                message: 'Employee ID not found in token.' 
            });
        }

        const payslipData = await getPayrollByEmployeeId(employeeId);
        
        if (!payslipData || payslipData.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No payslip found for this employee.' 
            });
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Set the response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=payslip.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add content to the PDF
        const latestPayslip = payslipData[0];
        
        // Title
        doc.fontSize(20).text('PAYSLIP', { align: 'center' });
        doc.moveDown();
        
        // Employee Information
        doc.fontSize(14).text(`Employee Name: ${latestPayslip.name}`);
        doc.text(`Employee Code: ${latestPayslip.employee_code}`);
        doc.text(`Position: ${latestPayslip.position}`);
        doc.text(`Department: ${latestPayslip.department}`);
        doc.moveDown();
        
        // Payment Details
        doc.font('Helvetica-Bold').text('Payment Details:', { underline: true });
        doc.font('Helvetica');
        doc.text(`Basic Salary: R${latestPayslip.final_salary.toLocaleString()}`);
        doc.text(`Hours Worked: ${latestPayslip.hours_worked}`);
        doc.text(`Leave Deductions: R${latestPayslip.leave_deductions.toLocaleString()}`);
        doc.moveDown();
        
        // Footer
        doc.fontSize(10).text('Generated on: ' + new Date().toLocaleDateString(), { align: 'right' });
        
        // Finalize the PDF
        doc.end();
        
    } catch (error) {
        console.error('Error generating payslip PDF:', error);
        
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false,
                message: 'Error generating payslip PDF: ' + error.message 
            });
        }
    }
};