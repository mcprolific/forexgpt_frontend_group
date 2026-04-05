// src/pages/RegisterPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { useTheme } from "../contexts/ThemeContext";
import Logo from "../assets/logo.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import LoadingScreen from "../components/ui/LoadingScreen";
import { forgotPasswordAPI, resendConfirmationAPI } from "../features/auth/authAPI";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { toast, show } = useToast();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [capsPassword, setCapsPassword] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [confirmNotice, setConfirmNotice] = useState("");
  const [resending, setResending] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotStatusType, setForgotStatusType] = useState("info");
  const closeForgotModal = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotStatus("");
    setForgotStatusType("info");
  };
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(left);
      if (left <= 0) {
        setCooldownUntil(0);
      }
    }, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const emailSuggestion = useMemo(() => {
    const v = form.email.trim();
    const idx = v.indexOf("@");
    if (idx === -1) return "";
    const [localPart, domain] = [v.slice(0, idx), v.slice(idx + 1).toLowerCase()];
    const fixes = {
      "gmal.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gnail.com": "gmail.com",
      "hotmal.com": "hotmail.com",
      "yaho.com": "yahoo.com",
      "outlok.com": "outlook.com",
      "icloud.co": "icloud.com",
    };
    const fixed = fixes[domain];
    if (fixed && fixed !== domain) {
      return `${localPart}@${fixed}`;
    }
    return "";
  }, [form.email]);

  const strength = useMemo(() => {
    let s = 0;
    if (form.password.length >= 8) s += 1;
    if (/[A-Z]/.test(form.password)) s += 1;
    if (/[a-z]/.test(form.password)) s += 1;
    if (/\d/.test(form.password)) s += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) s += 1;
    return Math.min(s, 4);
  }, [form.password]);

  const isEmailValid = useMemo(() => {
    const re =
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(form.email);
  }, [form.email]);

  const isNameValid = form.name.trim().length >= 2;
  const isPasswordValid =
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /\d/.test(form.password);
  const isConfirmMatch = confirmPassword === form.password;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-400", "bg-[#22c55e]"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (cooldownLeft > 0) {
      setFormError(`Too many attempts. Please wait ${cooldownLeft}s before trying again.`);
      return;
    }

    // Validation checks with descriptive feedback
    if (!form.name.trim()) {
      setFormError("Full identifier is required for account creation.");
      return;
    }
    if (!isNameValid) {
      setFormError("Identity verification failed: Name must be at least 2 characters.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Institutional email credentials are required for entry.");
      return;
    }
    if (!isEmailValid) {
      setFormError("Authorization failed: Invalid email format detected.");
      return;
    }
    if (!form.password) {
      setFormError("Security key is required for account initialization.");
      return;
    }
    if (!isPasswordValid) {
      setFormError("Security protocol failed: Password must be 8+ chars with upper, lower and numeric requirements.");
      return;
    }
    if (!confirmPassword) {
      setFormError("Please re-enter your security key for verification.");
      return;
    }
    if (!isConfirmMatch) {
      setFormError("Security mismatch: Password confirmation does not match.");
      return;
    }
    if (!accepted) {
      setFormError("Agreement to the educational research protocols is required to proceed.");
      return;
    }

    const payload = {
      email: form.email.trim(),
      password: form.password,
      display_name: form.name.trim(),
    };

    try {
      const res = await dispatch(registerUser(payload)).unwrap();
      if (res?.requires_confirmation) {
        const email = res?.email || form.email.trim();
        setConfirmNotice(email);
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { state: { email } });
      } else {
        show("Registration successful. You can now log in.", "success");
        navigate("/login");
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : "Registration failed. Please verify your connection to the secure server.";
      setFormError(msg);
      if (typeof err === "string" && /too many/i.test(err)) {
        setCooldownUntil(Date.now() + 60_000);
      }
    }
  };


  return (
    <>
      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden p-6 pt-24 pb-20 text-white selection:bg-[#D4AF37]/30 transition-colors duration-500"
        style={{ background: isLight ? "#F0EDE6" : "#1A1A1A" }}
      >
        {loading && <LoadingScreen />}
        <div className="fixed top-0 left-0 right-0 z-50"><PublicNavbar /></div>

        {/* Premium Background Elements */}
        <Motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 20% -10%, rgba(212,175,55,0.15), transparent 70%), radial-gradient(1000px 500px at 80% 20%, rgba(255,215,0,0.1), transparent 70%), radial-gradient(800px 400px at 50% 110%, rgba(212,175,55,0.08), transparent 70%)",
          }}
        />

        {/* Animated Glow Orbs */}
        <Motion.div
          className="pointer-events-none absolute top-[-10%] left-[-5%] h-[40rem] w-[40rem] rounded-full bg-[#D4AF37]/5 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <Motion.div
          className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[35rem] w-[35rem] rounded-full bg-[#D4AF37]/3 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Grid Pattern Overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Side: User Assistance / Value Proposition */}
          <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-10">
            <div className="space-y-4">
              <Motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Join the <span className="bg-gradient-to-r from-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent">Elite Quant</span> Community
              </Motion.h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Experience the next generation of trading. Our AI doesn't just give signals it provides comprehensive market intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "AI Confluence", desc: "Aggregated intelligence from technicals, news, and sentiment.", icon: "" },
                { title: "Institutional Risk", desc: "Professional-grade position sizing and automated risk checks.", icon: "" },
                { title: "Strategy Mentor", desc: "Step-by-step guidance to master high-probability setups.", icon: "" },
                { title: "Live Sync", desc: "Real-time updates across London, NY, and Tokyo sessions.", icon: "" }
              ].map((feat, i) => (
                <Motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="text-2xl mb-3">{feat.icon}</div>
                  <h3 className="font-bold text-[#F0D880] mb-1">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </Motion.div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4 text-sm text-[#fff]/100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="w-8 h-8 rounded-full border-2 border-[#D4AF37] bg-zinc-800 flex items-center justify-center text-[10px] uppercase font-bold">
                    {String.fromCharCode(64 + n)}
                  </div>
                ))}
              </div>
              <span>Joined by 12,000+ traders globally</span>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="lg:col-span-5 relative group">
            {/* Card Glow Effect */}
            <div className="pointer-events-none absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#FFD700]/10 to-[#D4AF37]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

            <div
              className="relative z-10 backdrop-blur-2xl p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border w-full transition-colors duration-500"
              style={{
                background: isLight ? "rgba(255,255,255,0.95)" : "rgba(18,18,18,0.90)",
                borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)"
              }}
            >
              {/* Logo */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                <img src={Logo} alt="ForexGPT" className="h-8 w-8 object-contain" />
                <span
                  className="text-lg font-black transition-colors duration-300"
                  style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', color: isLight ? '#1A1A1A' : '#ffffff' }}
                >ForexGPT</span>
              </div>

              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: isLight ? '#1A1A1A' : '#ffffff' }}>
                  Create Account
                </h2>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-400/30 bg-red-900/20 backdrop-blur px-5 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-sm md:text-base font-semibold text-red-300">{formError}</div>
                  {cooldownLeft > 0 && (
                    <div className="mt-2 text-xs text-red-200">
                      Please wait {cooldownLeft}s before trying again.
                    </div>
                  )}
                </div>
              )}
              {confirmNotice && (
                <div
                  role="status"
                  className="mb-6 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 backdrop-blur px-5 py-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-sm md:text-base font-semibold" style={{ color: isLight ? '#7A6830' : '#F0D880' }}>
                    Please check your email to Verify your ForexGPT account
                  </div>
                  <button
                    type="button"
                    disabled={resending}
                    onClick={async () => {
                      try {
                        setResending(true);
                        await resendConfirmationAPI(confirmNotice);
                        show("Confirmation email resent. Check inbox and spam.", "success");
                      } catch (error) {
                        show(error.message || "Could not resend confirmation email. Try again later.", "error");
                      } finally {
                        setResending(false);
                      }
                    }}
                    className="inline-block mt-3 mr-2 px-4 py-2 rounded-lg font-bold text-xs tracking-widest transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #1f2937, #111827)", color: "#F0D880", border: '1px solid rgba(240,216,128,0.3)' }}
                  >
                    {resending ? "Resending..." : "Resend Confirmation Email"}
                  </button>
                  <Link
                    to="/login"
                    className="inline-block mt-3 px-4 py-2 rounded-lg font-bold text-xs tracking-widest transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #FFD700, #D4AF37)", color: "#1A1A1A" }}
                  >
                    I confirmed — Go to Login
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: isLight ? '#374151' : '#6b7280' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? '#9ca3af' : '#4b5563' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Publica Academy"
                      autoFocus
                      className="w-full border rounded-xl pl-10 pr-4 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
                        color: isLight ? '#111' : '#fff',
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: isLight ? '#374151' : '#6b7280' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? '#9ca3af' : '#4b5563' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ncc@gmail.com"
                      className="w-full border rounded-xl pl-10 pr-4 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: form.email && !isEmailValid ? 'rgba(239,68,68,0.6)' : isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
                        color: isLight ? '#111' : '#fff',
                      }}
                    />
                  </div>
                  {form.email && !isEmailValid && (
                    <p className="mt-1 text-[10px] text-red-400">Invalid email format</p>
                  )}
                  {emailSuggestion && (
                    <p className="mt-1 text-[10px] text-[#22c55e]">Did you mean {emailSuggestion}?</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: isLight ? '#374151' : '#6b7280' }}>
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? '#9ca3af' : '#4b5563' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      onKeyUp={(e) => setCapsPassword(e.getModifierState && e.getModifierState("CapsLock"))}
                      placeholder="••••••••"
                      className="w-full border rounded-xl pl-10 pr-14 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
                        color: isLight ? '#111' : '#fff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email.trim());
                      setForgotOpen(true);
                    }}
                    className="mt-2 text-[10px] font-bold text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                  >
                    Forgot password?
                  </button>
                  {capsPassword && (
                    <p className="mt-1 text-[10px] text-amber-500 font-bold uppercase tracking-tight">Caps Lock is ON</p>
                  )}
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <Motion.div
                          className={`h-full ${strengthColor[strength]} transition-all duration-500`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(strength / 4) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600">{strengthLabel[strength]}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: isLight ? '#374151' : '#6b7280' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? '#9ca3af' : '#4b5563' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border rounded-xl pl-10 pr-14 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: confirmPassword && !isConfirmMatch ? 'rgba(239,68,68,0.6)' : isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
                        color: isLight ? '#111' : '#fff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                    >
                      {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && !isConfirmMatch && (
                    <p className="mt-1 text-[10px] text-red-400">Passwords don't match</p>
                  )}
                  {confirmPassword && isConfirmMatch && (
                    <p className="mt-1 text-[10px] text-[#22c55e]">✓ Passwords match</p>
                  )}
                </div>

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-[#2a2a2a] accent-[#22c55e] cursor-pointer flex-shrink-0"
                    />
                    <span className="text-[10px] text-[#FFF] leading-relaxed">
                      I agree to the{" "}
                      <Link to="/about/security" className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">Terms of Service</Link>
                      {" "}and acknowledge results are based on educational research.
                    </span>
                  </label>
                </div>

                {/* Sign Up button */}
                <button
                  type="submit"
                  disabled={loading || cooldownLeft > 0}
                  className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-[0.15em] text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #D4AF37)" }}
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>Create Account <span className="text-base">→</span></>
                  )}
                </button>

                {/* Divider */}
                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <span
                    className="relative px-4 text-[9px] uppercase tracking-[0.3em]"
                    style={{ color: '#9ca3af', background: isLight ? 'rgba(255,255,255,0.95)' : '#1e1e1e' }}
                  >
                    Or continue with
                  </span>
                </div>

                {/* Google button */}
                <button
                  type="button"
                  onClick={() => {
                    const base = axiosInstance?.defaults?.baseURL || "";
                    window.location.href = `${base}/oauth/start?provider=google`;
                  }}
                  className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-sm font-semibold text-white transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </form>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs" style={{ color: isLight ? '#6b7280' : '#9ca3af' }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="inline-block font-bold underline decoration-from-font transition-colors cursor-pointer"
                style={{ color: isLight ? '#000000' : '#F0D880', pointerEvents: 'auto' }}
                aria-label="Go to login page"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Motion.div>
      </div>
      <PublicFooter />
      {toast && <Toast message={toast.message} type={toast.type} />}
      <Modal
        open={forgotOpen}
        onClose={closeForgotModal}
        title="Reset Password"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeForgotModal}>
              {forgotStatusType === "success" ? "Close" : "Cancel"}
            </Button>
            <Button
              onClick={async () => {
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(forgotEmail)) {
                  setForgotStatus("Enter a valid email address.");
                  setForgotStatusType("error");
                  return;
                }
                try {
                  setForgotSending(true);
                  setForgotStatus("");
                  await forgotPasswordAPI(forgotEmail.trim());
                  setForgotStatus(
                    "If this email exists, a reset link will be sent. Check your inbox and spam folder."
                  );
                  setForgotStatusType("success");
                } catch (error) {
                  setForgotStatus(error.message || "Could not send reset link.");
                  setForgotStatusType("error");
                } finally {
                  setForgotSending(false);
                }
              }}
              disabled={forgotSending || forgotStatusType === "success"}
            >
              {forgotSending ? "Sending..." : "Send link"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-300">Enter your account email to receive a reset link.</div>
          {forgotStatus && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                forgotStatusType === "success"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/30 bg-red-500/10 text-red-200"
              }`}
            >
              {forgotStatus}
            </div>
          )}
          <Input
            id="forgot-email"
            type="email"
            label="Email address"
            value={forgotEmail}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              if (forgotStatusType === "error") {
                setForgotStatus("");
                setForgotStatusType("info");
              }
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default RegisterPage;
