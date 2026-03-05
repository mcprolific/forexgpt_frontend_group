import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../context/ThemeContext";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";

const timeline = [
  {
    phase: "Week 1 (Day 1-3)",
    title: "Concept & Mission",
    desc: "ForexGPT was conceived as an AI-driven educational framework designed to bridge retail forex learning and institutional quantitative FX analysis.",
  },
  {
    phase: "Week 1 (Day 4-7)",
    title: "Integrated System Design",
    desc: "By integrating narrative signal extraction from earnings call transcripts with rigorous quantitative modeling, structured strategy generation, and realistic backtesting validation, the system provides a controlled environment for learning institutional-level FX thinking without executing live trades.",
  },
  {
    phase: "Week 2 (Day 8-10)",
    title: "Data Foundation & ML Infrastructure",
    desc: `The planning phase of the ForexGPT project focused on establishing the data foundation, technical infrastructure, and structured annotation framework necessary for building a domain-specialized financial language model centered on foreign exchange (forex) exposure analysis.
1. Strategic Data Acquisition
A targeted dataset development initiative was undertaken to collect earnings call transcripts from globally diversified corporations with significant foreign exchange exposure. These included multinational firms such as Alphabet, Amazon, Intel, Pfizer, Shell, Unilever, Microsoft, Apple, Coca-Cola, Procter & Gamble, TSMC, ExxonMobil, Siemens, SAP, LVMH, Toyota, Sony, and others.
To ensure scalability and reproducibility:
Automated scripts were developed to download raw transcripts from Google Drive.
A structured local data directory (data/raw) was established to organize and manage collected files.
Standardized naming and metadata conventions were implemented to support traceability and future dataset expansion.
This created a high-quality, real-world financial text corpus aligned with ForexGPT’s analytical objectives.
2. Infrastructure Setup for Model Development
The foundational machine learning infrastructure required for fine-tuning and experimentation was successfully established:
Hugging Face environment configured for model management and deployment.
Weights & Biases (W&B) integrated for experiment tracking and performance monitoring.
Lightning AI environment prepared to support scalable fine-tuning workflows.
This infrastructure ensures reproducibility, structured experimentation, and deployment readiness.`,
  },
  {
    phase: "Week 2 (Day 11-14)",
    title: "Preprocessing Pipeline",
    desc: `3. Preprocessing Pipeline Design
A comprehensive preprocessing framework was designed to convert raw transcripts into model-ready structured inputs. This includes:
Text cleaning protocols to remove formatting noise and inconsistencies.
Intelligent chunking strategies to optimize context window usage.
Speaker identification logic to differentiate executives, analysts, and operators for contextual learning.
This pipeline guarantees consistency and high-quality input preparation for supervised training.`,
  },
  {
    phase: "Week 3 (Day 15-17)",
    title: "Architecture Build‑out & Fine‑Tuning",
    desc: `This week focused on infrastructure build-out, core system architecture design, model fine-tuning execution, and prompt optimization for the ForexGPT platform. The objective was to transition from research and planning into implementation while validating our AI training pipeline.
On the backend, we successfully deployed our database infrastructure using Supabase, where we created the project environment and defined a structured schema covering users, transcripts, trading signals, and backtests. This establishes a scalable and production-ready data layer. In parallel, we built the foundational API layer using FastAPI, structuring routes and services to support authentication, model interaction, and backtesting endpoints.
On the frontend, we initialized the user interface using React, implementing routing and a base layout to prepare for dashboard integration. 
From the AI system perspective, we drafted and refined system prompts across three core modules.`,
  },
  {
    phase: "Week 3 (Day 18-19)",
    title: "Mentor, Code & Backtesting Alignment",
    desc: `Educational Mentor behavior (structured forex explanations)
Code Generation (strategy → Python trading logic)
Backtesting prompt alignment
We designed the backtesting engine logic, defining entry/exit rules, position sizing methodology, and transaction cost modeling to ensure realistic trading simulation outputs.
For model optimization, we configured LoRA fine-tuning parameters (rank 8, alpha 16, learning rate 2e-4, batch size 4, 3 epochs) and launched training on Hugging Face infrastructure. Training was monitored through loss curves and validation metrics. However, initial evaluation on the held-out test set revealed suboptimal learning performance, indicating underfitting and limited strategy generalization.
To address this, we initiated parameter adjustments and retraining, refining hyperparameters and improving dataset alignment. Evaluation scripts were finalized to compute model accuracy and structured output consistency. Prompt refinement was also conducted based on real user queries to improve response structure and instructional clarity.
Despite the training setback, infrastructure, architecture, and system integration components were completed as planned. The retraining process is underway, and by the coming week, we expect to have a fully functional integrated prototype with model performance meeting our baseline quality threshold.`,
  },
  {
    phase: "Week 3 (Day 20-21)",
    title: "Specialized Model & Deploy",
    desc: ``,
  },
];

const AboutOurStoryPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.80)";
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      {/* BG effects */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 30% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(600px 400px at 70% 90%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Our Story
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            ForexGPT began with a simple belief: every trader and learner deserves access to the kind of
            AI-powered quantitative finance education that was once reserved for institutional desks.
          </p>
        </Motion.div>
      </section>

      {/* Origin block */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <Motion.div initial={{ opacity: 0, scale: 0.97, filter: "blur(2px)" }} whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} viewport={{ once: true }}
          whileHover={{ y: -4, scale: 1.01, boxShadow: `0 18px 48px ${GOLD}22` }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border p-8 md:p-10 text-center overflow-hidden"
          style={{ background: BG2, borderColor: `${GOLD}25` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(40rem 16rem at 50% 50%, rgba(212,175,55,0.06), transparent 70%)` }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
          <p className="relative text-lg md:text-xl font-medium leading-relaxed italic" style={{ color: TEXT }}>
            "ForexGPT represents a new paradigm for quantitative finance education: using AI not to automate
            trading, but to empower learners with transparent, reasoning-driven mentoring."
          </p>
          <div className="relative mt-4 text-sm font-bold" style={{ color: GOLD }}>Project Proposal, Conclusion §10</div>
        </Motion.div>
      </section>

      {/* Development Timeline */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <Motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
          Development Timeline (Week 1-3)
        </Motion.h2>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px"
            style={{ background: `linear-gradient(180deg, transparent, ${GOLD}40, ${GOLD}40, transparent)` }} />

          {timeline.map((t, i) => (
            <Motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, filter: "blur(2px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              whileHover={{ y: -4, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 z-10"
                style={{ borderColor: GOLD_LIGHT, background: BG }} />
              <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] rounded-2xl border p-5 relative ${i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto"}`}
                style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50, transparent)` }} />
                <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: GOLD }}>{t.phase}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#F0D880" }}>{t.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{t.desc}</p>
              </div>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <Motion.div initial={{ opacity: 0, y: 16, filter: "blur(2px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }}
          whileHover={{ y: -4, scale: 1.01, boxShadow: `0 18px 48px ${GOLD}22` }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border p-8 relative overflow-hidden" style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
          <h2 className="text-center text-xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
            Impact & Significance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: MUTED }}>
            <div>
              <h4 className="font-semibold mb-1" style={{ color: "#F0D880" }}>Educational</h4>
              <p>Accessibility: high-quality education without expensive platforms. Interactivity: learn by asking questions and seeing reasoning.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1" style={{ color: "#F0D880" }}>Technical</h4>
              <p>Fine-tuning effectiveness: domain-specific models beat generic models. Transparent reasoning chains build trust.</p>
            </div>
          </div>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutOurStoryPage;
