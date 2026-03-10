import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  FiClock,
  FiSearch,
  FiFilter,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiDatabase
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { getUserSignals } from "../../services/signalService";
import { getBacktestResults } from "../../services/backtestService";
import LoadingScreen from "../../components/ui/LoadingScreen";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const HistoryPage = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.user_id) return;
      try {
        const [signals, backtests] = await Promise.all([
          getUserSignals(user.user_id),
          getBacktestResults()
        ]);

        const items = [
          ...signals.map(s => ({
            type: 'Signal',
            name: s.company_name || 'AI Extraction',
            date: s.created_at,
            status: 'Verified',
            pair: s.currency_pair || 'FX'
          })),
          ...(backtests.results || []).map(b => ({
            type: 'Backtest',
            name: `Simulation: ${b.pair}`,
            date: b.created_at,
            status: 'Completed',
            pair: b.pair
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setHistoryItems(items);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const filteredItems = historyItems.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiClock className="text-yellow-500" />
            Trading <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Archives</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Comprehensive historical record of your market operations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
            <input
              type="text"
              placeholder="Search Archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm uppercase tracking-widest">Operation History</h3>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">DISPLAYING {filteredItems.length} ENTRIES</span>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <LoadingScreen />
          </div>
        ) : (
          <Motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {filteredItems.map((entry, i) => (
              <Motion.div
                key={i}
                variants={item}
                className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    {entry.type === 'Signal' ? <FiZap /> : <FiActivity />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">{entry.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{entry.type} • {entry.pair} • {new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded uppercase tracking-widest border border-green-500/20">
                    {entry.status}
                  </span>
                  <button className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all">
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </Motion.div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-20 text-center">
                <FiDatabase className="mx-auto mb-4 text-white/5" size={40} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Archive data stream empty.</p>
              </div>
            )}
          </Motion.div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'ARCHIVED SIGNALS', value: historyItems.filter(i => i.type === 'Signal').length },
          { label: 'BACKTEST RUNS', value: historyItems.filter(i => i.type === 'Backtest').length },
          { label: 'TOTAL ASSETS', value: new Set(historyItems.map(i => i.pair)).size },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
