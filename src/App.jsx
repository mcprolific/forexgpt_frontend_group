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
import WhyPage from "./pages/WhyPage";
import HowAIHelpsPage from "./pages/HowAIHelpsPage";
import HowToUsePage from "./pages/HowToUsePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import AboutOurStoryPage from "./pages/AboutOurStoryPage";
import AboutVisionValuesPage from "./pages/AboutVisionValuesPage";
import SecurityPrivacyPage from "./pages/SecurityPrivacyPage";
import ContactSupportPage from "./pages/ContactSupportPage";
import TeamNamesPage from "./pages/TeamNamesPage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";

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
        <Route path="/why" element={<WhyPage />} />
        <Route path="/how-ai-helps" element={<HowAIHelpsPage />} />
        <Route path="/how-to-use" element={<HowToUsePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/our-story" element={<AboutOurStoryPage />} />
        <Route path="/about/vision-values" element={<AboutVisionValuesPage />} />
        <Route path="/about/security" element={<SecurityPrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/contact/support" element={<ContactSupportPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/team" element={<TeamNamesPage />} />
        <Route path="/backtest" element={<BacktestPage />} />
        <Route path="/mentor" element={<MentorPage />} />
        <Route path="/signals" element={<SignalAnalysisPage />} />
        <Route path="/strategy" element={<StrategyLabPage />} />
        <Route path="/transcript" element={<TranscriptPage />} />
        <Route path="/auth/confirmed" element={<EmailConfirmedPage />} />

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
        <Route path="/datadashboard" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          
          
          
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
