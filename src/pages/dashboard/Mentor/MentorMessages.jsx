import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FiClock,
  FiCopy,
  FiCpu,
  FiDownload,
  FiSend,
  FiThumbsUp,
  FiZap,
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  analyzeBacktest,
  askMentor,
  getConversationHistory,
} from '../../../services/mentorService';
import toast from 'react-hot-toast';

const STRATEGY_PATTERNS = [
  { label: 'mean reversion', regex: /mean\s*reversion/i },
  { label: 'RSI', regex: /\brsi\b/i },
  { label: 'MACD', regex: /\bmacd\b/i },
  { label: 'Bollinger Bands', regex: /bollinger\s*bands/i },
  { label: 'moving average', regex: /moving\s*average/i },
  { label: 'momentum', regex: /momentum/i },
  { label: 'trend following', regex: /trend\s*following/i },
];

const detectStrategyType = (text) =>
  STRATEGY_PATTERNS.find(({ regex }) => regex.test(text || ''))?.label ?? null;

const MentorMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisMode, setAnalysisMode] = useState(false);
  const [backtestData, setBacktestData] = useState(null);

  const scrollRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId || conversationId === 'new' || !userId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const cacheKey = `fgpt_mentor_history_${conversationId}`;

      try {
        setErrorMessage('');
        const res = await getConversationHistory(conversationId, userId);
        const history = res.history || [];
        setMessages(history);
        localStorage.setItem(cacheKey, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to load history:', error);

        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setMessages(JSON.parse(cached));
          } catch (cacheError) {
            console.error('Cache parse error:', cacheError);
            toast.error('Failed to load history');
          }
        } else {
          toast.error('Failed to load history');
        }
        setErrorMessage('Failed to load conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [conversationId, userId]);

  useEffect(() => {
    if (
      location.state?.prefilledQuestion &&
      conversationId === 'new' &&
      !messages.length
    ) {
      setNewMessage((current) => current || location.state.prefilledQuestion);
    }
  }, [conversationId, location.state, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, sending]);

  useEffect(() => {
    const state = location.state;
    const incomingResults = state?.metricsForMentor || state?.results;
    const incomingStrategyType = state?.strategyType || state?.metricsForMentor?.strategy_name;
    const incomingStrategyCode =
      state?.strategyCode ||
      state?.metricsForMentor?.custom_code ||
      state?.results?.custom_code ||
      '';

    if (!userId || state?.mode !== 'analyze' || analysisMode || !incomingResults) {
      return;
    }

    let cancelled = false;

    const runBacktestAnalysis = async () => {
      setAnalysisMode(true);
      setBacktestData({
        ...state,
        strategyType: incomingStrategyType,
        strategyCode: incomingStrategyCode,
        results: incomingResults,
      });
      setSending(true);

      try {
        const data = await analyzeBacktest({
          user_id: userId,
          strategy_type: incomingStrategyType,
          strategy_code: incomingStrategyCode || null,
          results: incomingResults,
        });

        if (cancelled) {
          return;
        }

        setMessages((prev) => {
          const next = [
            ...prev,
            {
              id: `${Date.now()}-analysis`,
              role: 'assistant',
              content: `**${data.verdict}**\n\n${data.explanation}`,
              timestamp: new Date().toISOString(),
            },
          ];

          if (conversationId && conversationId !== 'new') {
            localStorage.setItem(
              `fgpt_mentor_history_${conversationId}`,
              JSON.stringify(next)
            );
          }

          return next;
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Analysis failed:', error);
          toast.error('Analysis failed');
        }
      } finally {
        if (!cancelled) {
          setSending(false);
        }
      }
    };

    runBacktestAnalysis();

    return () => {
      cancelled = true;
    };
  }, [analysisMode, conversationId, location.state, userId]);

  const handleCopy = async (text, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Could not copy');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !userId) return;

    const userContent = newMessage.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];

      if (conversationId && conversationId !== 'new') {
        localStorage.setItem(
          `fgpt_mentor_history_${conversationId}`,
          JSON.stringify(next)
        );
      }

      return next;
    });

    setNewMessage('');
    setSending(true);

    try {
      const response = await askMentor(
        userContent,
        conversationId === 'new' ? null : conversationId,
        userId
      );

      if (conversationId === 'new' && response?.conversation_id) {
        navigate(`/dashboard/mentor/messages/${response.conversation_id}`, {
          replace: true,
        });
        return;
      }

      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: response?.response || 'No response returned.',
            timestamp: response?.timestamp || new Date().toISOString(),
          },
        ];

        if (conversationId && conversationId !== 'new') {
          localStorage.setItem(
            `fgpt_mentor_history_${conversationId}`,
            JSON.stringify(next)
          );
        }

        return next;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setErrorMessage('Failed to send message. Please try again.');

      setMessages((prev) => {
        const next = prev.filter((message) => message.id !== userMsg.id);

        if (conversationId && conversationId !== 'new') {
          localStorage.setItem(
            `fgpt_mentor_history_${conversationId}`,
            JSON.stringify(next)
          );
        }

        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const handleGenerateCode = (content) => {
    navigate('/dashboard/codegen/session/new', {
      state: {
        fromMentor: true,
        strategyType: detectStrategyType(content) || 'trading',
        context: content,
        strategyText: content,
      },
    });
  };

  const handleImproveStrategy = () => {
    const strategyCode =
      backtestData?.strategyCode ||
      backtestData?.results?.custom_code ||
      backtestData?.code ||
      '';

    if (!backtestData || !strategyCode) {
      toast.error('No strategy code is available to improve.');
      return;
    }

    navigate('/dashboard/codegen/session/new', {
      state: {
        mode: 'improve',
        originalCode: strategyCode,
        backtestResults: backtestData?.results || {},
        mentorAnalysis: messages[messages.length - 1]?.content || '',
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-black/20 backdrop-blur-sm border border-white/5 overflow-hidden">
      <div className="bg-white/[0.02] border-b border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Mentor Intelligence
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  AI Node Active • {messages.length} Exchanges
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-yellow-500 hover:border-yellow-500/30 transition-all"
          >
            <FiDownload /> Export Logs
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3">
            {errorMessage}
          </div>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <FiZap size={48} className="text-yellow-500 mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">
              Awaiting Input Query
            </p>
          </div>
        ) : (
          messages.map((message, idx) => {
            const showGenerateCode =
              message.role === 'assistant' &&
              Boolean(detectStrategyType(message.content));
            const showImproveStrategy =
              message.role === 'assistant' &&
              analysisMode &&
              idx === messages.length - 1 &&
              Boolean(
                backtestData?.strategyCode ||
                backtestData?.results?.custom_code ||
                backtestData?.code
              );

            return (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id || idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 transition-all ${
                    message.role === 'user'
                      ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/10'
                      : 'bg-white/[0.03] border border-white/5 text-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                      <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                        AI MENTOR
                      </span>
                    </div>
                  )}

                  <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');

                          return match ? (
                            <div className="rounded-lg overflow-hidden my-4 border border-white/10 relative group/code">
                              <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      String(children).replace(/\n$/, ''),
                                      'Snippet copied'
                                    )
                                  }
                                  className="p-1.5 bg-black/50 backdrop-blur-sm rounded-md hover:text-yellow-500 transition-colors text-gray-400"
                                >
                                  <FiCopy size={12} />
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  padding: '1rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#0d0d0d',
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code
                              className="bg-white/10 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {(showGenerateCode || showImproveStrategy) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {showGenerateCode && (
                        <button
                          type="button"
                          onClick={() => handleGenerateCode(message.content)}
                          className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Generate Code
                        </button>
                      )}
                      {showImproveStrategy && (
                        <button
                          type="button"
                          onClick={handleImproveStrategy}
                          className="px-4 py-2 rounded-lg bg-green-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Improve Strategy
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    className={`mt-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-tighter ${
                      message.role === 'user' ? 'text-black/40' : 'text-gray-600'
                    }`}
                  >
                    <span>
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(message.content, 'Message copied')}
                          className="hover:text-yellow-500"
                        >
                          <FiCopy />
                        </button>
                        <button type="button" className="hover:text-yellow-500">
                          <FiThumbsUp />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Motion.div>
            );
          })
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex gap-2">
              <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce" />
              <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 p-6 bg-white/[0.02] border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            placeholder="Input market analysis query..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all font-medium placeholder-gray-600 disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:grayscale shadow-lg shadow-yellow-500/20"
          >
            <FiSend size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
            <FiZap className="text-yellow-500" /> High-Compute Node
          </span>
          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
            <FiClock className="text-yellow-500" /> Real-time Knowledge
          </span>
        </div>
      </div>
    </div>
  );
};

export default MentorMessages;
