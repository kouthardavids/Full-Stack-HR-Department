import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import DashboardPage from "./pages/admin/DashboardPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import AttendancePage from "./pages/admin/AttendancePage";
import PayrollPage from "./pages/admin/PayrollPage";
import TimeoffPage from "./pages/admin/TimeoffPage";
import Review from "./pages/admin/Review";
import ScannerPage from "./pages/admin/ScannerPage";
import Login from "./components/LoginComp";
import Signup from "./components/Signup";
import EmployeesDashboard from "./pages/employees/EmployeeDashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const ProtectedRoute = ({ allowedRoles }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === "admin" ? "/dashboard" : "/employeesdash"} replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => <ProtectedRoute allowedRoles={["admin"]} />;

const EmployeeRoute = () => <ProtectedRoute allowedRoles={["employee"]} />;

const AuthRoute = () => <ProtectedRoute />;

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/scanner" element={<ScannerPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />}/>
      <Route path="/reset-password/:token" element={<ResetPassword />}/>

      {/* Admin-only routes */}
      <Route element={<AdminRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/timeoff" element={<TimeoffPage />} />
        <Route path="/performance" element={<Review />} />
      </Route>

      {/* Employee-only route */}
      <Route element={<EmployeeRoute />}>
        <Route path="/employeesdash" element={<EmployeesDashboard />} />
      </Route>

      {/* Default routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;