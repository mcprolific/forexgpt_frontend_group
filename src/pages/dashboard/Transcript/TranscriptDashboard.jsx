import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    FiFileText,
    FiZap,
    FiArrowRight,
    FiActivity,
    FiCpu,
    FiTrendingUp,
    FiClock
} from "react-icons/fi";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const TranscriptDashboard = () => {
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <FiFileText className="text-yellow-500" />
                        Transcript <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Intelligence</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Uncover institutional alpha buried in corporate transcripts.</p>
                </div>
            </div>

            {/* Main Feature Guide */}
            <Motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                <Motion.div
                    variants={item}
                    className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:border-yellow-500/20 transition-all border-l-4 border-l-yellow-500/40"
                >
                    <div>
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                            <FiZap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Signal Extraction</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                            Paste earnings call transcripts to identify currency headwinds and sentiment shifts using institutional-grade NLP.
                        </p>
                    </div>
                    <Link to="/dashboard/signals" className="flex items-center gap-2 text-yellow-500 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                        Launch Extractor <FiArrowRight />
                    </Link>
                </Motion.div>

                <Motion.div
                    variants={item}
                    className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:border-yellow-500/20 transition-all border-l-4 border-l-white/10"
                >
                    <div>
                        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 mb-6 group-hover:scale-110 transition-transform">
                            <FiCpu className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">AI Strategy Mentor</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                            Discuss market reports with our AI Mentor to understand complex macro-economic indicators and their FX impact.
                        </p>
                    </div>
                    <Link to="/dashboard/mentor" className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all hover:text-white">
                        Consult AI <FiArrowRight />
                    </Link>
                </Motion.div>
            </Motion.div>

            {/* Capabilities List */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Alpha Extraction Matrix</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Pair Detection', desc: 'Identify affected FX crosses.', icon: FiTrendingUp },
                        { label: 'Sentiment Vector', desc: 'Measure institutional optimism.', icon: FiActivity },
                        { label: 'Historical Context', desc: 'Compare with past transcripts.', icon: FiClock },
                    ].map((cap, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                    <cap.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-black text-gray-200 uppercase tracking-tighter">{cap.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{cap.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TranscriptDashboard;
