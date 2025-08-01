# HR Management System Backend

**Module 2 Core Project**

---

## Overview

Adds a secure backend (Node.js, Express, MySQL) to the existing React frontend, supporting:

* JWT-based role authentication (HR, Employee)
* Automated regional payroll with tax rules
* Time-off requests
* Attendance tracking

---

## Tech Stack

* Backend: Node.js, Express
* Database: MySQL (3NF normalized)
* Authentication: JWT, Bcrypt
* Security: CORS, Rate Limiting
* Frontend: React (from Module 1)

---

## Database

* ADMINS, EMPLOYEES, TIMEOFF\_REQUESTS tables

---

## Authentication Flow

* Login endpoint issues JWT tokens
* Tokens required for protected routes

---

## Setup

1. Clone repo
2. Install dependencies (`npm install`)
3. Configure `.env` with DB and JWT secrets
4. Initialize database (`mysql -u root -p < schema.sql`)
5. Start server (`npm start` or `npm run dev`)
6. Have Access to Admin Dashboard: Email -> john.doe@example.com
                                   Password -> admin123
7. To access the Employee Dashboard: You can Sign Up!

---

## API Highlights

### Authentication
* `/api/auth/signup` — Register new employee (no auth)
* `/api/auth/login/employee` — Employee login (no auth)
* `/api/auth/login/admin` — Admin login (no auth)
* `/api/auth/verify-token` — Validate JWT token (all users)
* `/api/auth/forgot-password` — Initiate password reset (no auth)
* `/api/auth/reset-password/:token` — Complete password reset (no auth)

### Employees
* `/api/employees` — List all employees (HR/Admin only)
* `/api/all/employees` — Get complete employee data (HR/Admin only)
* `/api/employees/:id` — Update employee details (HR/Admin only)
* `/api/employees/:id` — Delete employee (HR/Admin only)

### Dashboard
* `/api/dashboardResults` — Admin dashboard analytics (Admin only)
* `/api/employeesdash` — Employee dashboard data (Employees+Admin)

### Attendance
* `/api/attendance` — Record attendance (all users)
* `/api/attendance` — View all records (HR/Admin only)
* `/api/attendance/manual` — Manual entry (HR/Admin only)

### Leave Requests
* `/api/leave-requests` — Submit request (all users)
* `/api/leave-requests` — View requests (all users)
* `/api/leave-requests/:id` — Update status (HR/Admin only)
* `/api/leave-requests` — Clear all requests (Admin only)

### Payroll
* `/api/payroll` — View all payroll data (HR/Admin only)
* `/api/payroll` — Add payroll record (HR/Admin only)
* `/api/payroll/:id` — Update payroll (HR/Admin only)
* `/api/payroll/:id` — Delete record (HR/Admin only)
* `/api/payroll/my-payslip` — Download payslip (Employees only)

Key:
- `(no auth)` = No authentication required
- `(all users)` = Requires valid JWT token
- Role-specific endpoints clearly marked
- Organized by functional area for easy reference
---

## Security

* Passwords hashed with bcrypt
* SQL injection prevented by parameterized queries
* JWT tokens expire after 1 hour
* Audit logs via database triggers

---

## Key Features  

### 🏷 **QR Attendance Tracking**  
* Mobile check-in/out via QR scanning  
* Real-time location + timestamp validation  
* Endpoint:  

### 🔐 **Security**  
* JWT token authentication (1-hour expiry)  
* Bcrypt password hashing (12 rounds)  
* Rate-limited login attempts (5 tries/hour)  

### 📱 **Mobile Optimized**  
* QR scanning via employee smartphones  
* Responsive attendance page for on-the-go access  

---

### Example QR Workflow:  
1. Employee opens company app  
2. Scans office QR code that contains an Employee Code
3. System verifies:  
   ✅ Employee Code is referenced to the Employee ID that contains all their employee information
   ✅ Real-time timestamp  

## Project Structure

```
backend/
├── controllers/       # API handlers
├── middleware/        # Auth & validation
├── models/            # DB queries
├── routes/            # API routes
└── .env               # Protect all our sensitive information
```

---

*© 2025 ModernTech Solutions*
*Submitted for Module 2 Core Project*

---
