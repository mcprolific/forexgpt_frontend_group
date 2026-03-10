// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import CountUp from "react-countup";
import { useTheme } from "../contexts/ThemeContext";
import {
  BoltIcon,
  CpuChipIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import AICopilot from "../components/AICopilot";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import LoadingScreen from "../components/ui/LoadingScreen";

/* ── Design tokens ─────────────────────────────────────── */
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const GOLD_DIM = "#B8960C";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";
const CHARCOAL3 = "#2E2E2E";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, when: "beforeChildren" } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

/* ── Data ───────────────────────────────────────────────── */
const topTraders = [
  { name: "Sarah Jenkins", trades: 24, win: 89.2 },
  { name: "Wei Chen", trades: 31, win: 85.7 },
  { name: "NeoTrader_X", trades: 18, win: 83.1 },
  { name: "Ahmed Al‑Sayed", trades: 27, win: 81.4 },
  { name: "Elena Rossi", trades: 14, win: 79.8 },
];

const features = [
  {
    icon: <CpuChipIcon className="h-6 w-6" />,
    title: "Instant Confluence",
    desc: "Combines technicals, news, and sentiment to score opportunities in seconds.",
  },
  {
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    title: "Risk‑First Logic",
    desc: "Tight risk with precise stops and position sizing on every single idea.",
  },
  {
    icon: <ClockIcon className="h-6 w-6" />,
    title: "24/7 Market Watch",
    desc: "Covers London, New York, and Asian sessions for continuous live alerts.",
  },
  {
    icon: <ChartBarIcon className="h-6 w-6" />,
    title: "Idea to Code",
    desc: "Generate readable strategy code and iterate quickly with backtests.",
  },
];

const achievements = [
  { title: "First Analysis", desc: "Complete your first AI analysis", icon: SparklesIcon },
  { title: "Streak Master", desc: "Win 5 trades in a row", icon: TrophyIcon },
  { title: "The 100 Club", desc: "Run 100 total analyses", icon: ChartBarIcon },
  { title: "Risk Guru", desc: "Maintain 80%+ win rate over 20 trades", icon: ShieldCheckIcon },
  { title: "Multi‑Asset", desc: "Trade across 5 different pairs", icon: BoltIcon },
  { title: "Legend", desc: "Reach Quant rank", icon: TrophyIcon },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Register and set your trading preferences in Settings." },
  { n: "02", title: "Describe your idea", desc: "Use Mentor or Signals to ask questions or paste transcripts." },
  { n: "03", title: "Generate & backtest", desc: "Review code and metrics, then iterate until performance is solid." },
  { n: "04", title: "Export & deploy", desc: "Download the strategy code and run it in your environment." },
];

const coreScreens = [
  { to: "/dashboard/transcript", label: "Signal Extraction" },
  { to: "/dashboard/mentor", label: "Educational Mentor" },
  { to: "/dashboard/strategy", label: "Code Generation" },
  { to: "/dashboard/backtest", label: "Backtesting" },
  { to: "/dashboard/learning", label: "Learning Hub" },
];

