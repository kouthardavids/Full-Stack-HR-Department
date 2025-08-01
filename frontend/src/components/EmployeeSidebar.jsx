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
                    <Link className={isActive("/dashboard")}>
                        <i class="bi bi-person-circle"></i><span>Profile</span></Link>
                </li>
                <li>
                    <Link className={isActive("/employees")}>
                        <i class="bi bi-hourglass-split"></i><span>Time Off</span></Link>
                </li>
                <li>
                    <Link className={isActive("/payroll")}>
                        <i className="bi bi-wallet2"></i><span>Payroll</span></Link>
                </li>
                <li>
                    <Link className={isActive("/performance")}>
                        <i class="bi bi-pencil-square"></i><span>Feedback</span></Link>
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