// EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboardBootstrap.css';

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    start: '',
    end: '',
    reason: '',
  });

  // Changed from popup states to modal states for leave request details
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsModalContent, setDetailsModalContent] = useState([]);
  const [detailsModalTitle, setDetailsModalTitle] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userRole = localStorage.getItem('userRole');

        if (!accessToken || userRole !== 'employee') {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5004/api/employeesdash', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('employeeData');
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch employee data: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setEmployeeData(result.data);
        } else {
          setError(result.message || 'Failed to load employee data');
        }
      } catch (err) {
        console.error('Error fetching employee dashboard data:', err);
        if (!window.location.pathname.includes('/login')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [navigate]);

  const handleOpenLeaveModal = () => setIsLeaveModalOpen(true);
  const handleCloseLeaveModal = () => {
    setIsLeaveModalOpen(false);
    setLeaveFormData({ start: '', end: '', reason: '' });
  };

  const handleDownloadPayslip = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5004/api/payroll/my-payslip', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Payslip.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };


  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Get employeeName from the fetched employeeData
      const employeeName = employeeData?.profile?.name;

      if (!employeeName) {
        alert('Employee name not found. Cannot submit leave request.');
        return;
      }

      const payload = {
        employeeName: employeeName,
        startDate: leaveFormData.start,
        endDate: leaveFormData.end,
        reason: leaveFormData.reason,
      };

      const response = await fetch('http://localhost:5004/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || `Failed to submit leave request: ${response.statusText}`);
      }

      const result = await response.json();
      alert('Leave request submitted successfully!');
      handleCloseLeaveModal();
      // Refetch employee data to update counts and details
      const fetchUpdatedData = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5004/api/employeesdash', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEmployeeData(result.data);
          }
        }
      };
      fetchUpdatedData(); // Call to refetch data
    } catch (err) {
      console.error('Error submitting leave request:', err);
      alert(`Error submitting leave request: ${err.message}`);
    }
  };

  // New: Handle opening details modal on click
  const handleOpenDetailsModal = (statusType) => {
    if (!employeeData?.individualLeaveRequests) {
      setDetailsModalContent([]);
      setDetailsModalTitle(`${statusType} Leave Requests`);
      setIsDetailsModalOpen(true);
      return;
    }

    const filteredRequests = employeeData.individualLeaveRequests.filter(
      req => req.status === statusType
    );

    setDetailsModalContent(filteredRequests);
    setDetailsModalTitle(`${statusType} Leave Requests`);
    setIsDetailsModalOpen(true);
  };

  // New: Handle closing details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsModalContent([]);
    setDetailsModalTitle('');
  };

  // Helper to get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#28a745', color: 'white' };
      case 'Denied':
        return { backgroundColor: '#dc3545', color: 'white' };
      case 'Pending':
      default:
        return { backgroundColor: '#ffc107', color: 'black' };
    }
  };

  // handleLogout function
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('employeeData');
    navigate('/login');
  };


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading employee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading Employee Dashboard</h4>
          <p>{error}</p>
          <hr />
        </div>
      </div>
    );
  }

  if (!employeeData || !employeeData.profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">No employee data or profile information available.</div>
      </div>
    );
  }

  // Destructure to use the correct keys from backend response
  const { profile, metrics, attendance, leaveRequestsSummary, individualLeaveRequests, recentPayslips } = employeeData;

  return (
    <main className="edb-root">
      <section className="contentWidth">
        <br />
        <div className="d-flex justify-content-between align-items-center container contentWidth mb-1 animationTop">
          <h3 className="fw-semibold">
            Welcome, {profile.name || 'Guest'}!
          </h3>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="container contentWidth text-start mt-4">
          <div className="row align-items-start">
            {/* Left main content */}
            <div className="col-sm-9 p-3 animationLeft">
              <h4>Overview</h4>
              <div className="row gap-3 mt-3 p-4 text-center">
                <div className="col-sm dashboard-content p-3 edb-metric-card">
                  <h2 className="mb-3 fw-bold">{metrics?.usedLeaveDays}</h2>
                  <h5 className="fw-semibold">Used Leave Days</h5>
                </div>
                <div className="col-sm dashboard-content p-3 edb-metric-card">
                  <h2 className="mb-3 fw-bold">{metrics?.remainingLeaveDays}</h2>
                  <h5 className="fw-semibold">Remaining Leave Days</h5>
                </div>
                <div className="col-sm dashboard-content p-3 edb-metric-card">
                  <h2 className="mb-3 fw-bold">{metrics?.attendanceRate}%</h2>
                  <h5 className="fw-semibold">Attendance Rate</h5>
                  <div className="progress">
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${metrics?.attendanceRate}%` }}
                      aria-valuenow={metrics?.attendanceRate}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                <div className="col-sm dashboard-content p-3 edb-metric-card">
                  <h2 className="mb-3 fw-bold">R{metrics?.recentPayroll?.toLocaleString() || 0}</h2>
                  <h5 className="fw-semibold">Recent Payroll</h5>
                </div>
              </div>

              <div className="row gap-1 mt-3">
                <div className="col-sm-12 col-md-6">
                  <h4>Profile Snapshot</h4>
                  <div className="dashboard-content p-4 mt-3 rounded-4 edb-profile-card shadow-sm bg-white">
                    <div className="d-flex flex-column flex-sm-row align-items-center gap-4">
                      <img
                        src={profile.avatar || "https://placehold.co/120x120/A0A0A0/FFFFFF?text=Profile"}
                        alt="Profile"
                        className="rounded-circle border"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <div className="text-start w-100">
                        <h5 className="mb-2"><strong>Name:</strong> {profile.name}</h5>
                        <h6 className="mb-2 text-muted"><strong>Job Title:</strong> {profile.position}</h6>
                        <p className="mb-1"><strong>Department:</strong> {profile.department}</p>
                        <p className="mb-1"><strong>Email:</strong> {profile.email}</p>
                        <p className="mb-1"><strong>Employee Type:</strong> {profile.type}</p>
                        <p className="mb-0"><strong>Employee Code:</strong> {profile.employeeCode}</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="col-sm">
                  <h4>Notifications and Reminders</h4>
                  <div className="dashboard-content p-4 mt-3 edb-reminders-card">
                    <h5 className="fw-semibold mb-4">📢 Reminder: Submit your monthly reports.</h5>
                    <h5 className="fw-semibold">📅 Note: Annual leave requests close next week.</h5>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar */}
            <div className="col-sm-3 p-3 animationRight">
              <h4>Time-off Requests</h4>
              {/* Changed from onMouseEnter to onClick */}
              <div
                className="dashboard-content p-3 mt-4 mb-3"
                style={{ backgroundImage: 'linear-gradient(#f69610 , #fbc100)', color: '#f0f0f0', cursor: 'pointer' }}
                onClick={() => handleOpenDetailsModal('Pending')}
              >
                <h5 className="fw-bold">Pending</h5>
                <p>{leaveRequestsSummary?.pending}</p>
              </div>
              <div
                className="dashboard-content p-3 mb-3"
                style={{ backgroundImage: 'linear-gradient(#38a638 , #89e789)', color: '#f0f0f0', cursor: 'pointer' }}
                onClick={() => handleOpenDetailsModal('Approved')}
              >
                <h5 className="fw-bold">Approved</h5>
                <p>{leaveRequestsSummary?.approved}</p>
              </div>
              <div
                className="dashboard-content p-3 mb-3"
                style={{ backgroundImage: 'linear-gradient(#c82c26 , #dd7470)', color: '#f0f0f0', cursor: 'pointer' }}
                onClick={() => handleOpenDetailsModal('Denied')}
              >
                <h5 className="fw-bold">Denied</h5>
                <p>{leaveRequestsSummary?.denied}</p>
              </div>
              <button className="dashboard-content btn w-100 mb-4 btn-primary" onClick={handleOpenLeaveModal}>
                + &nbsp; Request Time Off
              </button>

              <div className="dashboard-content p-4">
                <h4>Payslip Download</h4>
                {recentPayslips?.length > 0 ? (
                  <>
                    <p className="text-muted">Recent payslips:</p>
                    <ul className="list-unstyled">
                      {recentPayslips.map((p, i) => (
                        <li key={i} className="mb-2">
                          {p.month}: R{p.amount?.toLocaleString() || 0}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-muted">No payslips available</p>
                )}
                <button className="dashboard-content btn w-100 mb-4 mt-2 btn-primary" onClick={handleDownloadPayslip}>
                  Download PDF
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leave Request Modal (existing code) */}
      {isLeaveModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="custom-centered-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Time Off</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseLeaveModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleLeaveRequestSubmit}>
                  <div className="mb-3">
                    <label htmlFor="startDate" className="form-label">Start Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      name="start"
                      value={leaveFormData.start}
                      onChange={handleLeaveFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="endDate" className="form-label">End Date:</label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      name="end"
                      value={leaveFormData.end}
                      onChange={handleLeaveFormChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">Reason:</label>
                    <textarea
                      className="form-control"
                      id="reason"
                      name="reason"
                      rows="3"
                      value={leaveFormData.reason}
                      onChange={handleLeaveFormChange}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseLeaveModal}>Close</button>
                    <button type="submit" className="btn btn-primary">Submit Request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* New: Details Modal for Leave Requests (replaces hover popup) */}
      {isDetailsModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="custom-centered-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{detailsModalTitle}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseDetailsModal}></button>
              </div>
              <div className="modal-body">
                {detailsModalContent.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {detailsModalContent.map((request) => (
                      <li key={request.id} className="mb-3 p-2 border rounded">
                        <div>
                          <strong>Dates:</strong> {new Date(request.start).toLocaleDateString()} - {new Date(request.end).toLocaleDateString()}
                          <br />
                          <strong>Reason:</strong> {request.reason}
                          <br />
                          <strong>Status:</strong> <span className="status-badge" style={getStatusBadgeStyle(request.status)}>{request.status}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">No {detailsModalTitle.toLowerCase().replace(' leave requests', '')} requests found.</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailsModal}>Close</button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default EmployeeDashboard;