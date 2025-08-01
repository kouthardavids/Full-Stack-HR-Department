import React, { useState, useEffect } from 'react';
import DashboardContent from '../../components/DashboardContent';

const EMPLOYEE_STORAGE_KEY = 'employees_data';
const ATTENDANCE_STORAGE_KEY = 'attendance_records'; // match your Attendance localStorage key
const PAYROLL_STORAGE_KEY = 'total_payroll';
const TIMEOFF_STORAGE_KEY = 'leave_requests';

const DashboardPage = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [overallAttendancePercent, setOverallAttendancePercent] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [timeOffCounts, setTimeOffCounts] = useState({
    approved: 0,
    denied: 0,
    pending: 0,
  });
  const [employeeCategories, setEmployeeCategories] = useState({
    fullTime: 0,
    partTime: 0,
    contractors: 0,
  });

  useEffect(() => {
    // Load Employees and categorize
    const savedEmployees = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    if (savedEmployees) {
      try {
        const employees = JSON.parse(savedEmployees);
        setTotalEmployees(employees.length);

        const counts = { fullTime: 0, partTime: 0, contractors: 0 };
        employees.forEach((emp) => {
          if (emp.employmentType === 'Full-Time') counts.fullTime++;
          else if (emp.employmentType === 'Part-Time') counts.partTime++;
          else if (emp.employmentType === 'Contractor') counts.contractors++;
        });
        setEmployeeCategories(counts);
      } catch {
        setTotalEmployees(0);
        setEmployeeCategories({ fullTime: 0, partTime: 0, contractors: 0 });
      }
    } else {
      setTotalEmployees(0);
      setEmployeeCategories({ fullTime: 0, partTime: 0, contractors: 0 });
    }

    // Load Attendance and calculate overall attendance percentage
    const savedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (savedAttendance) {
      try {
        const attendanceRecords = JSON.parse(savedAttendance);
        const totalDays = attendanceRecords.reduce(
          (acc, emp) => acc + Object.values(emp.attendance).length,
          0
        );
        const totalPresent = attendanceRecords.reduce(
          (acc, emp) =>
            acc + Object.values(emp.attendance).filter((s) => s === 'Present').length,
          0
        );
        const percent = totalDays === 0 ? 0 : ((totalPresent / totalDays) * 100).toFixed(1);
        setOverallAttendancePercent(Number(percent));
      } catch {
        setOverallAttendancePercent(0);
      }
    } else {
      setOverallAttendancePercent(0);
    }

    // Load Payroll total
    const savedPayroll = localStorage.getItem(PAYROLL_STORAGE_KEY);
    if (savedPayroll && !isNaN(savedPayroll)) {
      setTotalPayroll(parseFloat(savedPayroll));
    } else {
      setTotalPayroll(0);
    }

    // Load Time off requests counts
    const savedRequests = localStorage.getItem(TIMEOFF_STORAGE_KEY);
    if (savedRequests) {
      try {
        const leaveRequests = JSON.parse(savedRequests);
        const approved = leaveRequests.filter((req) => req.status === 'Approved').length;
        const denied = leaveRequests.filter((req) => req.status === 'Denied').length;
        const pending = leaveRequests.filter((req) => req.status === 'Pending').length;
        setTimeOffCounts({ approved, denied, pending });
      } catch {
        setTimeOffCounts({ approved: 0, denied: 0, pending: 0 });
      }
    } else {
      setTimeOffCounts({ approved: 0, denied: 0, pending: 0 });
    }
  }, []);

  return (
    <DashboardContent
      totalEmployees={totalEmployees}
      overallAttendancePercent={overallAttendancePercent}
      totalPayroll={totalPayroll}
      timeOffCounts={timeOffCounts}
      employeeCategories={employeeCategories}
    />
  );
};

export default DashboardPage;
