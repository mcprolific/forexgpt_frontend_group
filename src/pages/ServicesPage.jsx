import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  CodeBracketIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── From Proposal §3.2 Architectural Components + §2 Objectives ── */
const services = [
  {
    icon: DocumentTextIcon,
    title: "Signal Extraction",
    desc: "Input corporate earnings call transcripts and extract structured forex trading signals using a fine-tuned NLP model. Identifies currency exposure, hedging activity, and directional bias.",
    detail: "Sources from Seeking Alpha, Finnhub, Intrinio APIs, and SEC filings. Outputs JSON with currency pair, direction, confidence (>75% accuracy), reasoning, magnitude, and time horizon.",
    to: "/dashboard/transcript",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Mentor AI (Decision Guidance)",
    desc: "An intelligent educational mentor that guides learners through quantitative finance concepts, strategy design, and decision-making with step-by-step reasoning chains.",
    detail: "Accepts trading scenarios ('Should I trade 0.67 lots with this signal?') and applies multi-step reasoning: assess signal quality → check account context → calculate position size → verify margin → provide recommendation.",
    to: "/dashboard/mentor",
  },
  {
    icon: CodeBracketIcon,
    title: "Strategy Code Generation",
    desc: "Describe your strategy in plain English and receive production-grade Python code with proper error handling, logging, documentation, and backtesting capability.",
    detail: "Example input: 'Mean reversion for GBP/USD on 1H: RSI < 35 AND Stochastic bullish + Price > SMA(200), exit RSI > 65 or ±50 pips.' Code runs without modification.",
    to: "/dashboard/strategy",
  },
  {
    icon: ChartBarIcon,
    title: "Realistic Backtesting",
    desc: "Run strategies against historical data with actual trading costs: spreads (2 pips normal, wider during volatility), slippage (1–2 pips normal, 5–20 during news), commission, and financing.",
    detail: "Performance metrics: win rate, Profit Factor, Sharpe ratio (target >0.8), max drawdown, and realistic vs. naïve comparison showing 20%+ cost impact.",
    to: "/dashboard/backtest",
  },
  {
    icon: AcademicCapIcon,
    title: "Learning Hub",
    desc: "Structured educational modules on risk management, technical analysis, position sizing, and strategy building — with 6–8 Jupyter notebooks, working code, and real earnings examples.",
    detail: "Covers: forex fundamentals, data labeling, fine-tuning workflow, strategy implementation, backtesting with costs, live bot architecture, decision scenarios, and code generation examples.",
    to: "/dashboard/learning",
  },
  {
    icon: CpuChipIcon,
    title: "AI Confluence Scoring",
    desc: "Get a single confluence score combining technicals, fundamentals, and sentiment for any trade idea — in seconds. Every recommendation explains its reasoning, entry logic, and risk rationale.",
    detail: "Risk Management Validator enforces: max 2% account risk per trade, daily loss limits (5% max), monthly drawdown limits (20% max). Alerts when limits would be exceeded.",
    to: "/dashboard/signals",
  },
];

const ServicesPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 80%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            All Capabilities
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Our Services
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            ForexGPT is organized into modular components that separate signal extraction, educational reasoning,
            code generation, and backtesting — each designed as a{" "}
            <strong className="text-[#C8A94A]">self-contained learning tool</strong>.
          </p>
        </Motion.div>
      </section>

      {/* Services grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 pb-20">
        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Motion.div key={s.title} variants={item}>
                <Link to={s.to}
                  className="flyout-card relative block rounded-2xl border p-6 h-full overflow-hidden group"
                  style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}>
                  <div className="absolute -inset-px rounded-2xl pointer-events-none"
                    style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 30%)` }} />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl mb-4 transition-colors"
                      style={{
                        background: isLight ? "rgba(212,175,55,0.15)" : `${GOLD}15`,
                        color: isLight ? "#9a7d30" : GOLD_LIGHT
                      }}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#FFD700] transition-colors"
                      style={{ color: isLight ? "#9a7d30" : "#F0D880" }}>
                      {s.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
                    <p className="text-xs leading-relaxed mt-2 italic" style={{ color: isLight ? "#71717a" : "rgba(255,255,255,0.60)" }}>{s.detail}</p>
                    <span className="inline-block mt-4 text-xs font-semibold" style={{ color: isLight ? "#9a7d30" : GOLD_LIGHT }}>
                      Explore →
                    </span>
                  </div>
                </Link>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ServicesPage;
