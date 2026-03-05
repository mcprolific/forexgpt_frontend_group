import React, { useState } from 'react';
import { FiFilter, FiEye } from 'react-icons/fi';
import PageHeader from '../../../components/dashboard/layout/PageHeader';
import SignalCard from '../../../components/dashboard/cards/SignalCard';

const Signals = () => {
  // State for user strategy input
  const [strategy, setStrategy] = useState({
    user_id: "e0b89393-0d59-4b55-af50-3bf9327d9efb",
    pair: "EURUSD",
    strategy_name: "rsi",
    start_date: "2022-01-01",
    end_date: "2023-06-30",
    strategy_id: null,
    timeframe: "1d",
    initial_capital: 10000,
    strategy_params: { period: 14, oversold: 30, overbought: 70 },
    cost_preset: "forex_retail",
    position_size_pct: 0.1,
    data_source: "auto"
  });

  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('all');

  // Function to "extract signals" based on current strategy
  const extractSignals = () => {
    const mockSignals = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      pair: strategy.pair,
      strategy_name: strategy.strategy_name,
      timeframe: strategy.timeframe,
      direction: Math.random() > 0.5 ? 'buy' : 'sell',
      price: (1 + Math.random() * 0.01).toFixed(4),
      confidence: (0.5 + Math.random() * 0.5).toFixed(2),
      source: ['Central Bank', 'News', 'Earnings Call', 'Economic Report'][i % 4],
      timestamp: new Date(2023, i, i + 1).toISOString()
    }));
    setSignals(mockSignals);
  };

  return (
    <div className="space-y-6 bg-[#121212] text-white min-h-screen p-6">

      {/* PAGE HEADER */}
      <PageHeader 
        title="Trading Signals"
        subtitle="AI-extracted signals from your strategy"
        action={{
          label: "Extract Signals",
          onClick: extractSignals,
          icon: <FiEye />
        }}
      />

      {/* STRATEGY INPUT */}
      <div className="bg-[#121212] border border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-2">
          Strategy Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Strategy Name"
            value={strategy.strategy_name}
            onChange={(e) => setStrategy({...strategy, strategy_name: e.target.value})}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            placeholder="Currency Pair"
            value={strategy.pair}
            onChange={(e) => setStrategy({...strategy, pair: e.target.value})}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
          <select
            value={strategy.timeframe}
            onChange={(e) => setStrategy({...strategy, timeframe: e.target.value})}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          >
            <option value="1m">1M</option>
            <option value="5m">5M</option>
            <option value="15m">15M</option>
            <option value="1h">1H</option>
            <option value="4h">4H</option>
            <option value="1d">1D</option>
            <option value="1w">1W</option>
          </select>
          <input
          //   type="text"
          //   placeholder="RSI Period (14)"
          //   value={strategy.strategy_params.period}
          //  onChange={(e) => setStrategy({...strategy, timeframe: e.target.value})}(e.target.value)}})}
          //   className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          // />
          // <input
            type="text"
            placeholder="Oversold (30)"
            value={strategy.strategy_params.oversold}
            onChange={(e) => setStrategy({...strategy, strategy_params: {...strategy.strategy_params, oversold: Number(e.target.value)}})}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            placeholder="Overbought (70)"
            value={strategy.strategy_params.overbought}
            onChange={(e) => setStrategy({...strategy, strategy_params: {...strategy.strategy_params, overbought: Number(e.target.value)}})}
            className="px-4 py-2 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* SIGNALS LIST */}
      <div className="space-y-4">
        {signals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No signals yet. Click "Extract Signals" to generate.</p>
        ) : (
          signals
            .filter(signal => filter === 'all' || signal.source === filter)
            .map(signal => <SignalCard key={signal.id} signal={signal} view="list" />)
        )}
      </div>

      {/* FILTER */}
      <div className="flex justify-start items-center mt-6 space-x-2">
        <select
          className="px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="Central Bank">Central Bank</option>
          <option value="News">News</option>
          <option value="Earnings Call">Earnings Call</option>
          <option value="Economic Report">Economic Report</option>
        </select>
      </div>

    </div>
  );
};

export default Signals;