import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const ResearchDisclosurePage = () => {
    return (
        <div className="relative min-h-screen bg-[#1A1A1A] text-white/90 selection:bg-[#D4AF37]/30">
            <PublicNavbar />

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black text-white mb-4">
                            Research <span className="text-[#D4AF37]">Disclosure</span>
                        </h1>
                        <p className="text-white/40 tracking-widest uppercase text-[10px] font-bold">
                            Institutional Standard
                        </p>
                    </div>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#F0D880]">The Nature of AI Logic</h2>
                        <p className="leading-relaxed">
                            Our AI models leverage historical price action, real-time sentiment, and institutional order flow data. While highly sophisticated, these results represent a <span className="text-white font-semibold">statistical probability</span>, not a certainty.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                            <h3 className="font-bold text-[#D4AF37] mb-2">Academic Foundation</h3>
                            <p className="text-sm">
                                ForexGPT is built on the premise of "Algorithmic Confluence Research." We aim to reduce the noise of retail trading by providing institutional-grade data interpretation.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#F0D880]">No Individual Advocacy</h2>
                        <p className="leading-relaxed">
                            We do not advocate for specific trades or market directions. Our mission is to provide you with the tools to perform your own rigorous quantitative analysis.
                        </p>
                    </section>

                    <section className="space-y-4 pt-10 border-t border-white/5 text-sm text-white/40 text-center">
                        "Knowledge is the only currency that never devalues in the markets."
                    </section>
                </Motion.div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default ResearchDisclosurePage;
