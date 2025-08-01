import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SideBar = ({ sidebarExpanded, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ? "page-links active" : "page-links";

    const logOut = () => {
        navigate("/login");
        localStorage.setItem("loggedIn", "");
    }

    return (
        <nav id="sidebar" className={sidebarExpanded ? "expand" : ""}>
            <div className="d-flex align-items-center">
                <button id="toggle-btn" type="button" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <div className="sidebar-logo">
                    <Link to="/">HR SYSTEM</Link>
                </div>
            </div>
            <ul>
                <li>
                    <Link to="/dashboard" className={isActive("/dashboard")}>
                        <i className="bi bi-house-door"></i><span>Dashboard</span></Link>
                </li>
                <li>
                    <Link to="/employees" className={isActive("/employees")}>
                        <i className="bi bi-people"></i><span>Employees</span></Link>
                </li>
                <li>
                    <Link to="/payroll" className={isActive("/payroll")}>
                        <i className="bi bi-wallet2"></i><span>Payroll</span></Link>
                </li>
                <li>
                    <Link to="/attendance" className={isActive("/attendance")}>
                        <i className="bi bi-clipboard-check"></i><span>Attendance</span></Link>
                </li>
                <li>
                    <Link to="/timeoff" className={isActive("/timeoff")}>
                        <i className="bi bi-clock"></i><span>Time Off</span></Link>
                </li>
                <li className="sidebar-footer" onClick={logOut}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Log Out</span>
                </li>
            </ul>
        </nav>
    );
};

export default SideBar;