import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import avatarDev from "../assets/mcp.jpg";
import avatarEng from "../assets/NCC_logo.png";
import { useTheme } from "../contexts/ThemeContext";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";
const CHARCOAL3 = "#2E2E2E";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TeamNamesPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : "#1A1A1A";
  const BG2 = isLight ? "rgba(255,255,255,0.90)" : "rgba(18,18,18,0.80)";
  const TEXT = isLight ? "#1A1A1A" : "#ffffff";
  const MUTED = isLight ? "#6b7280" : "#D4AF37";
  const groups = [
    {
      title: "AI Development Squad (Frontend & Backend)",
      color: "#D4AF37",
      members: [
        {
          name: "Saka Idris Ajayi",
          role: "Frontend Architect (AI Developer)",
          portfolio: "https://idris-saka.vercel.app/",
          linkedin: "https://www.linkedin.com/in/saka-idris-906a0b256/",
          image: avatarDev,
          bio: "Leads UI architecture: React/Vite, design systems, and performance-focused UX"
        },
        {
          name: "Odushile Omodolapo Odunayo",
          role: "Backend Lead (AI Developer)",
          portfolio: "https://www.linkedin.com/in/omodolapo-odushile-8a9494383",
          linkedin: "https://www.linkedin.com/in/omodolapo-odushile-8a9494383",
          image: avatarEng,
          bio: "Backend Lead: FastAPI services, authentication, and robust API design"
        },
        {
          name: "Sanni Abolore",
          role: "Database Lead (AI Developer)",
          portfolio: "#",
          linkedin: "https://github.com/O-R-E001-dotcom",
          image: avatarEng,
          bio: "Database lead — Handled database schema, authentication, integration and error handling."
        },

        {
          name: "Odeleye Rukayat Ajoke",
          role: "Frontend Developer (AI Developer)",
          portfolio: "#",
          linkedin: "#",
          image: avatarEng,
          bio: "Dashboard UI: charts, tables, and responsive component implementation"
        },
      ],
    },
    {
      title: "AI Engineering Elite",
      color: "#B8960C",
      members: [
        {
          name: "Rasak Akeem Olasunkanmi",
          role: "AI Engineer (Team Lead)",
          portfolio: "https://github.com/RasakOlasunkanmi",
          linkedin: "#",
          image: avatarEng,
          bio: "Backtesting engine and model fine‑tuning; leads technical direction"
        },
        {
          name: "Victor Ridwan Ademuyiwa",
          role: "AI Engineer",
          portfolio: "#",
          linkedin: "#",
          image: avatarEng,
          bio: "Codegen, signals, mentor services & prompts; model fine‑tuning and integration"
        },
        {
          name: "Bello Oluwadamilare",
          role: "AI Engineer",
          portfolio: "#",
          linkedin: "#",
          image: avatarEng,
          bio: "Backend (Preprocessing, Labelling and Finetuning)"
        },
        {
          name: "Olaiya Oluwaseun Solomon",
          role: "AI Engineer",
          portfolio: "#",
          linkedin: "https://www.linkedin.com/in/solomon-olaiya-028610356/",
          image: avatarEng,
          bio: "Fine‑tuning, model evaluation and reporting"
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden selection:bg-[#D4AF37]/30"
      style={{ background: BG, color: TEXT }}>
      {/* Fixed Navbar */}
      <PublicNavbar />

      {/* Premium Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `radial-gradient(${isLight ? "#000" : "#fff"} 1.2px, transparent 1.2px)`, backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
            Institutional Group Project
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            The 8 Elite <br />
            <span className="text-gold-gradient">Power Players</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.60)" }}>
            A diverse collective of 8 specialists collaborating to redefine automated intelligence.
            4 AI Developers (Frontend/Backend) and 4 dedicated AI Engineers.
          </p>
        </Motion.div>

        {groups.map((g, gIdx) => (
          <div key={g.title} className="space-y-12 mb-20">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center mb-24 gap-4"
            >
              <div className="flex items-center justify-center gap-8 w-full">
                <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                <h2
                  className="text-center font-black tracking-[0.2em] text-2xl md:text-4xl uppercase px-4 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-700 hover:scale-105"
                  style={{
                    color: g.color,
                    textShadow: `0 0 20px ${g.color}44, 0 0 40px ${g.color}22`
                  }}
                >
                  {g.title}
                </h2>
                <div className="h-px w-full max-w-[200px] bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-transparent" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.8em] text-[#D4AF37]/40 font-bold" style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}>
                Nigeria Communication Commission
              </span>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {g.members.map((m, idx) => (
                <Motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  {/* Card Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-[#D4AF37]/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

                  <div className="relative h-full backdrop-blur-xl border p-8 rounded-3xl flex flex-col items-center text-center transition-all duration-300"
                    style={{
                      background: BG2,
                      borderColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)",
                      boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.03)" : undefined
                    }}>
                    <div className="w-24 h-24 rounded-full border flex items-center justify-center mb-6 overflow-hidden group-hover:border-[#D4AF37]/50 transition-all duration-300"
                      style={{
                        background: isLight ? "rgba(0,0,0,0.05)" : "linear-gradient(135deg, #1A1A1A, #0A0A0A)",
                        borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(212,175,55,0.2)"
                      }}>
                      {m.image ? (
                        <img src={m.image} alt={m.name} className={`w-full h-full object-cover transition-opacity ${isLight ? "opacity-90" : "opacity-60"} group-hover:opacity-100`} />
                      ) : (
                        <span className="text-4xl font-black text-[#D4AF37]/30">{m.name.charAt(0)}</span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-1 group-hover:text-[#F0D880] transition-colors" style={{ color: TEXT, fontFamily: "'Outfit', sans-serif" }}>
                      {m.name}
                    </h3>
                    <div className="flex flex-col items-center gap-1 mb-4">
                      <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">
                        {m.role}
                      </p>
                      {m.linkedin && m.linkedin !== "#" && (
                        <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400/60 hover:text-blue-400 transition-colors flex items-center gap-1">
                          LinkedIn Profile ↗
                        </a>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed mb-8 flex-grow" style={{ color: isLight ? "#6b7280" : "#6b7280" }}>
                      {m.bio}
                    </p>

                    <a
                      href={m.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                    >
                      View Portfolio
                    </a>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <PublicFooter />
    </div>
  );
};

export default TeamNamesPage;
