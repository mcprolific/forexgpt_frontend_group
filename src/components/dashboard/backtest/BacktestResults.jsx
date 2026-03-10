import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { getBacktestTrades } from '../../../services/backtestService';
import { useAuth } from '../../../contexts/AuthContext';
import CandlestickChart from './CandlestickChart';

// --- Sub-components for Advanced Design ---

const AnimatedValue = ({ value, label, prefix = '', suffix = '', isNegative = false }) => (
    <div className="relative group cursor-default">
        <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-black ${isNegative ? 'text-red-500' : 'text-white'} tracking-tighter`}
        >
            {prefix}{value}{suffix}
        </Motion.div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1 group-hover:text-yellow-500/50 transition-colors">
            {label}
        </div>
        <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-yellow-500/30 group-hover:w-full transition-all duration-500" />
    </div>
);

const IntelligenceBlock = ({ title, children, delay = 0 }) => (
    <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden group hover:border-white/10 transition-all"
    >
        <div className="flex flex-col items-center mb-6 text-center">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{title}</h3>
        </div>
        {children}
    </Motion.div>
);

const BacktestResults = ({ result, onDelete }) => {
    const { user } = useAuth();
    const [trades, setTrades] = useState([]);
    const [tradesLoading, setTradesLoading] = useState(false);

    useEffect(() => {
        if (result?.id && user?.user_id) {
            const fetchTrades = async () => {
                setTradesLoading(true);
                try {
                    const data = await getBacktestTrades(user.user_id || user.id, result.id);
                    setTrades(data);
                } catch (err) {
                    console.error('Failed to fetch trades:', err);
                } finally {
                    setTradesLoading(false);
                }
            };
            fetchTrades();
        }
    }, [result?.id, user]);

    if (!result) return null;

    const m = result.metrics || {};
    const equity = result.equity_curve || [];

    // Formatting helpers
    const fmt = (val, dec = 2) => val != null ? Number(val).toFixed(dec) : '—';
    const money = (val) => val != null ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
    const perc = (val) => val != null ? `${Number(val).toFixed(2)}%` : '—';

    // Legacy ASCII Chart removed in favor of CandlestickChart

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-gray-300 max-w-5xl mx-auto space-y-6 pb-20"
        >
            {/* --- Premium Header Section --- */}
            <div className="relative p-10 rounded-[40px] border border-white/5 bg-[#050505] shadow-2xl overflow-hidden text-center">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />

                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-2xl font-black text-white tracking-[0.4em] uppercase mb-2">Simulation Report</h1>
                    <div className="flex items-center gap-4 text-[10px] font-black text-yellow-500/40 uppercase tracking-widest mb-12">
                        <span>ID: {result.id}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{result.pair} • {result.timeframe}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-3xl">
                        <AnimatedValue label="Net Profit" value={money(m.final_capital - m.initial_capital)} prefix="" isNegative={m.final_capital < m.initial_capital} />
                        <AnimatedValue label="Total Return" value={fmt(m.total_return_pct)} suffix="%" isNegative={m.total_return_pct < 0} />
                        <AnimatedValue label="Win Rate" value={fmt(m.win_rate_pct)} suffix="%" />
                        <AnimatedValue label="Max Drawdown" value={fmt(m.max_drawdown_pct)} suffix="%" isNegative={true} />
                    </div>
                </div>
            </div>

            {/* --- Core Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Visual Intelligence - Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-[40px] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center relative group min-h-[450px] w-full"
                    >
                        <div className="absolute top-6 left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-[10px] text-center font-black text-white uppercase tracking-[0.3em]">Equity & Price Progression</span>
                        </div>
                        <CandlestickChart data={equity} />
                    </Motion.div>

                    <IntelligenceBlock title="Performance Metrics" delay={0.2}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {[
                                { label: 'Gross Profit', value: money(m.gross_profit), color: 'text-green-500' },
                                { label: 'Gross Loss', value: money(m.gross_loss), color: 'text-red-500' },
                                { label: 'Profit Factor', value: fmt(m.profit_factor), color: 'text-white' },
                                { label: 'Total Costs', value: money(m.total_costs), color: 'text-yellow-500/80' },
                                { label: 'Sharpe Ratio', value: fmt(m.sharpe_ratio), color: 'text-white' },
                                { label: 'Sortino Ratio', value: fmt(m.sortino_ratio), color: 'text-white' },
                                { label: 'Avg Trade PnL', value: money(m.total_pnl / m.total_trades), color: m.total_pnl >= 0 ? 'text-green-500' : 'text-red-500' },
                                { label: 'Vol (Annual)', value: perc(m.volatility_annual_pct), color: 'text-white' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-1 hover:border-white/10 transition-colors">
                                    <span className="text-[10px] text-white/30 uppercase font-black">{item.label}</span>
                                    <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </IntelligenceBlock>
                </div>

                {/* Meta Intelligence - Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <IntelligenceBlock title="Asset Context" delay={0.1}>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <span className="text-[9px] text-white/20 block mb-1 uppercase font-black">Strategy</span>
                                <span className="text-xs font-black text-white block">{result.strategy_name?.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <span className="text-[9px] text-white/20 block mb-1 uppercase font-black text-center">Configuration</span>
                                <div className="text-[10px] space-y-1">
                                    <div className="flex justify-between"><span>Pair</span><span className="text-white">{result.pair}</span></div>
                                    <div className="flex justify-between"><span>Interval</span><span className="text-white">{result.timeframe}</span></div>
                                    <div className="flex justify-between"><span>Capital</span><span className="text-white">{money(m.initial_capital)}</span></div>
                                </div>
                            </div>
                        </div>
                    </IntelligenceBlock>

                    <IntelligenceBlock title="Risk Assessment" delay={0.3}>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] mb-2">
                                    <span className="text-white/30 uppercase font-black">Max Drawdown</span>
                                    <span className="text-red-500 font-black">{perc(m.max_drawdown_pct)}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <Motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.abs(m.max_drawdown_pct) * 2)}%` }}
                                        className="h-full bg-red-500"
                                    />
                                </div>
                            </div>
                            <ul className="space-y-3 text-[10px] text-white/40 leading-relaxed list-none text-center">
                                <li>Simulation ran over {m.avg_holding_days} d avg holding.</li>
                                <li>{m.costs_pct_of_gross_pnl > 10 ? 'High cost impact detected.' : 'Transaction costs within normal ranges.'}</li>
                            </ul>
                        </div>
                    </IntelligenceBlock>

                    <div className="p-6 rounded-3xl border border-yellow-500/10 bg-yellow-500/[0.02] text-center">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Observations from this backtest</h4>
                        <ul className="space-y-3 text-[10px] leading-relaxed text-white/40 list-none">
                            <li>The strategy {m.total_pnl >= 0 ? 'gained' : 'lost'} money overall: {money(m.initial_capital)} → {money(m.final_capital)}</li>
                            <li>{m.total_trades === 1 ? 'Only 1 trade executed, indicating potential data scarcity.' : `${m.total_trades} trades executed across the period.`}</li>
                            <li>{m.sharpe_ratio < 0 ? 'Sharpe ratio is negative — poor risk-adjusted performance.' : m.sharpe_ratio > 1 ? 'Positive risk-adjusted returns observed.' : 'Sub-optimal Sharpe ratio indicates high volatility.'}</li>
                            <li>Costs accounted for {fmt(m.costs_pct_of_gross_pnl)}% of gross PnL.</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-3xl border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/5 transition-all text-center cursor-pointer" onClick={() => onDelete(result.id)}>
                        <div className="flex items-center justify-center gap-3">
                            <FiTrash2 className="text-red-500/50 group-hover:text-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Purge Simulations</span>
                        </div>
                    </div>
                </div>
            </div>
        </Motion.div>
    );
};

export default BacktestResults;
