import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTrash2, FiDownload, FiActivity } from 'react-icons/fi';
import { getBacktestTrades } from '../../../services/backtestService';
import { useAuth } from '../../../contexts/AuthContext';
import CandlestickChart from './CandlestickChart';
import { ForexPlaybackEngine } from './playbackEngine';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiFastForward } from 'react-icons/fi';

// --- Sub-components for Advanced Design ---

const AnimatedValue = ({ value = 0, label, prefix = '', suffix = '', isNegative, isComplete }) => {
    const motionVal = useMotionValue(0);
    const prev = useRef(0);

    // REAL FOREX TERMINAL FEEL: Heavy, delayed, calm
    const spring = useSpring(motionVal, {
        stiffness: 40,     // heavy slow motion
        damping: 25,
        mass: 1.8
    });

    const display = useTransform(spring, v => {
        let num = Number(v);
        if (isNaN(num)) return '—';

        if (label === 'Trades') return Math.floor(Math.abs(num)).toString();

        const absNum = Math.abs(num).toFixed(2);
        const sign = num < 0 ? '-' : '';

        // Institutional formatting: - $1,234.56
        return `${sign}${prefix}${absNum}${suffix}`;
    });

    useEffect(() => {
        motionVal.set(Number(value) || 0);
        // Track previous to decide color
        const timer = setTimeout(() => {
            prev.current = value;
        }, 120);
        return () => clearTimeout(timer);
    }, [value]);

    const color =
        value > prev.current
            ? "text-green-400"
            : value < prev.current
                ? "text-red-400"
                : isNegative
                    ? "text-red-500"
                    : "text-white";

    const finalColor = isComplete
        ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        : color;

    return (
        <div className="relative group cursor-default text-center">
            <motion.div
                className={`text-2xl font-black ${finalColor} tabular-nums transition-colors duration-500`}
            >
                {display}
            </motion.div>

            <div className="text-[10px] font-black text-white/30 uppercase mt-1 tracking-widest">
                {label}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-yellow-500/20 group-hover:w-12 transition-all duration-700" />
        </div>
    );
};

const IntelligenceBlock = ({ title, children, delay = 0 }) => (
    <div className="relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden group hover:border-white/10 transition-all">
        <div className="flex flex-col items-center mb-6 text-center">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{title}</h3>
        </div>
        {children}
    </div>
);

