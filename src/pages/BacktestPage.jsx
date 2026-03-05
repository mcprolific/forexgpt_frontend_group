import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../context/ThemeContext";
import { ChartBarSquareIcon, BeakerIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

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

      <section className="max-w-6xl mx-auto px-6 pt-32 pb-16 text-center">
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
            Validate your logic with high-fidelity historical data. Analyze win rates, Profit Factors,
            and drawdown with charts that reflect real-world market conditions.
          </p>
        </Motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
        {[
          {
            icon: BeakerIcon,
            title: "Stress Testing",
            desc: "Simulate volatile news events and high-slippage environments to see how your strategy truly performs."
          },
          {
            icon: ChartBarSquareIcon,
            title: "Advanced Metrics",
            desc: "Go beyond P&L. Track Sharpe ratios, Sortino ratios, and maximum adverse excursion for deeper insights."
          },
          {
            icon: ArrowTrendingUpIcon,
            title: "Visual Feedback",
            desc: "Interactive equity curves and trade entry/exit markers help you identify where your strategy edge lies."
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Motion.div
              key={idx}
              initial={{ opacity: 0, y: 22, scale: 0.98, filter: "blur(2px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: `0 18px 48px ${GOLD}25` }}
              whileTap={{ scale: 0.995 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 rounded-2xl border overflow-hidden"
              style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
            >
              <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{ background: `linear-gradient(180deg, ${GOLD}14, transparent 35%)` }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `${GOLD}15`, color: GOLD }}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#F0D880" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
              <Motion.div
                aria-hidden
                initial={{ opacity: 0, x: -20 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-3xl"
                style={{ background: `${GOLD_LIGHT}18`, filter: "blur(18px)" }}
              />
            </Motion.div>
          );
        })}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Realistic Costs</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Include spreads, slippage, commissions, and overnight financing. Small costs compound and can turn a profitable curve into break-even.
            </p>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Data & Bias</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Avoid survivorship and look‑ahead bias. Use stable data sources and align timestamps to prevent leaking future information.
            </p>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Overfitting Guardrails</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Use train/test splits, walk‑forward validation, and limit parameter searches. Prefer simple rules that generalize.
            </p>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Key Metrics</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Monitor win rate, Profit Factor, Sharpe/Sortino, max drawdown, and time in market. Evaluate stability across periods.
            </p>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Suggested Workflow</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Define rules → backtest with costs → review metrics → stress test → adjust rules → re‑validate on fresh data.
            </p>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            whileHover={{ y: -5, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border p-6"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F0D880" }}>Limitations</h3>
            <p className="text-sm" style={{ color: MUTED }}>
              Backtests are approximations. Market regimes change and liquidity varies; treat results as learning tools, not guarantees.
            </p>
          </Motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default BacktestPage;
