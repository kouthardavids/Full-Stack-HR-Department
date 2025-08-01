import {
  getEmployeeProfile,
  getEmployeeAttendance,
  getEmployeeLeaveDays,
  getEmployeeIndividualLeaveRequests,
  getEmployeePayroll
} from '../models/dashboardEmployeeModel.js';

export const getEmployeeDashboardData = async (req, res) => {
  try {
    const employeeId = req.user.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID not found in token'
      });
    }

    // Fetch all data including payroll
    const [profile, attendance, leaveDays, individualLeaveRequests, payrollData] = await Promise.all([
      getEmployeeProfile(employeeId),
      getEmployeeAttendance(employeeId),
      getEmployeeLeaveDays(employeeId),
      getEmployeeIndividualLeaveRequests(employeeId),
      getEmployeePayroll(employeeId)
    ]);

    // Show the counts for each count
    const pendingCount = individualLeaveRequests.filter(req => req.status === 'Pending').length;
    const approvedCount = individualLeaveRequests.filter(req => req.status === 'Approved').length;
    const deniedCount = individualLeaveRequests.filter(req => req.status === 'Denied').length;

    // Get the most recent payroll amount
    const recentPayroll = payrollData.length > 0 ? payrollData[0].final_salary : 0;

    // Format the data for the frontend
    res.json({
      success: true,
      data: {
        profile: {
          name: profile.name,
          position: profile.position,
          department: profile.department,
          email: profile.email,
          type: profile.type,
          salary: profile.salary,
          employeeCode: profile.employee_code
        },
        metrics: {
          attendanceRate: attendance.attendanceRate,
          usedLeaveDays: leaveDays.used,
          remainingLeaveDays: leaveDays.remaining,
          totalAllowedLeaveDays: leaveDays.totalAllowed,
          recentPayroll: recentPayroll
        },
        attendance: {
          monthlyData: attendance.recentRecords.map(record => ({
            date: record.date,
            timeIn: record.time_in,
            timeOut: record.time_out,
            status: record.status
          }))
        },
        // IMPORTANT: Sending the individual requests array for the hover popups
        // AND the aggregated counts for your existing UI divs
        leaveRequestsSummary: {
            pending: pendingCount,
            approved: approvedCount,
            denied: deniedCount
        },
        // This is the full list needed for detailed popups
        individualLeaveRequests: individualLeaveRequests.map(request => ({
            id: request.id,
            start: request.start,
            end: request.end,
            reason: request.reason,
            status: request.status,
            submissionDate: request.submission_date
        })),
        recentPayslips: payrollData.map(payroll => ({
            id: payroll.payroll_id,
            amount: payroll.final_salary,
            hoursWorked: payroll.hours_worked,
            leaveDeductions: payroll.leave_deductions,
            date: payroll.created_at,
            employeeCode: payroll.employee_code,
            name: payroll.name,
            position: payroll.position,
            department: payroll.department
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching employee dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee dashboard data. Please try again later.'
    });
  }
};