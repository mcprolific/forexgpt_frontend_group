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
  hidden: { opacity: 0, y: 18, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const TranscriptPage = () => {
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
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 80%, rgba(255,215,0,0.06), transparent 65%)` }} />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: -80, y: -40 }}
        animate={{ opacity: 0.3, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `${GOLD}33` }}
      />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: 80, y: 40 }}
        animate={{ opacity: 0.25, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl"
        style={{ background: `${GOLD_LIGHT}26` }}
      />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      <section className="max-w-6xl mx-auto px-6 pt-28 pb-8 text-center">
        <Motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Signals Guide
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Transcript Signals
          </h1>
          <p className="mt-5 text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Extract actionable forex insights from earnings call transcripts. This page explains the API, authentication, errors,
            request and response shapes, and recommended rendering patterns section by section.
          </p>
        </Motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}18, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              What It Does
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              Transcript Signals turns long earnings call transcripts into a simple, readable summary:
              which currency pair is affected, the likely direction, how confident the signal is, the time horizon,
              and a short explanation of why. It helps you spot FX headwinds or tailwinds without reading every word.
            </p>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, backgroundSize: "200% 100%" }}>
              What You Get
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>Currency Pair: e.g., EUR/USD (or “Unknown pair” if unclear).</li>
              <li>Direction: LONG, SHORT, or NEUTRAL.</li>
              <li>Confidence: a percentage to gauge strength.</li>
              <li>Time Horizon: current quarter, next quarter, or longer term.</li>
              <li>Reasoning: a brief explanation of the drivers (e.g., USD strength).</li>
            </ul>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              How To Use It
            </h2>
            <ol className="list-decimal pl-5 text-sm space-y-2" style={{ color: MUTED }}>
              <li>Open Transcript Signals from the navigation.</li>
              <li>Paste the transcript text or upload a .txt or .md file.</li>
              <li>Optionally enter the company name to provide context.</li>
              <li>Choose whether to save the result to your account.</li>
              <li>Click Extract Signal to analyze the transcript.</li>
              <li>Review the result card: pair, direction, confidence, horizon, and reasoning.</li>
            </ol>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Interpreting Results
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>If no signal is found, you’ll see a brief note explaining why.</li>
              <li>Unknown fields mean the model detected something but couldn’t identify specifics.</li>
              <li>Confidence helps you gauge reliability, but it’s not a guarantee.</li>
              <li>Use the reasoning to understand the underlying driver (e.g., currency headwinds).</li>
            </ul>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Tips For Better Signals
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>Prefer full transcripts over short excerpts for context.</li>
              <li>Include the company name when available.</li>
              <li>Remove tables or boilerplate that aren’t part of the spoken content.</li>
              <li>Look for explicit mentions of currency impact, hedging, or FX sensitivity.</li>
            </ul>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Save & Manage
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              When you choose to save, your result is stored in your account so you can review it later from the
              Signal Analysis area. You can organize, filter, and delete past signals from there.
            </p>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Benefits
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>Save time scanning long transcripts.</li>
              <li>Consistent, structured summaries to compare across companies and quarters.</li>
              <li>Clear reasoning to help you learn and verify the conclusion.</li>
              <li>Simple outputs you can track and revisit later.</li>
            </ul>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}12, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Privacy & Safety
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>Your content is only saved if you choose to save it.</li>
              <li>No trading advice — use results for learning and research.</li>
              <li>You control your saved signals and can remove them at any time.</li>
            </ul>
          </Motion.div>

          <Motion.div
            variants={item}
            whileHover={{ y: -6, scale: 1.01, boxShadow: `0 15px 45px ${GOLD}30` }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative rounded-2xl border p-6 overflow-hidden"
            style={{ background: BG3, borderColor: `${GOLD}22`, color: TEXT }}
          >
            <div className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${GOLD}10, transparent 35%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
            <h2 className="text-2xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              Common Issues
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MUTED }}>
              <li>Empty input: paste text or upload a .txt/.md file.</li>
              <li>Not logged in: log in to save results to your account.</li>
              <li>File issues: only plain text or markdown are supported for upload.</li>
              <li>No signal: try a fuller transcript or include the company name.</li>
            </ul>
          </Motion.div>
        </Motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default TranscriptPage;
