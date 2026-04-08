import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiFilter, FiZap, FiCpu, FiPlus, FiTrash2, FiClock,
  FiActivity, FiTarget, FiX, FiTrendingUp, FiTrendingDown,
  FiMinus, FiAlertCircle, FiCheckCircle, FiList, FiGrid
} from 'react-icons/fi';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  extractSignal,
  batchExtract,
  getUserSignals,
  getSignalStats,
  getSignalDetail,
  deleteSignal,
  buildSignalStats,
} from '../../../services/signalService';
import SignalCard from '../../../components/dashboard/cards/SignalCard';
import SignalResult from '../../../components/dashboard/signals/SignalResult';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { logError, normalizeError } from '../../../utils/errorHandling';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#FFD700';

// -----------------------------------------------------------------------------
// Backend API Reference (do NOT change these):
//
// POST /signals/extract
//   Body: { transcript: str, company_name: str|null, user_id: str, save_to_db: bool }
//   Returns: SignalResponse { signal, currency_pair, direction, confidence,
//                             reasoning, magnitude, time_horizon, company_name,
//                             raw_response, signal_id, timestamp }
//
// POST /signals/batch
//   Body: { transcripts: [{text: str, company_name: str}], user_id: str, save_to_db: bool }
//   Returns: BatchSignalResponse { signals: [SignalResponse], total, signals_found }
//
// GET  /signals/user/{user_id}?limit=50&currency_pair=X&direction=Y
//   Returns: list of DB rows { id, source_type, source_label, base_currency,
//             primary_sentiment, primary_direction, primary_strength,
//             affected_pairs, confidence, is_saved, created_at }
//
// GET  /signals/user/{user_id}/{signal_id}
//   Returns: single DB row (same fields as above)
//
// GET  /signals/statistics/{user_id}
//   Returns: { total_signals, by_currency_pair, by_direction, by_magnitude,
//               average_confidence }
//   where by_direction keys are: LONG, SHORT, NEUTRAL, UNKNOWN
//
// DELETE /signals/{user_id}/{signal_id}
//   Returns: { message, signal_id }
// -----------------------------------------------------------------------------

const DirectionBadge = ({ direction }) => {
  const d = (direction || '').toUpperCase();
  if (d === 'LONG') return <span className="flex items-center gap-1 text-green-500 font-black text-[10px]"><FiTrendingUp size={11} /> LONG</span>;
  if (d === 'SHORT') return <span className="flex items-center gap-1 text-red-500   font-black text-[10px]"><FiTrendingDown size={11} /> SHORT</span>;
  return <span className="flex items-center gap-1 text-white-500 font-black text-[10px]"><FiMinus size={11} /> NEUTRAL</span>;
};

