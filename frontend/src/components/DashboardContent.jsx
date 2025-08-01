import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import './DashboardContent.css';
import { Pie, Bar } from 'react-chartjs-2';
import SideBar from './SideBar';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DashboardContent() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [countEmployees, setCountEmployees] = useState(0);
  const [countAttendance, setCountAttendance] = useState(0);
  const [countPayroll, setCountPayroll] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    overallAttendancePercent: 0,
    totalPayroll: 0,
    timeOffCounts: { pending: 0, approved: 0, denied: 0 },
    employeeCategories: { fullTime: 0, partTime: 0, contractors: 0 },
    messages: []
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const toggleSidebar = () => setSidebarExpanded(!sidebarExpanded);

  const fetchDashboardDataSingle = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userRole = localStorage.getItem('userRole');

      if (!accessToken || userRole !== 'admin') {
        // If no token or not admin, redirect to login
        navigate('/login');
        return; // Stop execution
      }

      const response = await fetch('http://localhost:5004/api/dashboardResults', {
        method: 'GET', // Explicitly define method
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Include the access token
          'Content-Type': 'application/json', // Specify content type
        },
      });

      if (!response.ok) {
        // Handle specific HTTP errors (401, 403) for better user experience
        if (response.status === 401 || response.status === 403) {
          // Token invalid/expired or not authorized, clear storage and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('employeeData'); // Clear employee data too, just in case
          navigate('/login');
          return; // Stop execution
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load dashboard data");
      }

      const data = result.data || {};
      setDashboardData({
        totalEmployees: data.totalEmployees || 0,
        overallAttendancePercent: data.overallAttendancePercent || 0,
        totalPayroll: data.totalPayroll || 0,
        timeOffCounts: data.totalTimeOff || { pending: 0, approved: 0, denied: 0 },
        employeeCategories: data.totalEmployeeCategories || { fullTime: 0, partTime: 0, contractors: 0 },
        messages: data.messages || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Only set generic error if not already redirected
      if (!window.location.pathname.includes('/login')) {
         setError(err.message);
      }
      // Set default values if there's an error
      setDashboardData(prev => ({
        ...prev,
        timeOffCounts: { pending: 0, approved: 0, denied: 0 }
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardDataSingle();
    const interval = setInterval(fetchDashboardDataSingle, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [navigate]); // Add navigate to dependency array

  const animateCounter = (value, setFn) => {
    let frame;
    let current = 0;
    const increment = value / (2000 / 16);
    const animate = () => {
      current += increment;
      if (current < value) {
        setFn(Math.floor(current));
        frame = requestAnimationFrame(animate);
      } else {
        setFn(value);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  };

  useEffect(() => {
    if (!loading) animateCounter(dashboardData.totalEmployees, setCountEmployees);
  }, [dashboardData.totalEmployees, loading]);

  useEffect(() => {
    if (!loading) animateCounter(dashboardData.totalPayroll, setCountPayroll);
  }, [dashboardData.totalPayroll, loading]);

  useEffect(() => {
    if (!loading) animateCounter(Math.round(dashboardData.overallAttendancePercent), setCountAttendance);
  }, [dashboardData.overallAttendancePercent, loading]);

  // Default reminders if backend messages are empty
  const reminders = dashboardData.messages.length > 0
    ? dashboardData.messages
    : [
      "Don't forget to submit your timesheets!",
      "Team meeting at 3 PM today.",
      "Check your emails for new HR policies.",
      "Remember to update your project status.",
      "Submit your leave requests on time."
    ];

  useEffect(() => {
    if (!reminders || reminders.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(i => (i + 1) % reminders.length);
        setFade(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Restored original colorful chart colors
  const pieData = {
    labels: ['Full-Time', 'Part-Time', 'Contractors'],
    datasets: [{
      label: 'Employee Breakdown',
      data: [
        dashboardData.employeeCategories.fullTime,
        dashboardData.employeeCategories.partTime,
        dashboardData.employeeCategories.contractors
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#393739',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Employee Distribution',
        color: '#393739',
        font: {
          size: 16
        }
      }
    }
  };

  const barData = {
    labels: ['Full-Time', 'Part-Time', 'Contractors'],
    datasets: [{
      label: 'Employees Count',
      data: [
        dashboardData.employeeCategories.fullTime,
        dashboardData.employeeCategories.partTime,
        dashboardData.employeeCategories.contractors
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#393739',
          precision: 0
        }
      },
      x: {
        ticks: {
          color: '#393739'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Employee Count by Type',
        color: '#393739',
        font: {
          size: 16
        }
      }
    }
  };

  const handleRefresh = () => {
    setCountEmployees(0);
    setCountAttendance(0);
    setCountPayroll(0);
    fetchDashboardDataSingle();
  };

  if (loading) {
    return (
      <div className="d-flex">
        <SideBar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
        <section className={`contentWidth flex-grow-1 ${sidebarExpanded ? 'expanded' : ''}`}>
          <div className="container-fluid mt-4 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex">
        <SideBar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
        <section className={`contentWidth flex-grow-1 ${sidebarExpanded ? 'expanded' : ''}`}>
          <div className="container-fluid mt-4 text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error Loading Dashboard</h4>
              <p>{error}</p>
              <hr />
              <button className="btn btn-outline-danger" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SideBar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <section className={`contentWidth flex-grow-1 ${sidebarExpanded ? 'expanded' : ''}`}>
        <div className="container-fluid mt-4 text-start">
          <div className="mb-3 animationTop d-flex justify-content-between align-items-center">
            <h2 className="fw-semibold">Main Dashboard</h2>
            <button className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>
              <i className="fa-solid fa-refresh me-2"></i>Refresh
            </button>
          </div>

          <div className="row">
            <div className="col-lg-8 col-12 p-3 animationLeft">
              <h4>Overview</h4>
              <div className="row g-3 mt-2">
                {[
                  {
                    icon: "fa-users",
                    value: countEmployees.toLocaleString(),
                    label: "Total Employees"
                  },
                  {
                    icon: "fa-percent",
                    value: `${countAttendance}%`,
                    label: "Attendance Percentage"
                  },
                  {
                    icon: "fa-money-bill-transfer",
                    value: `R${countPayroll.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                    label: "Total Monthly Payroll"
                  }
                ].map((card, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <div className="dashboard-content stat-card p-3 text-start h-100">
                      <i className={`fa-solid ${card.icon} mb-3 p-1 icon-purple`}></i>
                      <div className="stat-number">{card.value}</div>
                      <h5 className="stat-label fw-semibold pt-2 mb-2">{card.label}</h5>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4>Employee Breakdown</h4>
                <div className="dashboard-content p-4 mt-3">
                  <div className="row g-3">
                    <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
                      <div className="w-100" style={{ height: '300px' }}>
                        <Pie data={pieData} options={pieOptions} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center">
                      <div className="w-100" style={{ height: '300px' }}>
                        <Bar data={barData} options={barOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12 p-3 animationRight">
              <h4>Time-off Requests</h4>
              {[
                {
                  label: 'Pending',
                  value: dashboardData.timeOffCounts.pending,
                  gradient: 'to right, #f69610, #fbc100',
                  icon: 'fa-hourglass-half'
                },
                {
                  label: 'Approved',
                  value: dashboardData.timeOffCounts.approved,
                  gradient: 'to right, #38a638, #89e789',
                  icon: 'fa-check-circle'
                },
                {
                  label: 'Denied',
                  value: dashboardData.timeOffCounts.denied,
                  gradient: 'to right, #c82c26, #dd7470',
                  icon: 'fa-times-circle'
                },
              ].map((card, i) => (
                <div key={i} className="dashboard-content time-off-card p-3 mb-3"
                  style={{ backgroundImage: `linear-gradient(${card.gradient})` }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-white mb-0">{card.label}</h5>
                    <i className={`fa-solid ${card.icon} text-white`}></i>
                  </div>
                  <p className="text-white mb-0 mt-2" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {card.value}
                  </p>
                </div>
              ))}

              <h4 className="mt-4">Reminders</h4>
              <div className="dashboard-content p-3 mt-3 mb-3" style={{ minHeight: '120px' }}>
                {reminders.length > 0 ? (
                  <div style={{
                    opacity: fade ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <h5 className="text-center mb-0" style={{ lineHeight: '1.5' }}>
                      {reminders[currentIndex]}
                    </h5>
                  </div>
                ) : (
                  <h5 className="text-center mb-0" style={{ color: '#888' }}>No reminders available</h5>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardContent