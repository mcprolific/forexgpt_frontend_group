// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import CountUp from "react-countup";
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
} from "@heroicons/react/24/outline";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const HomePage = () => {
  const topTraders = [
    { name: "Sarah Jenkins", trades: 24, win: 89.2 },
    { name: "Wei Chen", trades: 31, win: 85.7 },
    { name: "NeoTrader_X", trades: 18, win: 83.1 },
    { name: "Ahmed Al‑Sayed", trades: 27, win: 81.4 },
    { name: "Elena Rossi", trades: 14, win: 79.8 },
  ];
  const achievements = [
    { title: "First Analysis", desc: "Complete your first AI analysis", icon: <SparklesIcon className="h-6 w-6 text-indigo-600" /> },
    { title: "Streak Master", desc: "Win 5 trades in a row", icon: <TrophyIcon className="h-6 w-6 text-indigo-600" /> },
    { title: "The 100 Club", desc: "Run 100 total analyses", icon: <ChartBarIcon className="h-6 w-6 text-indigo-600" /> },
    { title: "Risk Guru", desc: "Maintain 80%+ win rate over 20 trades", icon: <ShieldCheckIcon className="h-6 w-6 text-indigo-600" /> },
    { title: "Multi‑Asset", desc: "Trade across 5 different pairs", icon: <BoltIcon className="h-6 w-6 text-indigo-600" /> },
    { title: "Legend", desc: "Reach Quant rank", icon: <TrophyIcon className="h-6 w-6 text-indigo-600" /> },
  ];
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, when: "beforeChildren" },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-indigo-100 to-white overflow-hidden">
      {/* Animated background accents */}
      <div className="pointer-events-none absolute inset-0 animate-gradient" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-indigo-300/30 blob" />
      <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-pink-300/30 blob" style={{ animationDelay: "1.2s" }} />
      <div className="pointer-events-none absolute bottom-10 right-1/3 h-56 w-56 rounded-full bg-cyan-300/30 blob" style={{ animationDelay: "2s" }} />
      <PublicNavbar />

      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center text-center">
        <Motion.h1
          className="text-4xl md:text-6xl font-extrabold text-indigo-700 leading-tight"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Trade Your Edge With Logic & Automation
        </Motion.h1>

        <Motion.p
          className="mt-6 text-lg md:text-xl text-gray-700 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Analyze confluence across technicals, fundamentals, and sentiment in seconds. Get risk‑first trade ideas with clear stops and position sizing.
        </Motion.p>

        <Motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/register"
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition inline-flex"
            aria-label="Get started for free"
            onMouseDown={(e) => e.currentTarget.classList.add("scale-[0.98]")}
            onMouseUp={(e) => e.currentTarget.classList.remove("scale-[0.98]")}
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-lg border border-indigo-600 text-indigo-700 font-semibold hover:bg-indigo-100 transition inline-flex"
            aria-label="Sign in"
            onMouseDown={(e) => e.currentTarget.classList.add("scale-[0.98]")}
            onMouseUp={(e) => e.currentTarget.classList.remove("scale-[0.98]")}
          >
            Sign In
          </Link>
        </Motion.div>
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-3 w-full"
        >
          <Motion.div variants={item} className="rounded-lg border bg-white p-3 text-sm text-gray-700">No credit card required</Motion.div>
          <Motion.div variants={item} className="rounded-lg border bg-white p-3 text-sm text-gray-700">50 free weekly credits</Motion.div>
          <Motion.div variants={item} className="rounded-lg border bg-white p-3 text-sm text-gray-700">
            <span className="text-gray-800 font-semibold">
              <CountUp end={12847} separator="," duration={2.2} /> analyses today
            </span>
          </Motion.div>
          <Motion.div variants={item} className="rounded-lg border bg-white p-3 text-sm text-gray-700">
            <span className="text-gray-800 font-semibold">
              <CountUp end={73.2} decimals={1} duration={2.2} />% avg win rate
            </span>
          </Motion.div>
        </Motion.div>
      </section>

      <section id="differentiators" className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Instant Confluence. Safer Decisions.
        </Motion.h2>

        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Motion.div variants={item} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3" whileHover={{ y: -4, scale: 1.01 }}>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600">
              <CpuChipIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Instant Confluence</h3>
            <p className="text-sm text-gray-600">Combines technicals, news, and sentiment to score opportunities fast.</p>
          </Motion.div>

          <Motion.div variants={item} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3" whileHover={{ y: -4, scale: 1.01 }}>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Risk‑First Logic</h3>
            <p className="text-sm text-gray-600">Tight risk with precise stops and position sizing on every idea.</p>
          </Motion.div>

          <Motion.div variants={item} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3" whileHover={{ y: -4, scale: 1.01 }}>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">24/7 Watch</h3>
            <p className="text-sm text-gray-600">Covers London, New York, and Asian sessions for continuous alerts.</p>
          </Motion.div>

          <Motion.div variants={item} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3" whileHover={{ y: -4, scale: 1.01 }}>
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">From Idea To Code</h3>
            <p className="text-sm text-gray-600">Generate readable strategy code and iterate with backtests.</p>
          </Motion.div>
        </Motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Top Traders This Week
        </Motion.h2>
        <Motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-6 bg-white rounded-xl shadow divide-y"
        >
          {topTraders.map((t, i) => (
            <Motion.div variants={item} key={t.name} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <div>
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.trades} trades</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600">{t.win}% win rate</div>
            </Motion.div>
          ))}
        </Motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Unlock Achievements. Level Up Your Trading.
        </Motion.h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((a) => (
            <div key={a.title} className="bg-white rounded-xl shadow p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">{a.icon}</div>
              <div>
                <div className="font-semibold text-gray-900">{a.title}</div>
                <div className="text-sm text-gray-600">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-ai-helps" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Motion.h2
            className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How the AI helps you
          </Motion.h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Ask natural questions</h3>
              </div>
              <p className="text-sm text-gray-600">Describe a market view or paste a transcript. The AI extracts context, risks, and candidate strategies.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <CodeBracketIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Generate and explain</h3>
              </div>
              <p className="text-sm text-gray-600">It produces readable code and explains entry, exit, and risk rationale so you understand the approach.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Validate with backtests</h3>
              </div>
              <p className="text-sm text-gray-600">Run backtests, inspect metrics, and iterate. Export when results match your standards.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="core-screens" className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Core Screens
        </Motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link to="/dashboard/transcript" className="block bg-white rounded-xl shadow p-5 text-center hover:shadow-md transition">Signal Extraction</Link>
          <Link to="/dashboard/mentor" className="block bg-white rounded-xl shadow p-5 text-center hover:shadow-md transition">Educational Mentor</Link>
          <Link to="/dashboard/strategy" className="block bg-white rounded-xl shadow p-5 text-center hover:shadow-md transition">Code Generation</Link>
          <Link to="/dashboard/backtest" className="block bg-white rounded-xl shadow p-5 text-center hover:shadow-md transition">Backtesting</Link>
          <Link to="/dashboard/learning" className="block bg-white rounded-xl shadow p-5 text-center hover:shadow-md transition">Learning Hub</Link>
        </div>
      </section>

      <section id="how-to-use" className="max-w-6xl mx-auto px-6 py-12">
        <Motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How to use ForexGPT
        </Motion.h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-xs font-semibold text-indigo-600">Step 1</div>
            <div className="mt-1 font-semibold">Create your account</div>
            <p className="mt-2 text-sm text-gray-600">Register and set your trading preferences in Settings.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-xs font-semibold text-indigo-600">Step 2</div>
            <div className="mt-1 font-semibold">Describe your idea</div>
            <p className="mt-2 text-sm text-gray-600">Use the Mentor or Signals page to ask questions or paste transcripts.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-xs font-semibold text-indigo-600">Step 3</div>
            <div className="mt-1 font-semibold">Generate & backtest</div>
            <p className="mt-2 text-sm text-gray-600">Review code and metrics, then iterate until performance is acceptable.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <div className="text-xs font-semibold text-indigo-600">Step 4</div>
            <div className="mt-1 font-semibold">Export & deploy</div>
            <p className="mt-2 text-sm text-gray-600">Download the strategy code and run it in your environment.</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/register"
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Start Now
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default HomePage;
