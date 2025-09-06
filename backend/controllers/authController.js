// add a new employee
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { findEmployee, findAdmin, insertNewEmployee, findEmployeeById, findAdminById, findAdminLogin } from '../models/authModel.js';
import { sendQRCodeEmail } from '../utils/emailService.js';
import { generateQRCode } from '../utils/generateQRCode.js';
import db from '../config/db.js';
dotenv.config();

// dont want to put anything into the db until we hash the password
export const addNewEmployee = async (req, res) => {
    const { name, email, password, position, department, type } = req.body;

    // check if the employee exists already
    try {
        // find employee by email
        const employee = await findEmployee(email);

        if (employee.length > 0) {
            return res.status(409).json({ message: 'Employee already found.' });
        }

        // we add employee but we must first hash the password
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // generate a employee code
        const employeeCode = `Emp-${Date.now()}`; // we create a unique student number using timestamp

        // insert new employee in the db
        const result = await insertNewEmployee(name, email, hashPassword, position, department, type, employeeCode);

        // use insert ID to fetch full data from the employees table because we want to save that employee data in a token
        const newEmployee = await findEmployeeById(result.insertId);

        // generate an access token
        const generateAccessToken = jwt.sign({
            id: newEmployee.id,
            email: newEmployee.email,
            employeeCode: newEmployee.employee_code,
            role: 'employee'
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        // generate a refresh token
        const generateRefreshToken = jwt.sign(
            { id: newEmployee.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        const generateQrCode = await generateQRCode(employeeCode)
        await sendQRCodeEmail(email, employeeCode, generateQrCode, name)

        // sending this response back to the frontend in order to use it there
        res.status(201).json({
            message: 'Employee added successfully!',
            success: true,
            token: generateAccessToken,
            refreshToken: generateRefreshToken,
            employee: {
                id: newEmployee.id,
                name: newEmployee.name,
                email: newEmployee.email,
                position: newEmployee.position,
                department: newEmployee.department,
                type: newEmployee.type,
                employeeCode: newEmployee.employee_code
            }
        });
    } catch (error) {
        console.error('Something went wrong with signing up:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// login in exisitng employee
export const loginEmployee = async (req, res) => {
    const { email, password } = req.body;

    try {
        // first check if the employee exists before employee has access
        // we need to check in the employees if the id exists of this user
        const employee = await findEmployee(email);

        if (employee.length === 0) { // Removed redundant || employee.length === 0
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const exisitngEmployee = employee[0];

        // now we check if their creditionals are correct
        // using bcrypt compare
        const isPassword = await bcrypt.compare(password, exisitngEmployee.password_hash);

        if (!isPassword) {
            return res.status(401).json({ message: 'Incorrect credentials.' });
        }

        const accessToken = jwt.sign(
            {
                id: employee[0].id,
                email: employee[0].email,
                employeeCode: employee[0].employee_code,
                role: 'employee'
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        const refreshToken = jwt.sign(
            { id: employee[0].id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            success: true,
            token: accessToken,
            refreshToken: refreshToken,
            employee: {
                id: employee[0].id,
                name: employee[0].name,
                email: employee[0].email,
                position: employee[0].position,
                department: employee[0].department,
                type: employee[0].type,
                employeeCode: employee[0].employee_code
            }
        });
    } catch (error) {
        console.error('Something went wrong with login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// login for admins
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await findAdminLogin(email);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const adminPasswordMatch = await bcrypt.compare(password, admin.password_hash);

        if (!adminPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect credentials.' })
        }

        const accessToken = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role // Ensure this line correctly adds the role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '8h' }
        );

        const refreshToken = jwt.sign(
            { id: admin.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Admin login successful.',
            token: accessToken,
            refreshToken: refreshToken,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
}

export const sendPasswordResetEmail = async (req, res) => {
    const { email, userType = 'employee' } = req.body; // Default to employee for backward compatibility

    // Debug: Check if environment variables are loaded
    console.log('EMAIL_FROM:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing email credentials in environment variables');
        return res.status(500).json({ message: 'Email service not configured properly' });
    }

    try {
        let user;
        let tableName;

        // Check user type and search in appropriate table
        if (userType === 'admin') {
            user = await findAdmin(email);
            tableName = 'admins';
        } else {
            user = await findEmployee(email);
            tableName = 'employees';
        }

        if (!user || user.length === 0) {
            return res.status(404).json({
                message: `No ${userType} found with that email address.`
            });
        }

        const userData = user[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        // Update the appropriate table with reset token
        await db.execute(
            `UPDATE ${tableName} SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?`,
            [token, expiry, email]
        );

        const resetLink = `http://localhost:5175/reset-password/${token}?type=${userType}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${userType.charAt(0).toUpperCase() + userType.slice(1)} Password Reset Request`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${userData.name},</p>
                    <p>You requested a password reset for your ${userType} account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #9B59B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetLink}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>Your HR Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({
            message: `Password reset email sent to your ${userType} account. Please check your inbox.`
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);

        // More specific error messages based on error type
        if (error.code === 'EAUTH') {
            console.error('Gmail authentication failed. Check your email and app password.');
            res.status(500).json({ message: 'Email authentication failed. Please contact support.' });
        } else if (error.code === 'ENOTFOUND') {
            console.error('Network error - cannot reach email server.');
            res.status(500).json({ message: 'Network error. Please try again later.' });
        } else {
            res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
        }
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, userType = 'employee' } = req.body; // Get userType from request body

    try {
        let tableName = userType === 'admin' ? 'admins' : 'employees';

        // Check if token is valid and not expired in the appropriate table
        const [user] = await db.execute(
            `SELECT * FROM ${tableName} WHERE resetToken = ? AND resetTokenExpiry > NOW()`,
            [token]
        );

        if (!user.length) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in the appropriate table
        await db.execute(
            `UPDATE ${tableName} SET password_hash = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?`,
            [hashedPassword, token]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
};