import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiClock, FiActivity } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { getBacktestTrades, getBacktestResult } from '../../../services/backtestService';
import { useAuth } from '../../../contexts/AuthContext';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const BacktestTrades = () => {
  const { backtestId } = useParams();
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const uid = user?.user_id || user?.id;
      if (!backtestId || !uid) {
        setLoading(false);
        return;
      }
      try {
        const [tradesData, resultData] = await Promise.all([
          getBacktestTrades(uid, backtestId),
          getBacktestResult(uid, backtestId)
        ]);
        setTrades(Array.isArray(tradesData) ? tradesData : tradesData?.trades || []);
        setBacktest(resultData);
      } catch (error) {
        console.error("Error fetching trades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [backtestId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="h-10 w-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 text-white space-y-10 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-6">
        <Link
          to="/dashboard/backtest"
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
        >
          <FiArrowLeft className="w-5 h-5 text-yellow-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            Trade <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Ledger</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Detailed execution audit for simulation ID: {backtestId?.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Stats Summary */}
      {backtest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Gross Profit", value: `$${backtest.total_return_pct?.toFixed(2)}`, color: 'text-green-500' },
            { label: "Total Executions", value: trades.length, color: 'text-white' },
            { label: "Success Rate", value: `${backtest.win_rate_pct?.toFixed(1)}%`, color: 'text-yellow-500' },
            { label: "Drawdown", value: `${backtest.max_drawdown_pct?.toFixed(2)}%`, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trades Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              {['#', 'Direction', 'Entry Execute', 'Exit Execute', 'P&L (USD)', 'Duration'].map((h, i) => (
                <th key={i} className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {trades.length > 0 ? trades.map((trade, i) => (
              <tr key={trade.id || i} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5 text-sm font-bold text-gray-500">
                  <span className="opacity-40">{String(i + 1).padStart(3, '0')}</span>
                </td>
                <td className="px-6 py-5">
                  <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.direction === 'long' ? <FiTrendingUp /> : <FiTrendingDown />}
                    {trade.direction}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-gray-300">{new Date(trade.entry_time).toLocaleDateString()}</div>
                  <div className="text-[10px] text-gray-600 font-bold">{new Date(trade.entry_time).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-gray-300">{new Date(trade.exit_time).toLocaleDateString()}</div>
                  <div className="text-[10px] text-gray-600 font-bold">{new Date(trade.exit_time).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-sm font-black ${trade.pnl_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnl_usd >= 0 ? '+' : ''}${Math.abs(trade.pnl_usd).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <FiClock size={12} />
                    {trade.duration_hours?.toFixed(1)}h
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <FiActivity size={40} className="mx-auto mb-4 text-white/5" />
                  <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No execution data found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default BacktestTrades;
