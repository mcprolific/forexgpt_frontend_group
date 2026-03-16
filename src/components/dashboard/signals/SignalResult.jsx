import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SignalResult = ({ signal, user }) => {
    if (!signal) return null;
    const navigate = useNavigate();

    // Unified Mapping for SignalResponse (live) vs Database Row (saved)
    const data = {
        company: signal.company_name || signal.source_label || 'N/A',
        pair: signal.currency_pair || signal.base_currency || 'N/A',
        detected: signal.signal === false ? 'NO' : 'YES',
        direction: (signal.direction || signal.primary_direction || 'NEUTRAL').toUpperCase(),
        confidence: signal.confidence != null ? `${Math.round(signal.confidence * 100)}%` : '—',
        magnitude: signal.magnitude || signal.primary_strength || 'N/A',
        horizon: signal.time_horizon || signal.source_type || 'N/A',
        reasoning: signal.reasoning || 'No further analysis available.',
        id: signal.signal_id || signal.id || 'Pending',
        time: signal.timestamp || signal.created_at || new Date().toISOString(),
        isSaved: signal.is_saved ? 'Yes' : (signal.signal_id ? 'Yes' : 'No'),
        userId: user?.user_id || user?.id || 'a792422a-cbb7-40e2-b7cd-f396f1c45b32'
    };

    const buildMentorQuestion = () => {
        const reasoning = signal.reasoning || 'this signal was detected';
        const pair = signal.currency_pair || signal.base_currency || 'this currency pair';
        return `Explain why ${reasoning}. How does this affect ${pair}?`;
    };

    const handleLearnAboutSignal = () => {
        navigate('/dashboard/mentor/messages/new', {
            state: {
                fromSignals: true,
                prefilledQuestion: buildMentorQuestion()
            }
        });
    };

    const handleGenerateStrategy = () => {
        const confidence =
            signal.confidence != null ? `${Math.round(signal.confidence * 100)}%` : 'a suitable threshold';
        navigate('/dashboard/codegen/session/new', {
            state: {
                fromSignals: true,
                prefilledDescription: `Create a strategy that trades ${data.pair} ${data.direction} when companies report similar forex exposure signals. Use confidence threshold of ${confidence}.`
            }
        });
    };

    const labelWidth = 17;
    const pad = (label) => label.padEnd(labelWidth, ' ');

    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-[12px] leading-relaxed text-gray-400 bg-[#050505] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
            {/* Subtle scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />

            <div className="relative z-10 whitespace-pre">
                <div className="text-white font-black tracking-[0.2em] uppercase mb-8">
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

                <div className="mb-10 text-gray-300 whitespace-pre-wrap leading-relaxed max-w-lg">
                    {data.reasoning}
                </div>

                {signal.signal === true && (
                    <div className="mb-10 flex flex-wrap gap-3">
                        <button
                            onClick={handleLearnAboutSignal}
                            className="px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-widest text-gray-200 hover:text-yellow-500 hover:border-yellow-500/40 transition"
                        >
                            Learn About This Signal
                        </button>
                        <button
                            onClick={handleGenerateStrategy}
                            className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition"
                        >
                            Generate Strategy Based On This
                        </button>
                    </div>
                )}

                <div className="text-white font-black tracking-widest uppercase mb-6">
                    {'                '}Signal Information
                </div>

                <div className="opacity-60">
                    <div className="flex"><span>{pad('Signal ID')}</span> : <span className="text-white font-bold ml-1">{data.id}</span></div>
                    <div className="flex"><span>{pad('Generated Time')}</span> : <span className="text-white font-bold ml-1">{new Date(data.time).toISOString().replace('T', ' ').split('.')[0]} UTC</span></div>
                    <div className="flex"><span>{pad('Saved to DB')}</span> : <span className="text-white font-bold ml-1">{data.isSaved}</span></div>
                    <div className="flex"><span>{pad('User ID')}</span> : <span className="text-white font-bold ml-1">{data.userId}</span></div>
                </div>
            </div>
        </Motion.div>
    );
};

export default SignalResult;
