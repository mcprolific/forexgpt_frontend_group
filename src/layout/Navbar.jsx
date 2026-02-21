import React from "react";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import useAuth from "../hooks/useAuth";

const Navbar = ({ toggleSidebar }) => {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white shadow p-4">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>

      <div className="flex-1 flex justify-center md:justify-start">
        <h1 className="text-xl font-bold text-gray-800">ForexGPT</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <BellIcon className="h-6 w-6 text-gray-700" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
