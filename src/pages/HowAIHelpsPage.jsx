import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  CpuChipIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BoltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";
const CHARCOAL3 = "#2E2E2E";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── AI Capabilities from Proposal §3.2 & §4.3 ── */
const capabilities = [
  {
    icon: DocumentTextIcon,
    title: "Signal Extraction (NLP Fine‑Tuning)",
    desc: "A fine-tuned NLP model analyses corporate earnings call transcripts to extract forex trading signals — identifying currency exposure, hedging activity, and directional bias with >75% accuracy.",
    detail: "Uses LoRA fine-tuning on 100–150 labeled earnings examples. Outputs structured JSON with currency pair, direction, confidence, and reasoning.",
  },
  {
    icon: AcademicCapIcon,
    title: "Educational Mentor System",
    desc: "An intelligent mentor guides learners through quantitative finance concepts, strategy design, and implementation using step-by-step reasoning chains and domain-specific knowledge.",
    detail: "Includes: Decision Guidance Engine, Reasoning Chain Generator, Code Translation Module, and Risk Management Validator.",
  },
  {
    icon: CpuChipIcon,
    title: "Code Translation Module",
    desc: "Converts plain-English strategy descriptions into production-grade Python code with proper error handling, logging, and documentation — code that runs without modification.",
    detail: "Input: 'Mean reversion for GBP/USD on 1H: RSI < 35 AND Stochastic bullish + Price > SMA(200)' → Output: Complete Python implementation.",
  },
  {
    icon: ChartBarIcon,
    title: "Realistic Backtesting Framework",
    desc: "Models actual trading costs — spreads, slippage, commission, and financing — and teaches learners why naïve backtests fail. Shows 20%+ cost impact vs. simplified models.",
    detail: "Mechanical signal generation with RSI, EMA, ATR indicators. Calculates win rate, Profit Factor, Sharpe ratio, and max drawdown.",
  },
  {
    icon: LightBulbIcon,
    title: "Reasoning Chain Generator",
    desc: "Explains decision-making like a professional trader: multi-step analysis, context awareness, alternative scenarios explored, and tradeoffs explained.",
    detail: "Shows HOW to think, not just WHAT to think — every recommendation comes with mathematical reasoning and risk analysis.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Risk Management Validator",
    desc: "Enforces position sizing rules: max 2% account risk per trade, daily loss limits (5% max), monthly drawdown limits (20% max). Alerts when limits would be exceeded.",
    detail: "Validates every decision against configurable safety limits before execution.",
  },
];

/* ── How AI strategy works (Proposal §4.3) ── */
const aiApproach = [
  { icon: BoltIcon, title: "Signal Extraction", desc: "Fine-tuned on labeled earnings transcripts to learn forex exposure patterns and generate structured signal outputs." },
  { icon: AcademicCapIcon, title: "Educational Mentoring", desc: "Fine-tuned on decision scenarios and reasoning chains, integrating quantitative finance domain knowledge." },
  { icon: CpuChipIcon, title: "Code Generation", desc: "Fine-tuned on strategy description → Python code pairs, integrating production code patterns." },
  { icon: SparklesIcon, title: "Realistic Backtesting", desc: "Deterministic algorithms for signal generation, combined with comprehensive cost modelling." },
];

const HowAIHelpsPage = () => {
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
        style={{ background: `radial-gradient(900px 500px at 40% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 80%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            AI‑Powered Learning
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            How AI Helps
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            ForexGPT uses fine-tuned language models, NLP signal extraction, and domain-specific reasoning
            to provide an intelligent educational mentor not a black box, but a transparent system that
            teaches <em>how</em> to think about quantitative trading.
          </p>
        </Motion.div>
      </section>

      {/* ── Architecture flow (simplified from Proposal §3.1) ── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <Motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border p-6 md:p-8 overflow-hidden"
          style={{ background: BG2, borderColor: `${GOLD}25`, color: TEXT }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#F0D880" }}>System Pipeline</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            {[
              "Earnings Calls",
              "→",
              "Text Parsing",
              "→",
              "Fine-Tuned NLP",
              "→",
              "Structured Signals",
              "→",
              "Mentor System",
              "→",
              "Backtesting",
              "→",
              "Demo UI",
            ].map((t, i) =>
              t === "→" ? (
                <span key={i} style={{ color: GOLD }}>→</span>
              ) : (
                <span key={i} className="px-3 py-1.5 rounded-lg border text-white/90"
                  style={{ background: BG3, borderColor: `${GOLD}30`, color: TEXT }}>
                  {t}
                </span>
              )
            )}
          </div>
        </Motion.div>
      </section>

      {/* ── Capabilities grid (Proposal §3.2) ── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Core AI Components
        </Motion.h2>

        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <Motion.div key={c.title} variants={item}
                className="relative rounded-2xl border p-6 overflow-hidden"
                style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
                whileHover={{ y: -4, boxShadow: `0 20px 50px rgba(212,175,55,0.12)` }}>
                <div className="absolute -inset-px rounded-2xl pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 30%)` }} />
                <div className="relative flex items-start gap-4">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl flex-shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "#F0D880" }}>{c.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{c.desc}</p>
                    <p className="text-xs leading-relaxed mt-2 italic" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.60)" }}>{c.detail}</p>
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* ── AI Strategy (Proposal §4.3) ── */}
      <section className="max-w-6xl mx-auto px-6 py-12 pb-16">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-4 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Fine‑Tuning Strategy
        </Motion.h2>
        <Motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center text-sm max-w-2xl mx-auto mb-10" style={{ color: isLight ? "#6b7280" : "#A89060" }}>
          ForexGPT is optimized for <strong style={{ color: "#C8A94A" }}>pedagogical effectiveness</strong>, not
          trading profitability. We measure clarity, rigor, and curriculum alignment — not market returns.
        </Motion.p>

        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aiApproach.map((a) => {
            const Icon = a.icon;
            return (
              <Motion.div key={a.title} variants={item}
                className="rounded-2xl border p-5 text-center"
                style={{ background: BG3, borderColor: `${GOLD}20`, color: TEXT }}
                whileHover={{ y: -4 }}>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mx-auto mb-3"
                  style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "#F0D880" }}>{a.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{a.desc}</p>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* Important disclaimer */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <Motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border p-6 flex items-start gap-4"
          style={{ background: BG3, borderColor: `${GOLD}20`, color: TEXT }}>
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl flex-shrink-0"
            style={{ background: "#7A283020", color: "#E6544A" }}>
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1" style={{ color: "#F0D880" }}>Important: Educational Tool Only</h3>
            <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
              ForexGPT does not execute trades, manage real money, make price predictions,
              or provide financial advice. It is an educational mentor that teaches quantitative
              methods through transparent reasoning, code generation, and realistic backtesting.
            </p>
          </div>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default HowAIHelpsPage;
