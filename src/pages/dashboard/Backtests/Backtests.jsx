import React, { useState } from "react";
import { FiBarChart2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import PageHeader from "../../../components/dashboard/layout/PageHeader";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Mock initial backtests
const mockBacktests = [
  {
    id: 1,
    pair: "EUR/USD",
    start_date: "Jan 1, 2024",
    end_date: "Mar 1, 2024",
    status: "Completed",
    total_return_pct: 12.5,
    sharpe_ratio: 1.8,
    max_drawdown_pct: 5,
    win_rate_pct: 60,
  },
];

const Backtests = () => {
  const [selectedBacktest, setSelectedBacktest] = useState(null);
  const [trades, setTrades] = useState([]);
  const [running, setRunning] = useState(false);

  const [userStrategy, setUserStrategy] = useState({
    user_id: "e0b89393-0d59-4b55-af50-3bf9327d9efb",
    pair: "EURUSD",
    strategy_name: "rsi",
    start_date: "2022-01-01",
    end_date: "2023-06-30",
    strategy_id: null,
    timeframe: "1D",
    initial_capital: 10000,
    position_size_pct: 0.1,
  });

  const equityData = [
    { date: "Jan", equity: 10000 },
    { date: "Feb", equity: 10200 },
    { date: "Mar", equity: 10150 },
    { date: "Apr", equity: 10500 },
    { date: "May", equity: 10800 },
    { date: "Jun", equity: 10700 },
  ];

  // Convert timeframe to number of trades
  const timeframeToTrades = (tf) => {
    switch (tf) {
      case "1M": return 100;
      case "5M": return 80;
      case "15M": return 60;
      case "1H": return 40;
      case "4H": return 20;
      case "1D": return 10;
      default: return 10;
    }
  };

  const runBacktest = () => {
    setRunning(true);

    setTimeout(() => {
      const numTrades = timeframeToTrades(userStrategy.timeframe);
      const mockTrades = Array.from({ length: numTrades }).map((_, i) => ({
        id: i + 1,
        trade_number: i + 1,
        direction: Math.random() > 0.5 ? "long" : "short",
        entry_time: new Date(2022, 0, i + 1).toISOString(),
        exit_time: new Date(2022, 0, i + 1, 1).toISOString(),
        lot_size: (userStrategy.initial_capital * userStrategy.position_size_pct).toFixed(2),
        pnl_pips: Math.floor(Math.random() * 20 - 10),
        pnl_usd: parseFloat((Math.random() * 200 - 100).toFixed(2)),
        duration_hours: 1,
      }));

      setTrades(mockTrades);

      const totalReturn = mockTrades.reduce((sum, t) => sum + t.pnl_usd, 0);
      const winningTrades = mockTrades.filter(t => t.pnl_usd > 0).length;

      const newBacktest = {
        id: mockBacktests.length + 1,
        pair: userStrategy.pair,
        start_date: userStrategy.start_date,
        end_date: userStrategy.end_date,
        status: "Completed",
        total_return_pct: (totalReturn / userStrategy.initial_capital * 100).toFixed(2),
        sharpe_ratio: (Math.random() * 2).toFixed(2),
        max_drawdown_pct: Math.floor(Math.random() * 10),
        win_rate_pct: ((winningTrades / mockTrades.length) * 100).toFixed(0),
      };

      mockBacktests.push(newBacktest);
      setSelectedBacktest(newBacktest);
      setRunning(false);
    }, 1000);
  };

  return (
    <div className="bg-black text-white min-h-screen p-6 space-y-6">
      <PageHeader
        title="Backtest Engine"
        subtitle="Test your strategies against historical data"
        action={{
          label: "Run Backtest",
          onClick: runBacktest,
          icon: <FiBarChart2 className="text-yellow-400" />,
        }}
      />

      {/* STRATEGY INPUT */}
      <div className="bg-black border border-white rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-yellow-400">Your Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Strategy Name"
            value={userStrategy.strategy_name}
            onChange={e => setUserStrategy({ ...userStrategy, strategy_name: e.target.value })}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            placeholder="Currency Pair"
            value={userStrategy.pair}
            onChange={e => setUserStrategy({ ...userStrategy, pair: e.target.value })}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          />
          <select
            value={userStrategy.timeframe}
            onChange={e => setUserStrategy({ ...userStrategy, timeframe: e.target.value })}
            className="px-4 py-2 rounded-lg bg-black border border-white text-white focus:ring-2 focus:ring-yellow-400"
          >
            {["1M", "5M", "15M", "1H", "4H", "1D"].map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT BACKTESTS */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-yellow-400">Recent Backtests</h3>
          {mockBacktests.map(bt => (
            <div
              key={bt.id}
              onClick={() => setSelectedBacktest(bt)}
              className={`bg-black border border-white rounded-lg p-4 cursor-pointer hover:bg-white hover:text-black transition ${selectedBacktest?.id === bt.id ? "ring-2 ring-yellow-400" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-yellow-400">{bt.pair}</h4>
                  <p className="text-white text-sm">{bt.start_date} → {bt.end_date}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-400 text-black rounded-full">{bt.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* SELECTED BACKTEST DETAILS */}
        <div className="lg:col-span-2">
          {selectedBacktest ? (
            <div className="bg-black border border-white rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Metric label="Total Return (%)" value={selectedBacktest.total_return_pct} color={selectedBacktest.total_return_pct >= 0 ? "text-green-400" : "text-red-400"} />
                <Metric label="Sharpe Ratio" value={selectedBacktest.sharpe_ratio} color="text-yellow-400" />
                <Metric label="Max Drawdown (%)" value={selectedBacktest.max_drawdown_pct} color="text-red-400" />
                <Metric label="Win Rate (%)" value={selectedBacktest.win_rate_pct} color="text-yellow-400" />
              </div>

              <div className="h-64 bg-black border border-white rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <CartesianGrid stroke="#fff" />
                    <XAxis dataKey="date" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip />
                    <Area type="monotone" dataKey="equity" stroke="#eab308" fill="#eab30833" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-black border border-white rounded-lg p-12 text-center">
              <FiBarChart2 className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium text-yellow-400 mb-2">Select a backtest</h3>
              <p className="text-white text-sm">Choose a backtest to view detailed results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value, color }) => (
  <div className="bg-black border border-white rounded-lg p-3">
    <p className="text-white text-xs">{label}</p>
    <p className={`text-lg font-bold ${color || "text-yellow-400"}`}>{value}</p>
  </div>
);

export default Backtests;