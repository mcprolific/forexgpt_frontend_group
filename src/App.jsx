import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from './layout/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/ui/LoadingScreen';
import { logoutUser } from './features/auth/authSlice';

// ── Layouts (lazy) ────────────────────────────────────────────────────
const DashboardLayout      = lazy(() => import('./components/dashboard/layout/DashboardLayout'));
const MentorLayout         = lazy(() => import('./components/dashboard/layout/MentorLayout'));
const CodeGenerationLayout = lazy(() => import('./components/dashboard/layout/CodeGenerationLayout'));
const BacktestLayout       = lazy(() => import('./components/dashboard/layout/BacktestLayout'));
const SignalsLayout        = lazy(() => import('./components/dashboard/layout/SignalsLayout'));

// ── Public Pages (lazy) ───────────────────────────────────────────────
const HomePage              = lazy(() => import('./pages/HomePage'));
const LoginPage             = lazy(() => import('./pages/LoginPage'));
const RegisterPage          = lazy(() => import('./pages/RegisterPage'));
const EmailConfirmedPage    = lazy(() => import('./pages/EmailConfirmedPage'));
const ResetPasswordPage     = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage       = lazy(() => import('./pages/VerifyEmailPage'));
const WhyPage               = lazy(() => import('./pages/WhyPage'));
const HowToUsePage          = lazy(() => import('./pages/HowToUsePage'));
const ServicesPage          = lazy(() => import('./pages/ServicesPage'));
const AboutOurStoryPage     = lazy(() => import('./pages/AboutOurStoryPage'));
const AboutVisionValuesPage = lazy(() => import('./pages/AboutVisionValuesPage'));
const SecurityPrivacyPage   = lazy(() => import('./pages/SecurityPrivacyPage'));
const HowAIHelpsPage        = lazy(() => import('./pages/HowAIHelpsPage'));
const ContactSupportPage    = lazy(() => import('./pages/ContactSupportPage'));
const TeamNamesPage         = lazy(() => import('./pages/TeamNamesPage'));
const TranscriptPage        = lazy(() => import('./pages/TranscriptPage'));
const StrategyLabPage       = lazy(() => import('./pages/StrategyLabPage'));
const BacktestPage          = lazy(() => import('./pages/BacktestPage'));
const MentorPage            = lazy(() => import('./pages/MentorPage'));

// ── Dashboard Pages (lazy) ────────────────────────────────────────────
const Dashboard           = lazy(() => import('./pages/dashboard/Dashboard'));
const Profile             = lazy(() => import('./pages/dashboard/Profile/Profile'));
const ProfileEdit         = lazy(() => import('./pages/dashboard/Profile/ProfileEdit'));
const ActivityLog         = lazy(() => import('./pages/dashboard/Activity/ActivityLog'));
const MentorConversations = lazy(() => import('./pages/dashboard/Mentor/MentorConversations'));
const MentorMessages      = lazy(() => import('./pages/dashboard/Mentor/MentorMessages'));
const CodeGenSessions     = lazy(() => import('./pages/dashboard/CodeGeneration/CodeGenSessions'));
const CodeGeneration      = lazy(() => import('./pages/dashboard/CodeGeneration/CodeGeneration'));
const Backtests           = lazy(() => import('./pages/dashboard/Backtests/Backtests'));
const BacktestTrades      = lazy(() => import('./pages/dashboard/Backtests/BacktestTrades'));
const Signals             = lazy(() => import('./pages/dashboard/Signals/Signals'));
const HistoryPage         = lazy(() => import('./pages/dashboard/HistoryPage'));
const LearningPage        = lazy(() => import('./pages/dashboard/LearningPage'));
const SettingsPage        = lazy(() => import('./pages/dashboard/SettingsPage'));
const TranscriptDashboard = lazy(() => import('./pages/dashboard/Transcript/TranscriptDashboard'));

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const countdownIntervalRef = useRef(null);
  const INACTIVITY_MS = 10 * 60 * 1000;
  const WARNING_MS = 1 * 60 * 1000;
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(60);

  useEffect(() => {
    const hasToken = token || (typeof localStorage !== "undefined" ? localStorage.getItem("token") : null);
    if (!user && !hasToken) return undefined;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (showInactivityWarning) setShowInactivityWarning(false);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setWarningSecondsLeft(Math.floor(WARNING_MS / 1000));

      warningTimerRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
        const tick = () => {
          const elapsed = Date.now() - lastActivityRef.current;
          const remaining = Math.max(INACTIVITY_MS - elapsed, 0);
          setWarningSecondsLeft(Math.ceil(remaining / 1000));
        };
        tick();
        countdownIntervalRef.current = setInterval(tick, 1000);
      }, INACTIVITY_MS - WARNING_MS);

      inactivityTimerRef.current = setTimeout(() => {
        dispatch(logoutUser());
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }, INACTIVITY_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [dispatch, token, user, showInactivityWarning]);

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
      {showInactivityWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0B0B0B] p-6 text-white shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-yellow-500 mb-3">
              Inactivity Warning
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              You will be logged out in {warningSecondsLeft}s due to inactivity.
              Move your mouse or press any key to stay signed in.
            </p>
            <button
              onClick={() => {
                lastActivityRef.current = Date.now();
                setShowInactivityWarning(false);
              }}
              className="w-full py-2.5 rounded-xl bg-yellow-500 text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Stay Signed In
            </button>
          </div>
        </div>
      )}
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmed" element={<EmailConfirmedPage />} />
          <Route path="/auth/confirm" element={<EmailConfirmedPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
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
          <Route path="/codegen" element={<StrategyLabPage />} />

          <Route path="/mentor" element={<MentorPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

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

              {/* CodeGen Lab Routes */}
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
        </Suspense>
      </Router>
    </>
  );
}

export default App;
