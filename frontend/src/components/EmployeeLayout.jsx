import React, { useState } from 'react';
import EmployeeSidebar from '../components/EmployeeSidebar.jsx';

const Layout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => setSidebarExpanded(prev => !prev);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <EmployeeSidebar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
};

export default Layout;