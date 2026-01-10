import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar/sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-root">
      {/* Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

      <div className="layout-body">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout