import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <Motion.div
      className="p-6 space-y-6 min-h-screen bg-[#1A1A1A]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-gold-gradient">Student Dashboard</h1>
        <p className="text-white/60">Quick links to your learning tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/learning" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">Learning Hub</h2>
          <p className="mt-2 text-white/60">Browse modules and track progress.</p>
        </Link>
        <Link to="/dashboard/mentor" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">Mentor AI</h2>
          <p className="mt-2 text-white/60">Ask questions, get step-by-step help.</p>
        </Link>
        <Link to="/dashboard/transcript" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">Signal Extraction</h2>
          <p className="mt-2 text-white/60">Extract and review signals from text.</p>
        </Link>
        <Link to="/dashboard/strategy" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">Strategy Lab</h2>
          <p className="mt-2 text-white/60">Turn ideas into backtestable code.</p>
        </Link>
        <Link to="/dashboard/backtest" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">Backtesting</h2>
          <p className="mt-2 text-white/60">Run and analyze results.</p>
        </Link>
        <Link to="/dashboard/history" className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl transition hover:border-[#D4AF37]/50 block group">
          <h2 className="text-lg font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors">History</h2>
          <p className="mt-2 text-white/60">See your recent activity.</p>
        </Link>
      </div>
    </Motion.div>
  );
};

export default DashboardPage;
