import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthStyles.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    department: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const departments = [
    "Data Analysis",
    "Sales",
    "Marketing",
    "Design",
    "IT",
    "Finance",
    "Support",
    "Operations",
    "Product Manager",
  ];

  const employeeTypes = ["Full-Time", "Part-Time", "Contractor"];

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Updated to match your backend route
      const response = await fetch("http://localhost:5004/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Show success message
      alert("Registration successful! QR code has been sent to your email.");
      
      // Redirect to login page
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading;

  return (
    <div className="login-body">
      <div className="bg-container">
        <div className="container">
          <h1>SIGN UP</h1>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <form id="signup-form" onSubmit={handleSubmit}>
            <div className="tbox">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="tbox">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="tbox">
              <input
                name="password"
                type="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
                disabled={isDisabled}
              />
            </div>

            <div className="tbox">
              <input
                name="position"
                type="text"
                placeholder="Job Position"
                value={formData.position}
                onChange={handleChange}
                required
                disabled={isDisabled}
              />
            </div>

            <div className="select-container">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={isDisabled}
                className="custom-select"
              >
                <option value="" disabled>Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="select-container">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={isDisabled}
                className="custom-select"
              >
                <option value="" disabled>Employment Type</option>
                {employeeTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="glow-btn">
              <div className="btn-glow"></div>
              <button type="submit" className="btn" disabled={isDisabled}>
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </div>
          </form>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link className="b2" to="/login">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;