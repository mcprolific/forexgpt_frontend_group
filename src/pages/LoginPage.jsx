import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../layout/PublicNavbar";
import PublicFooter from "../layout/PublicFooter";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    dispatch(login({ email, password }))
      .unwrap()
      .then(() => navigate("/dashboard"));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-100 to-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 animate-gradient" />
      <div className="pointer-events-none absolute -top-20 -left-16 h-56 w-56 rounded-full bg-indigo-300/30 blob" />
      <div className="pointer-events-none absolute top-32 -right-20 h-64 w-64 rounded-full bg-pink-300/30 blob" />
      <div className="pointer-events-none absolute bottom-10 right-1/3 h-48 w-48 rounded-full bg-cyan-300/30 blob" />
      <div className="fixed top-0 left-0 right-0 z-40">
        <PublicNavbar />
      </div>
      <div className="flex items-center justify-center min-h-screen px-6 pt-24 pb-24 ">
        <Motion.div
          className="bg-white/95 backdrop-blur p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200 ring-1 ring-black/5 w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <Motion.h1
            className="text-3xl md:text-3xl font-extrabold tracking-tight mb-6 text-center text-slate-900 drop-shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Sign in to ForexGPT
          </Motion.h1>

          {error && (
            <Motion.p
              className="text-red-600 mb-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </Motion.p>
          )}

          <Motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          />
          <Motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          />
          <Motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
          >
            <Link
              to="/register"
              className="text-sm text-indigo-700 hover:text-indigo-800"
            >
              Create account
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-800">
              Forgot password?
            </a>
          </Motion.div>

          <Motion.button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition mb-2"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Motion.button>
        </Motion.div>
      </div>
      
    </div>
  );
};

export default LoginPage;
