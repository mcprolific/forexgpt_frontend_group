import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SignalResult = ({ signal, user }) => {
    const navigate = useNavigate();
    if (!signal) return null;
    const navigate = useNavigate();

    // Unified Mapping for SignalResponse (live) vs Database Row (saved)
    const data = {
        company:    signal.company_name   || signal.source_label      || 'N/A',
        pair:       signal.currency_pair  || signal.base_currency      || 'N/A',
        detected:   signal.signal === false ? 'NO' : 'YES',
        direction: (signal.direction      || signal.primary_direction  || 'NEUTRAL').toUpperCase(),
        confidence: signal.confidence != null ? `${Math.round(signal.confidence * 100)}%` : '—',
        magnitude:  signal.magnitude      || signal.primary_strength   || 'N/A',
        horizon:    signal.time_horizon   || signal.source_type        || 'N/A',
        reasoning:  signal.reasoning      || 'No further analysis available.',
        id:         signal.signal_id      || signal.id                 || 'Pending',
        time:       signal.timestamp      || signal.created_at         || new Date().toISOString(),
        isSaved:    signal.is_saved ? 'Yes' : (signal.signal_id ? 'Yes' : 'No'),
        userId:     user?.user_id || user?.id || 'a792422a-cbb7-40e2-b7cd-f396f1c45b32',
    };

    const labelWidth = 17;
    const pad = (label) => label.padEnd(labelWidth, ' ');

    const confidencePct = signal.confidence != null ? Math.round(signal.confidence * 100) : null;

    // ── Navigate to Mentor — with auth guard
    const handleLearnAboutSignal = () => {
        const destination = user?.id
            ? '/dashboard/mentor/messages/new'
            : '/mentor';

        navigate(destination, {
            state: {
                fromSignals: true,
                prefilledQuestion: `Explain why ${data.reasoning}. How does this affect ${data.pair}?`,
            },
        });
    };

    // ── Navigate to CodeGen — with auth guard 
    const handleGenerateStrategy = () => {
        const destination = user?.id
            ? '/dashboard/codegen/session/new'
            : '/codegen';

        navigate(destination, {
            state: {
                fromSignals: true,
                prefilledDescription: `Create a strategy that trades ${data.pair} ${data.direction} when companies report similar forex exposure signals. Use confidence threshold of ${confidencePct != null ? `${confidencePct}%` : 'a suitable threshold'}.`,
            },
        });
    };

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-[12px] leading-relaxed text-gray-400 bg-[#050505] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden w-full max-w-[calc(100vw-1rem)] min-w-0 break-all sm:break-normal md:min-w-[600px]"
        >
            {/* Subtle scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />

            <div className="relative z-10 whitespace-normal">
                <div className="text-white font-black tracking-[0.2em] uppercase mb-8 text-center sm:text-left">
                    {'                '}SIGNAL EXTRACTION RESULT
                </div>

                <div className="mb-6">
                    <div className="flex"><span>{pad('Company')}</span> : <span className="text-white font-bold ml-1">{data.company}</span></div>
                    <div className="flex"><span>{pad('Currency Pair')}</span> : <span className="text-white font-bold ml-1">{data.pair}</span></div>
                    <div className="flex"><span>{pad('Signal Detected')}</span> : <span className="text-yellow-500 font-black ml-1">{data.detected}</span></div>
                </div>

                <div className="mb-10">
                    <div className="flex"><span>{pad('Direction')}</span> : <span className={`ml-1 font-black ${data.direction === 'LONG' ? 'text-green-500' : data.direction === 'SHORT' ? 'text-red-500' : 'text-white'}`}>{data.direction}</span></div>
                    <div className="flex"><span>{pad('Confidence Level')}</span> : <span className="text-white font-bold ml-1">{data.confidence}</span></div>
                    <div className="flex"><span>{pad('Magnitude')}</span> : <span className="text-white font-bold ml-1 capitalize">{data.magnitude}</span></div>
                    <div className="flex"><span>{pad('Time Horizon')}</span> : <span className="text-white font-bold ml-1 capitalize">{data.horizon}</span></div>
                </div>

                <div className="text-white font-black tracking-widest uppercase mb-6">
                    {'                    '}Reasoning
                </div>

                <div className="mb-10 text-gray-300 whitespace-pre-wrap leading-relaxed max-w-none">
                    {data.reasoning}
                </div>

                <div className="text-white font-black tracking-widest uppercase mb-6">
                    {'                '}Signal Information
                </div>

                <div className="opacity-60 mb-10">
                    <div className="flex"><span>{pad('Signal ID')}</span> : <span className="text-white font-bold ml-1">{data.id}</span></div>
                    <div className="flex"><span>{pad('Generated Time')}</span> : <span className="text-white font-bold ml-1">{new Date(data.time).toISOString().replace('T', ' ').split('.')[0]} UTC</span></div>
                    <div className="flex"><span>{pad('Saved to DB')}</span> : <span className="text-white font-bold ml-1">{data.isSaved}</span></div>
                    <div className="flex"><span>{pad('User ID')}</span> : <span className="text-white font-bold ml-1">{data.userId}</span></div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                    <button
                        onClick={handleLearnAboutSignal}
                        className="flex-1 px-4 py-2.5 text-[11px] tracking-widest uppercase font-black border border-white/10 text-gray-400 hover:text-white hover:border-yellow-600 transition-all duration-200 rounded-xl"
                    >
                        Learn About This Signal
                    </button>
                    <button
                        onClick={handleGenerateStrategy}
                        className="flex-1 px-4 py-2.5 text-[11px] tracking-widest uppercase font-black bg-white/5 border border-white/10 text-white hover:bg-yellow-600 transition-all duration-200 rounded-xl"
                    >
                        Generate Strategy
                    </button>
                </div>
            </div>
        </Motion.div>
    );
};

export default SignalResult;
