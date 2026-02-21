// src/pages/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState(
    localStorage.getItem("preferredLanguage") || "yo"
  );
  const [localError, setLocalError] = useState(null);
  const [capsPassword, setCapsPassword] = useState(false);
  const [capsConfirm, setCapsConfirm] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "learner");
  const [newsletter, setNewsletter] = useState(
    localStorage.getItem("newsletter_opt_in") === "true"
  );
  const [referral, setReferral] = useState(
    localStorage.getItem("referral_code") || ""
  );

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
  const isSubmitDisabled = useMemo(
    () =>
      loading ||
      !isNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmMatch ||
      !accepted,
    [loading, isNameValid, isEmailValid, isPasswordValid, isConfirmMatch, accepted]
  );

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+[]{}";
    let out = "";
    for (let i = 0; i < 14; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm({ ...form, password: out });
    setConfirmPassword(out);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!isNameValid) {
      setLocalError("Enter your full name");
      return;
    }
    if (!isEmailValid) {
      setLocalError("Enter a valid email address");
      return;
    }
    if (!isPasswordValid) {
      setLocalError("Use 8+ chars with upper, lower and a number");
      return;
    }
    if (!isConfirmMatch) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!accepted) {
      setLocalError("You must accept Terms to continue");
      return;
    }
    localStorage.setItem("preferredLanguage", preferredLanguage);
    localStorage.setItem("role", role);
    localStorage.setItem("newsletter_opt_in", String(newsletter));
    if (referral) localStorage.setItem("referral_code", referral);
    const result = await dispatch(registerUser({ ...form, role }));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    }
  };

  return (
    <>
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50 p-6 pt-24 pb-24">
      <div className="fixed top-0 left-0 right-0 z-40"><PublicNavbar /></div>
      
      <Motion.div
        className="pointer-events-none absolute -top-24 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-white/70 via-white/50 to-white/30 blur-3xl shadow-xl ring-1 ring-white/50"
        animate={{ y: [0, -18, 0], x: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <Motion.div
        className="pointer-events-none absolute -bottom-32 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-white/60 via-white/40 to-white/20 blur-3xl shadow-xl ring-1 ring-white/50"
        animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <Motion.div
        className="pointer-events-none absolute inset-[-25%] rounded-full"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.28), rgba(255,255,255,0.18), rgba(255,255,255,0.12), rgba(255,255,255,0.28))",
          filter: "blur(80px)",
          opacity: 0.6,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      <Motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/90 backdrop-blur shadow-2xl rounded-2xl w-full max-w-md p-8 border border-white/60"
      >
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 text-center">
          Create Learning Account
        </h2>
        <p className="mb-4 text-center text-xs text-amber-700">
          Educational use only. Not financial advice. Not intended for live trading or developer workflows.
        </p>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {localError && (
          <div role="alert" aria-live="assertive" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {localError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="name" className="sr-only">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
            autoComplete="name"
            aria-invalid={!isNameValid}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <div>
            <label htmlFor="email" className="sr-only">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              aria-invalid={!isEmailValid}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none ${
                isEmailValid
                  ? "focus:ring-indigo-400"
                  : "focus:ring-red-400 border-red-300"
              }`}
            />
            {emailSuggestion && (
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, email: emailSuggestion })
                }
                className="mt-1 text-xs text-indigo-700 hover:underline"
              >
                Did you mean {emailSuggestion}?
              </button>
            )}
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              onKeyUp={(e) =>
                setCapsPassword(e.getModifierState && e.getModifierState("CapsLock"))
              }
              required
              autoComplete="new-password"
              aria-describedby="passwordHelp"
              aria-invalid={!isPasswordValid}
              className={`w-full px-4 py-3 pr-32 border rounded-lg focus:ring-2 outline-none ${
                isPasswordValid
                  ? "focus:ring-indigo-400"
                  : "focus:ring-yellow-400"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-sm text-indigo-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Generate
              </button>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength <= 1
                    ? "bg-red-400 w-1/4"
                    : strength === 2
                    ? "bg-yellow-400 w-1/2"
                    : strength === 3
                    ? "bg-blue-400 w-3/4"
                    : "bg-green-500 w-full"
                }`}
              />
            </div>
            {capsPassword && (
              <div className="mt-1 text-xs text-amber-700">
                Caps Lock is on
              </div>
            )}
            <p id="passwordHelp" className="mt-1 text-xs text-gray-500">
              Use at least 8 characters with upper, lower and a number.
            </p>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyUp={(e) =>
                setCapsConfirm(e.getModifierState && e.getModifierState("CapsLock"))
              }
              required
              autoComplete="new-password"
              aria-invalid={!isConfirmMatch}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none ${
                isConfirmMatch ? "focus:ring-indigo-400" : "focus:ring-red-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
            {capsConfirm && (
              <div className="mt-1 text-xs text-amber-700">
                Caps Lock is on
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
            >
              <option value="yo">Yorùbá</option>
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
            >
              <option value="learner">Learner</option>
              <option value="educator">Educator</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Referral code (optional)"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Send me learning tips and product updates
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            I agree to the Terms and Privacy Policy
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            aria-busy={loading}
            className={`w-full text-white py-3 rounded-lg transition duration-300 ${
              isSubmitDisabled ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium">
            Login
          </Link>
        </p>
      </Motion.div>
      
    </div>
    <PublicFooter />
    </>
  );
};

export default RegisterPage;
