import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiTrendingDown, FiMinus,
  FiCpu, FiMessageCircle, FiCode
} from 'react-icons/fi';

// ─── Direction config ─────────────────────────────────────────────────────────
const DIR_CONFIG = {
  LONG: {
    label: 'LONG',
    icon: FiTrendingUp,
    gradient: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
    dot: 'bg-green-500',
    text: 'text-green-400',
    glow: 'shadow-green-500/10',
  },
  SHORT: {
    label: 'SHORT',
    icon: FiTrendingDown,
    gradient: 'from-red-500/20 to-red-500/5',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    dot: 'bg-red-500',
    text: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  NEUTRAL: {
    label: 'NEUTRAL',
    icon: FiMinus,
    gradient: 'from-white/5 to-transparent',
    border: 'border-white/10',
    badge: 'bg-white/10 text-gray-400 border border-white/10',
    dot: 'bg-gray-400',
    text: 'text-gray-400',
    glow: 'shadow-black/10',
  },
};

// ─── Circular confidence ring (pure CSS + SVG) ────────────────────────────────
const ConfidenceRing = ({ pct }) => {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  const color = pct >= 70 ? '#22c55e' : pct >= 45 ? '#D4AF37' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" className="-rotate-90" style={{ position: 'absolute' }}>
        {/* Track */}
        <circle cx={40} cy={40} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        {/* Arc */}
        <circle
          cx={40} cy={40} r={radius} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-lg font-black text-white leading-none">{pct}%</div>
        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Conf.</div>
      </div>
    </div>
  );
};

// ─── Tag pill ─────────────────────────────────────────────────────────────────
const Tag = ({ label, value }) => (
  <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/5 min-w-[80px]">
    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">{label}</span>
    <span className="text-[11px] font-black text-white uppercase">{value || '—'}</span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SignalResult = ({ signal, user }) => {
  const navigate = useNavigate();
  if (!signal) return null;

  const data = {
    company: signal.company_name || signal.source_label || 'Unknown',
    pair: signal.currency_pair || signal.base_currency || '—',
    detected: signal.signal === false ? 'NO' : 'YES',
    direction: (signal.direction || signal.primary_direction || 'NEUTRAL').toUpperCase(),
    confidence: signal.confidence != null ? Math.round(signal.confidence * 100) : 0,
    magnitude: signal.magnitude || signal.primary_strength || null,
    horizon: signal.time_horizon || signal.source_type || null,
    reasoning: signal.reasoning || 'No further analysis available.',
    id: signal.signal_id || signal.id || 'Pending',
    time: signal.timestamp || signal.created_at || new Date().toISOString(),
    isSaved: signal.is_saved ? true : !!signal.signal_id,
    userId: user?.user_id || user?.id,
  };

  const transcriptText =
    signal.transcript ||
    signal.raw_transcript ||
    signal.source_transcript ||
    signal.source_text ||
    signal.raw_text ||
    signal.raw_response?.transcript ||
    signal.raw_response?.text ||
    '';

  const dir = DIR_CONFIG[data.direction] || DIR_CONFIG.NEUTRAL;
  const DirIcon = dir.icon;

  const handleLearnAboutSignal = () => {
    const reasoning = signal.reasoning || 'this signal was detected';
    const pair = signal.currency_pair || signal.base_currency || 'this currency pair';
    const dest = user?.id ? '/dashboard/mentor/messages/new' : '/mentor';
    navigate(dest, {
      state: {
        fromSignals: true,
        prefilledQuestion: `Explain why ${reasoning}. How does this affect ${pair}?`,
      },
    });
  };

  const handleGenerateStrategy = () => {
    const confidence = data.confidence ? `${data.confidence}%` : 'a suitable threshold';
    const dest = user?.id ? '/dashboard/codegen/session/new' : '/codegen';
    navigate(dest, {
      state: {
        fromSignals: true,
        prefilledDescription: `Create a strategy that trades ${data.pair} ${data.direction} when companies report similar forex exposure signals. Use confidence threshold of ${confidence}.`,
      },
    });
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`backdrop-blur-3xl rounded-3xl border bg-gradient-to-br ${dir.gradient} ${dir.border} shadow-2xl ${dir.glow} flex flex-col items-stretch justify-start`}
    >
      {/* Subtle scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px] z-0" />

      <div className="relative z-10 p-6 md:p-8 pb-10 space-y-6 flex flex-col">

        {/* ── Top row: pair + direction badge + confidence ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {/* Company */}
            <div className="flex items-center gap-2 mb-1">
              <FiCpu size={11} className="text-gray-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {data.company}
              </span>
              {data.isSaved && (
                <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-widest border border-yellow-500/20 px-1.5 py-0.5 rounded-full">
                  Saved
                </span>
              )}
            </div>

            {/* Currency pair — hero text */}
            <div className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-2">
              {data.pair}
            </div>

            {/* Direction badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${dir.badge}`}>
              <DirIcon size={13} />
              {dir.label}
              {data.detected === 'NO' && (
                <span className="ml-1 text-[9px] text-gray-500">(no signal)</span>
              )}
            </div>
          </div>

          {/* Confidence ring */}
          <ConfidenceRing pct={data.confidence} />
        </div>

        {/* ── Metadata chips ── */}
        <div className="flex flex-wrap gap-2">
          {data.magnitude && <Tag label="Magnitude" value={data.magnitude} />}
          {data.horizon && <Tag label="Horizon" value={data.horizon} />}
          <Tag label="Signal" value={data.detected} />
          <Tag label="Time" value={new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>

        {/* ── Reasoning block ── */}
        <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`h-1.5 w-1.5 rounded-full ${dir.dot}`} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              AI Reasoning
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {data.reasoning}
          </p>
        </div>

        {/* ── Meta footer ── */}
        <div className="flex flex-wrap items-center gap-3 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
          <span>ID: {String(data.id).slice(0, 8)}…</span>
          <span className="text-white/10">•</span>
          <span>{new Date(data.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="text-white/10">•</span>
          <span>User: {String(data.userId || '—').slice(0, 8)}…</span>
        </div>

        {/* ── Action buttons ── */}
        {transcriptText && (
          <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Transcript Used
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {transcriptText}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
          <button
            onClick={handleLearnAboutSignal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10"
          >
            <FiMessageCircle size={13} />
            Learn about this signal
          </button>
          <button
            onClick={handleGenerateStrategy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-gray-200 text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
          >
            <FiCode size={13} />
            Generate Strategy
          </button>
        </div>
      </div>
    </Motion.div>
  );
};

export default SignalResult;
