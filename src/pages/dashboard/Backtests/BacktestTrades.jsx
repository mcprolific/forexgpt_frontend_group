import React, { useState } from 'react';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BacktestTrades = () => {
  const [trades, setTrades] = useState([]);
  const [strategy, setStrategy] = useState({
    name: '',
    type: 'trend_following',
    pair: 'EUR/USD',
    timeframe: '1H',
    stopLoss: 20,
    takeProfit: 50,
  });
  const [running, setRunning] = useState(false);

  const runBacktest = () => {
    if (!strategy.name) return alert("Please enter a strategy name");
    setRunning(true);

    setTimeout(() => {
      const mockTrades = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        trade_number: i + 1,
        direction: Math.random() > 0.5 ? 'long' : 'short',
        entry_time: new Date(2024, 2, i + 1).toISOString(),
        exit_time: new Date(2024, 2, i + 1, i + 2).toISOString(),
        lot_size: (Math.random() * 1).toFixed(2),
        pnl_pips: Math.floor(Math.random() * 20 - 10),
        pnl_usd: parseFloat((Math.random() * 200 - 100).toFixed(2)),
        duration_hours: Math.floor(Math.random() * 24),
      }));
      setTrades(mockTrades);
      setRunning(false);
    }, 1000);
  };

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl_usd, 0);
  const winningTrades = trades.filter(t => t.pnl_usd > 0).length;
  const losingTrades = trades.filter(t => t.pnl_usd < 0).length;

  return (
    <div className="min-h-screen bg-black p-6 text-white space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/backtests" className="p-2 hover:bg-gray-800 rounded-lg transition">
          <FiArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold">Backtest Engine</h1>
        <div></div>
      </div>

      {/* Strategy Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-yellow-400">Enter Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Strategy Name"
            value={strategy.name}
            onChange={e => setStrategy({...strategy, name: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          />
          <select
            value={strategy.type}
            onChange={e => setStrategy({...strategy, type: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          >
            <option value="trend_following">Trend Following</option>
            <option value="mean_reversion">Mean Reversion</option>
            <option value="breakout">Breakout</option>
          </select>
          <select
            value={strategy.pair}
            onChange={e => setStrategy({...strategy, pair: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          >
            <option>EUR/USD</option>
            <option>USD/JPY</option>
            <option>GBP/USD</option>
          </select>
          <select
            value={strategy.timeframe}
            onChange={e => setStrategy({...strategy, timeframe: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          >
            <option>1H</option>
            <option>4H</option>
            <option>1D</option>
          </select>
          <input
            type="number"
            placeholder="Stop Loss (pips)"
            value={strategy.stopLoss}
            onChange={e => setStrategy({...strategy, stopLoss: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            placeholder="Take Profit (pips)"
            value={strategy.takeProfit}
            onChange={e => setStrategy({...strategy, takeProfit: e.target.value})}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <button
          onClick={runBacktest}
          disabled={running}
          className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-white hover:text-black transition"
        >
          {running ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {/* Stats */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnL.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-2xl font-bold text-white">{trades.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Winning Trades</p>
            <p className="text-2xl font-bold text-green-400">{winningTrades}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Losing Trades</p>
            <p className="text-2xl font-bold text-red-400">{losingTrades}</p>
          </div>
        </div>
      )}

      {/* Trades Table */}
      {trades.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-black">
              <tr>
                {['#','Direction','Entry','Exit','Lot','Pips','P&L ($)','Duration'].map((label, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {trades.map(trade => (
                <tr key={trade.id} className="hover:bg-gray-800 transition">
                  <td className="px-6 py-4 text-sm text-white font-medium">#{trade.trade_number}</td>
                  <td className={`px-6 py-4 flex items-center space-x-1 ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.direction === 'long' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                    <span className="capitalize">{trade.direction}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(trade.entry_time).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(trade.exit_time).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{trade.lot_size}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${trade.pnl_pips >=0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl_pips >=0 ? '+' : ''}{trade.pnl_pips}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${trade.pnl_usd >=0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.pnl_usd.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{trade.duration_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default BacktestTrades;