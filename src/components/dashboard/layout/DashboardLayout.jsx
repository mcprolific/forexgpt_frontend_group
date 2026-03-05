import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-screen bg-[#121212]"> {/* Charcoal black background */}

      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 overflow-y-auto p-6 bg-[#121212]"> {/* Match the main content background */}
        <Outlet />
      </div>

    </div>
  );
};

export default DashboardLayout;