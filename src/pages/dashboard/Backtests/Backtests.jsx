import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { getBacktestResult, deleteBacktest } from '../../../services/backtestService';
import BacktestForm from '../../../components/dashboard/backtest/BacktestForm';
import BacktestResults from '../../../components/dashboard/backtest/BacktestResults';
import toast from 'react-hot-toast';
import { logError, normalizeError } from '../../../utils/errorHandling';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getWinRateRatio = (metrics = {}) => {
  const rawWinRate = toNumber(metrics.win_rate);
  if (rawWinRate != null) {
    return rawWinRate > 1 ? rawWinRate / 100 : rawWinRate;
  }

  const rawWinRatePct = toNumber(metrics.win_rate_pct);
  return rawWinRatePct != null ? rawWinRatePct / 100 : null;
};

const calculateExpectancy = (metrics = {}) => {
  const winRate = getWinRateRatio(metrics);
  const avgWin = toNumber(metrics.avg_win);
  const avgLoss = toNumber(metrics.avg_loss);

  if (winRate == null || avgWin == null || avgLoss == null) {
    return null;
  }

  return (winRate * avgWin) + ((1 - winRate) * avgLoss);
};

const classifyPerformance = (metrics = {}, expectancy = null) => {
  const sharpeRatio = toNumber(metrics.sharpe_ratio);
  const sortinoRatio = toNumber(metrics.sortino_ratio);
  const maxDrawdownPct = Math.abs(toNumber(metrics.max_drawdown_pct) ?? toNumber(metrics.max_drawdown) ?? 0);
  const profitFactor = toNumber(metrics.profit_factor);
  const totalTrades = toNumber(metrics.total_trades) ?? 0;

  const isCriticalFailure =
    (profitFactor != null && profitFactor < 1.0) ||
    maxDrawdownPct > 30 ||
    (expectancy != null && expectancy < 0);

  if (isCriticalFailure) {
    return 'critical';
  }

  const isPoorPerformance =
    (sharpeRatio != null && sharpeRatio < 0.5) ||
    maxDrawdownPct > 20 ||
    (profitFactor != null && profitFactor < 1.2) ||
    totalTrades < 20;

  if (isPoorPerformance) {
    return 'poor';
  }

  const isAcceptablePerformance =
    sharpeRatio != null &&
    sharpeRatio >= 0.5 &&
    sharpeRatio < 1.0 &&
    maxDrawdownPct <= 20 &&
    (profitFactor == null || profitFactor >= 1.2) &&
    totalTrades >= 20;

  if (isAcceptablePerformance) {
    return 'acceptable';
  }

  const isGoodPerformance =
    (sharpeRatio == null || sharpeRatio >= 1.0) &&
    (sortinoRatio == null || sortinoRatio >= 1.0) &&
    maxDrawdownPct <= 15 &&
    (profitFactor == null || profitFactor >= 1.3) &&
    totalTrades >= 20 &&
    (expectancy == null || expectancy > 0);

  return isGoodPerformance ? 'good' : 'acceptable';
};

/* ═══════════════════════════════════════════════════════════
   Backtests — index + result page
   Route: /dashboard/backtest          → shows form + sidebar
   Route: /dashboard/backtest/:id      → shows result + sidebar
═══════════════════════════════════════════════════════════ */
const Backtests = () => {
  const { user } = useAuth();
  const { backtestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = user?.user_id || user?.id;

  const [result, setResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const strategyCode = location.state?.customCode || location.state?.strategyCode || '';
  const expectancy = result?.metrics ? calculateExpectancy(result.metrics) : null;
  const performanceVerdict = result?.metrics ? classifyPerformance(result.metrics, expectancy) : null;
  const metricsForMentor = result?.metrics
    ? {
        strategy_name: location.state?.strategyType || result.strategy_name || 'custom',
        pair: result.pair || result.metrics.pair || null,
        start_date: result.start_date || result.metrics.start_date || null,
        end_date: result.end_date || result.metrics.end_date || null,
        total_return_pct: result.metrics.total_return_pct ?? null,
        total_return: result.metrics.total_return_pct ?? null,
        cagr_pct: result.metrics.cagr_pct ?? null,
        sharpe_ratio: result.metrics.sharpe_ratio ?? null,
        sortino_ratio: result.metrics.sortino_ratio ?? null,
        calmar_ratio: result.metrics.calmar_ratio ?? null,
        max_drawdown_pct: result.metrics.max_drawdown_pct ?? null,
        max_drawdown: result.metrics.max_drawdown_pct ?? null,
        total_trades: result.metrics.total_trades ?? null,
        win_rate_pct: result.metrics.win_rate_pct ?? null,
        win_rate: result.metrics.win_rate_pct ?? null,
        profit_factor: result.metrics.profit_factor ?? null,
        avg_win: result.metrics.avg_win ?? null,
        avg_loss: result.metrics.avg_loss ?? null,
        avg_risk_reward: result.metrics.avg_risk_reward ?? null,
        avg_holding_days: result.metrics.avg_holding_days ?? null,
        expectancy,
        custom_code: strategyCode || null,
      }
    : null;

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
      } catch (error) {
        logError('Backtest load failed:', error);
        toast.error(normalizeError(error, { fallback: 'Could not load this simulation.' }));
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
    } catch (error) {
      logError('Backtest delete failed:', error);
      toast.error(normalizeError(error, { fallback: 'Could not delete simulation.' }));
    }
  };

  const handleUnderstandFailure = () => {
    if (!result || !metricsForMentor) return;

    navigate('/dashboard/mentor/messages/new', {
      state: {
        mode: 'analyze',
        strategyType: metricsForMentor.strategy_name,
        strategyCode,
        results: metricsForMentor,
        metricsForMentor,
      },
    });
  };

  const handleNeedsImprovement = () => {
    if (!result || !metricsForMentor) return;

    navigate('/dashboard/mentor/messages/new', {
      state: {
        mode: 'analyze',
        strategyType: metricsForMentor.strategy_name,
        strategyCode,
        results: metricsForMentor,
        metricsForMentor,
        skipToImprovement: true,
      },
    });
  };

  const handleDownloadCode = () => {
    if (!strategyCode) {
      toast.error('No strategy code is available to download.');
      return;
    }

    const blob = new Blob([strategyCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${(location.state?.strategyName || result?.strategy_name || 'strategy')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'strategy'}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

            <BacktestResults
              result={result}
              onDelete={handleDelete}
              onAnalyze={handleUnderstandFailure}
              onNeedsImprovement={handleNeedsImprovement}
              onDownloadCode={handleDownloadCode}
              canDownloadCode={Boolean(strategyCode)}
              performanceVerdict={performanceVerdict}
              expectancy={expectancy}
            />
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
