import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import { resendConfirmationAPI } from "../features/auth/authAPI";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState("");

  const email = useMemo(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) return stateEmail;
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  }, [location]);

  const handleResend = async () => {
    if (!email) {
      setStatus("Missing email. Please return to registration.");
      return;
    }
    setResending(true);
    setStatus("");
    try {
      await resendConfirmationAPI(email);
      setStatus("Confirmation email resent. Check inbox and spam.");
    } catch (error) {
      setStatus(error.message || "Could not resend confirmation email. Try again later.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white selection:bg-[#D4AF37]/30 transition-colors duration-500"
      style={{ background: isLight ? "#F0EDE6" : "#1A1A1A" }}
    >
      <Motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -10%, rgba(212,175,55,0.15), transparent 70%), radial-gradient(1000px 500px at 80% 20%, rgba(255,215,0,0.1), transparent 70%), radial-gradient(800px 400px at 50% 110%, rgba(212,175,55,0.08), transparent 70%)",
        }}
      />
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNavbar />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-6 pt-24 pb-20">
        <Motion.div
          className="relative bg-[#121212]/90 backdrop-blur-3xl p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 w-full max-w-xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Verify Your Email
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            We sent a verification link to
            <span className="text-[#FFD700] font-semibold"> {email || "your email"} </span>.
            Open it to activate your account.
          </p>
          {status && (
            <div className="mt-4 text-xs text-[#F0D880]">
              {status}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full px-6 py-4 rounded-xl font-bold text-xs tracking-widest transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #FFD700, #D4AF37)", color: "#1A1A1A" }}
            >
              {resending ? "Resending..." : "Resend Verification Email"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 rounded-xl font-bold text-xs tracking-widest border border-white/10 text-white hover:border-[#D4AF37]/50 hover:text-[#FFD700] transition-all"
            >
              Log Out
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Already confirmed?{" "}
            <Link to="/login" className="text-[#FFD700] hover:text-[#D4AF37] underline">
              Go to Login
            </Link>
          </div>
        </Motion.div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default VerifyEmailPage;
