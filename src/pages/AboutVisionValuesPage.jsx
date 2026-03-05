import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../context/ThemeContext";
import {
  EyeIcon,
  HeartIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CodeBracketIcon,
  CpuChipIcon,
  LightBulbIcon,
  BoltIcon,
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

/* ── Project Objectives from Proposal §2 ── */
const objectives = [
  { icon: DocumentTextIcon, text: "Design a fine-tuned language model that extracts actionable forex trading signals from corporate earnings call transcripts using NLP." },
  { icon: AcademicCapIcon, text: "Build an intelligent educational mentor that guides learners through quantitative finance concepts using step-by-step reasoning chains." },
  { icon: ChartBarIcon, text: "Develop a comprehensive curriculum teaching forex fundamentals, technical analysis, risk management, backtesting, and decision-making." },
  { icon: CodeBracketIcon, text: "Create a strategy-to-code translation system converting mechanical trading descriptions into production-grade Python code." },
  { icon: CpuChipIcon, text: "Implement a realistic backtesting framework modelling actual trading costs (spreads, slippage, commission, financing)." },
  { icon: LightBulbIcon, text: "Demonstrate system effectiveness through working prototypes and evaluate learning outcomes based on clarity, rigor, and alignment." },
];

/* ── Core Values from Proposal §6 Ethical Design Principles ── */
const values = [
  { icon: EyeIcon, title: "Transparency", desc: "All reasoning chains are visible and explainable. Learners understand how the system works — no black boxes." },
  { icon: ShieldCheckIcon, title: "Safety First", desc: "No autonomous trading. All trading is simulated/paper, never real money. System is an educational tool, not a trading system." },
  { icon: AcademicCapIcon, title: "Education Over Profit", desc: "Evaluate on learning outcomes, not financial returns. Clarity, rigor, and curriculum alignment matter more than market performance." },
  { icon: HeartIcon, title: "Accessibility", desc: "Makes quantitative finance education available without expensive proprietary tools. The free tier gives everyone a starting point." },
  { icon: SparklesIcon, title: "Responsible AI", desc: "Explicit scope boundaries. No price predictions, no financial advice, no claims to beat markets. Financial risk is explicitly mitigated." },
  { icon: UserGroupIcon, title: "Replicability", desc: "Learners can understand and build the system. Open methodology, documented guidelines, and clear evaluation criteria." },
];

const AboutVisionValuesPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 60% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(600px 400px at 20% 80%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Our DNA
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Vision & Values
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            ForexGPT is a fine-tuned language model for learning quantitative finance, algorithmic trading,
            and intelligent decision-support in foreign exchange markets — designed with transparency,
            ethics, and accessibility at its core.
          </p>
        </Motion.div>
      </section>

      {/* Vision Statement (Proposal subtitle + §10) */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <Motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-2xl border p-8 md:p-10 text-center overflow-hidden"
          style={{ background: BG2, borderColor: `${GOLD}25` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(40rem 16rem at 50% 50%, rgba(212,175,55,0.06), transparent 70%)` }} />
          <p className="relative text-lg md:text-xl font-medium leading-relaxed italic" style={{ color: TEXT }}>
            "To democratize professional-grade trading analysis through AI, making risk-intelligent,
            data-driven decisions accessible to every trader — regardless of experience or capital.
            The most valuable AI applications in finance may not be about making money, but about helping
            people understand how to."
          </p>
          <div className="relative mt-4 text-sm font-bold" style={{ color: GOLD }}>— ForexGPT Project Vision</div>
        </Motion.div>
      </section>

      {/* Project Objectives (Proposal §2) */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Project Objectives
        </Motion.h2>
        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {objectives.map((o, i) => {
            const Icon = o.icon;
            return (
              <Motion.div key={i} variants={item}
                className="flex items-start gap-4 rounded-2xl border p-5"
                style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
                whileHover={{ y: -3 }}>
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                  style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{o.text}</p>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* Ethical Values (Proposal §6) */}
      <section className="max-w-6xl mx-auto px-6 py-8 pb-20">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Ethical Design Principles
        </Motion.h2>
        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <Motion.div key={v.title} variants={item}
                className="relative rounded-2xl border p-5 overflow-hidden"
                style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
                whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(212,175,55,0.10)` }}>
                <div className="absolute -inset-px rounded-2xl pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${GOLD}10, transparent 30%)` }} />
                <div className="relative flex items-start gap-4">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "#F0D880" }}>{v.title}</h3>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: MUTED }}>{v.desc}</p>
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutVisionValuesPage;
