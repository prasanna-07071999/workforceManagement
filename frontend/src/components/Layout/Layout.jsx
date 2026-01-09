import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar/sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-root">
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout