import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";
import { useDispatch } from "react-redux";
import { confirmEmail } from "../features/auth/authSlice";

const getParam = (searchParams, hashParams, key) =>
  searchParams.get(key) || hashParams.get(key) || "";

const EmailConfirmedPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState({ loading: true, ok: false, message: "" });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(
      location.hash.startsWith("#") ? location.hash.slice(1) : location.hash
    );
    const tokenHash = getParam(searchParams, hashParams, "token_hash");
    const type = getParam(searchParams, hashParams, "type");
    const accessToken = getParam(searchParams, hashParams, "access_token");
    const confirmationToken =
      tokenHash ||
      getParam(searchParams, hashParams, "token") ||
      getParam(searchParams, hashParams, "confirmation_token");
    const errorDescription =
      getParam(searchParams, hashParams, "error_description") ||
      getParam(searchParams, hashParams, "error");

    (async () => {
      try {
        if (type === "recovery") {
          navigate(`/reset-password${location.search}${location.hash}`, {
            replace: true,
          });
          return;
        }

        if (errorDescription) {
          setStatus({ loading: false, ok: false, message: errorDescription });
          return;
        }

        if (accessToken && !confirmationToken) {
          setStatus({
            loading: false,
            ok: true,
            message: "Your email has already been confirmed. You can now log in to access your dashboard.",
          });
          return;
        }

        if (!confirmationToken || !type) {
          setStatus({
            loading: false,
            ok: false,
            message:
              "This confirmation link is missing information or has already been used. Request a new verification email and try again.",
          });
          return;
        }

        await dispatch(confirmEmail({ token_hash: confirmationToken, type })).unwrap();
        setStatus({ loading: false, ok: true, message: "Your email has been confirmed. You can now log in to access your dashboard." });

        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus({
          loading: false,
          ok: false,
          message: typeof err === "string" ? err : err?.message || "Confirmation failed.",
        });
      }
    })();
  }, [location.hash, location.search, dispatch, navigate]);

  return (
    <div className="relative min-h-screen bg-[#1A1A1A] overflow-hidden text-white selection:bg-[#D4AF37]/30">
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
            {status.loading ? "Confirming…" : status.ok ? "Email Confirmed" : "Confirmation Error"}
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            {status.loading ? "Please wait while we confirm your email." : status.message}
          </p>
          {!status.loading && (
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-2 mt-8 px-10 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FFD700, #D4AF37)", color: "#1A1A1A" }}
            >
              Go to Login
            </Link>
          )}
        </Motion.div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default EmailConfirmedPage;
