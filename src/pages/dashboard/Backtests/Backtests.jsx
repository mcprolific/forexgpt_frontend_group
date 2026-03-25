import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiBarChart2, FiPlus, FiClock, FiChevronRight,
  FiZap, FiRefreshCw, FiArrowLeft, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getBacktestResults,
  getBacktestResult,
  deleteBacktest
} from '../../../services/backtestService';
import BacktestForm from '../../../components/dashboard/backtest/BacktestForm';
import BacktestResults from '../../../components/dashboard/backtest/BacktestResults';
import toast from 'react-hot-toast';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#FFD700';

/* ═══════════════════════════════════════════════════════════
   Backtests — index + result page
   Route: /dashboard/backtest          → shows form + sidebar
   Route: /dashboard/backtest/:id      → shows result + sidebar
═══════════════════════════════════════════════════════════ */
const Backtests = () => {
  const { user } = useAuth();
  const { backtestId } = useParams();
  const navigate = useNavigate();

  const userId = user?.user_id || user?.id;

  const [result, setResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── load specific result when URL has :backtestId ── */
  useEffect(() => {
    if (!backtestId || !userId || backtestId === 'new') {
      setResult(null);
      return;
    }
    const load = async () => {
      try {
        setDetailLoading(true);
        const data = await getBacktestResult(userId, backtestId);
        setResult(data);
      } catch {
        toast.error('Could not load this simulation.');
        navigate('/dashboard/backtest', { replace: true });
      } finally {
        setDetailLoading(false);
      }
    };
    load();
  }, [backtestId, userId, navigate]);

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this simulation permanently?')) return;
    try {
      await deleteBacktest(userId, id);
      toast.success('Simulation deleted.');
      // After deletion, go back to form
      navigate('/dashboard/backtest');
      // Note: We might want a way to tell the layout to refresh its list
      // A simple way is to use window.location.reload() or a more React-y way
      // For now, let's assume the user can manually refresh or the layout handles it.
    } catch {
      toast.error('Could not delete simulation.');
    }
  };

  const showingResult = !!backtestId && backtestId !== 'new';

  return (
    <div className="flex-1 min-w-0">
        {/* Detail Loading */}
        {detailLoading && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="h-14 w-14 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin mb-6" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Loading simulation…
            </p>
          </div>
        )}

        {/* Results Page */}
        {!detailLoading && showingResult && result && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-2">
              <Link
                to="/dashboard/backtest"
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                New Backtest
              </Link>
              <button
                onClick={() => handleDelete(backtestId)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 hover:text-red-500 transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                Purge simulation
              </button>
            </div>

            <BacktestResults result={result} onDelete={handleDelete} />
          </div>
        )}

        {/* Form (index or /new) */}
        {!detailLoading && (!showingResult || backtestId === 'new') && (
          <div>
            <BacktestForm />
          </div>
        )}
    </div>
  );
};

export default Backtests;
