import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthStyles.css";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userType, setUserType] = useState("employee"); // employee or admin

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const validateLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const endpoint = userType === "admin"
        ? "http://localhost:5004/api/login/admin"
        : "http://localhost:5004/api/login/employee";

      const response = await axios.post(endpoint, {
        email: username,
        password
      });

      // Store tokens and user data
      localStorage.setItem("accessToken", response.data.token || response.data.accessToken);
      localStorage.setItem("userRole", userType);

      if (userType === "employee") {
        localStorage.setItem("employeeData", JSON.stringify(response.data.user));
      }

      // Redirect based on user type
      navigate(userType === "admin" ? "/dashboard" : "/employeesdash");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="bg-container">
        <div className="container">
          <h1>LOG IN</h1>

          {/* User Type Selector */}
          <div className="user-type-toggle">
            <label className={`radio-container ${userType === "employee" ? "checked" : ""}`}>
              Employee
              <input
                type="radio"
                name="userType"
                value="employee"
                checked={userType === "employee"}
                onChange={() => setUserType("employee")}
              />
              <span className="checkmark"></span>
            </label>

            <label className={`radio-container ${userType === "admin" ? "checked" : ""}`}>
              Admin
              <input
                type="radio"
                name="userType"
                value="admin"
                checked={userType === "admin"}
                onChange={() => setUserType("admin")}
              />
              <span className="checkmark"></span>
            </label>
          </div>

          <form id="login-form" onSubmit={validateLogin}>
            <div className="tbox">
              <input
                id="uname"
                type="email"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="tbox password-container">
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <input
                id="pwd"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>


            <div className="glow-btn">
              <div className="btn-glow"></div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="alert alert-danger mt-3">
              {errorMessage}
            </div>
          )}

          {userType === "employee" && (
            <p className="text-center mt-3">
              Don't have an account?{" "}
              <Link className="b2" to="/signup">
                Sign Up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;