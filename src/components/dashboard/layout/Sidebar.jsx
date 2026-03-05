import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiMessageCircle,
  FiTrendingUp,
  FiActivity,
  FiCode,
  FiBarChart2,
  FiUser,
  FiClock,
  FiCpu,
  FiGitBranch,
  FiChevronRight,
  FiMenu
} from "react-icons/fi";

const Sidebar = ({ isOpen, toggleSidebar }) => {

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/mentor/conversations", icon: FiMessageCircle, label: "Mentor" },
    // { path: "/quant/sessions", icon: FiCpu, label: "Quant" },
    { path: "/code", icon: FiCode, label: "Code Generation" },
    { path: "/signals", icon: FiActivity, label: "Signals Extraction" },
    // { path: "/strategies", icon: FiGitBranch, label: "Strategies" },
    { path: "/backtests", icon: FiBarChart2, label: "Backtests" },
    { path: "/activity", icon: FiClock, label: "Activity" },
    { path: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-black text-white flex flex-col py-6 shadow-xl transition-all duration-300`}
    >

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="mb-6 ml-4 text-yellow-500"
      >
        <FiMenu size={22} />
      </button>

      {/* Logo */}
      <div className="px-5 mb-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
          <span className="text-lg font-bold text-black">FX</span>
        </div>

        {isOpen && (
          <div>
            <span className="text-lg font-bold text-yellow-500">
              ForexGPT
            </span>
            <p className="text-xs text-white">
              AI-Powered Trading
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 space-y-1">

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-yellow-600 text-black"
                  : "text-yellow-500 hover:bg-white hover:text-black"
              }`
            }
          >
            <item.icon className="w-5 h-5" />

            {isOpen && (
              <span className="ml-3 text-sm font-semibold">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}

      </div>
    </div>
  );
};

export default Sidebar;