const SignalRow = ({ signal, onDelete, onClick }) => (
  <Motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    className="group relative flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer"
    onClick={onClick}
  >
    {/* Direction indicator */}
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${signal.direction === 'LONG' ? 'bg-green-500/10' :
      signal.direction === 'SHORT' ? 'bg-red-500/10' : 'bg-white/5'
      }`}>
      {signal.direction === 'LONG' && <FiTrendingUp className="text-green-500" size={18} />}
      {signal.direction === 'SHORT' && <FiTrendingDown className="text-red-500" size={18} />}
      {(!signal.direction || signal.direction === 'NEUTRAL') && <FiMinus className="text-white-500" size={18} />}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1">
        <p className="text-sm font-bold text-white truncate">
          {signal.company_name || signal.source_label || 'Signal Extract'}
        </p>
        <DirectionBadge direction={signal.direction} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {/* currency_pair (string from backend) */}
        {signal.currency_pair && (
          <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-wide">
            {signal.currency_pair}
          </span>
        )}
        {signal.primary_sentiment && (
          <span className="text-[10px] text-white-600 uppercase font-bold tracking-wide">{signal.primary_sentiment}</span>
        )}
        {signal.magnitude && (
          <span className="text-[10px] text-white-600 uppercase font-bold">{signal.magnitude}</span>
        )}
      </div>
    </div>

    {/* Confidence + Date */}
    <div className="text-right flex-shrink-0">
      {signal.confidence != null && (
        <div className="text-sm font-black text-yellow-500">{Math.round(signal.confidence * 100)}%</div>
      )}
      <div className="text-[9px] text-white-600 mt-0.5">
        {new Date(signal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>

    {/* Delete */}
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(signal.signal_id); }}
      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
    >
      <FiTrash2 size={13} />
    </button>
  </Motion.div>
);


// --- Main Page ----------------------------------------------------------------
const Signals = () => {
  const { user } = useSelector((state) => state.auth);
  const readStoredUserId = () => {
    if (typeof localStorage === "undefined" || typeof sessionStorage === "undefined") {
      return null;
    }
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.user_id || parsed?.id || null;
    } catch {
      return null;
    }
  };
  const userId = user?.user_id || user?.id || readStoredUserId();
  const location = useLocation();
  const navigate = useNavigate();

  const transcriptCacheKey = (id) => `fgpt_signal_transcripts_${id || "anon"}`;

  const readTranscriptCache = () => {
    if (typeof localStorage === "undefined") return {};
    try {
      const raw = localStorage.getItem(transcriptCacheKey(userId));
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const writeTranscriptCache = (next) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(transcriptCacheKey(userId), JSON.stringify(next || {}));
  };

  const storeTranscript = (signalId, text) => {
    if (!signalId || !text) return;
    const cache = readTranscriptCache();
    cache[signalId] = text;
    writeTranscriptCache(cache);
  };

  // Data
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [lastSingleResult, setLastSingleResult] = useState(null);
  const [lastBatchResults, setLastBatchResults] = useState([]);
  const [lastResultsSaved, setLastResultsSaved] = useState(false);
  const [showResultFocus, setShowResultFocus] = useState(false);

  // Mode
  const [mode, setMode] = useState('single'); // 'single' | 'batch'

  // Single mode - POST /signals/extract body fields
  const [transcript, setTranscript] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [saveToDb, setSaveToDb] = useState(true);

  // Batch mode - POST /signals/batch body: { transcripts: [{text, company_name}] }
  const [batchEntries, setBatchEntries] = useState([
    { company_name: '', text: '' },
  ]);
  const [batchSaveToDB, setBatchSaveToDB] = useState(true);

  // -- Fetch signals + stats --------------------------------------------------
  const fetchAll = async () => {
    if (!userId) return;
    try {
      setErrorMessage('');
      const [signalsData, statsData] = await Promise.all([
        getUserSignals(userId, 50),
        getSignalStats(userId),
      ]);
      const nextSignals = Array.isArray(signalsData) ? signalsData : [];
      setSignals(nextSignals);
      setStats(
        (statsData?.total_signals || 0) === 0 && nextSignals.length > 0
          ? buildSignalStats(nextSignals)
          : statsData
      );
    } catch (err) {
      logError('Fetch error:', err);
      toast.error(normalizeError(err, { fallback: 'Failed to load signals.' }));
      setErrorMessage(
        normalizeError(err, { fallback: 'Failed to load signals. Please try again.' })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [userId]);

  useEffect(() => {
    const selectedId = location.state?.selectedSignalId;
    if (!selectedId || !userId) return;

    let cancelled = false;
    const fromCache = signals.find(
      (s) => s?.signal_id === selectedId || s?.id === selectedId
    );
    if (fromCache) setSelectedSignal(fromCache);

    const loadDetail = async () => {
      try {
        const detail = await getSignalDetail(userId, selectedId);
        if (!cancelled) {
          const cachedTranscript = readTranscriptCache()[selectedId];
          const nextDetail =
            cachedTranscript &&
            detail &&
            !detail.transcript &&
            !detail.raw_transcript &&
            !detail.source_text
              ? { ...detail, transcript: cachedTranscript }
              : detail;
          setSelectedSignal(nextDetail || fromCache || null);
        }
      } catch (error) {
        logError("Failed to load signal detail:", error);
      } finally {
        if (!cancelled) {
          navigate(location.pathname, { replace: true, state: null });
        }
      }
    };

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.state, navigate, signals, userId]);

  const hasLatestResults = Boolean(lastSingleResult || (lastBatchResults && lastBatchResults.length > 0));

  useEffect(() => {
    if (!hasLatestResults) setShowResultFocus(false);
  }, [hasLatestResults]);

  // -- Single Extraction ------------------------------------------------------
  // POST /signals/extract
  // { transcript, company_name, user_id, save_to_db }
  const handleSingleExtract = async () => {
    if (!transcript.trim()) { toast.error('Paste a transcript first'); return; }
    if (saveToDb && !userId) {
      toast.error('Please log in to save signals');
      return;
    }
    setExtracting(true);
    const t = toast.loading('Synthesizing neural signals...');
    try {
      const result = await extractSignal(transcript, companyName || null, userId, saveToDb);
      setLastSingleResult(result || null);
      setLastBatchResults([]);
      setLastResultsSaved(Boolean(saveToDb));
      setShowResultFocus(Boolean(result));
      if (result?.signal_id || result?.id) {
        storeTranscript(result.signal_id || result.id, transcript);
      }
      // result: SignalResponse { signal (bool), currency_pair, direction,
      //         confidence, reasoning, magnitude, time_horizon, signal_id, ... }
      if (result?.signal) {
        toast.success(
          `Signal detected - ${result.direction || 'direction unknown'}  ${result.currency_pair || ''}`,
          { id: t, duration: 5000 }
        );
      } else {
        toast.error('No clear forex signal detected in transcript', { id: t });
      }
      setTranscript('');
      setCompanyName('');
      await fetchAll();
      if (saveToDb && typeof window !== "undefined") {
        window.dispatchEvent(new Event("fgpt-signal-history-updated"));
      }
    } catch (err) {
      const msg = normalizeError(err, { fallback: 'Extraction failed. Please try again.' });
      toast.error(msg, { id: t });
      setErrorMessage(msg);
    } finally {
      setExtracting(false);
    }
  };

  // -- Batch Extraction -------------------------------------------------------
  // POST /signals/batch
  // { transcripts: [{text, company_name}], user_id, save_to_db }
  const handleBatchExtract = async () => {
    const valid = batchEntries.filter(e => e.text.trim());
    if (valid.length === 0) { toast.error('Add at least one transcript entry'); return; }
    if (batchSaveToDB && !userId) {
      toast.error('Please log in to save signals');
      return;
    }
    setExtracting(true);
    const t = toast.loading(`Processing ${valid.length} transcript${valid.length > 1 ? 's' : ''}...`);
    try {
      const result = await batchExtract(valid, userId, batchSaveToDB);
      setLastBatchResults(Array.isArray(result?.signals) ? result.signals : []);
      setLastSingleResult(null);
      setLastResultsSaved(Boolean(batchSaveToDB));
      setShowResultFocus(true);
      if (Array.isArray(result?.signals)) {
        result.signals.forEach((signal, index) => {
          storeTranscript(signal?.signal_id || signal?.id, valid[index]?.text || "");
        });
      }
      // result: BatchSignalResponse { signals: [SignalResponse], total, signals_found }
      toast.success(
        `Batch complete - ${result.signals_found}/${result.total} signals found`,
        { id: t, duration: 5000 }
      );
      setBatchEntries([{ company_name: '', text: '' }]);
      await fetchAll();
      if (batchSaveToDB && typeof window !== "undefined") {
        window.dispatchEvent(new Event("fgpt-signal-history-updated"));
      }
    } catch (err) {
      const msg = normalizeError(err, { fallback: 'Batch failed. Please try again.' });
      toast.error(msg, { id: t });
      setErrorMessage(msg);
    } finally {
      setExtracting(false);
    }
  };

  // -- Delete -----------------------------------------------------------------
  // DELETE /signals/{user_id}/{signal_id}
  const handleDelete = async (signalId) => {
    try {
      await deleteSignal(userId, signalId);
      toast.success('Signal purged');
      setSignals(prev => prev.filter(s => s.signal_id !== signalId));
      if (selectedSignal?.signal_id === signalId) setSelectedSignal(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fgpt-signal-history-updated"));
      }
    } catch (err) {
      logError('Failed to purge signal:', err);
      toast.error(normalizeError(err, { fallback: 'Failed to delete signal.' }));
      setErrorMessage(
        normalizeError(err, { fallback: 'Failed to delete signal. Please try again.' })
      );
    }
  };

  // Batch entry helpers
  const updateEntry = (i, f, v) => setBatchEntries(p => p.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  const addEntry = () => setBatchEntries(p => [...p, { company_name: '', text: '' }]);
  const removeEntry = (i) => setBatchEntries(p => p.filter((_, idx) => idx !== i));

  if (loading) return <LoadingScreen />;

  // Stats from SignalStatisticsResponse
  const totalSignals = stats?.total_signals || 0;
  const longCount = stats?.by_direction?.LONG || 0;
  const shortCount = stats?.by_direction?.SHORT || 0;
  const neutralCount = stats?.by_direction?.NEUTRAL || 0;
  const avgConf = Math.round((stats?.average_confidence || 0) * 100);

  const normalizeDirection = (value) => {
    const raw = (value || '').toString().trim().toUpperCase();
    if (raw === 'BUY') return 'LONG';
    if (raw === 'SELL') return 'SHORT';
    return raw;
  };

  // Filter uses direction from DB rows (support direction/primary_direction + BUY/SELL)
  const filtered = signals.filter((s) =>
    filter === 'all' ||
    normalizeDirection(s.direction || s.primary_direction) === filter
  );

  return (
    <div className="relative">
      {showResultFocus && hasLatestResults && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" onClick={() => setShowResultFocus(false)} />
          <div className="relative z-10 w-full max-w-4xl h-full max-h-[calc(100vh-2rem)] flex flex-col bg-transparent">
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10 px-3 py-3 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">
                Latest Extraction Result
              </h3>
              <button
                onClick={() => setShowResultFocus(false)}
                className="text-[10px] font-black text-white-400 uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl hover:text-white hover:border-white/30 transition-all"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pt-4 pb-10">
              {lastSingleResult && (
                <SignalResult signal={lastSingleResult} user={user} />
              )}
              {lastBatchResults && lastBatchResults.map((r, i) => (
                <div key={`focus-${i}`} className="mt-4">
                  <SignalResult signal={r} user={user} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-8 max-w-6xl mx-auto pb-24 transition-all ${showResultFocus && hasLatestResults ? 'blur-xl pointer-events-none select-none' : ''}`} aria-hidden={showResultFocus && hasLatestResults}>

      {/* -- Header ----------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black text-white-500 uppercase tracking-widest">Alpha Intelligence Engine</span>
          </div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <FiZap className="text-yellow-500" />
            Signal <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Extraction</span>
          </h1>
          <p className="text-white-500 text-sm mt-1 font-bold uppercase tracking-widest">Institutional Forex Alpha From Earnings Transcripts</p>
        </div>

        {/* Stats - SignalStatisticsResponse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
          <div className="text-center px-3">
            <div className="text-[9px] font-black text-white-600 uppercase tracking-tighter mb-1">Total</div>
            <div className="text-2xl font-black text-white">{totalSignals}</div>
          </div>
          <div className="text-center px-3 border-l border-white/5">
            <div className="text-[9px] font-black text-white-600 uppercase tracking-tighter mb-1">Long</div>
            <div className="text-2xl font-black text-green-500">{longCount}</div>
          </div>
          <div className="text-center px-3 border-l border-white/5">
            <div className="text-[9px] font-black text-white-600 uppercase tracking-tighter mb-1">Short</div>
            <div className="text-2xl font-black text-red-500">{shortCount}</div>
          </div>
          <div className="text-center px-3 border-l border-white/5">
            <div className="text-[9px] font-black text-white-600 uppercase tracking-tighter mb-1">Avg Conf</div>
            <div className="text-2xl font-black text-yellow-500">{avgConf}%</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3">
          {errorMessage}
        </div>
      )}

      {/* Latest Results (moved to top) */}
      {(lastSingleResult || (lastBatchResults && lastBatchResults.length > 0)) && (
        <div className="rounded-[20px] border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">
              {lastResultsSaved ? 'Latest Saved Results' : 'Unsaved Results'}
            </h3>
            <span className="text-[10px] font-black text-yellow-500/70">
              {(lastBatchResults?.length || 0) + (lastSingleResult ? 1 : 0)}
            </span>
          </div>
          <div className="space-y-2">
            {lastSingleResult && (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-black/40">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {lastSingleResult.direction === 'LONG' ? <FiTrendingUp className="text-green-500" /> :
                    lastSingleResult.direction === 'SHORT' ? <FiTrendingDown className="text-red-500" /> :
                      <FiMinus className="text-white-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {lastSingleResult.currency_pair || 'PAIR'}  {lastSingleResult.direction || 'N/A'}
                    </span>
                    <span className="text-[10px] font-black text-yellow-500">
                      {lastSingleResult.confidence != null ? Math.round(lastSingleResult.confidence * 100) + '%' : '-'}
                    </span>
                  </div>
                  {lastSingleResult.reasoning && (
                    <p className="text-[11px] text-white-400 mt-1">{lastSingleResult.reasoning}</p>
                  )}
                </div>
              </div>
            )}
            {lastBatchResults && lastBatchResults.length > 0 && lastBatchResults.map((r, i) => (
              <div key={`unsaved-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-black/40">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {r.direction === 'LONG' ? <FiTrendingUp className="text-green-500" /> :
                    r.direction === 'SHORT' ? <FiTrendingDown className="text-red-500" /> :
                      <FiMinus className="text-white-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {r.currency_pair || 'PAIR'}  {r.direction || 'N/A'}
                    </span>
                    <span className="text-[10px] font-black text-yellow-500">
                      {r.confidence != null ? Math.round(r.confidence * 100) + '%' : '-'}
                    </span>
                  </div>
                  {r.reasoning && (
                    <p className="text-[11px] text-white-400 mt-1">{r.reasoning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* -- Left: Extraction Panel ------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.01] backdrop-blur-sm">

            {/* Mode switcher */}
            <div className="flex items-center gap-2 mb-6 bg-white/5 rounded-2xl p-1.5">
              <button
                onClick={() => setMode('single')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'single'
                  ? 'bg-yellow-500 text-black'
                  : 'text-white-500 hover:text-white'
                  }`}
              >
                Single Extract
              </button>
              <button
                onClick={() => setMode('batch')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'batch'
                  ? 'bg-yellow-500 text-black'
                  : 'text-white-500 hover:text-white'
                  }`}
              >
                Batch Extract
              </button>
            </div>

            {/* -- SINGLE MODE -------------------------------------------------- */}
            {/* POST /signals/extract */}
            {/* Body: { transcript, company_name, user_id, save_to_db } */}
            {mode === 'single' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-white-500 uppercase tracking-widest">
                    <FiTarget size={11} className="text-white-600" /> company_name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft, FOMC, Apple..."
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/40 font-bold transition-all placeholder:text-white-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-white-500 uppercase tracking-widest">
                    <FiClock size={11} className="text-white-600" /> transcript <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    rows={9}
                    placeholder="Paste earnings call transcript or institutional report here..."
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/40 font-medium transition-all placeholder:text-white-700 resize-none custom-scrollbar"
                  />
                </div>

                {/* save_to_db toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white-500 uppercase tracking-widest">save history</span>
                  <button
                    onClick={() => setSaveToDb(!saveToDb)}
                    className={`w-12 h-6 rounded-full transition-all relative ${saveToDb ? 'bg-yellow-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${saveToDb ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  onClick={handleSingleExtract}
                  disabled={extracting || !transcript.trim()}
                  className="w-full py-4 bg-yellow-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-2xl shadow-yellow-500/10"
                >
                  <FiCpu className={extracting ? 'animate-spin' : ''} size={14} />
                  {extracting ? 'Extracting...' : 'Extract Signal'}
                </button>
              </div>
            )}

            {/* -- BATCH MODE --------------------------------------------------- */}
            {/* POST /signals/batch */}
            {/* Body: { transcripts: [{text, company_name}], user_id, save_to_db } */}
            {mode === 'batch' && (
              <div className="space-y-4">
                <p className="text-[10px] text-white-600 font-bold uppercase tracking-widest">
                  Each entry ? <code className="text-yellow-500/60">{'{ text, company_name }'}</code>
                </p>

                <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                  {batchEntries.map((entry, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-black/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-yellow-500/50 uppercase tracking-widest">
                          Transcript {idx + 1}
                        </span>
                        {batchEntries.length > 1 && (
                          <button onClick={() => removeEntry(idx)} className="text-red-500/50 hover:text-red-500 transition-colors">
                            <FiX size={11} />
                          </button>
                        )}
                      </div>
                      {/* company_name field */}
                      <input
                        type="text"
                        value={entry.company_name}
                        onChange={e => updateEntry(idx, 'company_name', e.target.value)}
                        placeholder="company_name (e.g. Microsoft)"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500/30 font-bold transition-all placeholder:text-white-700"
                      />
                      {/* text field */}
                      <textarea
                        value={entry.text}
                        onChange={e => updateEntry(idx, 'text', e.target.value)}
                        rows={4}
                        placeholder="text (paste transcript here)"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500/30 transition-all placeholder:text-white-700 resize-none"
                      />
                    </div>
                  ))}

                  <button
                    onClick={addEntry}
                    className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-white-600 hover:text-yellow-500 hover:border-yellow-500/30 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FiPlus size={12} /> Add Entry
                  </button>
                </div>

                {/* save_to_db toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white-500 uppercase tracking-widest">save history</span>
                  <button
                    onClick={() => setBatchSaveToDB(!batchSaveToDB)}
                    className={`w-12 h-6 rounded-full transition-all relative ${batchSaveToDB ? 'bg-yellow-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${batchSaveToDB ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  onClick={handleBatchExtract}
                  disabled={extracting}
                  className="w-full py-4 bg-yellow-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-2xl shadow-yellow-500/10"
                >
                  <FiCpu className={extracting ? 'animate-spin' : ''} size={14} />
                  {extracting
                    ? `Processing ${batchEntries.filter(e => e.text.trim()).length} transcripts...`
                    : `Batch Extract (${batchEntries.filter(e => e.text.trim()).length})`
                  }
                </button>
              </div>
            )}
          </div>

          {/* by_magnitude breakdown */}
          {stats?.by_magnitude && (
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
              <h3 className="text-[10px] font-black text-white-500 uppercase tracking-widest">Signal Magnitude</h3>
              {['high', 'moderate', 'low'].map(mag => {
                const count = stats.by_magnitude[mag] || 0;
                const pct = totalSignals ? Math.round((count / totalSignals) * 100) : 0;
                return (
                  <div key={mag}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold text-white-400 uppercase">{mag}</span>
                      <span className="text-[10px] font-black text-white">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${mag === 'high' ? 'bg-yellow-500' :
                          mag === 'moderate' ? 'bg-yellow-500/60' : 'bg-yellow-500/30'
                          }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* by_currency_pair breakdown */}
          {stats?.by_currency_pair && Object.keys(stats.by_currency_pair).length > 0 && (
            <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2">
              <h3 className="text-[10px] font-black text-white-500 uppercase tracking-widest mb-3">Top Pairs</h3>
              {Object.entries(stats.by_currency_pair)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([pair, count]) => (
                  <div key={pair} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-yellow-500/80 uppercase">{pair}</span>
                    <span className="text-[10px] font-black text-white">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* -- Right: Signals Stream --------------------------------------------- */}
        <div className="lg:col-span-7 space-y-5">

          {/* Latest Result (Pinned to Saved Signals Top) */}
          {(lastSingleResult || (lastBatchResults && lastBatchResults.length > 0)) && (
            <div className="rounded-[20px] border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">
                  Latest Result
                </h3>
                <span className="text-[10px] font-black text-yellow-500/70">
                  {(lastBatchResults?.length || 0) + (lastSingleResult ? 1 : 0)}
                </span>
              </div>
              <div className="space-y-2">
                {lastSingleResult && (
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-black/40">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {lastSingleResult.direction === 'LONG' ? <FiTrendingUp className="text-green-500" /> :
                        lastSingleResult.direction === 'SHORT' ? <FiTrendingDown className="text-red-500" /> :
                          <FiMinus className="text-white-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {lastSingleResult.currency_pair || 'PAIR'}  {lastSingleResult.direction || ''}
                        </span>
                        <span className="text-[10px] font-black text-yellow-500">
                          {lastSingleResult.confidence != null ? Math.round(lastSingleResult.confidence * 100) + '%' : 'N/A'}
                        </span>
                      </div>
                      {lastSingleResult.reasoning && (
                        <p className="text-[11px] text-white-400 mt-1">{lastSingleResult.reasoning}</p>
                      )}
                    </div>
                  </div>
                )}
                {lastBatchResults && lastBatchResults.length > 0 && lastBatchResults.map((r, i) => (
                  <div key={`saved-top-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-black/40">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {r.direction === 'LONG' ? <FiTrendingUp className="text-green-500" /> :
                        r.direction === 'SHORT' ? <FiTrendingDown className="text-red-500" /> :
                          <FiMinus className="text-white-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {r.currency_pair || 'PAIR'}  {r.direction || ''}
                        </span>
                        <span className="text-[10px] font-black text-yellow-500">
                          {r.confidence != null ? Math.round(r.confidence * 100) + '%' : 'N/A'}
                        </span>
                      </div>
                      {r.reasoning && (
                        <p className="text-[11px] text-white-400 mt-1">{r.reasoning}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-white-500 uppercase tracking-[0.3em]">
                Saved Signals
              </h3>
              <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>

            {/* Filter by primary_direction - LONG / SHORT / NEUTRAL from DB */}
            <div className="flex items-center gap-2">
              <FiFilter size={12} className="text-white-600" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black text-yellow-500 uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="all" className="bg-black">All</option>
                <option value="LONG" className="bg-black">Long</option>
                <option value="SHORT" className="bg-black">Short</option>
                <option value="NEUTRAL" className="bg-black">Neutral</option>
              </select>
            </div>
          </div>

          {/* Signals list */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map(signal => (
                <SignalRow
                  key={signal.signal_id}
                  signal={signal}
                  onDelete={handleDelete}
                  onClick={() => setSelectedSignal(signal)}
                />
              ))
            ) : (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-28 rounded-[40px] border border-dashed border-white/5"
              >
                <FiCpu className="mx-auto mb-4 text-white-800" size={56} />
                <p className="text-white-600 font-black uppercase tracking-[0.3em] text-[10px]">
                  {filter !== 'all' ? `No ${filter} signals saved` : 'Neural Stream Empty'}
                </p>
                <p className="text-white-700 text-[9px] mt-2 uppercase font-bold tracking-widest">
                  {filter !== 'all'
                    ? `Switch filter or extract more transcripts`
                    : `Extract alpha from an earnings transcript to begin`}
                </p>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* -- Signal Detail Modal ------------------------------------------------- */}
      {/* Shows full DB row: id, source_label, primary_direction, affected_pairs,
           confidence, primary_sentiment, primary_strength, base_currency, created_at */}
      <AnimatePresence>
        {selectedSignal && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-6 md:pt-8">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSignal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-transparent z-10 max-h-[calc(100vh-2.5rem)] overflow-y-auto custom-scrollbar pr-2"
            >
              <button
                onClick={() => setSelectedSignal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white-400 transition-all z-[60] border border-white/10"
              >
                <FiX size={16} />
              </button>

              <div className="pt-12 pb-24 px-2 space-y-4">
                <SignalResult signal={selectedSignal} user={user} />

                <div className="px-1">
                  <button
                    onClick={() => handleDelete(selectedSignal.signal_id)}
                    className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    <FiTrash2 className="inline mr-2" size={13} />
                    Purge Intelligence
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Signals;



