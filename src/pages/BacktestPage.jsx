import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { runBacktest } from "../services/backtestService";
import CandlestickChart from "../components/dashboard/backtest/CandlestickChart";
import toast from "react-hot-toast";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";

const BacktestPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#636363" : "rgba(255,255,255,0.70)";
  const { user } = useSelector((s) => s.auth);
  const userId = user?.user_id || user?.id || "";

  const [form, setForm] = useState({
    pair: "EURUSD",
    strategy_name: "bollinger_bands",
    start_date: "2021-01-01",
    end_date: "2023-12-29",
    strategy_id: null,
    timeframe: "1d",
    initial_capital: 10000,
    strategy_params: { period: 20, std_dev: 2.0 },
    cost_preset: "forex_retail",
    position_size_pct: 0.1,
    data_source: "csv",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const updateParams = (k, v) => setForm((p) => ({ ...p, strategy_params: { ...p.strategy_params, [k]: v } }));

  const onSubmit = async () => {
    if (!userId) {
      toast.error("Login required");
      return;
    }
    setSubmitting(true);
    const t = toast.loading("Running backtest...");
    try {
      const res = await runBacktest(userId, form);
      setResult(res);
      toast.success("Backtest complete", { id: t });
    } catch (e) {
      toast.error("Backtest failed", { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 40% 0%, rgba(212,175,55,0.08), transparent 70%)` }} />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: -60, y: -30 }}
        animate={{ opacity: 0.3, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `${GOLD}33` }}
      />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: 60, y: 30 }}
        animate={{ opacity: 0.25, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `${GOLD_LIGHT}26` }}
      />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <PublicNavbar />

      <section className="max-w-6xl mx-auto px-6 pt-32 pb-10 text-center">
        <Motion.div initial={{ opacity: 0, y: 20, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Validation Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent leading-tight mb-6"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Backtesting
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: TEXT }}>
            Execute strategy simulations against historical data and review performance metrics.
          </p>
        </Motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 p-6 rounded-2xl border" style={{ background: BG2, borderColor: `${GOLD}22` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pair <span className="text-red-500">*</span></label>
                <input value={form.pair} onChange={(e) => update("pair", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Strategy <span className="text-red-500">*</span></label>
                <select value={form.strategy_name} onChange={(e) => update("strategy_name", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="bollinger_bands">bollinger_bands</option>
                  <option value="sma_cross">sma_cross</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Start <span className="text-red-500">*</span></label>
                <input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">End <span className="text-red-500">*</span></label>
                <input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Timeframe</label>
                <select value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="1d">1d</option>
                  <option value="4h">4h</option>
                  <option value="1h">1h</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Initial Capital <span className="text-red-500">*</span></label>
                <input type="number" value={form.initial_capital} onChange={(e) => update("initial_capital", Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cost Preset</label>
                <select value={form.cost_preset} onChange={(e) => update("cost_preset", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="forex_retail">forex_retail</option>
                  <option value="forex_ecn">forex_ecn</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Position Size %</label>
                <input type="number" step="0.01" value={form.position_size_pct} onChange={(e) => update("position_size_pct", Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data Source</label>
                <select value={form.data_source} onChange={(e) => update("data_source", e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="csv">csv</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Strategy Id</label>
                <input value={form.strategy_id || ""} onChange={(e) => update("strategy_id", e.target.value || null)} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Period</label>
                <input type="number" value={form.strategy_params.period} onChange={(e) => updateParams("period", Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Std Dev</label>
                <input type="number" step="0.1" value={form.strategy_params.std_dev} onChange={(e) => updateParams("std_dev", Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={onSubmit} disabled={submitting || !form.pair || !form.strategy_name || !form.start_date || !form.end_date || !form.timeframe || !form.initial_capital} className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-[0.2em]" style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#000' }}>
                {submitting ? "Running..." : "Run Backtest"}
              </button>
              <button
                onClick={() => setShowJson(s => !s)}
                className="px-4 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:border-yellow-500/40 hover:text-yellow-500 transition-all"
              >
                {showJson ? "Hide Payload" : "Show Payload"}
              </button>
              <button
                disabled={!result}
                onClick={() => {
                  const el = document.getElementById("bt-result");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border ${result ? 'border-yellow-500/40 text-yellow-500' : 'border-white/10 text-white/30 cursor-not-allowed'}`}
              >
                {result ? `${result.total_return_pct}% · Sharpe ${Number(result.sharpe_ratio || 0).toFixed(2)}` : "No Output"}
              </button>
            </div>
            {showJson && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-white/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black uppercase tracking-widest text-[9px] text-gray-500">Request Payload</span>
                  <button
                    onClick={() => {
                      const payload = {
                        pair: form.pair,
                        strategy_name: form.strategy_name,
                        start_date: form.start_date,
                        end_date: form.end_date,
                        strategy_id: form.strategy_id || null,
                        timeframe: form.timeframe,
                        initial_capital: Number(form.initial_capital),
                        strategy_params: {
                          period: Number(form.strategy_params.period),
                          std_dev: Number(form.strategy_params.std_dev),
                        },
                        cost_preset: form.cost_preset,
                        position_size_pct: Number(form.position_size_pct),
                        data_source: form.data_source,
                      };
                      navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
                    }}
                    className="px-3 py-1 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-yellow-500/40 hover:text-yellow-500 transition-all"
                  >
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify({
                  pair: form.pair,
                  strategy_name: form.strategy_name,
                  start_date: form.start_date,
                  end_date: form.end_date,
                  strategy_id: form.strategy_id || null,
                  timeframe: form.timeframe,
                  initial_capital: Number(form.initial_capital),
                  strategy_params: {
                    period: Number(form.strategy_params.period),
                    std_dev: Number(form.strategy_params.std_dev),
                  },
                  cost_preset: form.cost_preset,
                  position_size_pct: Number(form.position_size_pct),
                  data_source: form.data_source,
                }, null, 2)}</pre>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 p-6 rounded-2xl border" style={{ background: BG2, borderColor: `${GOLD}22` }}>
            <h3 id="bt-result" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Result</h3>
            <div className="mt-4 text-sm text-gray-300">
              {result ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Total Return</span>
                    <span>{result.total_return_pct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sharpe</span>
                    <span>{result.sharpe_ratio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max Drawdown</span>
                    <span>{result.max_drawdown_pct}%</span>
                  </div>
                </div>
              ) : (
                <div className="opacity-50 text-gray-500 text-sm">No result yet</div>
              )}
            </div>
            {result && result.equity_curve && result.equity_curve.length ? (
              <div className="mt-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Equity Timeline</h4>
                <div className="h-52">
                  <CandlestickChart data={result.equity_curve} />
                </div>
              </div>
            ) : result ? (
              <p className="mt-4 text-xs text-gray-400">Equity data unavailable for charting.</p>
            ) : null}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default BacktestPage;
