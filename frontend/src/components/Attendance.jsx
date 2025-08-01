import React, { useEffect, useState } from "react";
import './Payroll.css';

const Attendance = () => {
  // State management
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    position: "",
    date: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    employee_id: "",
    name: "",
    position: "",
    department: "",
    date_in: "",
    time_in: "",
    time_out: "",
    status: "present"
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Fetch attendance and employees data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        // If no token, set an error and stop fetching
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.position) queryParams.append("position", filters.position);
      if (filters.date) {
        const formattedDate = new Date(filters.date).toISOString().split('T')[0];
        queryParams.append("date", formattedDate);
      }
      if (filters.status) queryParams.append("status", filters.status);

      const [attendanceRes, employeesRes] = await Promise.all([
        fetch(`http://localhost:5004/api/attendance?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add token for attendance API
            'Content-Type': 'application/json',
          },
        }),
        fetch("http://localhost:5004/api/employees", {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add Authorization header here
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!attendanceRes.ok) {
        const errorData = await attendanceRes.json();
        throw new Error(`Attendance fetch failed: ${errorData.message || attendanceRes.statusText}`);
      }
      if (!employeesRes.ok) {
        const errorData = await employeesRes.json();
        throw new Error(`Employees fetch failed: ${errorData.message || employeesRes.statusText}`);
      }

      const attendanceData = await attendanceRes.json();
      const employeesData = await employeesRes.json();

      const employees = Array.isArray(employeesData.data) // Access .data property if response is { success: true, data: [...] }
        ? employeesData.data
        : [];

      setAllEmployees(employees);
      processAttendanceData(attendanceData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      // Check if the error is due to unauthorized access and provide specific message
      if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Authentication required')) {
        setError("You are not authorized to view this data. Please ensure you are logged in as an Admin.");
        // Optionally, redirect to login: navigate('/login');
      } else {
        setError(err.message || "Failed to load data. Please try again.");
      }
      setAttendanceRecords([]);
      setAllEmployees([]); // Clear employees on error too
    } finally {
      setLoading(false);
    }
  };

  // Process and format attendance data
  const processAttendanceData = (attendanceData) => {
    let records = Array.isArray(attendanceData) ? attendanceData : [];

    records = records.map(r => {
      let timeInDate = null;
      let timeOutDate = null;

      // Helper to safely create Date objects
      const createDateFromValue = (value, datePart) => {
        if (value instanceof Date && !isNaN(value.getTime())) {
          return value;
        }
        if (typeof value === 'string' && value) {
          // If value is just a time string (e.g., "10:30:00"), combine with the date part
          if (datePart && value.match(/^\d{2}:\d{2}(:\d{2})?$/)) { // Matches HH:MM or HH:MM:SS
            return new Date(`${datePart} ${value}`);
          }
          // Otherwise, try to parse as a full date string
          return new Date(value);
        }
        return null;
      };

      timeInDate = createDateFromValue(r.time_in, r.date);
      timeOutDate = createDateFromValue(r.time_out, r.date);

      return {
        ...r,
        status: r.status || (timeInDate ? "present" : "absent"),
        formatted_date: formatDisplayDate(r.date),
        formatted_time_in: timeInDate && !isNaN(timeInDate.getTime()) ?
          timeInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "--",
        formatted_time_out: timeOutDate && !isNaN(timeOutDate.getTime()) ?
          timeOutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "--",
        hours_worked: timeInDate && timeOutDate && !isNaN(timeInDate.getTime()) && !isNaN(timeOutDate.getTime()) ?
          calculateHoursWorked(timeInDate, timeOutDate) : "--"
      };
    });

    setAttendanceRecords(records);
  };

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "--";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const formatTimeDisplay = (datetimeStr) => {
    if (!datetimeStr) return "--";
    try {
      const date = new Date(datetimeStr);
      if (isNaN(date.getTime())) return "--";
      return date.toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "--";
    }
  };

  // Calculate worked hours
  const calculateHoursWorked = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "--";
    try {
      const start = new Date(timeIn);
      const end = new Date(timeOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "--";

      const diffMs = end - start;
      if (diffMs < 0) return "--";

      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${diffHrs}h ${diffMins}m`;
    } catch {
      return "--";
    }
  };

  // adding filter in the attendance table
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setIsFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      position: "",
      date: "",
      status: "",
    });
    setIsFiltersOpen(false);
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // Modal handlers
  const openAddModal = () => {
    setNewAttendance({
      employee_id: "",
      name: "",
      position: "",
      department: "",
      date_in: "",
      time_in: "",
      time_out: "",
      status: "present"
    });
    setIsAddModalOpen(true);
    setError("");
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setError("");
  };

  // When selecting employee from dropdown
  const onEmployeeSelect = (e) => {
    const selectedEmployeeCode = e.target.value;
    if (!selectedEmployeeCode) {
      setNewAttendance(prev => ({
        ...prev,
        employee_id: "",
        name: "",
        position: "",
        department: ""
      }));
      return;
    }

    const employee = allEmployees.find(emp => emp.employee_code === selectedEmployeeCode);
    if (employee) {
      setNewAttendance(prev => ({
        ...prev,
        employee_id: employee.employee_code,
        name: employee.name,
        position: employee.position,
        department: employee.department || employee.department_name || employee.dept || "General"
      }));
    }
  };

  // Handle changes in add attendance form inputs
  const onAddChange = (e) => {
    const { name, value } = e.target;
    setNewAttendance(prev => ({
      ...prev,
      [name]: value,
      ...(name === "status" && (value === "absent" || value === "leave") ? {
        time_in: "",
        time_out: ""
      } : {})
    }));
  };

  // Submit new attendance
  const addNewAttendance = async () => {
    try {
      if (!newAttendance.employee_id || !newAttendance.date_in) {
        setError("Employee and date are required fields.");
        return;
      }

      const payload = {
        employeeCode: newAttendance.employee_id,
        status: newAttendance.status,
        date_in: newAttendance.date_in
      };

      const accessToken = localStorage.getItem('accessToken'); // Get token for manual attendance
      const response = await fetch("http://localhost:5004/api/attendance/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`, // Add token for manual attendance API
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add attendance");
      }

      setIsAddModalOpen(false);
      fetchData(); // Re-fetch data to update table
    } catch (err) {
      console.error("Add attendance error:", err);
      setError(err.message || "Failed to add attendance. Please try again.");
    }
  };

  // UI helper for status styling
  const getStatusStyle = (status) => {
    const styles = {
      present: {
        color: "#28a745",
        backgroundColor: "#d4edda",
        border: "1px solid #c3e6cb"
      },
      absent: {
        color: "#dc3545",
        backgroundColor: "#f8d7da",
        border: "1px solid #f5c6cb"
      },
      leave: {
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
        <h2 className="contentWidth mt-4 mb-2" style={{ fontWeight: 600 }}>Attendance Records</h2>

        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <button className="btn addBtn" onClick={openAddModal}>Add Attendance</button>
          <button
            className={`btn ${isFiltersOpen ? 'save-btn' : 'view-btn'}`}
            onClick={toggleFilters}
          >
            {isFiltersOpen ? 'Hide Filters' : 'Search & Filter'}
          </button>

        </div>

        {isFiltersOpen && (
          <div className="filtersContainer">
            <div style={{
              color: "#262626",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "15px"
            }}>Filter Options</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
              alignItems: "center"
            }}>
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Search by name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px"
            }}>
              <button
                className="btn save-btn"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
              <button
                className="btn cancel-btn"
                onClick={handleClearFilters}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            Loading attendance records...
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && attendanceRecords.length === 0 && !error && (
          <div className="no-records">
            <h3>No Records Found</h3>
            <p>No attendance records match your current filters. Try adjusting your search criteria.</p>
          </div>
        )}

        {!loading && attendanceRecords.length > 0 && (
          <>
            <div className="record-count">
              Showing {attendanceRecords.length} record{attendanceRecords.length !== 1 ? 's' : ''}
            </div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => {
                    const statusStyle = getStatusStyle(record.status);
                    return (
                      <tr key={`attendance-${record.employee_id}-${record.date_in}-${index}`}>
                        <td>{record.name}</td>
                        <td>{record.position}</td>
                        <td>{record.department}</td>
                        <td>{record.formatted_date}</td>
                        <td>{record.formatted_time_in}</td>
                        <td>{record.formatted_time_out}</td>
                        <td>{record.hours_worked}</td>
                        <td>
                          <span className="status-badge" style={statusStyle}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {isAddModalOpen && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h4>Add New Attendance</h4>
              {error && <div className="modal-error">{error}</div>}

              <div className="form-group">
                <label>Select Employee:</label>
                <select
                  className="form-input"
                  onChange={onEmployeeSelect}
                  value={newAttendance.employee_id || ""}
                  required
                >
                  <option value="">Select an employee</option>
                  {allEmployees.length > 0 ? (
                    allEmployees.map((employee) => (
                      <option
                        key={`employee-${employee.employee_code}`}
                        value={employee.employee_code}
                      >
                        {employee.name} (ID: {employee.employee_code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No employees available</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Employee ID:</label>
                <input
                  type="text"
                  name="employee_id"
                  value={newAttendance.employee_id}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newAttendance.name}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Position:</label>
                <input
                  type="text"
                  name="position"
                  value={newAttendance.position}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Department:</label>
                <input
                  type="text"
                  name="department"
                  value={newAttendance.department}
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={newAttendance.status}
                  onChange={onAddChange}
                  className="form-input"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date_in"
                  value={newAttendance.date_in}
                  onChange={(e) => {
                    setNewAttendance(prev => ({
                      ...prev,
                      date_in: e.target.value
                    }));
                  }}
                  className="form-input"
                  required
                />
              </div>

              {newAttendance.status === "present" && (
                <>
                  <div className="form-group">
                    <label>Time In:</label>
                    <input
                      type="time"
                      name="time_in"
                      value={newAttendance.time_in}
                      onChange={onAddChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Out:</label>
                    <input
                      type="time"
                      name="time_out"
                      value={newAttendance.time_out}
                      onChange={onAddChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button className="btn save-btn" onClick={addNewAttendance}>Add</button>
                <button className="btn cancel-btn" onClick={closeAddModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>


      <style>{`
        .filtersContainer {
          background: #f1f1f1;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        .loading-indicator {
          margin: 20px 0;
          font-size: 1.1rem;
          color: #555;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        .error-message {
          color: #dc3545;
          font-weight: 600;
          margin: 15px 0;
        }
        .no-records {
          padding: 20px;
          text-align: center;
          color: #777;
        }
        .record-count {
          margin-bottom: 10px;
          font-weight: 600;
          font-size: 1.1rem;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 25px;
          border-radius: 10px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .modal-content h4 {
          margin-bottom: 15px;
          font-weight: 700;
        }
        .modal-error {
          color: #dc3545;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .form-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .btn {
          padding: 8px 15px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }
        .btn.save-btn {
          background-color: #007bff;
          color: white;
        }
        .btn.cancel-btn {
          background-color: #6c757d;
          color: white;
        }
        .btn.addBtn {
          background-color: #28a745;
          color: white;
        }
        .btn.view-btn {
          background-color: #17a2b8;
          color: white;
        }
        .btn.save-btn:hover {
          background-color: #0056b3;
        }
        .btn.cancel-btn:hover {
          background-color: #565e64;
        }
        .btn.addBtn:hover {
          background-color: #1e7e34;
        }
        .btn.view-btn:hover {
          background-color: #117a8b;
        }
      `}</style>
    </section>
  );
};

export default Attendance;
