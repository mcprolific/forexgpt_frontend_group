import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <Motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600">Quick links to your learning tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/learning" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">Learning Hub</h2>
          <p className="mt-2 text-gray-500">Browse modules and track progress.</p>
        </Link>
        <Link to="/dashboard/mentor" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">Mentor AI</h2>
          <p className="mt-2 text-gray-500">Ask questions, get step-by-step help.</p>
        </Link>
        <Link to="/dashboard/transcript" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">Signal Extraction</h2>
          <p className="mt-2 text-gray-500">Extract and review signals from text.</p>
        </Link>
        <Link to="/dashboard/strategy" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">Strategy Lab</h2>
          <p className="mt-2 text-gray-500">Turn ideas into backtestable code.</p>
        </Link>
        <Link to="/dashboard/backtest" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">Backtesting</h2>
          <p className="mt-2 text-gray-500">Run and analyze results.</p>
        </Link>
        <Link to="/dashboard/history" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition block">
          <h2 className="text-lg font-semibold text-gray-700">History</h2>
          <p className="mt-2 text-gray-500">See your recent activity.</p>
        </Link>
      </div>
    </Motion.div>
  );
};

export default DashboardPage;