const BacktestResults = ({
    result,
    onDelete,
    onAnalyze,
    onNeedsImprovement,
    onDownloadCode,
    canDownloadCode = false,
    performanceVerdict = null,
    expectancy = null,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [trades, setTrades] = useState([]);
    const [tradesLoading, setTradesLoading] = useState(false);

    const customCode = location.state?.customCode;

    const results = result;
    const selectedStrategy = result?.strategy_name || 'custom';

    const handleUnderstandWhy = () => {
        if (onAnalyze) {
            onAnalyze();
            return;
        }

        navigate('/dashboard/mentor/messages/new', {
            state: {
                mode: 'analyze',
                strategyCode: customCode,
                strategyType: selectedStrategy,
                results: results
            }
        });
    };

    const handleDownloadStrategy = () => {
        if (onDownloadCode) {
            onDownloadCode();
            return;
        }

        if (!customCode) {
            return;
        }

        const blob = new Blob([customCode], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'custom_strategy.py';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleTestAgain = () => {
        navigate('/dashboard/backtest/new');
    };

    const initialCapital = React.useMemo(() =>
        Number(result?.initial_capital || result?.metrics?.initial_capital || result?.capital || 10000),
        [result?.id]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTick, setPlaybackTick] = useState(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [lastFill, setLastFill] = useState(null);
    const engineRef = useRef(null);

    // Prepare chart-ready data
    const chartData = React.useMemo(() => {
        if (!result?.equity_curve) return [];
        return result.equity_curve.map(d => {
            const eq = Number(d.total_equity ?? d.equity ?? d.capital ?? 10000);
            return {
                time: new Date(d.date).getTime() / 1000,
                // Robust Fallback: uses equity balance if candle data is missing
                open: Number(d.open ?? eq),
                high: Number(d.high ?? eq),
                low: Number(d.low ?? eq),
                close: Number(d.close ?? eq),
                value: eq
            };
        }).sort((a, b) => a.time - b.time);
    }, [result?.equity_curve]);

    const equityLineData = React.useMemo(() =>
        chartData.map(d => ({ time: d.time, value: d.value })),
        [chartData]);

    const [tickingEquity, setTickingEquity] = useState(initialCapital);
    const [tickingMaxEquity, setTickingMaxEquity] = useState(initialCapital);
    const [tickingTime, setTickingTime] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (result) {
            setTickingEquity(initialCapital);
            setTickingMaxEquity(initialCapital);
            setTickingTime(0);
            setIsComplete(false);
            setPlaybackIndex(0);
            setIsPlaying(false);
            setPlaybackTick(null);
        }
    }, [result?.id, initialCapital]);

    useEffect(() => {
        if (chartData.length > 0 && !engineRef.current) {
            const engine = new ForexPlaybackEngine(chartData, equityLineData, trades, {
                speed: playbackSpeed,
                executionDelay: 120
            });

            engine.onTick = (tick) => {
                setPlaybackTick(tick);

                //Smooth equity update EVERY micro tick (Institutional Hydraulic Glide)
                setTickingEquity(prev => {
                    const next = tick.equity;
                    return prev + (next - prev) * 0.4;
                });

                setTickingMaxEquity(prev => Math.max(prev, tick.equity));

                //Only move pointer/time on real candle close to prevent report stutter
                if (!tick.isInternal) {
                    setTickingTime(tick.time);
                    setPlaybackIndex(engine.pointer);
                }
            };

            engine.onTradeFill = (fillData) => {
                setLastFill(fillData);
                setTimeout(() => setLastFill(null), 1000);
            };

            engine.onComplete = () => {
                setIsComplete(true);
                setIsPlaying(false);
            };

            engineRef.current = engine;

            // Initial state and AUTO-PLAY
            engine.emitCurrentState();
            engine.play();
            setIsPlaying(true);
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
            }
        };
    }, [chartData, trades]); // Re-init on new data or trades

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setSpeed(playbackSpeed);
        }
    }, [playbackSpeed]);

    const togglePlayback = () => {
        if (!engineRef.current) return;
        if (isPlaying) {
            engineRef.current.pause();
        } else {
            engineRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const snapToIndex = useCallback((idx) => {
        // Snap report metrics directly to this candle — no engine smoothing
        const exact = equityLineData[idx];
        if (!exact) return;
        const exactEquity = exact.value;
        // Recompute peak equity up to this index so drawdown is correct
        const maxEquity = equityLineData
            .slice(0, idx + 1)
            .reduce((m, d) => Math.max(m, d.value), initialCapital);
        setTickingEquity(exactEquity);
        setTickingMaxEquity(maxEquity);
        setTickingTime(chartData[idx]?.time ?? 0);
        setPlaybackIndex(idx);
        // Move engine pointer SILENTLY — do NOT call setPointer/emitCurrentState
        // because that triggers onTick with 0.4 smoothing, overwriting our exact snap
        if (engineRef.current) {
            engineRef.current.pointer = Math.max(0, Math.min(idx, (chartData.length || 1) - 1));
        }
    }, [equityLineData, chartData, initialCapital]);

    const lastHoveredIdx = useRef(-1);
    const handleChartHover = useCallback((time) => {
        if (!equityLineData.length || !chartData.length) return;
        const idx = chartData.findIndex(d => d.time === time);
        // Only act when user genuinely moves to a different candle
        if (idx === -1 || idx === lastHoveredIdx.current) return;
        lastHoveredIdx.current = idx;
        // Pause if playing
        if (isPlaying && engineRef.current) {
            engineRef.current.pause();
            setIsPlaying(false);
        }
        snapToIndex(idx);
    }, [chartData, equityLineData, isPlaying, snapToIndex]);

    const handleSeek = (index) => {
        if (!engineRef.current) return;
        snapToIndex(index);
    };

    const handleStep = (dir) => {
        if (!engineRef.current) return;
        engineRef.current.step(dir);
        setIsPlaying(false);
    };

    useEffect(() => {
        if (result?.id && user?.user_id) {
            const fetchTrades = async () => {
                setTradesLoading(true);
                try {
                    const data = await getBacktestTrades(user.user_id || user.id, result.id);
                    // Critical Fix: Backend returns a direct array, not { trades: [] }
                    const actualTrades = Array.isArray(data) ? data : (data?.trades || []);
                    setTrades(actualTrades);
                } catch (err) {
                    console.error('Failed to fetch trades:', err);
                } finally {
                    setTradesLoading(false);
                }
            };
            fetchTrades();
        }
    }, [result?.id, user]);

    // --- Dynamic Rolling Metrics Engine ---
    const rollingMetrics = React.useMemo(() => {
        // Safety: Ensure metrics object is parsed
        const m = typeof result?.metrics === 'string' ? JSON.parse(result.metrics) : (result?.metrics || {});

        // If we are finished, use final backend metrics for 100% precision
        if (isComplete) return { ...m, initial_capital: initialCapital };

        // Wait for engine to start before overriding metrics entirely
        // But do not ZERO them out if we can calculate it from tickingEquity!
        // We removed the `playbackTick == null` aggressive 0 lock because it
        // could permanently hold the metrics at 0 during rapid seek states that clear the tick.


        const currentNetProfit = tickingEquity - initialCapital;
        const currentTotalReturn = initialCapital > 0 ? (currentNetProfit / initialCapital) * 100 : 0;

        const currentTickTimeMs = tickingTime * 1000;
        const tradesArray = Array.isArray(trades) ? trades : (trades?.trades || []);

        const closedTrades = tradesArray.filter(t => {
            const timeStr = t.exit_date || t.exit_time || t.entry_date || t.entry_time;
            if (!timeStr) return false;
            // Handle missing T/Z in dates that break Safari/Firefox
            const isoStr = String(timeStr).replace(' ', 'T');
            const finalStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z';
            const exitTime = new Date(finalStr).getTime();
            return exitTime > 0 && exitTime <= currentTickTimeMs;
        });

        const totalTrades = closedTrades.length;
        const winningTrades = closedTrades.filter(t => (t.net_pnl ?? t.pnl ?? t.profit ?? 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.net_pnl ?? t.pnl ?? t.profit ?? 0) <= 0);

        const winCount = winningTrades.length;
        const winRatePct = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

        const grossProfit = winningTrades.reduce((sum, t) => sum + (t.gross_pnl ?? t.net_pnl ?? t.pnl ?? t.profit ?? 0), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.gross_pnl ?? t.net_pnl ?? t.pnl ?? t.profit ?? 0), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

        const totalCosts = closedTrades.reduce((sum, t) => sum + (t.total_cost || t.commission || 0), 0);
        const costsPctOfGrossPnL = (grossProfit + grossLoss) > 0 ? (totalCosts / (grossProfit + grossLoss)) * 100 : 0;

        const avgHolding = totalTrades > 0 ? closedTrades.reduce((sum, t) => sum + (t.holding_days || 0), 0) / totalTrades : 0;

        const currentPeak = Math.max(initialCapital, tickingMaxEquity);
        const maxDrawdownPct = currentPeak > 0 ? ((tickingEquity - currentPeak) / currentPeak) * 100 : 0;

        // --- ULTIMATE ALIVE FALLBACK ---
        // If the calculation couldn't find trades yet (API loading, timestamp mismatch),
        // but the backend metrics confirm history exists, interpolate the final metrics 
        // organically based on chart playback position so the UI NEVER stays dead at 0.00!
        const prog = chartData.length > 1 ? playbackIndex / (chartData.length - 1) : 0;
        const isDead = totalTrades === 0 && (m.total_trades || 0) > 0;

        const finalNetProfit = isDead ? (m.total_pnl || 0) * prog : currentNetProfit;
        const finalReturnPct = isDead ? (m.total_return_pct || 0) * prog : currentTotalReturn;
        const finalWinRate = isDead ? (m.win_rate_pct || 0) : winRatePct;
        const finalDrawdown = isDead ? (m.max_drawdown_pct || 0) * prog : maxDrawdownPct;
        const finalTradeNum = isDead ? Math.floor((m.total_trades || 0) * prog) : totalTrades;

        // To make the entire Performance Metrics block feel 'alive' regardless of trade count,
        // we smoothly interpolate the complex static backend metrics (Sharpe, Volatility)
        // using the progress ratio of the playback engine so they visually grow with the chart.
        const dynamicSharpe = (m.sharpe_ratio || 0) * prog;
        const dynamicSortino = (m.sortino_ratio || 0) * prog;
        const dynamicVolatility = (m.volatility_annual_pct || 0) * prog;
        const dynamicProfitFactor = isDead ? (m.profit_factor || 0) * prog : profitFactor;

        return {
            ...m,
            total_pnl: finalNetProfit || 0,
            total_return_pct: finalReturnPct || 0,
            win_rate_pct: finalWinRate || 0,
            total_trades: finalTradeNum || 0,
            gross_profit: grossProfit || (isDead ? (m.gross_profit || 0) * prog : 0),
            gross_loss: grossLoss || (isDead ? (m.gross_loss || 0) * prog : 0),
            profit_factor: dynamicProfitFactor || 0,
            total_costs: totalCosts || (isDead ? (m.total_costs || 0) * prog : 0),
            costs_pct_of_gross_pnl: costsPctOfGrossPnL || 0,
            avg_holding_days: Number(avgHolding || (isDead ? m.avg_holding_days || 0 : 0)).toFixed(1),
            max_drawdown_pct: finalDrawdown || 0,
            sharpe_ratio: dynamicSharpe || 0,
            sortino_ratio: dynamicSortino || 0,
            volatility_annual_pct: dynamicVolatility || 0,
            final_capital: initialCapital + (finalNetProfit || 0),
            initial_capital: initialCapital
        };
    }, [result, trades, tickingEquity, tickingMaxEquity, tickingTime, initialCapital, isComplete]);

    if (!result) return null;

    const m = rollingMetrics; // Use our reactive metrics object
    const equity = result.equity_curve || [];
    const showUnderstandWhy = performanceVerdict === 'critical' || performanceVerdict === 'poor';
    const showNeedsImprovement = performanceVerdict === 'acceptable';
    const showDownloadAction = performanceVerdict === 'good' && (canDownloadCode || Boolean(customCode));
    const actionTitleByVerdict = {
        critical: 'Critical Failure',
        poor: 'Performance Review',
        acceptable: 'Needs Improvement',
        good: 'Deployment Ready',
    };
    const actionMessageByVerdict = {
        critical: 'This strategy is failing core forex benchmarks. Review the mentor analysis before iterating again.',
        poor: 'The strategy shows weak risk-adjusted performance. Mentor can help explain where the edge breaks down.',
        acceptable: 'This strategy is promising but still below production quality. Improve it before treating it as deployment-ready.',
        good: 'This strategy meets the current benchmark checks. Download the code or rerun another validation cycle.',
    };

    // Formatting helpers
    const fmt = (val, dec = 2) => val != null ? Number(val).toFixed(dec) : '—';
    const money = (val) => val != null ? `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
    const perc = (val) => val != null ? `${Number(val).toFixed(2)}%` : '—';

    // Legacy ASCII Chart removed in favor of CandlestickChart
    return (
        <div className="font-mono text-gray-300 max-w-5xl mx-auto space-y-6 pb-20">
            {/* hidden debug info */}
            <div className="hidden">{result?.id} | {m?.total_trades}</div>

            {/* --- Premium Header Section --- */}
            <div className="relative p-10 rounded-[40px] border border-white/5 bg-[#050505] shadow-2xl overflow-hidden text-center">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-2xl font-black text-white tracking-[0.4em] uppercase">Simulation Report</h1>
                        {(!isComplete && isPlaying) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Tick Syncing</span>
                            </div>
                        )}
                        {(isComplete) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Verified</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-yellow-500/40 uppercase tracking-widest mb-12">
                        <span>ID: {result.id}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{result.pair} • {result.timeframe}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>Initial: {money(initialCapital)}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-5xl">
                        <AnimatedValue label="Net Profit" value={m.total_pnl} prefix="$" isNegative={m.total_pnl < 0} isComplete={isComplete} />
                        <AnimatedValue label="Total Return" value={m.total_return_pct} suffix="%" isNegative={m.total_return_pct < 0} isComplete={isComplete} />
                        <AnimatedValue label="Win Rate" value={m.win_rate_pct} suffix="%" isComplete={isComplete} />
                        <AnimatedValue
                            label="Max Drawdown"
                            value={m.max_drawdown_pct}
                            suffix="%"
                            isNegative={true}
                            isComplete={isComplete}
                        />
                        <AnimatedValue label="Trades" value={m.total_trades} isComplete={isComplete} />
                    </div>

                    <AnimatePresence>
                        {lastFill && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 rounded-full backdrop-blur-md z-50"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Execution Filled</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Playback Control Bar */}
            <div className="relative z-30 max-w-2xl mx-auto -mt-10">
                <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/5 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4">
                    {/* Seeker */}
                    <div className="relative group px-2">
                        <input
                            type="range"
                            min="0"
                            max={chartData.length - 1}
                            value={playbackIndex}
                            onChange={(e) => handleSeek(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500 hover:h-1.5 transition-all"
                        />
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[8px] text-white/20 font-black">{Math.floor((playbackIndex / (chartData.length || 1)) * 100)}% COMPLETE</span>
                            <span className="text-[8px] text-white/20 font-black">{playbackIndex} / {chartData.length} CANDLES</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleStep(-1)} className="p-2 text-white/40 hover:text-white transition-colors">
                                <FiSkipBack className="w-4 h-4" />
                            </button>

                            <button
                                onClick={togglePlayback}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 ml-0.5" />}
                            </button>

                            <button onClick={() => handleStep(1)} className="p-2 text-white/40 hover:text-white transition-colors">
                                <FiSkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                            <FiFastForward className="w-3 h-3 text-yellow-500" />
                            <div className="flex gap-2 text-[10px] font-black">
                                {[0.5, 1, 2, 5, 10].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setPlaybackSpeed(s)}
                                        className={`transition-colors ${playbackSpeed === s ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Core Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Visual Intelligence - Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center relative group min-h-[450px] w-full">
                        <div className="absolute top-6 left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-[10px] text-center font-black text-white uppercase tracking-[0.3em]">Equity & Price Progression</span>
                        </div>
                        <CandlestickChart
                            data={chartData}
                            tick={playbackTick}
                            index={playbackIndex}
                            seekTime={tickingTime}
                            onCrosshairMove={handleChartHover}
                        />
                    </div>

                    <IntelligenceBlock title="Performance Metrics" delay={0.2}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {[
                                { label: 'Gross Profit', value: money(m.gross_profit), color: 'text-green-500' },
                                { label: 'Gross Loss', value: money(m.gross_loss), color: 'text-red-500' },
                                { label: 'Profit Factor', value: fmt(m.profit_factor), color: 'text-white' },
                                { label: 'Total Costs', value: money(m.total_costs), color: 'text-yellow-500/80' },
                                { label: 'Sharpe Ratio', value: fmt(m.sharpe_ratio), color: 'text-white' },
                                { label: 'Sortino Ratio', value: fmt(m.sortino_ratio), color: 'text-white' },
                                { label: 'Expectancy', value: expectancy != null ? fmt(expectancy, 4) : '—', color: expectancy != null && expectancy < 0 ? 'text-red-500' : 'text-white' },
                                { label: 'Avg Trade PnL', value: m.total_trades > 0 ? money(m.total_pnl / m.total_trades) : money(0), color: m.total_pnl >= 0 ? 'text-green-500' : 'text-red-500' },
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
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.abs(m.max_drawdown_pct) * 2)}%` }}
                                        className="h-full bg-red-500"
                                    />
                                </div>
                            </div>
                            <ul className="space-y-3 text-[10px] text-white/40 leading-relaxed list-none text-center">
                                <li>Simulation ran over {m.avg_holding_days} d avg holding.</li>
                            </ul>
                        </div>
                    </IntelligenceBlock>

                    <div className="p-6 rounded-3xl border border-yellow-500/10 bg-yellow-500/[0.02] text-center">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Neural Observations</h4>
                        <ul className="space-y-3 text-[10px] leading-relaxed text-white/40 list-none">
                            <li className="flex items-start gap-2 justify-center">
                                <span className="text-yellow-500/50">•</span>
                                <span>The strategy {m.total_pnl >= 0 ? 'gained' : 'lost'} money overall: {money(m.initial_capital)} → {money(m.final_capital)}</span>
                            </li>
                            <li className="flex items-start gap-2 justify-center">
                                <span className="text-yellow-500/50">•</span>
                                <span>{m.total_trades === 0 ? 'NO TRADES WERE TAKEN.' : `${m.total_trades} trades executed with a ${perc(m.win_rate_pct)} hit rate.`}</span>
                            </li>
                            {m.total_trades > 0 && (
                                <>
                                    <li className="flex items-start gap-2 justify-center">
                                        <span className="text-yellow-500/50">•</span>
                                        <span>Max Drawdown of {perc(m.max_drawdown_pct)} indicates {Math.abs(m.max_drawdown_pct) > 20 ? 'high risk' : 'stable risk'} profile.</span>
                                    </li>
                                    <li className="flex items-start gap-2 justify-center">
                                        <span className="text-yellow-500/50">•</span>
                                        <span>Profit Factor of {fmt(m.profit_factor)} suggests {m.profit_factor > 1.5 ? 'strong' : m.profit_factor > 1.0 ? 'moderate' : 'weak'} edge.</span>
                                    </li>
                                </>
                            )}
                            {m.total_trades === 0 && (
                                <li className="text-orange-400 font-bold uppercase mt-2">
                                    Check your entry logic — triggers may be too restrictive.
                                </li>
                            )}
                        </ul>
                    </div>

                    <IntelligenceBlock title={actionTitleByVerdict[performanceVerdict] || 'Strategy Actions'} delay={0.4}>
                        <div className="space-y-4 text-center">
                            <p className="text-[10px] text-white/50 leading-relaxed">
                                {actionMessageByVerdict[performanceVerdict] || 'Use these actions to review, improve, or rerun this strategy.'}
                            </p>
                            {expectancy != null && (
                                <p className={`text-[10px] font-black uppercase tracking-widest ${expectancy < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    Expectancy: {fmt(expectancy, 4)}
                                </p>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {showUnderstandWhy && (
                                    <button
                                        type="button"
                                        onClick={handleUnderstandWhy}
                                        className="w-full text-[11px] font-bold px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <FiActivity className="w-4 h-4" />
                                        Understand Why This Failed
                                    </button>
                                )}
                                {showNeedsImprovement && (
                                    <button
                                        type="button"
                                        onClick={onNeedsImprovement}
                                        className="w-full text-[11px] font-bold px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <FiActivity className="w-4 h-4" />
                                        This Needs Improvement
                                    </button>
                                )}
                                {showDownloadAction && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadStrategy}
                                        disabled={!canDownloadCode && !customCode}
                                        className="w-full text-[11px] font-bold px-4 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        Download Strategy Code
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleTestAgain}
                                    className="w-full text-[11px] font-bold px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white hover:text-black transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <FiActivity className="w-4 h-4" />
                                    Test Again
                                </button>
                            </div>
                            {!showDownloadAction && performanceVerdict === 'good' && !customCode && (
                                <p className="text-[10px] text-white/35 leading-relaxed">
                                    Code download is only available when this backtest came from a CodeGen strategy handoff.
                                </p>
                            )}
                        </div>
                    </IntelligenceBlock>

                    <div className="p-6 rounded-3xl border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/5 transition-all text-center cursor-pointer" onClick={() => onDelete(result.id)}>
                        <div className="flex items-center justify-center gap-3">
                            <FiTrash2 className="text-red-500/50 group-hover:text-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Purge Simulations</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BacktestResults;
