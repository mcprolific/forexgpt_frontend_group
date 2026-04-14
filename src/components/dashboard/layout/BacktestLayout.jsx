import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  FiBarChart2, FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getBacktestResults } from '../../../services/backtestService';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";


const BacktestLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen] = useState(false);
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { backtestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.user_id || user?.id;

  useEffect(() => {
    if (userId) {
      loadHistory();
      return;
    }

    setBacktests([]);
  }, [userId, location.pathname]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (!userId) {
        setBacktests([]);
        return;
      }
      const data = await getBacktestResults(userId, 200, 0);
      setBacktests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full rounded-3xl border border-white/5 overflow-hidden bg-black/20 backdrop-blur-sm relative">

      {/* Backtest sidebar + hamburger removed */}

      <Motion.aside
        initial={false}
        animate={{
          width: '0px',
          x: window.innerWidth < 768 ? -300 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden"
      >
        <div className="w-[300px] md:w-80 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/dashboard/backtest');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-yellow-500/10"
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#000' }}
            >
              <FiPlus className="w-4 h-4" />
              New Backtest Run
            </Motion.button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
            <div className="flex items-center justify-between px-3 mb-4">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Historical Reports ({backtests.length})</h3>
              <button
                onClick={loadHistory}
                disabled={loading}
                className="text-gray-600 hover:text-yellow-500 transition-colors"
                title="Refresh history"
              >
                <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading && backtests.length === 0 ? (
              <div className="space-y-3 px-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : backtests.length > 0 ? (
              <div className="space-y-1.5">
                {backtests.map(bt => {
                  const isPos = (bt.total_return_pct ?? 0) >= 0;
                  const isActive = String(bt.id) === String(backtestId);
                  return (
                    <button
                      key={bt.id}
                      onClick={() => {
                        navigate(`/dashboard/backtest/${bt.id}`);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full p-4 rounded-xl border transition-all group ${isActive
                        ? 'border-yellow-500/40 bg-yellow-500/5'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                        } text-left`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-200">{bt.pair || 'EURUSD'}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${isPos ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isPos ? '+' : ''}{bt.total_return_pct?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-gray-600 font-bold uppercase truncate max-w-[120px]">
                          {bt.strategy_name?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] text-gray-700 font-bold">
                          {new Date(bt.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 opacity-40 group hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                  <FiBarChart2 className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No backtests found</p>
                <p className="text-xs text-gray-600 mt-1">Validate your strategy edge.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="border-t border-white/5 p-6 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compute Node Ready</span>
            </div>
          </div>
        </div>
      </Motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-transparent relative min-w-0">
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BacktestLayout;
