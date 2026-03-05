import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../context/ThemeContext";
import {
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CpuChipIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BoltIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ChartBarIcon,
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

/* ── Problem cards from Proposal §1 ── */
const problems = [
  {
    icon: ExclamationTriangleIcon,
    title: "Theory‑Practice Gap",
    desc: "Textbooks teach forex mechanics and probability theory but provide minimal guidance on applying these concepts to actual strategy design.",
  },
  {
    icon: CodeBracketIcon,
    title: "Implementation Without Understanding",
    desc: "Online trading platforms offer tools and backtesting frameworks, but no pedagogical guidance on how these components work together.",
  },
  {
    icon: CpuChipIcon,
    title: "Domain Specificity Absent",
    desc: "Generic AI assistants answer finance questions generically, without domain depth, context, or curriculum alignment specific to forex markets.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Cost & Access Barriers",
    desc: "Professional-grade quantitative finance education and tools are expensive, proprietary, and closed-source inaccessible to self-taught learners.",
  },
];

/* ── What ForexGPT uniquely offers (Proposal §1 → The Opportunity) ── */
const solutions = [
  {
    icon: BookOpenIcon,
    title: "Theory",
    desc: "Probability, statistics, and signal processing taught with real-world forex examples not abstract exercises.",
  },
  {
    icon: CodeBracketIcon,
    title: "Implementation",
    desc: "Coding strategies in Python, building backtesting frameworks — with generated code you can read, audit, and run.",
  },
  {
    icon: ChartBarIcon,
    title: "Validation",
    desc: "Realistic cost modelling (spreads, slippage, commission, financing) so you learn why naïve backtests fail in real trading.",
  },
  {
    icon: LightBulbIcon,
    title: "Decision‑Making",
    desc: "Learn how professional traders reason through scenarios with step-by-step analysis and transparent reasoning chains.",
  },
];

/* ── Market facts (Proposal §1) ── */
const facts = [
  { value: "$6T+", label: "Daily FX transaction volume" },
  { value: "100+", label: "Labeled earnings transcripts for training" },
  { value: "75%+", label: "Target directional signal accuracy" },
  { value: "6–8", label: "Jupyter notebooks with working code" },
];

const WhyPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const BG3 = isLight ? "#F5F2EC" : CHARCOAL3;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      {/* BG effects */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 80%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* ──── Hero ──── */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Why Choose Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Why ForexGPT?
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Quantitative finance education faces a critical gap: learners encounter fragmented resources that
            separate mathematical theory from practical implementation, leaving them unable to translate
            concepts into working trading systems. <strong className="text-[#C8A94A]">ForexGPT bridges that gap.</strong>
          </p>
        </Motion.div>
      </section>

      {/* ──── The Problem (Proposal §1) ──── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          The Educational Challenge
        </Motion.h2>

        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <Motion.div key={p.title} variants={item}
                className="relative rounded-2xl border p-6 flex items-start gap-4 overflow-hidden backdrop-blur"
                style={{ background: BG2, borderColor: `${GOLD}25`, color: TEXT }}
                whileHover={{ y: -4, boxShadow: `0 20px 50px rgba(212,175,55,0.12)` }}>
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl flex-shrink-0"
                  style={{ background: isLight ? "rgba(230,84,74,0.1)" : "#7A283020", color: "#E6544A" }}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: isLight ? "#9a7d30" : "#F0D880" }}>{p.title}</h3>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: MUTED }}>{p.desc}</p>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* ──── The Opportunity / What ForexGPT Connects (Proposal §1) ──── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-4 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          ForexGPT Connects It All
        </Motion.h2>
        <Motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center text-sm max-w-2xl mx-auto mb-10" style={{ color: isLight ? "#6b7280" : "#A89060" }}>
          There is no intelligent, domain‑specific, curriculum‑aligned educational tool that connects
          theory, implementation, validation, and decision-making until now.
        </Motion.p>

        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <Motion.div key={s.title} variants={item}
                className="relative rounded-2xl border p-6 text-center overflow-hidden"
                style={{ background: BG2, borderColor: `${GOLD}25`, color: TEXT }}
                whileHover={{ y: -5, boxShadow: `0 20px 50px rgba(212,175,55,0.14)` }}>
                <div className="absolute -inset-px rounded-2xl pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${GOLD}15, transparent 35%)` }} />
                <div className="relative">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mx-auto mb-3 transition-colors"
                    style={{
                      background: isLight ? "rgba(212,175,55,0.15)" : `${GOLD}15`,
                      color: isLight ? "#9a7d30" : GOLD_LIGHT
                    }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base" style={{ color: isLight ? "#9a7d30" : "#F0D880" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mt-2" style={{ color: MUTED }}>{s.desc}</p>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* ──── Key Numbers (Proposal §1, §8) ──── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {facts.map((f) => (
            <Motion.div key={f.label} variants={item}
              className="rounded-2xl border p-6 text-center"
              style={{ background: BG3, borderColor: `${GOLD}20`, color: TEXT }}>
              <div className="text-3xl md:text-4xl font-black" style={{ color: GOLD_LIGHT }}>{f.value}</div>
              <div className="text-xs mt-2 font-medium" style={{ color: MUTED }}>{f.label}</div>
            </Motion.div>
          ))}
        </Motion.div>
      </section>

      {/* ──── Quote / thesis (Proposal §10 Conclusion) ──── */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <Motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-2xl border p-8 md:p-10 text-center overflow-hidden"
          style={{ background: BG2, borderColor: `${GOLD}25` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(40rem 16rem at 50% 50%, rgba(212,175,55,0.06), transparent 70%)` }} />
          <p className="relative text-lg md:text-xl font-semibold leading-relaxed" style={{ color: TEXT }}>
            <span className="text-[#D4AF37]">"</span>ForexGPT addresses this gap by providing an intelligent educational mentor that teaches
            quantitative methods in an FX context through step-by-step reasoning, code generation, and
            realistic backtesting all without trading, predicting prices, or providing financial advice.<span className="text-[#D4AF37]">"</span>
          </p>
          <div className="relative mt-4 text-sm font-bold" style={{ color: GOLD }}>ForexGPT Project Proposal</div>
        </Motion.div>
      </section>

      {/* ──── CTA ──── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <Motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-2xl border p-10 text-center overflow-hidden"
          style={{ background: BG2, borderColor: `${GOLD}25` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(50rem 20rem at 50% 50%, rgba(212,175,55,0.08), transparent 70%)` }} />
          <h2 className="relative text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
            Ready to learn with an edge?
          </h2>
          <p className="relative mt-3 text-sm" style={{ color: MUTED }}>
            Join learners using AI-powered confluence analysis, strategy code generation, and realistic backtesting.
          </p>
          <a href="/register"
            className="relative inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-xl font-bold text-sm btn-glow shadow-lg"
            style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: CHARCOAL }}>
            Get Started Free →
          </a>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default WhyPage;
