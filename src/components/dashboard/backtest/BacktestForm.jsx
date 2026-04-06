import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlay, FiAlertCircle, FiLoader, FiCode } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { runBacktest, runCustomBacktest } from '../../../services/backtestService';
import toast from 'react-hot-toast';
import { logError, normalizeError } from '../../../utils/errorHandling';

const GOLD = '#D4AF37';

/* ─── helpers ─────────────────────────────────────────────── */
const Label = ({ htmlFor, children }) => (
    <label
        htmlFor={htmlFor}
        className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"
    >
        {children}
    </label>
);

const inputCls =
    'w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white ' +
    'placeholder-gray-600 focus:border-yellow-500/60 focus:outline-none transition-colors';

const selectCls =
    'w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white ' +
    'focus:border-yellow-500/60 focus:outline-none transition-colors appearance-none';

/* ─── Component ───────────────────────────────────────────── */
const BacktestForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [customCode, setCustomCode] = useState('');
    const [showCodePreview, setShowCodePreview] = useState(false);
    const customStrategyName = location.state?.strategyName || 'Custom Strategy';
    const customStrategyType = location.state?.strategyType || 'custom';

    const [form, setForm] = useState({
        pair: 'EURUSD',
        strategy_name: 'sma',
        strategy_id: '',
        start_date: '2021-01-01',
        end_date: '2023-12-29',
        timeframe: '1D',
        initial_capital: 10000,
        // RSI (bollinger_bands value)
        period: 14,
        oversold: 30,
        overbought: 70,
        // MACD (rsi_divergence value)
        fast: 12,
        slow: 26,
        macd_signal: 9,
        // Bollinger Bands (moving_average_cross value)
        bb_period: 20,
        std_dev: 2.0,
        // Crossover (macro_arbitrage value)
        fast_period: 50,
        slow_period: 200,
        cost_preset: 'forex_retail',
        position_size_pct: 0.1,
        data_source: 'auto',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const selectedStrategy = form?.strategy_name || 'sma';
    const isCustomMode = selectedStrategy === 'custom';
    const setSelectedStrategy = (val) => set('strategy_name', val);

    useEffect(() => {
      if (location.state?.mode === 'custom' && location.state?.customCode) {
        setSelectedStrategy('custom');
        setCustomCode(location.state.customCode);
        setShowCodePreview(true);
      }
    }, [location.state, location.state?.mode, location.state?.customCode]);

    /* ── build payload ── */
    const payload = () => {
        let strategy_params = {};
        const { strategy_name } = form;

        if (strategy_name === 'rsi') {
            strategy_params = { period: Number(form.period), oversold: Number(form.oversold), overbought: Number(form.overbought) };
        } else if (strategy_name === 'macd') {
            strategy_params = { fast: Number(form.fast), slow: Number(form.slow), signal: Number(form.macd_signal) };
        } else if (strategy_name === 'bollinger') {
            strategy_params = { period: Number(form.bb_period), std_dev: Number(form.std_dev) };
        } else if (strategy_name === 'sma') {
            strategy_params = { fast_period: Number(form.fast_period), slow_period: Number(form.slow_period) };
        }

        return {
            user_id: user?.user_id || user?.id,
            pair: form.pair,
            strategy_name,
            strategy_id: form.strategy_id || null,
            start_date: form.start_date,
            end_date: form.end_date,
            timeframe: form.timeframe,
            initial_capital: Number(form.initial_capital),
            strategy_params,
            cost_preset: form.cost_preset,
            position_size_pct: Number(form.position_size_pct),
            data_source: form.data_source,
        };
    };

    /* ── submit ── */
    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);

        if (!user) { setError('You must be logged in.'); return; }
        if (new Date(form.start_date) >= new Date(form.end_date)) {
            setError('Start date must be before end date.'); return;
        }

        if (form.strategy_name === 'custom' && !customCode) {
            setError('Please load custom code before running backtest.'); return;
        }

        try {
            setLoading(true);
            const userId = user?.user_id || user?.id;
            let result;

            if (form.strategy_name === 'custom') {
                const customPayload = {
                    user_id: String(userId),
                    custom_code: customCode,
                    currency_pair: form.pair,
                    start_date: form.start_date,
                    end_date: form.end_date,
                    capital: Number(form.initial_capital),
                    position_size: Number(form.position_size_pct * form.initial_capital)
                };
                result = await runCustomBacktest(customPayload);
            } else {
                result = await runBacktest(userId, payload());
            }

            toast.success('Simulation complete!');
            navigate(`/dashboard/backtest/${result.id}`, {
                state: form.strategy_name === 'custom'
                    ? {
                        mode: 'custom',
                        customCode,
                        strategyName: customStrategyName,
                        strategyType: customStrategyType,
                        source: 'codegen',
                    }
                    : null,
            });
        } catch (err) {
            logError('Backtest error (raw):', err);
            const msg = normalizeError(err, {
                fallback: 'Backtest failed. Please check your inputs and try again.',
            });
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    /* ── render ── */
    return (
        <div className="max-w-3xl mx-auto py-6">

            {/* Header */}
            <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">
                    Neural Simulation Engine
                </p>
                <h1 className="text-3xl font-black text-white">
                    {isCustomMode && customCode ? 'Custom ' : 'New '}{' '}
                    <span
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(135deg, #FFD700, ${GOLD})` }}
                    >
                        Backtest
                    </span>
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                    {isCustomMode && customCode
                        ? 'A generated strategy has been loaded. Review the parameters below and run a custom backtest.'
                        : 'Fill in the parameters below and click '}
                    {!(isCustomMode && customCode) && <strong className="text-gray-300">Run Backtest</strong>}
                    {!(isCustomMode && customCode) && ' to start the simulation.'}
                </p>
            </Motion.div>

            {isCustomMode && customCode && (
                <div className="p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em] mb-2">
                        Custom Strategy Loaded
                    </p>
                    <p className="text-sm text-gray-300 font-bold">
                        {customStrategyName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Strategy code was passed in from CodeGen and will be included in the backtest request.
                    </p>
                </div>
            )}

            <Motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* ── ROW 1: Pair / Strategy ───────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="pair">Currency Pair</Label>
                        <select
                            id="pair"
                            value={form.pair}
                            onChange={e => set('pair', e.target.value)}
                            className={selectCls}
                        >
                            <optgroup label="Majors">
                                {['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                            <optgroup label="EUR Crosses">
                                {['EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                            <optgroup label="GBP Crosses">
                                {['GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD', 'GBPSGD', 'GBPZAR'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                            <optgroup label="AUD / NZD / CAD">
                                {['AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD', 'CADCHF', 'NZDCHF', 'NZDCAD'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                            <optgroup label="Exotics (USD)">
                                {['USDTRY', 'USDZAR', 'USDMXN', 'USDBRL', 'USDSGD', 'USDHKD', 'USDNOK', 'USDSEK', 'USDDKK', 'USDPLN', 'USDHUF', 'USDCZK', 'USDILS', 'USDCNH', 'USDINR', 'USDTHB', 'USDIDR', 'USDMYR', 'USDPHP', 'USDRUB'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                            <optgroup label="Exotics (EUR)">
                                {['EURTRY', 'EURNOK', 'EURSEK', 'EURPLN', 'EURHUF', 'EURCZK'].map(p =>
                                    <option key={p} value={p}>{p.slice(0, 3)}/{p.slice(3)}</option>
                                )}
                            </optgroup>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="strategy_name">Strategy</Label>
                        <select 
                            id="strategy_name"
                            value={selectedStrategy} 
                            onChange={(e) => setSelectedStrategy(e.target.value)}
                            className={selectCls}
                        >
                          <option value="sma">SMA Crossover (Built-in)</option>
                          <option value="rsi">RSI Mean Reversion (Built-in)</option>
                          <option value="macd">MACD Strategy (Built-in)</option>
                          <option value="bollinger">Bollinger Bands (Built-in)</option>
                          {(location.state?.mode === 'custom' || !!customCode) && (
                            <option value="custom">Custom Strategy</option>
                          )}
                        </select>
                    </div>
                </div>

                {/* ── ROW 2: Strategy ID / Timeframe ───────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="strategy_id">Strategy ID <span className="text-gray-600 font-normal normal-case">(optional)</span></Label>
                        <input
                            id="strategy_id"
                            type="text"
                            value={form.strategy_id}
                            onChange={e => set('strategy_id', e.target.value)}
                            placeholder="Strategy ID"
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <select
                            id="timeframe"
                            value={form.timeframe}
                            onChange={e => set('timeframe', e.target.value)}
                            className={selectCls}
                        >
                            <option value="1m">1 Minutes</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="30m">30 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">Daily</option>
                            <option value="1w">Weekly</option>
                            <option value="1mn">Monthly</option>
                        </select>
                    </div>
                </div>

                {/* ── ROW 3: Date Range ─────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <input
                            id="start_date"
                            type="date"
                            value={form.start_date}
                            onChange={e => set('start_date', e.target.value)}
                            className={inputCls}

                        />
                    </div>
                    <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <input
                            id="end_date"
                            type="date"
                            value={form.end_date}
                            onChange={e => set('end_date', e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* ── ROW 4: Capital / Position Size ───────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="initial_capital">Initial Capital (USD)</Label>
                        <input
                            id="initial_capital"
                            type="number"
                            min="100"
                            step="100"
                            value={form.initial_capital}
                            onChange={e => set('initial_capital', e.target.value)}
                            placeholder="10000"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <Label htmlFor="position_size_pct">Position Size (fraction of capital)</Label>
                        <input
                            id="position_size_pct"
                            type="number"
                            min="0.01"
                            max="1"
                            step="0.01"
                            value={form.position_size_pct}
                            onChange={e => set('position_size_pct', e.target.value)}
                            placeholder="0.1"
                            className={inputCls}
                        />
                    </div>
                </div>

                {selectedStrategy !== 'custom' && (
                <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">
                        Strategy Parameters
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {form.strategy_name === 'rsi' && (
                            <>
                                <div>
                                    <Label htmlFor="period">RSI Period</Label>
                                    <input id="period" type="number" value={form.period} onChange={e => set('period', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="oversold">Oversold (30)</Label>
                                    <input id="oversold" type="number" value={form.oversold} onChange={e => set('oversold', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="overbought">Overbought (70)</Label>
                                    <input id="overbought" type="number" value={form.overbought} onChange={e => set('overbought', e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}

                        {form.strategy_name === 'macd' && (
                            <>
                                <div>
                                    <Label htmlFor="fast">Fast EMA (12)</Label>
                                    <input id="fast" type="number" value={form.fast} onChange={e => set('fast', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="slow">Slow EMA (26)</Label>
                                    <input id="slow" type="number" value={form.slow} onChange={e => set('slow', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="macd_signal">Signal (9)</Label>
                                    <input id="macd_signal" type="number" value={form.macd_signal} onChange={e => set('macd_signal', e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}

                        {form.strategy_name === 'bollinger' && (
                            <>
                                <div>
                                    <Label htmlFor="bb_period">BB Period (20)</Label>
                                    <input id="bb_period" type="number" value={form.bb_period} onChange={e => set('bb_period', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="std_dev">Std Dev (2.0)</Label>
                                    <input id="std_dev" type="number" step="0.1" value={form.std_dev} onChange={e => set('std_dev', e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}

                        {form.strategy_name === 'sma' && (
                            <>
                                <div>
                                    <Label htmlFor="fast_period">Fast Period (50)</Label>
                                    <input id="fast_period" type="number" value={form.fast_period} onChange={e => set('fast_period', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <Label htmlFor="slow_period">Slow Period (200)</Label>
                                    <input id="slow_period" type="number" value={form.slow_period} onChange={e => set('slow_period', e.target.value)} className={inputCls} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                )}

                {/* ── ROW 5: Cost Preset / Data Source ─────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label htmlFor="cost_preset">Cost Preset</Label>
                        <select
                            id="cost_preset"
                            value={form.cost_preset}
                            onChange={e => set('cost_preset', e.target.value)}
                            className={selectCls}
                        >
                            <option value="forex_retail">Forex Retail</option>
                            <option value="forex_institutional">Forex Institutional</option>
                            <option value="crypto_standard">Crypto Standard</option>
                            <option value="stocks_commission_free">Stocks Commission Free</option>
                            <option value="stocks_traditional">Stocks Traditional</option>
                            <option value="futures_cme">Futures CME</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="data_source">Data Source</Label>
                        <select
                            id="data_source"
                            value={form.data_source}
                            onChange={e => set('data_source', e.target.value)}
                            className={selectCls}
                        >
                            <option value="auto">AUTO</option>
                            {/* <option value="api">api — Broker live API</option>
                            <option value="mock">mock — Synthetic test data</option> */}
                        </select>
                    </div>
                </div>

                {/* ── Divider ───────────────────────────────────────────── */}
                <div className="border-t border-white/5" />

                {/* ── Custom Strategy Handling ─────────────────────────────────────────────── */}
                {selectedStrategy === 'custom' && !customCode && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-400">
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="text-sm">Cannot run Custom Strategy: No code loaded.</div>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard/codegen/session/new')} 
                        className="text-xs font-bold px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"
                    >
                        Go to CodeGen
                    </button>
                  </div>
                )}

                {selectedStrategy === 'custom' && customCode && (
                  <div className="code-preview bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-green-400">
                            <FiCode className="w-4 h-4" />
                            <h3 className="text-[11px] font-bold uppercase tracking-widest m-0">✓ Custom Code Loaded</h3>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowCodePreview(!showCodePreview)}
                            className="text-[10px] font-black uppercase text-gray-400 hover:text-white pb-1 border-b border-gray-600 hover:border-white transition-colors"
                        >
                          {showCodePreview ? 'Hide Code' : 'Show Code'}
                        </button>
                    </div>
                    {showCodePreview && (
                        <pre className="bg-[#0D0D0D] p-4 rounded-xl text-[11px] text-gray-400 overflow-x-auto whitespace-pre-wrap border border-white/5 font-mono leading-relaxed mt-2 max-h-64 overflow-y-auto w-full">
                            <code>{customCode}</code>
                        </pre>
                    )}
                  </div>
                )}

                {/* ── Error ─────────────────────────────────────────────── */}
                <AnimatePresence>
                    {error && (
                        <Motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5"
                        >
                            <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400">{error}</p>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {/* ── Submit ────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] text-gray-600">
                        Results will open on a new page after the simulation completes.
                    </p>
                    <Motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212,175,55,0.15)' }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2.5 px-9 py-3 rounded-xl bg-white text-black
                                   font-black text-xs uppercase tracking-[0.2em]
                                   hover:bg-yellow-400 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                Running…
                            </>
                        ) : (
                            <>
                                <FiPlay className="w-4 h-4" />
                                Run Backtest
                            </>
                        )}
                    </Motion.button>
                </div>
            </Motion.form>
        </div>
    );
};

export default BacktestForm;
