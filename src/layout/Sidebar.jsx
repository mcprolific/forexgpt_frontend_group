import React from "react";
import { NavLink } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import { BoltIcon, ChatBubbleLeftRightIcon, CodeBracketIcon, ChartBarIcon, BookOpenIcon, ClockIcon, Cog6ToothIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Transcript", path: "/dashboard/transcript", icon: <DocumentTextIcon className="h-5 w-5" /> },
  { name: "Signals", path: "/dashboard/signals", icon: <BoltIcon className="h-5 w-5" /> },
  { name: "Mentor", path: "/dashboard/mentor", icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> },
  { name: "Strategy", path: "/dashboard/strategy", icon: <CodeBracketIcon className="h-5 w-5" /> },
  { name: "Backtest", path: "/dashboard/backtest", icon: <ChartBarIcon className="h-5 w-5" /> },
  { name: "Learning", path: "/dashboard/learning", icon: <BookOpenIcon className="h-5 w-5" /> },
  { name: "History", path: "/dashboard/history", icon: <ClockIcon className="h-5 w-5" /> },
  { name: "Settings", path: "/dashboard/settings", icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <Motion.aside
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg w-64 flex-shrink-0 z-50 h-screen fixed md:relative md:translate-x-0"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-4 font-bold text-xl text-indigo-600 border-b">
          ForexGPT
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-100 transition-colors ${
                  isActive ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-700"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Toggle button for mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden bg-indigo-600 text-white p-2 m-4 rounded-lg"
        >
          {isOpen ? "Close" : "Open"}
        </button>
      </div>
    </Motion.aside>
  );
};

export default Sidebar;
