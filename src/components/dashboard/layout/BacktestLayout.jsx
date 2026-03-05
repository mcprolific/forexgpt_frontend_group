import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiBarChart2, FiPlus, FiSearch, FiMoreVertical, FiTrash2,
  FiMenu, FiX, FiClock, FiCheckCircle, FiXCircle,
  FiPlay, FiDownload, FiEye, FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';

const BacktestLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(`backtest_history_${user?.id}`);
      if (saved) {
        setBacktests(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col overflow-hidden`}>
        {isSidebarOpen && (
          <>
            <div className="p-4 border-b border-[#1f1f1f]">
              <button
                onClick={() => navigate('/backtests/new')}
                className="w-full flex items-center justify-between px-4 py-3 
                           bg-[#141414] border border-[#1f1f1f] rounded-lg 
                           hover:border-yellow-400 transition duration-300"
              >
                <span className="text-sm font-medium text-yellow-400">
                  New Backtest
                </span>
                <FiPlus className="w-4 h-4 text-yellow-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Backtest list here */}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative bg-black">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 z-10 p-2 bg-[#141414] 
                     border border-[#1f1f1f] rounded-lg 
                     hover:border-yellow-400 transition duration-300"
          style={{
            left: isSidebarOpen ? '20rem' : '1rem'
          }}
        >
          {isSidebarOpen
            ? <FiX className="w-4 h-4 text-white" />
            : <FiMenu className="w-4 h-4 text-white" />}
        </button>

        <div className="h-full overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BacktestLayout;