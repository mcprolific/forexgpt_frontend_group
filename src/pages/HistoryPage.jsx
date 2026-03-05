import React from "react";
import { useTheme } from "../context/ThemeContext";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const CHARCOAL = "#1A1A1A";

const HistoryPage = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const BG = isLight ? "#F0EDE6" : CHARCOAL;
  const TEXT = isLight ? "#1A1A1A" : "#f3f4f6";
  const MUTED = isLight ? "#6b7280" : "rgba(255,255,255,0.70)";

  return (
    <div className="relative min-h-screen w-full" style={{ background: BG, color: TEXT }}>
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-black mb-4">History</h1>
        <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
          Review your past analyses and actions. All your trading intelligence in one place.
        </p>

        {/* Placeholder for history list */}
        <div className="mt-12 p-12 rounded-3xl border border-dashed flex items-center justify-center text-center transition-colors"
          style={{ borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(212,175,55,0.2)" }}>
          <p className="text-sm italic" style={{ color: MUTED }}>No history items found yet.</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default HistoryPage;