/* ══════════════════════════════════════════════════════════
   HomePage Component
══════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { toast, show } = useToast();
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Theme-aware design tokens
  const BG = isLight ? "#FAF9F6" : CHARCOAL;        // Main surface
  const BG2 = isLight ? "#F0EDE6" : CHARCOAL2;      // Alternate sections
  const BG3 = isLight ? "#F8F3E9" : CHARCOAL3;      // Inner cards / contrast sections
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#4B5563" : "rgba(255,255,255,0.70)";
  const BORDER = isLight ? `rgba(212,175,55,0.25)` : `${GOLD}18`;
  const SHADOW_CARD = isLight ? "0 20px 50px rgba(0,0,0,0.06)" : "0 20px 50px rgba(0,0,0,0.3)";

  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, []);

  const validate = (f) => {
    const e = {};
    if (!f.name || f.name.trim().length < 2) e.name = "Please enter your full name";
    if (!emailRegex.test(f.email)) e.email = "Enter a valid email address";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.name && nameRef.current) nameRef.current.focus();
      else if (e.email && emailRef.current) emailRef.current.focus();
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      show("Welcome aboard! We'll email you next steps.", "success");
      setForm({ name: "", email: "" });
    } catch {
      show("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setParallaxY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Render ─────────────────────────────────────────────── */
  const videoOpacity = Math.max(0, 1 - parallaxY / 700);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: BG, color: TEXT }}
    >
      {isLoading && <LoadingScreen />}

      {/* ── Background layers ── */}
      {/* Fade-in curtain */}
      <Motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55 }}
        className="pointer-events-none absolute inset-0 bg-black z-50"
      />

      {/* Hero Video Background */}
      <Motion.div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        style={{ opacity: videoOpacity }}
      >
        <video
          autoPlay muted loop playsInline
          className="absolute min-w-full min-h-full w-auto h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover contrast-[1.5] saturate-[1.2] brightness-[0.9]"
        >
          <source src="/src/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 z-10"
          style={{ background: `linear-gradient(to bottom, transparent 0%, ${BG} 85%), radial-gradient(circle at 50% 50%, transparent 0%, ${BG} 100%)` }}
        />
      </Motion.div>

      {/* Light mode hero gradient */}
      {
        isLight && (
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{ background: "radial-gradient(900px 500px at 50% -10%, rgba(212,175,55,0.12), transparent 70%)" }}
          />
        )
      }

      {/* Gold radial glows */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            `radial-gradient(900px 500px at 15% 0%, rgba(212,175,55,${isLight ? '0.08' : '0.15'}), transparent 65%),
             radial-gradient(700px 400px at 85% 20%, rgba(255,215,0,${isLight ? '0.05' : '0.1'}), transparent 65%)`,
        }}
      />

      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 dot-grid z-10 opacity-20" />

      {/* ── Nav ── */}
      <PublicNavbar />

      {/* ════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen max-w-6xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center justify-center text-center">

        {/* Badge */}
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}
        >
          <SparklesIcon className="h-3.5 w-3.5" />
          AI‑Powered Forex Intelligence
        </Motion.div>

        {/* Headline */}
        <Motion.div
          className="relative inline-block"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65 }}
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
            style={{
              color: "#D4AF37",
              textShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
            }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - r.left - r.width / 2;
              const y = e.clientY - r.top - r.height / 2;
              e.currentTarget.style.transform = `perspective(1000px) rotateX(${(-y / 90).toFixed(2)}deg) rotateY(${(x / 90).toFixed(2)}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
            }}
          >
            Trade Your Edge<br />With Logic &amp; Automation
          </h1>
          <span className="absolute -inset-x-40 -top-2 h-12 shine rounded-full" />
        </Motion.div>

        {/* Sub-headline */}
        <Motion.p
          className="mt-6 text-lg md:text-xl max-w-2xl leading-relaxed text-white/90"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          Analyze confluence across technicals, fundamentals, and sentiment in
          seconds. Get risk‑first trade ideas with clear stops and position sizing.
        </Motion.p>

        {/* CTA Buttons */}
        <Motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
              color: CHARCOAL,
            }}
          >
            Get Started Free
            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide border transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
            style={{ borderColor: isLight ? "rgba(26,26,26,0.35)" : `${GOLD}50`, color: isLight ? "#1A1A1A" : GOLD_LIGHT }}
          >
            Sign In
          </Link>
        </Motion.div>

        {/* Trust badges */}
        <Motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl"
        >
          {[
            "No credit card required",
            "50 free weekly credits",
            <><CountUp end={12847} separator="," duration={2.2} /> analyses today</>,
            <><CountUp end={73.2} decimals={1} duration={2.2} />% avg win rate</>,
          ].map((label, i) => (
            <Motion.div
              key={i}
              variants={item}
              className="relative rounded-lg border p-3 text-sm font-medium overflow-hidden text-center"
              style={{
                borderColor: `${GOLD}25`,
                background: isLight ? "rgba(255,255,255,0.70)" : `${CHARCOAL2}CC`,
                color: TEXT,
              }}
              whileHover={{ y: -3, boxShadow: `0 10px 40px rgba(212,175,55,0.15)` }}
            >
              <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.06), transparent 40%)" }} />
              <div className="relative">{label}</div>
            </Motion.div>
          ))}
        </Motion.div>

        {/* Waitlist form */}
        <Motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          aria-labelledby="waitlist-title"
          className="mt-10 w-full max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 backdrop-blur border rounded-xl p-4"
          style={{ background: isLight ? "rgba(255,255,255,0.80)" : `${CHARCOAL2}99`, borderColor: `${GOLD}25` }}
        >
          <p id="waitlist-title" className="sm:col-span-12 text-sm font-semibold mb-1" style={{ color: isLight ? "#000000" : GOLD_LIGHT }}>
            Join the waitlist be first when we launch
          </p>
          <div className="sm:col-span-5 relative group">
            <label
              htmlFor="name"
              className="absolute left-3 top-2.5 px-1 text-xs transition-all z-10"
              style={{
                color: form.name ? (isLight ? "#9a7d30" : GOLD) : "#6B7280",
                transform: form.name ? "translateY(-12px)" : undefined,
                background: form.name ? (isLight ? "#ffffff" : CHARCOAL2) : undefined,
              }}
            >
              Full name
            </label>
            <Input
              id="name"
              ref={nameRef}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder=" "
              aria-invalid={!!errors.name}
              className={`pt-5 pb-2 border-white/10 placeholder:text-transparent transition-all duration-300 ${errors.name ? "border-red-500/60" : ""}`}
              style={{
                "--tw-ring-color": GOLD,
                background: isLight ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.40)",
                color: TEXT
              }}
            />
            {errors.name && <div className="mt-1 text-xs text-red-400">{errors.name}</div>}
          </div>
          <div className="sm:col-span-5 relative group">
            <label
              htmlFor="email"
              className="absolute left-3 top-2.5 px-1 text-xs transition-all z-10"
              style={{
                color: form.email ? (isLight ? "#9a7d30" : GOLD) : "#6B7280",
                transform: form.email ? "translateY(-12px)" : undefined,
                background: form.email ? (isLight ? "#ffffff" : CHARCOAL2) : undefined,
              }}
            >
              Email address
            </label>
            <Input
              id="email"
              ref={emailRef}
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder=" "
              inputMode="email"
              aria-invalid={!!errors.email}
              className={`pt-5 pb-2 border-white/10 placeholder:text-transparent transition-all duration-300 ${errors.email ? "border-red-500/60" : ""}`}
              style={{
                background: isLight ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.40)",
                color: TEXT
              }}
            />
            {errors.email && <div className="mt-1 text-xs text-red-400">{errors.email}</div>}
          </div>
          <div className="sm:col-span-2 flex items-end">
            <Button
              type="submit"
              disabled={submitting}
              className={`w-full font-bold flex items-center justify-center gap-2 ${submitting ? "opacity-80 cursor-not-allowed" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: CHARCOAL,
              }}
              aria-busy={submitting}
            >
              {submitting ? <Spinner className="text-black" /> : null}
              {submitting ? "Joining…" : "Join"}
            </Button>
          </div>
          <div className="sm:col-span-12 text-left text-xs text-white/60">
            No spam. We'll only email important updates.
          </div>
        </Motion.form>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES / DIFFERENTIATORS
      ════════════════════════════════════════════════ */}
      <section id="differentiators" className="max-w-6xl mx-auto px-6 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
          >
            Instant Confluence. Safer Decisions.
          </h2>
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            Every tool you need to analyse, generate, and deploy winning strategies.
          </p>
        </Motion.div>

        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <Motion.div
              key={f.title}
              variants={item}
              className="relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden backdrop-blur"
              style={{
                background: isLight ? "#FFFFFF" : BG2,
                borderColor: isLight ? "rgba(0,0,0,0.05)" : `${GOLD}25`,
                color: TEXT,
                boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.04)" : undefined
              }}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: isLight ? "0 24px 64px rgba(0,0,0,0.08)" : `0 24px 64px rgba(212,175,55,0.18)`
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                e.currentTarget.style.transform = `perspective(900px) rotateX(${(-y / 100).toFixed(2)}deg) rotateY(${(x / 100).toFixed(2)}deg)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
              }}
            >
              {/* Glow strip */}
              <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{ background: `linear-gradient(180deg, ${GOLD}18, transparent 35%)` }} />
              {/* Icon */}
              <div
                className="inline-flex items-center justify-center h-11 w-11 rounded-xl"
                style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-base" style={{ color: "#F0D880" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
            </Motion.div>
          ))}
        </Motion.div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW THE AI HELPS
      ════════════════════════════════════════════════ */}
      <section
        id="how-ai-helps"
        className="relative overflow-hidden border-t border-b"
        style={{ borderColor: BORDER, background: isLight ? BG3 : `${CHARCOAL2}CC` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(60rem 24rem at 50% 0%, rgba(212,175,55,0.08), transparent 70%)` }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
            >
              How the AI Helps You
            </h2>
          </Motion.div>
          <Motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <ChatBubbleLeftRightIcon className="h-7 w-7" />,
                title: "Ask natural questions",
                desc: "Describe a market view or paste a transcript. The AI extracts context, risks, and candidate strategies.",
              },
              {
                icon: <CodeBracketIcon className="h-7 w-7" />,
                title: "Generate and explain",
                desc: "It produces readable code and explains entry, exit, and risk rationale so you truly understand the approach.",
              },
              {
                icon: <ChartBarIcon className="h-7 w-7" />,
                title: "Validate with backtests",
                desc: "Run backtests, inspect metrics, and iterate. Export when results match your trading standards.",
              },
            ].map((card) => (
              <Motion.div
                key={card.title}
                variants={item}
                className="relative p-8 rounded-2xl border overflow-hidden"
                style={{
                  background: isLight ? "#FFFFFF" : BG3,
                  borderColor: isLight ? "rgba(212,175,55,0.3)" : `${GOLD}25`,
                  color: TEXT,
                  boxShadow: SHADOW_CARD
                }}
                whileHover={{
                  y: -4,
                  boxShadow: isLight ? "0 30px 60px rgba(212,175,55,0.15)" : `0 20px 50px rgba(212,175,55,0.14)`
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)` }} />
                <div
                  className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-5"
                  style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}
                >
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#F0D880" }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{card.desc}</p>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TOP TRADERS LEADERBOARD
      ════════════════════════════════════════════════ */}

      {/* ════════════════════════════════════════════════
          ACHIEVEMENTS
      ════════════════════════════════════════════════ */}
      <section
        className="relative border-t"
        style={{ borderColor: BORDER, background: isLight ? "#FAF9F6" : BG2 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
            >
              Unlock Achievements. Level Up.
            </h2>
            <p className="mt-3 text-sm" style={{ color: MUTED }}>
              Earn badges as you grow your trading edge.
            </p>
          </Motion.div>
          <Motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <Motion.div
                  key={a.title}
                  variants={item}
                  className="flex items-start gap-4 p-5 rounded-2xl border"
                  style={{
                    background: isLight ? "#FFFFFF" : BG3,
                    borderColor: isLight ? "rgba(0,0,0,0.04)" : `${GOLD}22`,
                    color: TEXT,
                    boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.03)" : undefined
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: isLight ? "0 20px 50px rgba(0,0,0,0.06)" : `0 16px 48px rgba(212,175,55,0.12)`
                  }}
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GOLD}15`, color: GOLD_LIGHT }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#F0D880" }}>{a.title}</div>
                    <div className="text-xs mt-1 leading-relaxed" style={{ color: MUTED }}>{a.desc}</div>
                  </div>
                </Motion.div>
              );
            })}
          </Motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CORE SCREENS
      ════════════════════════════════════════════════ */}
      <section id="core-screens" className="max-w-6xl mx-auto px-6 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
          >
            Core Screens
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Navigate to any tool directly from the dashboard.
          </p>
        </Motion.div>
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {coreScreens.map((s) => (
            <Motion.div key={s.to} variants={item}>
              <Link
                to={s.to}
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center text-sm font-semibold transition-all duration-200"
                style={{
                  background: isLight ? "#FFFFFF" : BG2,
                  borderColor: isLight ? "rgba(0,0,0,0.06)" : `${GOLD}25`,
                  color: isLight ? "#9a7d30" : "#C8A94A",
                  boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.02)" : undefined
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${GOLD}12`;
                  e.currentTarget.style.borderColor = `${GOLD}70`;
                  e.currentTarget.style.color = GOLD_LIGHT;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(212,175,55,0.18)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BG2;
                  e.currentTarget.style.borderColor = `${GOLD}25`;
                  e.currentTarget.style.color = isLight ? "#9a7d30" : "#C8A94A";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <ArrowRightIcon className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                {s.label}
              </Link>
            </Motion.div>
          ))}
        </Motion.div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW TO USE — STEPS
      ════════════════════════════════════════════════ */}
      <section
        id="how-to-use"
        className="relative border-t"
        style={{ borderColor: BORDER, background: BG2 }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(80rem 30rem at 50% 0%, rgba(212,175,55,0.06), transparent 70%)` }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2
              className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
            >
              How to Use ForexGPT
            </h2>
          </Motion.div>

          <Motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {steps.map((s, idx) => (
              <Motion.div
                key={s.n}
                variants={item}
                className="relative rounded-2xl border p-6"
                style={{
                  background: isLight ? "#FFFFFF" : BG3,
                  borderColor: isLight ? "rgba(212,175,55,0.3)" : `${GOLD}22`,
                  color: TEXT,
                  boxShadow: SHADOW_CARD
                }}
                whileHover={{
                  y: -4,
                  boxShadow: isLight ? "0 30px 60px rgba(212,175,55,0.15)" : `0 16px 48px rgba(212,175,55,0.14)`
                }}
              >
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 -right-3 w-6 h-px"
                    style={{ background: `linear-gradient(90deg, ${GOLD}50, transparent)` }}
                  />
                )}
                <div className="text-3xl font-black mb-4" style={{ color: `${GOLD}30` }}>
                  {s.n}
                </div>
                <div className="font-bold text-sm mb-2" style={{ color: "#F0D880" }}>{s.title}</div>
                <p className="text-xs leading-relaxed" style={{ color: isLight ? "#6b7280" : "#7A6830" }}>{s.desc}</p>
              </Motion.div>
            ))}
          </Motion.div>

          {/* Final CTA */}
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14 flex flex-col items-center gap-3"
          >
            <p className="text-sm" style={{ color: isLight ? "#6b7280" : "#7A6830" }}>Ready to sharpen your edge?</p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: CHARCOAL,
              }}
            >
              Start Now — It's Free
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Motion.div>
        </div>
      </section>

      {/* AI Copilot widget */}
      {/* <AICopilot /> */}

      {toast && <Toast message={toast.message} type={toast.type} />}

      <PublicFooter />
    </div >
  );
};

export default HomePage;
