import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-100 overflow-hidden">
      <PublicNavbar />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/70 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gold-gradient">
            About
          </h1>
          <p className="mt-3 text-white/80">Our mission is to make risk‑first, explainable trading education accessible.</p>
        </Motion.div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default AboutPage;
