import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './Payroll.css';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    hoursWorked: "",
    leaveDeductions: "",
    finalSalary: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPayroll, setNewPayroll] = useState({
    employee_code: "",
    name: "",
    department: "",
    position: "",
    hours_worked: "",
    leave_deductions: "",
    final_salary: "",
  });
  const [slideIn, setSlideIn] = useState(false);

  // Utility function for currency formatting
  const formatCurrency = (value) => `R${Number(value || 0).toFixed(2)}`;

  useEffect(() => {
    setSlideIn(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please log in.');
        }

        // Fetch payroll data
        const payrollResponse = await fetch("http://localhost:5004/api/payroll", {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!payrollResponse.ok) {
            const errorData = await payrollResponse.json();
            throw new Error(errorData.message || "Failed to fetch payroll data");
        }
        const payrollData = await payrollResponse.json();
        setPayrolls(Array.isArray(payrollData) ? payrollData : []);

        // Fetch all employees for dropdown
        const employeesResponse = await fetch("http://localhost:5004/api/employees", {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add token
            'Content-Type': 'application/json',
          },
        });
        if (!employeesResponse.ok) {
            const errorData = await employeesResponse.json();
            throw new Error(errorData.message || "Failed to fetch employees");
        }
        const employeesData = await employeesResponse.json();

        // Handle both array and object with data property
        const employeesArray = Array.isArray(employeesData)
          ? employeesData
          : (Array.isArray(employeesData?.data) ? employeesData.data : []);

        setAllEmployees(employeesArray);

      } catch (err) {
        setError(err.message);
        console.error("Error in Payroll fetchData:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalMonthlyPay = useMemo(() => {
    return payrolls.reduce((acc, payroll) => acc + Number(payroll.final_salary || 0), 0);
  }, [payrolls]);

  const downloadPayslipPDF = (payroll) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const centerX = pageWidth / 2;
    const headerColor = [126, 40, 158];
    const darkTextColor = [38, 38, 38];

    // Payslip header
    doc.setFontSize(20);
    doc.setTextColor(...headerColor);
    doc.text("Employee Payslip", centerX, 20, { align: "center" });

    // Date issued
    doc.setFontSize(12);
    doc.setTextColor(...darkTextColor);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, margin, 30);

    // Employee information
    doc.setFontSize(14);
    doc.setTextColor(...headerColor);
    doc.text("Employee Information", margin, 40);

    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: [
        ["Payroll ID", payroll.payroll_id],
        ["Employee Code", payroll.employee_code],
        ["Name", payroll.name],
        ["Department", payroll.department],
        ["Position", payroll.position],
      ],
      theme: "grid",
      headStyles: { fillColor: headerColor, textColor: 255 },
      styles: {
        fontSize: 11,
        cellPadding: 3,
        textColor: darkTextColor,
        lineColor: darkTextColor,
      },
      margin: { left: margin, right: margin },
    });

    // Salary breakdown
    const salaryY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(...headerColor);
    doc.text("Salary Breakdown", margin, salaryY);

    autoTable(doc, {
      startY: salaryY + 5,
      head: [["Description", "Amount"]],
      body: [
        ["Hours Worked", payroll.hours_worked],
        ["Leave Deductions", formatCurrency(payroll.leave_deductions)],
        ["Final Salary", formatCurrency(payroll.final_salary)],
      ],
      theme: "striped",
      headStyles: { fillColor: headerColor, textColor: 255 },
      styles: {
        fontSize: 11,
        cellPadding: 3,
        textColor: darkTextColor,
        lineColor: darkTextColor,
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(...darkTextColor);
    doc.text("Generated by HR System", centerX, doc.internal.pageSize.getHeight() - 20, { align: "center" });

    doc.save(`Payslip_${payroll.employee_code}_${payroll.payroll_id}.pdf`);
  };

  const handleDelete = async (payrollId) => {
    // IMPORTANT: Replace window.confirm with a custom modal UI
    if (window.confirm("Are you sure you want to delete this payroll record?")) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5004/api/payroll/${payrollId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add token
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete payroll");
        }

        setPayrolls(prev => prev.filter(p => p.payroll_id !== payrollId));
        if (selectedPayroll?.payroll_id === payrollId) {
          setSelectedPayroll(null);
          setIsEditing(false);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const startEditing = () => {
    if (!selectedPayroll) return;
    setEditValues({
      hoursWorked: selectedPayroll.hours_worked || "",
      leaveDeductions: selectedPayroll.leave_deductions || "",
      finalSalary: selectedPayroll.final_salary || ""
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = async () => {
    try {
      const updatedData = {
        hours_worked: Number(editValues.hoursWorked) || 0,
        leave_deductions: Number(editValues.leaveDeductions) || 0,
        final_salary: Number(editValues.finalSalary) || 0,
      };

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5004/api/payroll/${selectedPayroll.payroll_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`, // Add token
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payroll");
      }

      setPayrolls(prev => prev.map(p =>
        p.payroll_id === selectedPayroll.payroll_id
          ? { ...p, ...updatedData }
          : p
      ));
      setSelectedPayroll(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const onChangeEditValue = (e) => {
    const { name, value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return;
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setNewPayroll({
      employee_code: "",
      name: "",
      department: "",
      position: "",
      hours_worked: "",
      leave_deductions: "",
      final_salary: "",
    });
    setIsAddModalOpen(true);
    setError(null);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const onEmployeeSelect = (e) => {
    const employeeCode = e.target.value;
    const employee = allEmployees.find(emp => emp.employee_code === employeeCode);

    if (employee) {
      setNewPayroll({
        employee_code: employee.employee_code,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        hours_worked: "",
        leave_deductions: "",
        final_salary: "",
      });
    } else {
      setNewPayroll({
        employee_code: "",
        name: "",
        department: "",
        position: "",
        hours_worked: "",
        leave_deductions: "",
        final_salary: "",
      });
    }
  };

  const onAddChange = (e) => {
    const { name, value } = e.target;
    if (
      ["hours_worked", "leave_deductions", "final_salary"].includes(name) &&
      value !== "" &&
      !/^\d*\.?\d*$/.test(value)
    ) return;

    setNewPayroll(prev => ({ ...prev, [name]: value }));
  };

  const addNewPayroll = async () => {
    try {
      // Validate inputs
      if (!newPayroll.employee_code) {
        throw new Error("Please select an employee");
      }

      const payload = {
        employee_code: newPayroll.employee_code,
        hours_worked: parseFloat(newPayroll.hours_worked) || 0,
        leave_deductions: parseFloat(newPayroll.leave_deductions) || 0,
        final_salary: parseFloat(newPayroll.final_salary) || 0
      };

      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch("http://localhost:5004/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`, // Add token
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add payroll");
      }

      setPayrolls(prev => [...prev, responseData.data]);
      setIsAddModalOpen(false);
      setError(null);

    } catch (err) {
      console.error("Add payroll error:", err);
      setError(err.message || "Failed to add payroll. Please try again.");
    }
  };

  const renderPayrollRow = (payroll) => (
    <tr key={payroll.payroll_id}>
      <td>{payroll.payroll_id}</td>
      <td>{payroll.employee_code}</td>
      <td>{payroll.name}</td>
      <td>{payroll.department}</td>
      <td>{payroll.position}</td>
      <td>{payroll.hours_worked}</td>
      <td>{formatCurrency(payroll.leave_deductions)}</td>
      <td>{formatCurrency(payroll.final_salary)}</td>
      <td className="actions-cell">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button
            className="btn view-btn"
            onClick={() => setSelectedPayroll(payroll)}
          >
            View
          </button>
          <button
            className="btn edit-btn"
            onClick={() => {
              setSelectedPayroll(payroll);
              startEditing();
            }}
          >
            Edit
          </button>
          <button
            className="btn delete-btn"
            onClick={() => handleDelete(payroll.payroll_id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const renderModal = () => (
    <div className="modal-overlay" onClick={() => {
      setSelectedPayroll(null);
      setIsEditing(false);
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h4>{isEditing ? "Edit Payroll" : "Payroll Details"}</h4>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Payroll ID:</label>
          <div className="form-value">{selectedPayroll.payroll_id}</div>
        </div>

        <div className="form-group">
          <label>Employee Code:</label>
          <div className="form-value">{selectedPayroll.employee_code}</div>
        </div>

        <div className="form-group">
          <label>Name:</label>
          <div className="form-value">{selectedPayroll.name}</div>
        </div>

        <div className="form-group">
          <label>Department:</label>
          <div className="form-value">{selectedPayroll.department}</div>
        </div>

        <div className="form-group">
          <label>Position:</label>
          <div className="form-value">{selectedPayroll.position}</div>
        </div>

        <div className="form-group">
          <label>Hours Worked:</label>
          {isEditing ? (
            <input
              type="text"
              name="hoursWorked"
              value={editValues.hoursWorked}
              onChange={onChangeEditValue}
              className="form-input"
            />
          ) : (
            <div className="form-value">{selectedPayroll.hours_worked}</div>
          )}
        </div>

        <div className="form-group">
          <label>Leave Deductions:</label>
          {isEditing ? (
            <input
              type="text"
              name="leaveDeductions"
              value={editValues.leaveDeductions}
              onChange={onChangeEditValue}
              className="form-input"
            />
          ) : (
            <div className="form-value">{formatCurrency(selectedPayroll.leave_deductions)}</div>
          )}
        </div>

        <div className="form-group">
          <label>Final Salary:</label>
          {isEditing ? (
            <input
              type="text"
              name="finalSalary"
              value={editValues.finalSalary}
              onChange={onChangeEditValue}
              className="form-input"
            />
          ) : (
            <div className="form-value">{formatCurrency(selectedPayroll.final_salary)}</div>
          )}
        </div>

        <div className="modal-actions">
          {isEditing ? (
            <>
              <button className="btn save-btn" onClick={saveEditing}>Save</button>
              <button className="btn cancel-btn" onClick={cancelEditing}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn edit-btn" onClick={startEditing}>Edit</button>
              <button
                className="btn download-btn"
                onClick={() => downloadPayslipPDF(selectedPayroll)}
              >
                Download
              </button>
            </>
          )}
          <button
            className="btn cancel-btn"
            onClick={() => {
              setSelectedPayroll(null);
              setIsEditing(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddModal = () => (
    <div className="modal-overlay" onClick={closeAddModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h4>Add New Payroll</h4>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Select Employee:</label>
          <select
            className="form-input"
            onChange={onEmployeeSelect}
            value={newPayroll.employee_code}
            required
          >
            <option value="">Select an employee</option>
            {Array.isArray(allEmployees) && allEmployees.map(employee => (
              <option key={employee.employee_code} value={employee.employee_code}>
                {employee.name} ({employee.employee_code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newPayroll.name}
            className="form-input"
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={newPayroll.department}
            className="form-input"
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Position:</label>
          <input
            type="text"
            name="position"
            value={newPayroll.position}
            className="form-input"
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Hours Worked:</label>
          <input
            type="text"
            name="hours_worked"
            value={newPayroll.hours_worked}
            onChange={onAddChange}
            className="form-input"
            placeholder="Enter hours worked"
          />
        </div>

        <div className="form-group">
          <label>Leave Deductions (R):</label>
          <input
            type="text"
            name="leave_deductions"
            value={newPayroll.leave_deductions}
            onChange={onAddChange}
            className="form-input"
            placeholder="Enter leave deductions"
          />
        </div>

        <div className="form-group">
          <label>Final Salary (R):</label>
          <input
            type="text"
            name="final_salary"
            value={newPayroll.final_salary}
            onChange={onAddChange}
            className="form-input"
            placeholder="Enter final salary"
          />
        </div>

        <div className="modal-actions">
          <button className="btn save-btn" onClick={addNewPayroll}>Add</button>
          <button className="btn cancel-btn" onClick={closeAddModal}>Cancel</button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading-indicator">Loading payroll data...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section>
      <div id="app">
        <h2 className="contentWidth mt-4 mb-2" style={{ fontWeight: 600 }}>Payroll Management</h2>

        <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 'bold' }}>
          Total Monthly Pay: {formatCurrency(totalMonthlyPay)}
        </div>

        <button className="btn addBtn" onClick={openAddModal}>Add Payroll</button>

        <div className={`table-responsive ${slideIn ? 'slide-in-right' : ''}`}>
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Payroll ID</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Hours Worked</th>
                <th>Leave Deductions</th>
                <th>Final Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                payrolls.map(renderPayrollRow)
              )}
            </tbody>
          </table>
        </div>

        {selectedPayroll && renderModal()}
        {isAddModalOpen && renderAddModal()}
      </div>
    </section>
  );
};

export default Payroll;