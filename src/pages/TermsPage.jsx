import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const TermsPage = () => {
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
                            Terms of <span className="text-[#D4AF37]">Service</span>
                        </h1>
                        <p className="text-white/40 tracking-widest uppercase text-[10px] font-bold">
                            Last Updated: March 2026
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#F0D880]">1. Educational Research Only</h2>
                        <p className="leading-relaxed">
                            ForexGPT is a specialized platform designed exclusively for educational research and strategy development. All tools, including AI-driven confluence and signal extraction, are meant to be used as data reference points and NOT as direct financial advice.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#F0D880]">2. No Financial Liability</h2>
                        <p className="leading-relaxed">
                            The architects and engineers behind ForexGPT assume no liability for financial losses. Trading carries significant risk; our AI provides intelligence, but the user remains the sole decision-maker for all execution.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#F0D880]">3. Account Responsibility</h2>
                        <p className="leading-relaxed">
                            Users are responsible for maintaining the security of their institutional access keys and login credentials. Any activity performed through a user's terminal is their sole responsibility.
                        </p>

                        
                    </section>

                    <section className="space-y-4 pt-10 border-t border-white/5 text-sm italic text-white/40 text-center">
                        By initializing your profile, you acknowledge and agree to these institutional research standards.
                    </section>
                </Motion.div>
            </div>

            <PublicFooter />
        </div>
    );
};

export default TermsPage;
