import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  EyeIcon,
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

/* ── What ForexGPT does NOT do (Proposal §6) ── */
const doesNot = [
  "Does not execute trades or manage real money",
  "Does not make price predictions or forecasts",
  "Does not provide financial advice or recommendations",
  "Does not claim to beat markets or generate superior returns",
  "Does not replace professional traders or advisors",
];

/* ── What ForexGPT DOES do (Proposal §6) ── */
const does = [
  "Teaches quantitative finance concepts",
  "Mentors through trading scenarios (educational)",
  "Generates code for learning purposes",
  "Shows how to backtest realistically",
  "Explains decision-making reasoning",
];

/* ── Ethical Design Principles (Proposal §6) ── */
const principles = [
  { icon: EyeIcon, title: "Transparency", desc: "All reasoning chains are visible and explainable. Learners understand how the system works." },
  { icon: ShieldCheckIcon, title: "No Black Boxes", desc: "Every recommendation explains its reasoning, entry logic, and risk rationale. Nothing is hidden." },
  { icon: ExclamationTriangleIcon, title: "Realistic Expectations", desc: "Backtests include actual costs. Performance is realistic (Sharpe >0.8, not >10). Shows 20%+ cost impact vs. naïve models." },
  { icon: NoSymbolIcon, title: "No Autonomous Trading", desc: "System is an educational tool, not a trading system. All trading is simulated/paper, never real money." },
  { icon: LockClosedIcon, title: "Financial Risk Mitigation", desc: "Position sizing enforces max 2% account risk per trade, 5% daily loss limits, and 20% monthly drawdown limits." },
  { icon: EyeSlashIcon, title: "Clear Limitations", desc: "Explicitly documents what the system cannot do. Scope boundaries are strict and non-negotiable." },
  { icon: CheckBadgeIcon, title: "Learning Focus", desc: "Evaluated on learning outcomes, not financial returns. Measures clarity, rigor, curriculum alignment, and pedagogical effectiveness." },
];

/* ── Ethical Considerations (Proposal §6) ── */
const considerations = [
  { label: "Financial Risk", desc: "Project explicitly avoids autonomous trading that could cause financial loss" },
  { label: "Regulatory", desc: "No claims of investment advice; educational use only" },
  { label: "Accessibility", desc: "Makes quantitative finance education available without expensive proprietary tools" },
  { label: "AI Transparency", desc: "Shows reasoning chains; builds trust in AI systems" },
  { label: "Responsible Automation", desc: "Demonstrates how to build financial AI ethically" },
];

const SecurityPrivacyPage = () => {
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
        style={{ background: `radial-gradient(900px 500px at 40% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(600px 400px at 70% 85%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            <ShieldCheckIcon className="h-3.5 w-3.5" /> Limitations & Ethics
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Security & Privacy
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Clear scope boundaries, ethical design principles, and responsible AI practices define everything
            ForexGPT does — and everything it deliberately does <em>not</em> do.
          </p>
        </Motion.div>
      </section>

      {/* Does / Does Not (Proposal §6) */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Does NOT */}
          <Motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl border p-6" style={{ background: BG2, borderColor: "#7A283040", color: TEXT }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#E6544A" }}>
              <NoSymbolIcon className="h-5 w-5" /> ForexGPT Does NOT
            </h2>
            <ul className="space-y-3">
              {doesNot.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: MUTED }}>
                  <span className="text-[#E6544A]">✕</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Motion.div>

          {/* DOES */}
          <Motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl border p-6" style={{ background: BG2, borderColor: `${GOLD}30`, color: TEXT }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#4ADE80" }}>
              <CheckBadgeIcon className="h-5 w-5" /> ForexGPT DOES
            </h2>
            <ul className="space-y-3">
              {does.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: MUTED }}>
                  <span className="text-[#4ADE80]">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Motion.div>
        </div>
      </section>

      {/* Ethical Design Principles (Proposal §6) */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Ethical Design Principles
        </Motion.h2>

        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <Motion.div key={p.title} variants={item}
                className="relative rounded-2xl border p-5 overflow-hidden"
                style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
                whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(212,175,55,0.10)` }}>
                <div className="absolute -inset-px rounded-2xl pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${GOLD}10, transparent 30%)` }} />
                <div className="relative flex items-start gap-3">
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "#F0D880" }}>{p.title}</h3>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: MUTED }}>{p.desc}</p>
                  </div>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* Ethical Considerations (Proposal §6) */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <Motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl border p-6" style={{ background: BG3, borderColor: `${GOLD}20`, color: TEXT }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#F0D880" }}>Ethical Considerations</h2>
          <div className="space-y-3">
            {considerations.map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-md text-xs font-bold flex-shrink-0"
                  style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}>{i + 1}</span>
                <div>
                  <span className="font-semibold text-[#D4AF37]">{c.label}:</span>{" "}
                  <span className="" style={{ color: MUTED }}>{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default SecurityPrivacyPage;
