// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "./layout/Layout";
import ProtectedRoute from "./layout/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FooterPage from "./pages/FooterPage";

// Protected Pages
import DashboardPage from "./pages/DashboardPage";
import TranscriptPage from "./pages/TranscriptPage";
import SignalAnalysisPage from "./pages/SignalAnalysisPage";
import MentorPage from "./pages/MentorPage";
import StrategyLabPage from "./pages/StrategyLabPage";
import BacktestPage from "./pages/BacktestPage";
import LearningPage from "./pages/LearningPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/footer" element={<FooterPage />} />

        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transcript" element={<TranscriptPage />} />
          <Route path="signals" element={<SignalAnalysisPage />} />
          <Route path="mentor" element={<MentorPage />} />
          <Route path="strategy" element={<StrategyLabPage />} />
          <Route path="backtest" element={<BacktestPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
