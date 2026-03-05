import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/dashboard/Sidebar";  // This goes up one level to components folder
import Navbar from "./components/dashboard/Navbar";    // This goes up one level to components folder

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-48">
        <Navbar />
        
        {/* Page Content */}
        <main className="p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;