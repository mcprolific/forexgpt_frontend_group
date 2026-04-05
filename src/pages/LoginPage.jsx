import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import Modal from "../components/ui/Modal";
import axiosInstance from "../services/axiosInstance";
import { useTheme } from "../contexts/ThemeContext";
import Logo from "../assets/logo.png";
import LoadingScreen from "../components/ui/LoadingScreen";
import { forgotPasswordAPI } from "../features/auth/authAPI";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const { toast, show } = useToast();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [formError, setFormError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotStatusType, setForgotStatusType] = useState("info");
  const [capsPassword, setCapsPassword] = useState(false);
  const [oauthHandled, setOauthHandled] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [lastAuthError, setLastAuthError] = useState("");

  const closeForgotModal = () => {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotStatus("");
    setForgotStatusType("info");
  };

  const validEmail = useMemo(
    () => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email),
    [email]
  );

  const handleLogin = async () => {
    if (loading || isSubmittingLogin) return;
    setIsSubmittingLogin(true);
    const e = { email: "", password: "" };
    setFormError("");

    if (!email.trim()) {
      setFormError("Institutional email credentials are required for entry.");
      e.email = "Required";
    } else if (!validEmail) {
      setFormError("Authorization failed: Invalid email format detected.");
      e.email = "Invalid format";
    }

    if (!password) {
      if (!e.email) setFormError("Security key is required for account access.");
      e.password = "Required";
    }

    setErrors(e);
    if (e.email || e.password) return;

      try {
        const result = await dispatch(login({ email, password, rememberMe })).unwrap();
        if (!result?.token) {
          setFormError("Invalid login details. Please check your email and password and try again.");
          show("Invalid login details. Please try again.", "error");
          return;
        }
        if (rememberMe) {
          localStorage.setItem("fgpt_login_email", email);
          localStorage.setItem("fgpt_remember_me", "true");
      } else {
        localStorage.removeItem("fgpt_login_email");
        localStorage.removeItem("fgpt_remember_me");
      }
      navigate("/dashboard", {
        state: {
          toast: {
            message: "Authorization successful. Welcome back.",
            type: "success",
            duration: 4500,
          },
        },
      });
      } catch (err) {
        const msg = err?.message || err?.toString() || "";
        if (/verify|confirm/i.test(msg) || /unverified/i.test(msg) || /email/i.test(msg) && /confirm/i.test(msg)) {
          setFormError("Email not verified. Please check your inbox and confirm your account before signing in.");
          show("Email not verified. Please confirm your account.", "error");
        } else {
          setFormError("Invalid login details. Please check your email and password and try again.");
          show("Invalid login details. Please try again.", "error");
        }
        setErrors({ email: "Invalid", password: "Invalid" });
      } finally {
        setIsSubmittingLogin(false);
      }
    };

  useEffect(() => {
    if (!authError || authError === lastAuthError) return;
    setLastAuthError(authError);
    const msg = typeof authError === "string" ? authError : "Invalid login details.";
    if (/verify|confirm/i.test(msg) || /unverified/i.test(msg) || /email/i.test(msg) && /confirm/i.test(msg)) {
      setFormError("Email not verified. Please check your inbox and confirm your account before signing in.");
      show("Email not verified. Please confirm your account.", "error");
    } else {
      setFormError("Invalid login details. Please check your email and password and try again.");
      show("Invalid login details. Please try again.", "error");
    }
  }, [authError, lastAuthError, show]);

  useEffect(() => {
    const rm = localStorage.getItem("fgpt_remember_me") === "true";
    const saved = localStorage.getItem("fgpt_login_email") || "";
    if (rm && saved) {
      setTimeout(() => {
        setEmail(saved);
        setRememberMe(true);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (oauthHandled) return;
    try {
      const hash = window.location.hash || "";
      if (hash.startsWith("#")) {
        const params = new URLSearchParams(hash.slice(1));
        const token = params.get("token");
        const emailParam = params.get("email");
        const userId = params.get("user_id");
        if (token) {
          localStorage.setItem("token", token);
          if (emailParam || userId) {
            try {
              localStorage.setItem("user", JSON.stringify({ id: userId || null, email: emailParam || null }));
            } catch (e) {
              void e;
            }
          }
          setTimeout(() => {
            setOauthHandled(true);
            navigate("/dashboard", {
              state: {
                toast: {
                  message: "Logged in with Google successfully.",
                  type: "success",
                  duration: 4500,
                },
              },
            });
          }, 0);
        }
      }
    } catch (e) {
      void e;
    }
  }, [navigate, show, oauthHandled]);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white selection:bg-[#D4AF37]/30 transition-colors duration-500"
      style={{ background: isLight ? "#F0EDE6" : "#1A1A1A" }}
    >
      {loading && <LoadingScreen />}
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
        animate={{
          x: [0, 30, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <Motion.div
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[35rem] w-[35rem] rounded-full bg-[#D4AF37]/3 blur-[100px]"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNavbar />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-6 pt-24 pb-20">
        <Motion.div
          className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Side: Security & Assistance Sidebar */}
          <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-10">
            <div className="space-y-4">
              <Motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Secure <span className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">Quantum</span> Portal
              </Motion.h1>
              <p className="text-gray-400 text-lg max-w-md">
                Log in to access your institutional-grade trading dashboard and AI-driven confluence tools.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {[
                { title: "Vault-Grade Security", desc: "Your data is protected by industry-standard AES-256 encryption.", icon: "" },
                { title: "24/7 AI Monitoring", desc: "Continuous analysis of global sentiment and fundamental shifts.", icon: "" },
                { title: "Priority Execution", desc: "Low-latency access to pre-computed signal extractions.", icon: "" }
              ].map((item, i) => (
                <Motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="text-2xl mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-[#F0D880] text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </Motion.div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-xs text-[#fff] font-medium italic">
                "Precision is not an act, it's a habit. Master the markets with AI."
              </p>
            </div>
          </div>

          {/* Right Side: The Login Form */}
          <div className="lg:col-span-6 relative group">
            {/* Card Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#FFD700]/10 to-[#D4AF37]/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />

            <div
              className="relative backdrop-blur-3xl p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border w-full transition-colors duration-500"
              style={{
                background: isLight ? "rgba(255,255,255,0.95)" : "rgba(18,18,18,0.90)",
                borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)"
              }}
            >
              {/* Logo */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                <img src={Logo} alt="ForexGPT" className="h-8 w-8 object-contain" />
                <span
                  className="text-lg font-black transition-colors duration-300"
                  style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', color: isLight ? '#1A1A1A' : '#ffffff' }}
                >ForexGPT</span>
              </div>

              <div className="mb-10 text-center">
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: isLight ? '#1A1A1A' : '#ffffff' }}>
                  Authorized Entry
                </h2>
                <p className="text-xs font-medium uppercase tracking-[0.2em] mt-1" style={{ color: isLight ? '#6b7280' : '#6b7280' }}>Personnel Access Only</p>
              </div>

              {formError && (
                <div role="alert" className="mb-6 text-[11px] font-medium text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3 text-center">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
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
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="trader@example.com"
                      className={`w-full border rounded-xl pl-10 pr-4 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors`}
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: errors.email ? 'rgba(239,68,68,0.6)' : isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
                        color: isLight ? '#111' : '#fff',
                      }}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[10px] text-red-400">{errors.email}</p>}
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
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsPassword(e.getModifierState && e.getModifierState("CapsLock"))}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="••••••••"
                      className="w-full border rounded-xl pl-10 pr-14 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? '#F5F2EC' : '#2a2a2a',
                        borderColor: errors.password ? 'rgba(239,68,68,0.6)' : isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
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
                    onClick={() => setForgotOpen(true)}
                    className="mt-2 text-[10px] font-bold text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                  >
                    Forgot password?
                  </button>
                  {errors.password && <p className="mt-1 text-[10px] text-red-400">{errors.password}</p>}
                  {capsPassword && (
                    <p className="mt-1 text-[10px] text-amber-500 font-bold uppercase tracking-tight">Caps Lock is ON</p>
                  )}
                </div>
              </div>

              {/* Remember me */}
              <div className="mt-4 mb-5">
                <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-[#2a2a2a] accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="text-[10px] hover:text-gray-400 transition-colors" style={{ color: isLight ? '#6b7280' : '#6b7280' }}>Remember me</span>
                </label>
              </div>

              {/* Sign In button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-[0.15em] text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #D4AF37, #D4AF37)" }}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>Sign In <span className="text-base">→</span></>
                )}
              </button>
              {formError && /verify|confirm|unverified/i.test(formError) && (
                <div className="mt-3 text-[11px] text-amber-400 text-center">
                  Didn’t get the email? Check spam or request a new link from support. After confirming, return to
                  <Link to="/login" className="ml-1 underline text-[#D4AF37] hover:text-[#FFD700]">this page</Link>.
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }} />
                </div>
                <span
                  className="relative px-4 text-[9px] uppercase tracking-[0.3em]"
                  style={{ color: '#9ca3af', background: isLight ? 'rgba(255,255,255,0.95)' : '#121212' }}
                >
                  Or continue with
                </span>
              </div>

              {/* Google button */}
              <button
                type="button"
                disabled={loading || isSubmittingLogin}
                onClick={() => {
                  const base = axiosInstance?.defaults?.baseURL || "";
                  window.location.href = `${base}/oauth/start?provider=google`;
                }}
                className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-sm font-semibold text-white transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Sign up link */}
            <p className="mt-8 text-center text-xs text-gray-500">
              New operator?{" "}
              <Link to="/register" className="font-bold text-[#D4AF37] hover:underline transition-colors uppercase tracking-widest ml-1">
                Initialize Access
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
    </div>
  );
};

export default LoginPage;
