import React, { useState, useEffect, useRef } from 'react';
import './EmployeesListings.css';

const employmentTypeOptions = ['Full-Time', 'Part-Time', 'Contractor'];

const EmployeesListings = () => {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    contact: '', // This corresponds to 'email' in the backend
    salary: '',
    employmentType: '',
  });

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    setSlideIn(true);
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5004/api/all/employees'); // Assuming your API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const validate = (emp) => {
    const errors = {};
    if (!emp.name.trim()) errors.name = 'Name is required';
    if (!emp.position.trim()) errors.position = 'Position is required';

    if (!emp.contact.trim()) {
      errors.contact = 'Contact is required';
    } else {
      const phoneRegex = /^[0-9\-\+]{9,15}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!phoneRegex.test(emp.contact) && !emailRegex.test(emp.contact)) {
        errors.contact = 'Must be a valid phone number or email';
      }
    }

    if (!emp.salary.toString().trim()) errors.salary = 'Salary is required';
    else if (isNaN(Number(emp.salary))) errors.salary = 'Salary must be a number';

    if (!employmentTypeOptions.includes(emp.employmentType)) {
      errors.employmentType = 'Select a valid employment type';
    }
    return errors;
  };

  const handleSaveEdit = async () => {
    const errors = validate(editingEmployee);
    if (Object.keys(errors).length) {
      setEditErrors(errors);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5004/api/employees/${editingEmployee.id}`, { // Assuming 'id' is the primary key from your DB
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingEmployee,
          salary: Number(editingEmployee.salary),
          type: editingEmployee.type,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      fetchEmployees(); // Re-fetch employees to update the list
      setEditErrors({});
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee edit:', error);
      // Handle error
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        const response = await fetch(`http://localhost:5004/api/employees/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
        fetchEmployees(); // Re-fetch employees to update the list
      } catch (error) {
        console.error('Error deleting employee:', error);
        // Handle error
      }
    }
  };

  const handleDragStart = (e, index) => dragItem.current = index;
  const handleDragEnter = (e, index) => dragOverItem.current = index;

  const handleDragEnd = async () => {
    const list = [...employees];
    const item = list.splice(dragItem.current, 1)[0];
    list.splice(dragOverItem.current, 0, item);
    setEmployees(list);
    dragItem.current = dragOverItem.current = null;
  };

  return (
    <section>
      <div id="app">
        <h2 className="contentWidth mt-4 mb-2" style={{ fontWeight: 600 }}>Employees List</h2>

        <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 'bold' }}>
          Total Employees: {employees.length}
        </div>

        <div style={{ margin: '16px 0', fontStyle: 'italic', color: '#7e289e', fontWeight: 'bold' }}>
          * Drag and drop rows to reorder employees. (Order changes are local, not persistent)
        </div>

        <table className={`table table-bordered table-striped ${slideIn ? 'slide-in-right' : ''}`}>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No employees found.</td></tr>
            ) : (
              employees.map((emp, index) => (
                <tr
                  key={emp.id} // Use emp.id from the database
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ cursor: 'grab' }}
                >
                  <td>{emp.id}</td> {/* Use emp.id from the database */}
                  <td>{emp.name}</td>
                  <td>{emp.position}</td>
                  <td>{emp.contact}</td> {/* This should now correctly display the email aliased as 'contact' */}
                  <td>{emp.type}</td>
                  <td className="actions-cell">
                    <button className="btn" onClick={() => setViewingEmployee(emp)}>View</button>
                    <button className="editBtn" onClick={() => setEditingEmployee({ ...emp, salary: String(emp.salary), contact: emp.contact, employmentType: emp.type })}>Edit</button> {/* Ensure contact is passed to edit */}
                    <button className="deleteBtn" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {viewingEmployee && (
          <Modal title="Employee Details" onClose={() => setViewingEmployee(null)}>
            <p><strong>Name:</strong> {viewingEmployee.name}</p>
            <p><strong>Position:</strong> {viewingEmployee.position}</p>
            <p><strong>Contact:</strong> {viewingEmployee.contact}</p> {/* Use contact here */}
            <p><strong>Salary:</strong> {viewingEmployee.salary}</p>
            <p><strong>Type:</strong> {viewingEmployee.type}</p>
            <button style={styles.cancelBtn} onClick={() => setViewingEmployee(null)}>Close</button>
          </Modal>
        )}

        {editingEmployee && (
          <Modal title="Edit Employee" onClose={() => setEditingEmployee(null)}>
            {/* Changed 'email' to 'contact' in array for mapping */}
            {['name', 'position', 'contact', 'salary'].map((field) => (
              <div key={field}>
                <input
                  style={styles.input}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalize placeholder
                  value={editingEmployee[field]}
                  onChange={(e) =>
                    setEditingEmployee((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                />
                {editErrors[field] && <div style={styles.error}>{editErrors[field]}</div>}
              </div>
            ))}
            <select
              style={styles.input}
              value={editingEmployee.employmentType}
              onChange={(e) =>
                setEditingEmployee((prev) => ({ ...prev, employmentType: e.target.value }))
              }
            >
              <option value="">Select Employment Type</option>
              {employmentTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {editErrors.employmentType && <div style={styles.error}>{editErrors.employmentType}</div>}

            <button style={styles.saveBtn} onClick={handleSaveEdit}>Save</button>
            <button style={styles.cancelBtn} onClick={() => setEditingEmployee(null)}>Cancel</button>
          </Modal>
        )}
      </div>
    </section>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div style={styles.overlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h4>{title}</h4>
      {children}
    </div>
  </div>
);

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
    width: '90%',
    maxWidth: 400,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #ccc',
    marginBottom: 10,
  },
  saveBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundImage: 'linear-gradient(#7e289e, #9b59b6)',
    color: 'white',
    marginRight: 10,
  },
  cancelBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: '#95a5a6',
    color: 'white',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
};

export default EmployeesListings;