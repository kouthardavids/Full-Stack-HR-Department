import {
    getTotalEmployees, fetchAttendancePercent, fetchTotalPayroll, getTimeOffCounts, getEmployeeCategories
} from '../models/dashboardModel.js';

export const handleDashboardCalculations = async (req, res) => {
    try {
        const [totalEmployees, attendancePercentage, totalPayroll, totalTimeOff, totalEmployeeCategories] =
            await Promise.all([
                getTotalEmployees(),
                fetchAttendancePercent(),
                fetchTotalPayroll(),
                getTimeOffCounts().catch(err => {
                    console.error('Error fetching time off counts:', err);
                    return { pending: 0, approved: 0, denied: 0 };
                }),
                getEmployeeCategories()
            ]);

        res.json({
            success: true,
            data: {
                totalEmployees,
                overallAttendancePercent: attendancePercentage,
                totalPayroll,
                totalTimeOff,
                totalEmployeeCategories,
                messages: []
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};