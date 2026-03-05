import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL2 = "#242424";

const PublicFooter = ({ fixed = false }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const footerBg = isLight ? "rgba(245,242,236,0.97)" : `${CHARCOAL2}E6`;
  const footerBdr = isLight ? `rgba(212,175,55,0.20)` : `${GOLD}18`;
  const descColor = isLight ? "#6b7280" : "#A89060";
  const linkColor = isLight ? "#9a7d30" : "#C8A94A";
  const dimColor = isLight ? "#6b7280" : "#7A6830";
  const textColor = isLight ? "#374151" : "#fff";

  const containerClass = fixed
    ? "fixed bottom-0 left-0 right-0 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.35)]"
    : "backdrop-blur-xl";

  return (
    <footer className={containerClass} style={{ borderTop: `1px solid ${footerBdr}`, background: footerBg }}>
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-gray-300">

        {/* Brand */}
        <div className="col-span-1">
          {/* <div className="flex items-center gap-2 mb-3">
            <img src={Logo} alt="ForexGPT" className="h-7 w-7 object-contain" />
            <div className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{
                fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em',
                backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`
              }}>
              ForexGPT
            </div>
          </div> */}
          <p className="text-sm leading-relaxed" style={{ color: descColor }}>
            AI copilot for strategy research, readable code generation, and concept backtesting.
          </p>
          <p className="mt-3 text-xs" style={{ color: textColor }}>
            For educational purposes only. Not financial advice.
          </p>
        </div>

        {/* Capabilities */}
        <div className="col-span-1 md:col-span-2">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Capabilities</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { to: "/services", label: "Services Overview", desc: "All capabilities at a glance." },
              { to: "/strategy", label: "Code Generation", desc: "Turn ideas into strategy code." },
              { to: "/backtest", label: "Backtesting", desc: "Validate logic with metrics & charts." },
              { to: "/transcript", label: "Signal Extraction", desc: "Extract trade ideas from any text." },
              { to: "/mentor", label: "Mentor AI", desc: "Guided step‑by‑step learning." },
              { to: "/how-ai-helps", label: "How AI Helps", desc: "See what the AI actually does for you." },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="group flex flex-col gap-1">
                <span className="text-sm font-semibold transition-colors duration-200 group-hover:text-[#FFD700]" style={{ color: linkColor }}>
                  {l.label}
                </span>
                <span className="text-xs leading-tight" style={{ color: textColor }}>
                  {l.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div className="col-span-1 text-right sm:text-left">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GOLD }}>Company</div>
          <ul className="space-y-2 text-sm">
            {[
              { to: "/about/our-story", label: "Our Story" },
              { to: "/about/vision-values", label: "Vision & Values" },
              { to: "/about/security", label: "Security & Privacy" },
              { to: "/contact/support", label: "Contact Support" },
              { to: "/team", label: "Team" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors duration-200 hover:text-[#FFD700]" style={{ color: dimColor }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      {!fixed && (
        <div style={{ borderTop: `1px solid ${GOLD}15` }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs items-center" style={{ color: dimColor }}>
              © {new Date().getFullYear()} ForexGPT. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              {/* <Link to="/about/security" className="text-xs transition-colors duration-200 hover:text-[#FFD700]" style={{ color: "#7A6830" }}>
                Security & Privacy
              </Link> */}
              {/* <Link to="/about/security" className="text-xs transition-colors duration-200 hover:text-[#FFD700]" style={{ color: "#7A6830" }}>
                Privacy
              </Link> */}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default PublicFooter;
