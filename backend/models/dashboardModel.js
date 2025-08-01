// all calculations for the dashboard
import db from '../config/db.js';

// get total employees
export const getTotalEmployees = async () => {
    const [result] = await db.query(
        `SELECT COUNT(*) AS totalEmployees FROM employees`
    );
    return result[0].totalEmployees;
};

// check the attendance by the present status - FIXED VERSION
export const fetchAttendancePercent = async () => {
    try {
        // First, let's check if we have any attendance records at all
        const [totalRecords] = await db.query(`SELECT COUNT(*) AS total FROM attendance`);
        console.log('Total attendance records:', totalRecords[0].total);
        
        if (totalRecords[0].total === 0) {
            console.log('No attendance records found');
            return 0;
        }

        // Check what status values exist in the database
        const [statusCheck] = await db.query(`
            SELECT status, COUNT(*) AS count 
            FROM attendance 
            GROUP BY status
        `);
        console.log('Status breakdown:', statusCheck);

        // Updated query to handle different possible status values
        const [result] = await db.query(`
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE 
                    WHEN LOWER(TRIM(status)) IN ('present', 'p', '1', 'yes') THEN 1 
                    ELSE 0 
                END) AS present_count,
                CASE 
                    WHEN COUNT(*) > 0 THEN
                        ROUND(
                            (SUM(CASE 
                                WHEN LOWER(TRIM(status)) IN ('present', 'p', '1', 'yes') THEN 1 
                                ELSE 0 
                            END) / COUNT(*)) * 100, 2
                        )
                    ELSE 0
                END AS attendance_percentage
            FROM attendance
        `);
        
        console.log('Attendance calculation result:', result[0]);
        
        const percentage = result[0].attendance_percentage || 0;
        return Math.round(percentage);
        
    } catch (error) {
        console.error('Error in fetchAttendancePercent:', error);
        return 0;
    }
};

// Alternative version if you want to filter by date range (e.g., current month)
export const fetchAttendancePercentCurrentMonth = async () => {
    try {
        const [result] = await db.query(`
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE 
                    WHEN LOWER(TRIM(status)) IN ('Present', 'P', '1', 'yes') THEN 1 
                    ELSE 0 
                END) AS present_count,
                ROUND(
                    (SUM(CASE 
                        WHEN LOWER(TRIM(status)) IN ('Present', 'P', '1', 'yes') THEN 1 
                        ELSE 0 
                    END) / COUNT(*)) * 100, 2
                ) AS attendance_percentage
            FROM attendance 
            WHERE MONTH(date) = MONTH(CURDATE()) 
            AND YEAR(date) = YEAR(CURDATE())
        `);
        
        console.log('Current month attendance result:', result[0]);
        
        if (result[0].total_records === 0) {
            return 0;
        }
        
        return Math.round(result[0].attendance_percentage || 0);
        
    } catch (error) {
        console.error('Error in fetchAttendancePercentCurrentMonth:', error);
        return 0;
    }
};

// fetch total employee salary
export const fetchTotalPayroll = async () => {
    const [result] = await db.query(
        `SELECT COALESCE(SUM(final_salary), 0) AS totalPayroll FROM payroll`
    );
    return Number(result[0].totalPayroll);
};

// get time_off status pending, approved, denied
export const getTimeOffCounts = async () => {
    const [result] = await db.query(
        `SELECT status, COUNT(*) AS count FROM leave_requests GROUP BY status`
    );

    const timeOffCounts = {};
    result.forEach(row => {
        const key = row.status.toLowerCase();
        timeOffCounts[key] = row.count;
    });

    return {
        pending: timeOffCounts.pending || 0,
        approved: timeOffCounts.approved || 0,
        denied: timeOffCounts.denied || 0,
    };
};

// get different employee categories
export const getEmployeeCategories = async () => {
    const [result] = await db.query(
        `SELECT 
            SUM(CASE WHEN type = 'Full-Time' THEN 1 ELSE 0 END) AS fullTime,
            SUM(CASE WHEN type = 'Part-Time' THEN 1 ELSE 0 END) AS partTime,
            SUM(CASE WHEN type = 'Contractor' THEN 1 ELSE 0 END) AS contractors
        FROM employees`
    );

    return {
        fullTime: result[0].fullTime || 0,
        partTime: result[0].partTime || 0,
        contractors: result[0].contractors || 0
    };
};