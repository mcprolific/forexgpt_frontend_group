import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FiUser, FiX, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';

const ProfileLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#121212] text-white"> {/* Charcoal background */}

      {/* Sidebar */}
      <aside
        className={`flex flex-col h-full bg-[#121212] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72' : 'w-0'
        } overflow-hidden`}
      >
        {isSidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#1E1E1E] hover:bg-yellow-400 hover:text-black transition-all group"
              >
                <span className="text-sm font-medium text-yellow-400 group-hover:text-black">
                  My Profile
                </span>
                <FiUser className="w-5 h-5 text-yellow-400 group-hover:text-black" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col mt-6 space-y-2 px-3">
              <Link
                to="/profile"
                className="px-3 py-2 rounded-lg text-white hover:bg-yellow-400 hover:text-black transition-colors"
              >
                Overview
              </Link>
              <Link
                to="/profile/settings"
                className="px-3 py-2 rounded-lg text-white hover:bg-yellow-400 hover:text-black transition-colors"
              >
                Settings
              </Link>
              <Link
                to="/profile/activity"
                className="px-3 py-2 rounded-lg text-white hover:bg-yellow-400 hover:text-black transition-colors"
              >
                Activity
              </Link>
            </nav>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 z-10 p-2 rounded-lg bg-[#121212] hover:bg-yellow-400 hover:text-black transition-colors"
          style={{ left: isSidebarOpen ? '18rem' : '1rem' }}
        >
          {isSidebarOpen ? (
            <FiX className="w-5 h-5 text-yellow-400" />
          ) : (
            <FiMenu className="w-5 h-5 text-yellow-400" />
          )}
        </button>

        {/* Profile Pages Outlet */}
        <div className="flex-1 overflow-y-auto p-6 min-h-screen bg-[#121212]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;