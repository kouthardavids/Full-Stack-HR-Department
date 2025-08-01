import React, { useState } from 'react';
import SideBar from './SideBar';

const Layout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => setSidebarExpanded(prev => !prev);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
};

export default Layout;