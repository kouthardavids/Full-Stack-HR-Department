// Timeoff.jsx
import React, { useState, useEffect } from 'react';
import './Payroll.css';

const Timeoff = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        const leaveRequestsRes = await fetch('http://localhost:5004/api/leave-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!leaveRequestsRes.ok) {
          throw new Error('Failed to fetch leave requests');
        }

        const leaveRequestsData = await leaveRequestsRes.json();
        console.log('Raw API response:', leaveRequestsData);
        console.log('Is array?', Array.isArray(leaveRequestsData));
        console.log('Data length:', leaveRequestsData?.length);
        
        if (leaveRequestsData && leaveRequestsData.length > 0) {
          console.log('First record structure:', leaveRequestsData[0]);
          console.log('First record keys:', Object.keys(leaveRequestsData[0]));
        }
        
        setLeaveRequests(Array.isArray(leaveRequestsData) ? leaveRequestsData : []);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError(err.message || "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const updateStatus = async (id, status) => {
    setSuccessMessage("");
    setError("");
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Authentication token missing. Please log in.");
        return;
      }

      const response = await fetch(`http://localhost:5004/api/leave-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update leave request status');
      }

      setLeaveRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, status: status } : req
        )
      );
      setSuccessMessage(`Leave request ${id} successfully ${status.toLowerCase()}.`);
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.message.includes('Access denied')) {
        setError('You do not have permission to perform this action. Only administrators can approve or deny leave requests.');
      } else {
        setError('Error updating status: ' + error.message);
      }
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Approved: {
        color: "#28a745",
        backgroundColor: "#d4edda",
        border: "1px solid #c3e6cb"
      },
      Denied: {
        color: "#dc3545",
        backgroundColor: "#f8d7da",
        border: "1px solid #f5c6cb"
      },
      Pending: {
        color: "#ffc107",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeeba"
      },
      default: {
        color: "#6c757d",
        backgroundColor: "#e2e3e5",
        border: "1px solid #d6d8db"
      }
    };
    return styles[status] || styles.default;
  };

  return (
    <section>
      <div id="app">
        <h2 className="contentWidth mt-4 mb-2" style={{ fontWeight: 600 }}>Time Off Requests</h2>

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            Loading leave requests...
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <strong>Success:</strong> {successMessage}
          </div>
        )}

        {!loading && leaveRequests.length === 0 && !error && (
          <div className="no-records">
            <h3>No Records Found</h3>
            <p>No leave requests found.</p>
          </div>
        )}

        {!loading && leaveRequests.length > 0 && (
          <>
            <div className="record-count">
              Showing {leaveRequests.length} record{leaveRequests.length !== 1 ? 's' : ''}
            </div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Submission Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => {
                    const statusStyle = getStatusStyle(request.status);
                    return (
                      <tr key={request.id}>
                        <td>{request.employee_name || request.name || 'N/A'}</td>
                        <td>{request.department || 'N/A'}</td>
                        <td>{request.start ? new Date(request.start).toLocaleDateString() : 'N/A'}</td>
                        <td>{request.end ? new Date(request.end).toLocaleDateString() : 'N/A'}</td>
                        <td>{request.reason || 'N/A'}</td>
                        <td>
                          <span className="status-badge" style={statusStyle}>
                            {request.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{request.submission_date ? new Date(request.submission_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {request.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                className="btn save-btn"
                                onClick={() => updateStatus(request.id, 'Approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn cancel-btn"
                                onClick={() => updateStatus(request.id, 'Denied')}
                              >
                                Deny
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Timeoff;