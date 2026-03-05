import React from "react";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const CHARCOAL = "#1A1A1A";
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const FooterPage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white" style={{ background: CHARCOAL }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%)` }} />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />

      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h1 className="text-3xl font-extrabold text-gold-gradient">
          Site Links & Legal
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Explore the navigation links and legal information in the footer below.
        </p>
      </main>

      <PublicFooter />
    </div>
  );
};

export default FooterPage;
