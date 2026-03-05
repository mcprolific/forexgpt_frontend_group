import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL2 = "#242424";

const Footer = () => {
  return (
    <footer style={{ borderTop: `1px solid ${GOLD}18`, background: CHARCOAL2 }}>
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          {/* <div className="flex items-center gap-2 mb-2">
            <img src={Logo} alt="ForexGPT" className="h-6 w-6 object-contain" />
            <div className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{ fontFamily: "'Outfit', sans-serif", backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              ForexGPT
            </div>
          </div> */}
          <p className="text-sm leading-relaxed" style={{ color: "#7A6830" }}>
            AI copilot for learning research, code generation, and backtesting concepts.
          </p>
          <p className="mt-2 text-xs" style={{ color: `${GOLD}90` }}>For educational purposes only. Not financial advice.</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Education</div>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/why" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Why ForexGPT</Link></li>
            <li><Link to="/how-ai-helps" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>How AI Helps</Link></li>
            <li><Link to="/how-to-use" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>How To Use</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Get Started</div>
          <ul className="space-y-1.5 text-sm">
            <li><Link to="/register" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Create account</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Sign in</Link></li>
            <li><Link to="/dashboard" className="transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Open dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${GOLD}15` }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs" style={{ color: "#7A6830" }}>© {new Date().getFullYear()} ForexGPT. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/about/security" className="text-xs transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Terms</Link>
            <Link to="/about/security" className="text-xs transition-colors hover:text-[#FFD700]" style={{ color: "#7A6830" }}>Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
