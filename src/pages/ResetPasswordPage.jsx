import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useTheme } from "../contexts/ThemeContext";
import { updatePasswordAPI } from "../features/auth/authAPI";

const getParam = (searchParams, hashParams, key) =>
  searchParams.get(key) || hashParams.get(key) || "";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ ok: false, message: "" });

  const recovery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(
      location.hash.startsWith("#") ? location.hash.slice(1) : location.hash
    );

    return {
      access_token: getParam(searchParams, hashParams, "access_token"),
      refresh_token: getParam(searchParams, hashParams, "refresh_token"),
      type: getParam(searchParams, hashParams, "type") || "recovery",
      error:
        getParam(searchParams, hashParams, "error_description") ||
        getParam(searchParams, hashParams, "error"),
    };
  }, [location.hash, location.search]);

  const hasRecoverySession = Boolean(
    recovery.access_token && recovery.refresh_token
  );

  useEffect(() => {
    if (!status.ok) return;

    const timeoutId = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigate, status.ok]);

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];

  const validatePassword = () => {
    if (!password) {
      return "Enter your new password.";
    }

    if (passwordChecks.some((check) => !check.valid)) {
      return "Password must be 8+ characters and include upper, lower, and numeric characters.";
    }

    if (!confirmPassword) {
      return "Confirm your new password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validatePassword();
    if (validationError) {
      setStatus({ ok: false, message: validationError });
      return;
    }

    if (!hasRecoverySession) {
      setStatus({
        ok: false,
        message:
          "This reset link is missing the recovery session or has already expired. Request a new password reset email.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ ok: false, message: "" });

      await updatePasswordAPI({
        newPassword: password,
        accessToken: recovery.access_token,
        refreshToken: recovery.refresh_token,
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setStatus({
        ok: true,
        message: "Your password has been updated successfully. Redirecting you to login...",
      });
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus({
        ok: false,
        message:
          error.message ||
          "Could not update your password. Request a new reset link and try again.",
      });
    } finally {
      setSubmitting(false);
    }
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
          className="relative backdrop-blur-3xl p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 w-full max-w-xl"
          style={{ background: isLight ? "rgba(255,255,255,0.92)" : "rgba(18,18,18,0.90)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-3xl font-black text-center"
            style={{ fontFamily: "'Outfit', sans-serif", color: isLight ? "#1A1A1A" : "#ffffff" }}
          >
            Reset Your Password
          </h1>
          <p className="mt-3 text-sm text-center text-gray-400">
            Create a new password for your ForexGPT account using the recovery link you opened.
          </p>

          {recovery.error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {recovery.error}
            </div>
          )}

          {!recovery.error && status.message && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                status.ok
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/30 bg-red-500/10 text-red-200"
              }`}
            >
              {status.message}
            </div>
          )}

          {!recovery.error && !hasRecoverySession && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              This reset link is missing the recovery session or has expired. Request a new password reset email.
            </div>
          )}

          {!recovery.error && hasRecoverySession && !status.ok && (
            <>
              <div className="mt-8 space-y-4">
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: isLight ? "#374151" : "#6b7280" }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full border rounded-xl px-4 pr-14 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? "#F5F2EC" : "#2a2a2a",
                        borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)",
                        color: isLight ? "#111" : "#fff",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: isLight ? "#374151" : "#6b7280" }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full border rounded-xl px-4 pr-14 h-12 text-sm placeholder:text-gray-500 focus:outline-none transition-colors"
                      style={{
                        background: isLight ? "#F5F2EC" : "#2a2a2a",
                        borderColor: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)",
                        color: isLight ? "#111" : "#fff",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={check.valid ? "text-emerald-300" : "text-gray-500"}
                  >
                    {check.valid ? "OK" : "•"} {check.label}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-8 w-full px-6 py-4 rounded-xl font-bold text-xs tracking-widest transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #FFD700, #D4AF37)", color: "#1A1A1A" }}
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </>
          )}

          <div className="mt-6 text-xs text-center text-gray-500">
            Return to{" "}
            <Link to="/login" className="text-[#FFD700] hover:text-[#D4AF37] underline">
              Login
            </Link>
          </div>
        </Motion.div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default ResetPasswordPage;
