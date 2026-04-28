import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion as Motion } from "framer-motion";
import Logo from "../assets/logo.png";
import { useTheme } from "../contexts/ThemeContext";

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFlyout, setOpenFlyout] = useState(null);
  const [mobileAbout, setMobileAbout] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let showTimer, hideTimer;
    if (location.pathname === "/") {
      showTimer = setTimeout(() => setShowDisclaimer(true), 0);
      hideTimer = setTimeout(() => setShowDisclaimer(false), 30000);
    } else {
      showTimer = setTimeout(() => setShowDisclaimer(false), 0);
    }
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [location.pathname]);

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpenFlyout(null);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* Disclaimer */}
      {/* {showDisclaimer && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full bg-[#00C853]/10 border-b border-[#00C853]/20 text-[#00C853] cursor-pointer select-none"
          onClick={() => setShowDisclaimer(false)}
          role="note"
        >
          <p className="max-w-6xl mx-auto px-6 py-2 text-center text-xs md:text-sm">
            For educational purposes only. Not financial advice.
          </p>
        </Motion.div>
      )} */}

      <header
        className="backdrop-blur border-b transition-all duration-300 relative overflow-visible"
        style={{
          background: isLight
            ? scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.92)"
            : scrolled ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
          borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)",
          boxShadow: scrolled ? (isLight ? "0 2px 20px rgba(0,0,0,0.08)" : "0 2px 20px rgba(0,0,0,0.3)") : "none",
        }}
      >
        {/* `radial-gradient(900px 500px at 50% 0%, rgba(212,175,55,0.10), transparent 65%), radial-gradient(700px 400px at 80% 80%, rgba(255,215,0,0.06), transparent 65%)` */}

        <div className="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="logo-hover flex items-center gap-0">
            <img src={Logo} alt="ForexGPT" className="h-7 w-7 object-contain" />
            <span
              className="text-lg font-extrabold transition-colors duration-300 whitespace-nowrap"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', color: isLight ? '#1A1A1A' : '#ffffff' }}
            >ForexGPT</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className={`hidden md:flex items-center gap-1 text-sm transition-colors duration-300 ${isLight ? "text-gray-700" : "text-gray-300"}`}>

            <NavItem to="/why">Why ForexGPT</NavItem>
            <NavItem to="/how-to-use">How To Use</NavItem>

            {/* About mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenFlyout("about")}
              onFocus={() => setOpenFlyout("about")}
              onMouseLeave={() => setOpenFlyout(null)}
              onBlur={handleBlur}
            >
              <button
                className="nav-link flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#FFD700] transition-colors duration-200"
                onClick={() => setOpenFlyout(openFlyout === "about" ? null : "about")}
                aria-haspopup="menu"
                aria-expanded={openFlyout === "about"}
                style={{ color: openFlyout === "about" ? "#FFD700" : undefined }}
              >
                About
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${openFlyout === "about" ? "rotate-180" : ""}`}
                />
              </button>

              {openFlyout === "about" && (
                <Motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full pt-3 z-[60]"
                  role="menu"
                  onMouseEnter={() => setOpenFlyout("about")}
                  onMouseLeave={() => setOpenFlyout(null)}
                >
                  <div
                    className="w-[720px] bg-zinc-900/95 backdrop-blur-xl border rounded-2xl p-5"
                    style={{ borderColor: 'rgba(212,175,55,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.08)' }}
                  >
                    {/* About links */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">About</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { to: "/about/our-story", label: "Our Story", desc: "Where we started and where we're going." },
                        { to: "/about/vision-values", label: "Vision & Values", desc: "What drives every decision we make." },
                        { to: "/about/security", label: "Security & Privacy", desc: "How we protect your data and trades." },
                      ].map((l) => (
                        <FlyoutCard key={l.to} to={l.to} label={l.label} desc={l.desc} />
                      ))}
                    </div>

                    <div className="border-t border-white/10 my-3" />

                    {/* Services links */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">Services</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { to: "/services", label: "Services Overview", desc: "All capabilities at a glance." },
                        { to: "/strategy", label: "Code Generation", desc: "Turn ideas into strategy code." },
                        { to: "/backtest", label: "Backtesting", desc: "Validate logic with metrics & charts." },
                        { to: "/transcript", label: "Signal Extraction", desc: "Extract trade ideas from any text." },
                        { to: "/mentor", label: "Mentor AI", desc: "Guided step‑by‑step learning." },
                        { to: "/how-ai-helps", label: "How AI Helps", desc: "See what the AI actually does for you." },
                      ].map((l) => (
                        <FlyoutCard key={l.to} to={l.to} label={l.label} desc={l.desc} />
                      ))}
                    </div>

                    <div className="border-t border-white/10 my-3" />

                    {/* Contact links */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 px-1">Contact</p>
                    <div className="flex gap-2">
                      <FlyoutCard to="/contact/support" label="Support" desc="Get help from our team." />
                      <FlyoutCard to="/team" label="Team" desc="Meet the people behind ForexGPT." />
                    </div>
                  </div>
                </Motion.div>
              )}
            </div>
          </nav>

          {/* ── Auth Buttons + Theme Toggle ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sun / Moon toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border"
              style={{
                background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
                borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)",
              }}
            >
              {isLight ? (
                /* Moon icon */
                <svg className="w-4 h-4" fill="none" stroke="#1A1A1A" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              ) : (
                /* Sun icon */
                <svg className="w-4 h-4" fill="none" stroke="#FFD700" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
            <Link
              to="/login"
              className="btn-outline-gold px-5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200"
              style={{ borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37' }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-glow px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)', color: '#1A1A1A' }}
            >
              Sign Up
            </Link>
          </div>

          {/* ── Hamburger + Theme Toggle (mobile) ── */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
              style={{
                background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
                borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)",
              }}
            >
              {isLight ? (
                <svg className="w-4 h-4" fill="none" stroke="#1A1A1A" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="#FFD700" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="hamburger-btn p-2 rounded-lg"
              style={{ color: isLight ? '#1A1A1A' : '#e5e7eb' }}
            >
              {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden backdrop-blur-xl border-t max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide"
            style={{
              background: isLight ? "rgba(255,255,255,0.97)" : "rgba(26,26,26,0.95)",
              borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(212,175,55,0.15)"
            }}
          >
            <div className="fixed inset-0 -z-10 bg-black/50 cursor-pointer" onClick={() => setOpen(false)} />
            <div className="max-w-6xl mx-auto px-6 py-4 space-y-1">

              <MobileLink to="/why" close={() => setOpen(false)}>Why ForexGPT</MobileLink>
              <MobileLink to="/how-to-use" close={() => setOpen(false)}>How To Use</MobileLink>

              {/* About accordion */}
              <button
                className="w-full flex items-center justify-between py-2.5 text-sm transition-colors"
                style={{ color: isLight ? "#1A1A1A" : "#e5e7eb" }}
                onClick={() => setMobileAbout((v) => !v)}
              >
                <span>About</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${mobileAbout ? "rotate-180" : ""}`} />
              </button>
              {mobileAbout && (
                <div className="pl-3 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] pt-2 pb-1" style={{ color: isLight ? "#9a7d30" : "#A89060" }}>About</p>
                  <MobileLink to="/about/our-story" close={() => setOpen(false)}>Our Story</MobileLink>
                  <MobileLink to="/about/vision-values" close={() => setOpen(false)}>Vision &amp; Values</MobileLink>
                  <MobileLink to="/about/security" close={() => setOpen(false)}>Security &amp; Privacy</MobileLink>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] pt-3 pb-1" style={{ color: isLight ? "#9a7d30" : "#A89060" }}>Services</p>
                  <MobileLink to="/services" close={() => setOpen(false)}>Services Overview</MobileLink>
                  <MobileLink to="/strategy" close={() => setOpen(false)}>Code Generation</MobileLink>
                  <MobileLink to="/backtest" close={() => setOpen(false)}>Backtesting</MobileLink>
                  <MobileLink to="/transcript" close={() => setOpen(false)}>Signal Extraction</MobileLink>
                  <MobileLink to="/mentor" close={() => setOpen(false)}>Mentor AI</MobileLink>
                  <MobileLink to="/how-ai-helps" close={() => setOpen(false)}>How AI Helps</MobileLink>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] pt-3 pb-1" style={{ color: isLight ? "#9a7d30" : "#A89060" }}>Contact</p>
                  <MobileLink to="/contact/support" close={() => setOpen(false)}>Support</MobileLink>
                  <MobileLink to="/team" close={() => setOpen(false)}>Team</MobileLink>
                </div>
              )}

              {/* Auth */}
              <div className="flex gap-3 pt-4 mt-2 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-outline-gold flex-1 text-center py-2.5 rounded-xl border text-sm font-semibold"
                  style={{ borderColor: 'rgba(212,175,55,0.5)', color: '#D4AF37' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-glow flex-1 text-center py-2.5 rounded-xl text-sm font-bold shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)', color: '#1A1A1A' }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </Motion.div>
        )}
      </header>
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────── */

const NavItem = ({ to, children }) => {
  const { theme } = useTheme();
  return (
    <Link
      to={to}
      className="nav-link px-3 py-2 rounded-lg text-sm hover:text-[#FFD700] transition-colors duration-200"
      style={{ color: theme === "light" ? "#374151" : "#d1d5db" }}
    >
      {children}
    </Link>
  );
};

const FlyoutCard = ({ to, label, desc }) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <Link
      to={to}
      className="flyout-card block rounded-xl p-3 border group transition-colors"
      style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)", background: isLight ? "rgba(0,0,0,0.02)" : "transparent" }}
    >
      <div className="font-semibold text-sm group-hover:text-[#FFD700] transition-colors duration-200" style={{ color: isLight ? "#1A1A1A" : "#e5e7eb" }}>{label}</div>
      {desc && <div className="text-xs mt-0.5 leading-relaxed transition-colors duration-200" style={{ color: isLight ? "#6b7280" : "#6b7280" }}>{desc}</div>}
    </Link>
  );
};

const MobileLink = ({ to, close, children }) => {
  const { theme } = useTheme();
  return (
    <Link
      to={to}
      onClick={close}
      className="mobile-nav-link block py-2.5 text-sm hover:text-[#FFD700] transition-colors duration-200"
      style={{ color: theme === "light" ? "#1A1A1A" : "#d1d5db" }}
    >
      {children}
    </Link>
  );
};

export default PublicNavbar;
