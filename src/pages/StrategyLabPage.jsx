import React from "react";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../context/ThemeContext";
 

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#1A1A1A";
const CHARCOAL2 = "#242424";

const StrategyLabPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const BG2 = isLight ? "#ffffff" : CHARCOAL2;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#636363" : "rgba(255,255,255,0.70)";

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.08), transparent 70%)` }} />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: -60, y: -30 }}
        animate={{ opacity: 0.3, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `${GOLD}33` }}
      />
      <Motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.95, x: 60, y: 30 }}
        animate={{ opacity: 0.25, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `${GOLD_LIGHT}26` }}
      />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <PublicNavbar />

      <section className="max-w-6xl mx-auto px-6 pt-32 pb-16 text-center">
        <Motion.div initial={{ opacity: 0, y: 20, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10`, color: GOLD_LIGHT }}>
            Strategy Lab
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent leading-tight mb-6"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #ffffff, ${GOLD})` }}>
            Code Generation
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: TEXT }}>
            Turn your trading ideas into high‑performance research code. Generate Pinescript, Python, or MQL
            using advanced AI fine‑tuned for quantitative finance.
          </p>
        </Motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 mb-20">
        <div className="relative">
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px pointer-events-none"
            style={{ background: `linear-gradient(180deg, transparent, ${GOLD}40, ${GOLD}40, transparent)` }}
          />
          {[
            {
              title: "Idea to Algorithm",
              desc: "Describe your logic in plain English and let AI handle the syntax. No more fighting with compiler errors."
            },
            {
              title: "Multi-Language Support",
              desc: "Export to Python for deep research, or Pinescript for TradingView visualization. Seamless translation."
            },
            {
              title: "Best Practices Baked-In",
              desc: "Generated code includes proper error handling, risk management modules, and clean documentation."
            }
          ].map((t, i) => {
            return (
              <Motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, filter: "blur(2px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: `0 16px 44px ${GOLD}22` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex items-start gap-6 mb-8 cursor-default select-none ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div
                  className="absolute left-6 md:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 z-10"
                  style={{ borderColor: GOLD_LIGHT, background: BG }}
                />
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] rounded-2xl border p-5 relative ${i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto"}`}
                  style={{ background: BG2, borderColor: `${GOLD}22`, color: TEXT }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50, transparent)` }}
                  />
                  <h3 className="text-base font-bold mb-2" style={{ color: "#F0D880" }}>
                    {t.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                    {t.desc}
                  </p>
                </div>
              </Motion.div>
            );
          })}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default StrategyLabPage;
