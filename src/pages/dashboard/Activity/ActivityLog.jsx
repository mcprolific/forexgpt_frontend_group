
import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FiClock, FiActivity, FiZap, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';
import { getActivityLogs } from '../../../services/userService';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLogs(50);
        setLogs(data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getActivityIcon = (action) => {
    if (action.includes('Signal')) return <FiTrendingUp className="text-yellow-500" />;
    if (action.includes('Mentor') || action.includes('Question')) return <FiMessageCircle className="text-yellow-500" />;
    if (action.includes('Backtest')) return <FiActivity className="text-yellow-500" />;
    return <FiZap className="text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiClock className="text-yellow-500" />
            Activity <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Log</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Historical trace of your AI trading intelligence.</p>
        </div>
      </div>

      {/* Activity List */}
      <Motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {logs.map((log) => (
          <Motion.div
            key={log.id}
            variants={item}
            whileHover={{ x: 5 }}
            className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-500/20 transition-all flex items-start gap-5 relative overflow-hidden"
          >
            {/* Gradient Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-yellow-500/0 via-yellow-500/40 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              {getActivityIcon(log.action)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <p className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors truncate">{log.action}</p>
                <span className="text-[10px] text-gray-600 whitespace-nowrap font-black uppercase tracking-tighter">
                  {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Transaction verified on institutional compute grid.</p>
            </div>
          </Motion.div>
        ))}
      </Motion.div>

      {/* Empty State if needed */}
      {logs.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <FiClock className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest">No activity found</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
