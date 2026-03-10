import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";
const CHARCOAL3 = "#2E2E2E";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── From Proposal §4.1 Methodology ── */
const phases = [
  {
    n: "01",
    title: "Create Your Account",
    desc: "Register in seconds no credit card needed. Set your preferred trading pairs, risk tolerance, and learning goals in Settings.",
    sub: null,
  },
  {
    n: "02",
    title: "Explore the Mentor AI",
    desc: "Ask questions about forex fundamentals, technical analysis, risk management, or strategy design. The Mentor explains concepts step-by-step with real examples.",
    sub: "From the proposal: 'Built‑in mentor AI teaches concepts as you go turning every analysis into a learning moment.'",
  },
  {
    n: "03",
    title: "Extract Signals from Transcripts",
    desc: "Paste an earnings call transcript into Signal Extraction. The fine-tuned NLP model identifies currency exposure, hedging activity, and directional bias outputting structured JSON signals.",
    sub: "Uses 100–150 labeled earnings examples with LoRA fine-tuning for >75% directional accuracy.",
  },
  {
    n: "04",
    title: "Generate Strategy Code",
    desc: "Describe your strategy in plain English (e.g., 'Mean reversion for GBP/USD on 1H: RSI < 35 AND Stochastic bullish + Price > SMA(200)'). The Code Translation Module generates production-grade Python with error handling, logging, and documentation.",
    sub: "Property: code runs without modification.",
  },
  {
    n: "05",
    title: "Backtest with Realistic Costs",
    desc: "Run your generated strategy against historical data with realistic cost modelling: entry/exit spreads (2 pips normal, wider during volatility), slippage (1–2 pips normal, 5–20 during news), commission, and financing costs.",
    sub: "Shows 20%+ cost impact vs. naïve backtests. Metrics include win rate, Profit Factor, Sharpe ratio, and max drawdown.",
  },
  {
    n: "06",
    title: "Learn, Iterate & Export",
    desc: "Review AI explanations of every recommendation. Use the Learning Hub for structured modules on risk management, position sizing, and technical analysis. Export clean, commented code when ready.",
    sub: "Evaluate on clarity and rigor, not profitability.",
  },
];

/* ── Educational Materials from Proposal §3.2.5 ── */
const notebooks = [
  "Fundamentals Walkthrough — forex mechanics, pairs, costs",
  "Data Labeling Guide — how to label earnings transcripts",
  "Fine‑Tuning Workflow — training and evaluation",
  "Strategy Implementation — building indicators and signals",
  "Backtesting with Costs — realistic simulation",
  "Live Bot Architecture — deployment patterns",
  "Decision Scenarios — mentoring behavior examples",
  "Code Generation Examples — strategy → Python translation",
];

const HowToUsePage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const BG3 = isLight ? "#F5F2EC" : CHARCOAL3;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 20% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 70%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Getting Started
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            How To Use ForexGPT
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            From first login to validated strategies follow these six steps to master
            AI-powered quantitative finance education. The learning progression flows from
            <strong className="text-[#C8A94A]"> Fundamentals → Theory → Implementation → Validation → Decisions</strong>.
          </p>
        </Motion.div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}
          className="space-y-6">
          {phases.map((s, idx) => (
            <Motion.div key={s.n} variants={item}
              className="relative rounded-2xl border p-6 overflow-hidden"
              style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
              whileHover={{ y: -3, boxShadow: `0 16px 48px rgba(212,175,55,0.10)` }}>
              {/* Gold top edge */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />
              <div className="flex items-start gap-5">
                <div className="text-3xl font-black flex-shrink-0 leading-none mt-1"
                  style={{ color: `${GOLD}${30 + idx * 10 > 99 ? 99 : 30 + idx * 10}` }}>{s.n}</div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: isLight ? "#9a7d30" : "#F0D880" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: MUTED }}>{s.desc}</p>
                  {s.sub && (
                    <p className="text-xs leading-relaxed mt-2 italic" style={{ color: isLight ? "#71717a" : "rgba(255,255,255,0.60)" }}>{s.sub}</p>
                  )}
                </div>
              </div>
            </Motion.div>
          ))}
        </Motion.div>
      </section>

      {/* Educational Materials (Proposal §3.2.5) */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <Motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border p-8" style={{ background: BG3, borderColor: `${GOLD}22`, color: TEXT }}>
          <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
            Educational Notebooks
          </h2>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            6–8 Jupyter Notebooks with working code, real examples, and step-by-step explanations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notebooks.map((nb, i) => (
              <Motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 p-3 rounded-xl border"
                style={{ background: BG2, borderColor: `${GOLD}15`, color: TEXT }}>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-md text-xs font-bold flex-shrink-0"
                  style={{ background: `${GOLD}18`, color: GOLD_LIGHT }}>
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: TEXT }}>{nb}</span>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default HowToUsePage;
