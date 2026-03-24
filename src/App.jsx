import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/dashboard/layout/DashboardLayout';
import MentorLayout from './components/dashboard/layout/MentorLayout';
import CodeGenerationLayout from './components/dashboard/layout/CodeGenerationLayout';
import BacktestLayout from './components/dashboard/layout/BacktestLayout';
import SignalsLayout from './components/dashboard/layout/SignalsLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WhyPage from './pages/WhyPage';
import HowToUsePage from './pages/HowToUsePage';
import ServicesPage from './pages/ServicesPage';
import AboutOurStoryPage from './pages/AboutOurStoryPage';
import AboutVisionValuesPage from './pages/AboutVisionValuesPage';
import SecurityPrivacyPage from './pages/SecurityPrivacyPage';
import HowAIHelpsPage from './pages/HowAIHelpsPage';
import ContactSupportPage from './pages/ContactSupportPage';
import TeamNamesPage from './pages/TeamNamesPage';
import TranscriptPage from './pages/TranscriptPage';
import StrategyLabPage from './pages/StrategyLabPage';
import BacktestPage from './pages/BacktestPage';
import MentorPage from './pages/MentorPage';
import EmailConfirmedPage from './pages/EmailConfirmedPage';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile/Profile';
import ProfileEdit from './pages/dashboard/Profile/ProfileEdit';
import ActivityLog from './pages/dashboard/Activity/ActivityLog';
import MentorConversations from './pages/dashboard/Mentor/MentorConversations';
import MentorMessages from './pages/dashboard/Mentor/MentorMessages';
import CodeGenSessions from './pages/dashboard/CodeGeneration/CodeGenSessions';
import CodeGeneration from './pages/dashboard/CodeGeneration/CodeGeneration';
import Backtests from './pages/dashboard/Backtests/Backtests';
import BacktestTrades from './pages/dashboard/Backtests/BacktestTrades';
import Signals from './pages/dashboard/Signals/Signals';
import HistoryPage from './pages/dashboard/HistoryPage';
import LearningPage from './pages/dashboard/LearningPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import TranscriptDashboard from './pages/dashboard/Transcript/TranscriptDashboard';

import ProtectedRoute from './layout/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#1A1A1A',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmed" element={<EmailConfirmedPage />} />
          <Route path="/auth/confirm" element={<EmailConfirmedPage />} />
          <Route path="/why" element={<WhyPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about/our-story" element={<AboutOurStoryPage />} />
          <Route path="/about/vision-values" element={<AboutVisionValuesPage />} />
          <Route path="/about/security" element={<SecurityPrivacyPage />} />
          <Route path="/how-ai-helps" element={<HowAIHelpsPage />} />
          <Route path="/contact/support" element={<ContactSupportPage />} />
          <Route path="/team" element={<TeamNamesPage />} />
          <Route path="/transcript" element={<TranscriptPage />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/strategy" element={<StrategyLabPage />} />

          <Route path="/mentor" element={<MentorPage />} />

          {/* Dashboard Routes (Protected) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/activity" element={<ActivityLog />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/profile/edit" element={<ProfileEdit />} />
            <Route path="/dashboard/transcript" element={<TranscriptDashboard />} />
            <Route path="/dashboard/learning" element={<LearningPage />} />
            <Route path="/dashboard/history" element={<HistoryPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />

            {/* Mentor App Routes */}
            <Route path="/dashboard/mentor" element={<MentorLayout />}>
              <Route index element={<Navigate to="conversations" replace />} />
              <Route path="conversations" element={<MentorConversations />} />
              <Route path="messages/:conversationId" element={<MentorMessages />} />
            </Route>

            {/* Backtests Routes */}
            <Route path="/dashboard/backtest" element={<BacktestLayout />}>
              <Route index element={<Backtests />} />
              <Route path=":backtestId" element={<Backtests />} />
              <Route path=":backtestId/trades" element={<BacktestTrades />} />
              <Route path="new" element={<Backtests />} />
            </Route>



            {/* CodeGen Lab (Code Generation) Routes */}
            <Route path="/dashboard/codegen" element={<CodeGenerationLayout />}>
              <Route index element={<Navigate to="sessions" replace />} />
              <Route path="sessions" element={<CodeGenSessions />} />
              <Route path="session/:conversationId" element={<CodeGeneration />} />
            </Route>

            {/* Signals Routes */}
            <Route path="/dashboard/signals" element={<SignalsLayout />}>
              <Route index element={<Signals />} />
              <Route path=":signalId" element={<Signals />} />
              <Route path="new" element={<Signals />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
