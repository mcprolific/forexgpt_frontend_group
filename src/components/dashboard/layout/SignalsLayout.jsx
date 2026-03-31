import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  FiActivity, FiZap, FiTrash2, FiSearch,
  FiTrendingUp, FiTrendingDown, FiMinus
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { getUserSignals, deleteSignal } from '../../../services/signalService';
import toast from 'react-hot-toast';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

// Direction icon helper — uses primary_direction from DB (LONG / SHORT / NEUTRAL)
const DirectionIcon = ({ direction }) => {
  const d = (direction || '').toUpperCase();
  if (d === 'LONG') return <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (d === 'SHORT') return <FiTrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <FiMinus className="w-3.5 h-3.5 text-gray-500" />;
};

const SignalsLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  const [isSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Load saved signals from backend ─────────────────────────────────────────
  // GET /signals/user/{user_id}
  // Returns list of DB rows: { id, source_label, primary_direction, affected_pairs,
  //                            confidence, primary_sentiment, base_currency, created_at }
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserSignals(userId, 50);
        setSignals(data || []);
      } catch (err) {
        console.error('Failed to load signals sidebar:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // ── Delete signal ────────────────────────────────────────────────────────────
  // DELETE /signals/{user_id}/{signal_id}
  const handleDelete = async (signalId, e) => {
    e.stopPropagation();
    try {
      await deleteSignal(userId, signalId);
      setSignals(prev => prev.filter(s => s.id !== signalId));
      toast.success("Signal purged");
    } catch {
      toast.error("Failed to purge signal");
    }
  };

  // ── Search: filter by source_label or affected_pairs ────────────────────────
  const filteredSignals = signals.filter(s =>
    !searchQuery ||
    s.source_label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.affected_pairs?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.base_currency?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Group signals by date ─────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const grouped = filteredSignals.reduce((acc, s) => {
    const key = formatDate(s.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-full rounded-3xl border border-white/5 overflow-hidden bg-black/20 backdrop-blur-sm relative">

      {/* Signals sidebar + hamburger removed */}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <Motion.aside
        initial={false}
        animate={{
          width: '0px',
          x: window.innerWidth < 768 ? -300 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden"
      >
        <div className="w-[300px] flex flex-col h-full">

          {/* Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <FiZap className="text-yellow-500 w-4 h-4" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Signal History</span>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
              {signals.length} saved signal{signals.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search by source or pair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-500/40 transition-all"
              />
            </div>
          </div>

          {/* Signals list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([date, sigs]) => (
                <div key={date} className="mb-5">
                  <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] px-2 mb-2">{date}</h3>
                  <div className="space-y-1">
                    {sigs.map(signal => (
                      <div key={signal.id} className="group relative">
                        <div
                          onClick={() => {
                            navigate('/dashboard/signals');
                            setIsSidebarOpen(false);
                          }}
                          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                        >
                          {/* Direction icon */}
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <DirectionIcon direction={signal.primary_direction} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Source label */}
                            <p className="text-xs font-bold text-gray-300 group-hover:text-yellow-500 transition-colors truncate">
                              {signal.source_label || 'Signal Extract'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {/* Pair */}
                              {(signal.affected_pairs?.[0] || signal.base_currency) && (
                                <span className="text-[9px] font-bold text-yellow-500/70 uppercase">
                                  {signal.affected_pairs?.[0] || signal.base_currency}
                                </span>
                              )}
                              <span className="text-gray-700">•</span>
                              {/* Direction */}
                              <span className={`text-[9px] font-black uppercase ${signal.primary_direction === 'LONG' ? 'text-green-500' :
                                signal.primary_direction === 'SHORT' ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {signal.primary_direction || 'NEUTRAL'}
                              </span>
                              {/* Confidence */}
                              {signal.confidence != null && (
                                <>
                                  <span className="text-gray-700">•</span>
                                  <span className="text-[9px] text-gray-600">{Math.round(signal.confidence * 100)}%</span>
                                </>
                              )}
                            </div>
                            {/* Time */}
                            <p className="text-[9px] text-gray-700 mt-0.5">
                              {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        {/* Delete on hover */}
                        <button
                          onClick={(e) => handleDelete(signal.id, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 text-red-500/60 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Signal"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40">
                <FiActivity className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No signals yet</p>
                <p className="text-[10px] text-gray-600 mt-1">Extract alpha from a transcript</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-4 bg-black/20">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Extraction Engine Active</span>
            </div>
          </div>
        </div>
      </Motion.aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-transparent relative min-w-0">
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SignalsLayout;
