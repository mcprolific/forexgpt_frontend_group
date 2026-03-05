import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/dashboard/layout/DashboardLayout';
import ProfileLayout from './components/dashboard/layout/ProfileLayout';
import MentorLayout from './components/dashboard/layout/MentorLayout';
import CodeGenerationLayout from './components/dashboard/layout/CodeGenerationLayout';
import BacktestLayout from './components/dashboard/layout/BacktestLayout';
import SignalsLayout from './components/dashboard/layout/SignalsLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile/Profile';
import ProfileEdit from './pages/dashboard/Profile/ProfileEdit';
import ActivityLog from './pages/dashboard/Activity/ActivityLog';
import MentorConversations from './pages/dashboard/Mentor/MentorConversations';
import MentorMessages from './pages/dashboard/Mentor/MentorMessages';
import CodeGeneration from './pages/dashboard/CodeGeneration/CodeGeneration';
import Backtests from './pages/dashboard/Backtests/Backtests';
import BacktestTrades from './pages/dashboard/Backtests/BacktestTrades';
import Signals from './pages/dashboard/Signals/Signals';

function App() {
  return (
    <Router>
      <Routes>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Route>

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<Profile />} />
          <Route path="edit" element={<ProfileEdit />} />
        </Route>

        {/* Mentor Routes */}
        <Route path="/mentor" element={<MentorLayout />}>
          <Route index element={<Navigate to="conversations" replace />} />
          <Route path="conversations" element={<MentorConversations />} />
          <Route path="messages/:conversationId" element={<MentorMessages />} />
        </Route>

        {/* Code Generation Routes */}
        <Route path="/code" element={<CodeGenerationLayout />}>
          <Route index element={<CodeGeneration />} />
          <Route path="session/:sessionId" element={<CodeGeneration />} />
        </Route>

        {/* Backtests Routes */}
        <Route path="/backtests" element={<BacktestLayout />}>
          <Route index element={<Backtests />} />
          <Route path=":backtestId" element={<Backtests />} />
          <Route path=":backtestId/trades" element={<BacktestTrades />} />
          <Route path="new" element={<Backtests />} />
        </Route>

        {/* Signals Routes */}
        <Route path="/signals" element={<SignalsLayout />}>
          <Route index element={<Signals />} />
          <Route path=":signalId" element={<Signals />} />
          <Route path="new" element={<Signals />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;