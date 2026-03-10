import React from 'react';
import { FiStar, FiShare2, FiDownload, FiTrendingUp, FiTrendingDown, FiClock, FiTarget, FiActivity, FiZap } from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';

const SignalCard = ({ signal, view }) => {
  const isBullish = signal.direction?.toLowerCase() === 'long' || signal.direction?.toLowerCase() === 'buy';
  const isBearish = signal.direction?.toLowerCase() === 'short' || signal.direction?.toLowerCase() === 'sell';

  const getStrengthLabel = () => {
    const strength = signal.magnitude || 'Moderate';
    return strength.toUpperCase();
  };

  const getConfidenceColor = () => {
    if (signal.confidence >= 0.8) return 'text-green-500';
    if (signal.confidence >= 0.6) return 'text-yellow-500';
    return 'text-gray-500';
  };

  if (view === 'list') {
    return (
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden group"
      >
        {/* Background Glow */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${isBullish ? 'from-green-500/5' : isBearish ? 'from-red-500/5' : 'from-yellow-500/5'} to-transparent`} />

        <div className="relative bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between gap-6">
            {/* Primary Info */}
            <div className="flex items-center gap-5 flex-1">
              {/* Direction Icon */}
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${isBullish ? 'bg-green-500/10 border-green-500/20 text-green-500' : isBearish ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                {isBullish ? <FiTrendingUp size={24} /> : isBearish ? <FiTrendingDown size={24} /> : <FiActivity size={24} />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-sm uppercase tracking-wider">{signal.company_name || signal.source_label || 'Institutional Signal'}</h3>
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5">{signal.asset_class || 'FX'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(signal.currency_pair) ? signal.currency_pair.map((pair, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-yellow-500/80">{pair}</span>
                  )) : <span className="text-[10px] font-bold text-yellow-500/80">{signal.currency_pair}</span>}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="hidden md:flex items-center gap-8">
              <div className="text-right">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Confidence</div>
                <div className={`text-xs font-black ${getConfidenceColor()}`}>{Math.round(signal.confidence * 100)}%</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Strength</div>
                <div className="text-xs font-black text-white">{getStrengthLabel()}</div>
              </div>
              <div className="h-8 w-px bg-white/5" />
            </div>

            {/* Actions (excluding delete which is handled in parent list) */}
            <div className="flex items-center gap-2 pr-10">
              <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all">
                <FiEye size={16} />
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    );
  }

  // Default Detailed View (Card)
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent hover:from-yellow-500/10 transition-all"
    >
      <div className="h-full bg-black/80 backdrop-blur-xl rounded-[28px] p-6 border border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FiZap size={12} className="text-yellow-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{signal.time_horizon || 'Forex'}</span>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">{signal.company_name || signal.source_label || 'Neural Signal'}</h3>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isBullish ? 'bg-green-500/10 border-green-500/20 text-green-500' : isBearish ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
            {isBullish ? <FiTrendingUp size={20} /> : isBearish ? <FiTrendingDown size={20} /> : <FiActivity size={20} />}
          </div>
        </div>

        {signal.reasoning && (
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 line-clamp-3">
            {signal.reasoning}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {Array.isArray(signal.currency_pair) ? signal.currency_pair.map((pair, idx) => (
            <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-yellow-500 uppercase tracking-widest">{pair}</span>
          )) : <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-yellow-500 uppercase tracking-widest">{signal.currency_pair}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div>
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <FiTarget size={10} /> Magnitude
            </div>
            <div className="text-xs font-black text-white">{getStrengthLabel()}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
              Alpha Probability
            </div>
            <div className={`text-xs font-black ${getConfidenceColor()}`}>{Math.round(signal.confidence * 100)}%</div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default SignalCard;
