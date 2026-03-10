import React from "react";
import { motion as Motion } from "framer-motion";
import {
  FiBookOpen,
  FiPlayCircle,
  FiAward,
  FiChevronRight,
  FiStar,
  FiZap
} from "react-icons/fi";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const LearningPage = () => {
  const courses = [
    { title: "AI Signals Foundations", level: "Beginner", time: "45 min", progress: 100, status: "Completed" },
    { title: "Quant Logic & Backtesting", level: "Intermediate", time: "2.5 hours", progress: 65, status: "In Progress" },
    { title: "Transcript Alpha Extraction", level: "Advanced", time: "1.2 hours", progress: 0, status: "Locked" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiBookOpen className="text-yellow-500" />
            Trading <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Intelligence</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Master the art of AI-driven market analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Learning Tracks */}
        <div className="lg:col-span-2 space-y-6">
          <Motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4"
          >
            {courses.map((course, i) => (
              <Motion.div
                key={i}
                variants={item}
                className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group overflow-hidden relative"
              >
                <div className="flex items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/5">
                      {course.status === "Locked" ? <FiAward className="opacity-20" /> : <FiPlayCircle className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${course.level === 'Beginner' ? 'bg-green-500/20 text-green-500' :
                            course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                          }`}>
                          {course.level}
                        </span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">• {course.time}</span>
                      </div>
                      <h4 className="text-lg font-black text-white group-hover:text-yellow-500 transition-colors">{course.title}</h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{course.progress}% Complete</p>
                    <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Motion.div>
            ))}
          </Motion.div>
        </div>

        {/* Sidebar / Progress Overview */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Scholar Status</h3>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FiZap size={100} color={GOLD} />
            </div>

            <div className="relative z-10">
              <div className="h-20 w-20 rounded-full border-4 border-yellow-500/20 flex items-center justify-center mx-auto mb-4 text-yellow-500 text-2xl font-black">
                L3
              </div>
              <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Technical Analyst</h4>
              <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Next Rank: Quant Master</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black mb-1">XP EARNED</p>
                  <p className="text-lg font-black text-yellow-500">12,450</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black mb-1">LESSONS</p>
                  <p className="text-lg font-black text-yellow-500">18</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3 rounded-xl bg-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <FiStar /> Claim Rewards
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LearningPage;
