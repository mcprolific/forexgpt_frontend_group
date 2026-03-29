import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FiSend,
  FiThumbsUp,
  FiThumbsDown,
  FiCopy,
  FiDownload,
  FiCpu,
  FiClock,
  FiZap,
  FiCode,
  FiPlay,
  FiTool,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  getCodeConversationHistory,
  generateCode as askArchitect,
  improveStrategy,
  getCodeGenHistoryCacheKey,
} from "../../../services/codeGenService";
import { formatLongDateTime } from "../../../utils/formatters";

const sanitizeFileName = (value) =>
  (value || "strategy")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "strategy";

const formatSummaryPercent = (value) =>
  value != null && value !== "" ? `${Number(value).toFixed(2)}%` : "N/A";

const formatSummaryMetric = (value, decimals = 2) =>
  value != null && value !== "" ? Number(value).toFixed(decimals) : "N/A";

const getDraftKey = (userId) => `fgpt_codegen_draft_${userId || "anon"}`;

const parseStoredMessages = (raw) => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const CodeGeneration = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [improvementMode, setImprovementMode] = useState(false);
  const [originalCode, setOriginalCode] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [mentorAnalysis, setMentorAnalysis] = useState(null);
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [showOriginalCode, setShowOriginalCode] = useState(false);
  const [showBacktestSummary, setShowBacktestSummary] = useState(true);

  const [latestStrategyDesc, setLatestStrategyDesc] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const scrollRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  useEffect(() => {
    const state = location.state || {};
    if (!Object.keys(state).length) return;

    if (state.fromMentor) {
      // Use the pre-built strategyText prompt passed from MentorMessages
      const prompt = state.strategyText || "";
      if (prompt) setNewMessage(prompt);
    }

    if (state.prefilledDescription) {
      setNewMessage(state.prefilledDescription);
    }

    if (state.mode === "improve") {
      setImprovementMode(true);
      setOriginalCode(state.originalCode || null);
      setBacktestResults(state.backtestResults || null);
      setMentorAnalysis(state.mentorAnalysis || null);
    }

    // Clear consumed state so a page re-render doesn't re-trigger this effect
    navigate(location.pathname, { replace: true, state: null });
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId || !userId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      if (conversationId === "new") {
        setMessages(parseStoredMessages(localStorage.getItem(getDraftKey(userId))));
        setLoading(false);
        return;
      }

      if (location.state?.skipFetch) {
        setLoading(false);
        return;
      }

      const cacheKey = getCodeGenHistoryCacheKey(conversationId);
      const cachedHistory = parseStoredMessages(localStorage.getItem(cacheKey));

      try {
        setErrorMessage("");
        const res = await getCodeConversationHistory(conversationId, userId);
        const history = Array.isArray(res.history) ? res.history : [];
        const nextHistory = history.length > 0 ? history : cachedHistory;
        setMessages(nextHistory);
        localStorage.setItem(cacheKey, JSON.stringify(nextHistory));
      } catch (error) {
        console.error("Error fetching logic history:", error);
        if (cachedHistory.length > 0) {
          setMessages(cachedHistory);
        }
        setErrorMessage("Failed to load conversation. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [conversationId, userId, location.state]);

  useEffect(() => {
    if (!userId) return;

    const draftKey = getDraftKey(userId);

    if (conversationId === "new") {
      localStorage.setItem(draftKey, JSON.stringify(messages));
      return;
    }

    localStorage.removeItem(draftKey);

    if (conversationId) {
      localStorage.setItem(
        getCodeGenHistoryCacheKey(conversationId),
        JSON.stringify(messages)
      );
    }
  }, [conversationId, messages, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCode = (code, fileNameHint = latestStrategyDesc) => {
    if (!code) return;

    const blob = new Blob([code], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${sanitizeFileName(fileNameHint)}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !userId) return;

    const userContent = newMessage;
    setNewMessage("");
    setSending(true);
    setErrorMessage("");
    setLatestStrategyDesc(userContent);

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];

      if (conversationId === "new") {
        localStorage.setItem(getDraftKey(userId), JSON.stringify(next));
      } else if (conversationId) {
        localStorage.setItem(
          getCodeGenHistoryCacheKey(conversationId),
          JSON.stringify(next)
        );
      }

      return next;
    });

    try {
      const response = await askArchitect(
        userContent,
        conversationId === "new" ? null : conversationId,
        userId
      );

      if (response && response.conversation_id) {
        const assistantMsg = {
          id: response.code_id || `${Date.now()}-assistant`,
          role: "assistant",
          content: response.explanation,
          code: response.code || null,
          timestamp: response.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          const targetConversationId =
            conversationId === "new" ? response.conversation_id : conversationId;

          if (targetConversationId) {
            localStorage.setItem(
              getCodeGenHistoryCacheKey(targetConversationId),
              JSON.stringify(next)
            );
          }

          return next;
        });

        if (conversationId === "new") {
          localStorage.removeItem(getDraftKey(userId));
          navigate(`/dashboard/codegen/session/${response.conversation_id}`, {
            replace: true,
            state: { skipFetch: true },
          });
        }
      } else {
        setErrorMessage("The server returned an unexpected response.");
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: "assistant",
            content: "The server returned an unexpected response. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating logic:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate code. Please try again.";
      setErrorMessage(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: `Error: ${errMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleImproveStrategy = async () => {
    if (sending || !userId || !originalCode) return;

    setSending(true);
    setErrorMessage("");

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: `Improving strategy${additionalRequirements ? ` with additional requirements: ${additionalRequirements}` : ""}...`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await improveStrategy(
        userId,
        originalCode,
        backtestResults || {},
        mentorAnalysis || "",
        additionalRequirements,
        conversationId === "new" ? null : conversationId
      );

      if (response) {
        const assistantMsg = {
          id: response.code_id || `${Date.now()}-improved`,
          role: "assistant",
          content: response.explanation,
          code: response.code || null,
          timestamp: response.timestamp || new Date().toISOString(),
          isImproved: true,
        };

        setImprovementMode(false);

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          const targetConversationId =
            conversationId === "new" ? response.conversation_id : conversationId;

          if (targetConversationId) {
            localStorage.setItem(
              getCodeGenHistoryCacheKey(targetConversationId),
              JSON.stringify(next)
            );
          }

          return next;
        });

        if (conversationId === "new" && response.conversation_id) {
          localStorage.removeItem(getDraftKey(userId));
          navigate(`/dashboard/codegen/session/${response.conversation_id}`, {
            replace: true,
            state: { skipFetch: true },
          });
        }
      }
    } catch (error) {
      console.error("Error improving strategy:", error);
      setErrorMessage("Failed to improve strategy. Please try again.");
      setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleTestStrategy = (code, version = 1) => {
    if (!code) {
      console.error("No code available to test");
      return;
    }

    navigate("/dashboard/backtest/new", {
      state: {
        mode: "custom",
        customCode: code,
        strategyName: latestStrategyDesc.substring(0, 50) || "Custom Strategy",
        strategyType: "custom",
        version,
        source: "codegen",
      },
    });
  };

  const renderContent = (
    content,
    code,
    isImproved = false,
    messageId,
    role = "assistant"
  ) => (
    <div className="space-y-4">
      <div className="text-sm leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <div className="rounded-lg overflow-hidden my-4 border border-white/10">
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
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
          {content}
        </ReactMarkdown>
      </div>

      {code && (
        <div className="rounded-xl overflow-hidden bg-[#0d0d0d] border border-white/10 group shadow-2xl">
          <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiCode size={12} className="text-yellow-500" />
                {isImproved ? "Improved Strategy v2" : "Neural Strategy Executable"}
              </span>
            </div>
            <button
              onClick={() => handleCopy(code, `copy-${messageId}`)}
              className="p-1.5 hover:text-yellow-500 transition-colors text-gray-500 flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
            >
              <FiCopy size={12} />
              <span className="text-[8px] font-black uppercase tracking-tighter">
                {copiedId === `copy-${messageId}` ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
          <SyntaxHighlighter
            language="python"
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              fontSize: "0.8rem",
              backgroundColor: "transparent",
              fontFamily: "JetBrains Mono, Menlo, monospace",
            }}
            showLineNumbers
            lineNumberStyle={{ color: "#ffffff20", minWidth: "2.5em" }}
          >
            {code}
          </SyntaxHighlighter>

          <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex gap-2">
            <button
              onClick={() => handleTestStrategy(code, isImproved ? 2 : 1)}
              disabled={!code}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlay size={12} />
              {isImproved ? "Test Improved Strategy" : "Test Strategy"}
            </button>
            <button
              onClick={() =>
                handleDownloadCode(code, latestStrategyDesc || `strategy-${messageId}`)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-300 text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              <FiDownload size={12} />
              Download Code
            </button>
          </div>
        </div>
      )}

      {role === "assistant" && !code && content && (
        <div className="flex items-center gap-2 text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-2">
          <FiAlertCircle size={12} />
          No code was returned for this response.
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden">
      <div className="bg-white/[0.02] border-b border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                {improvementMode ? "Strategy Improvement Mode" : "Logic Intelligence"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={`h-1.5 w-1.5 rounded-full animate-pulse ${improvementMode ? "bg-orange-500" : "bg-green-500"}`}
                />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  {improvementMode
                    ? "Improvement Mode Active • Backtest Context Loaded"
                    : `AI Node Active • ${messages.length} Exchanges`}
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-yellow-500 hover:border-yellow-500/30 transition-all">
            <FiDownload /> Export Logic
          </button>
        </div>
      </div>

      {improvementMode && (
        <div className="mx-4 mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTool className="text-orange-400" size={14} />
              <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">
                Improvement Mode • Backtest Context Loaded
              </span>
            </div>
            <button
              onClick={() => setShowBacktestSummary(!showBacktestSummary)}
              className="text-orange-400 hover:text-orange-300"
            >
              {showBacktestSummary ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
          </div>

          {showBacktestSummary && backtestResults && (
            <div className="px-4 pb-3 border-t border-orange-500/20">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 mb-1 font-bold">
                Backtest Results
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Sharpe", value: formatSummaryMetric(backtestResults.sharpe_ratio) },
                  {
                    label: "Max DD",
                    value: formatSummaryPercent(
                      backtestResults.max_drawdown ?? backtestResults.max_drawdown_pct
                    ),
                  },
                  {
                    label: "Win Rate",
                    value: formatSummaryPercent(
                      backtestResults.win_rate ?? backtestResults.win_rate_pct
                    ),
                  },
                  {
                    label: "Return",
                    value: formatSummaryPercent(
                      backtestResults.total_return ?? backtestResults.total_return_pct
                    ),
                  },
                  {
                    label: "Expectancy",
                    value: formatSummaryMetric(backtestResults.expectancy, 4),
                  },
                ].map((metric) => (
                  <div key={metric.label} className="bg-black/30 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                      {metric.label}
                    </p>
                    <p className="text-sm font-black text-orange-400">{metric.value}</p>
                  </div>
                ))}
              </div>

              {mentorAnalysis && (
                <div className="mt-2 p-2 bg-black/30 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">
                    Mentor Analysis
                  </p>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                    {mentorAnalysis}
                  </p>
                </div>
              )}

              {originalCode && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowOriginalCode(!showOriginalCode)}
                    className="text-[10px] text-gray-500 hover:text-yellow-500 uppercase tracking-widest font-bold flex items-center gap-1"
                  >
                    {showOriginalCode ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
                    {showOriginalCode ? "Hide Original Code" : "Show Original Code"}
                  </button>
                  {showOriginalCode && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <SyntaxHighlighter
                        language="python"
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          padding: "1rem",
                          fontSize: "0.75rem",
                          backgroundColor: "transparent",
                        }}
                        showLineNumbers
                        lineNumberStyle={{ color: "#ffffff20" }}
                      >
                        {originalCode}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3">
            {errorMessage}
          </div>
        )}
        {messages.length === 0 && !improvementMode ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <FiCode size={48} className="text-yellow-500 mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Logic Query</p>
          </div>
        ) : (
          messages.map((message, idx) => (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id || idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start w-full"}`}
            >
              <div
                className={`rounded-2xl p-4 transition-all ${
                  message.role === "user"
                    ? "max-w-[85%] bg-yellow-600 text-black font-bold shadow-lg shadow-black/20"
                    : "w-full bg-white/[0.03] border border-white/5 text-gray-200"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                      {message.isImproved ? "IMPROVED STRATEGY" : "AI LOGIC"}
                    </span>
                  </div>
                )}

                {renderContent(
                  message.content,
                  message.code,
                  message.isImproved,
                  message.id || idx,
                  message.role
                )}

                <div
                  className={`mt-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-tighter ${
                    message.role === "user" ? "text-white/75" : "text-gray-600"
                  }`}
                >
                  <span>{formatLongDateTime(message.timestamp)}</span>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      <button className="hover:text-yellow-500">
                        <FiThumbsUp />
                      </button>
                      <button className="hover:text-yellow-500">
                        <FiThumbsDown />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Motion.div>
          ))
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

      <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-3">
        {improvementMode && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Additional Requirements (optional)
            </label>
            <textarea
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="e.g. Add ADX filter, tighten stop losses to 1.5%, only trade during London session..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/30 transition-all font-medium placeholder-gray-600 resize-none"
            />
            <button
              onClick={handleImproveStrategy}
              disabled={sending || !originalCode}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTool size={14} />
              {sending ? "Generating Improved Strategy..." : "Generate Improved Strategy"}
            </button>
          </div>
        )}

        {!improvementMode && (
          <div className="relative group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              placeholder="Input neural logic query..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all font-medium placeholder-gray-600 disabled:opacity-50"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:grayscale shadow-lg shadow-yellow-500/20"
            >
              <FiSend size={18} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
            <FiZap className="text-yellow-500" /> High-Compute Node
          </span>
          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
            <FiClock className="text-yellow-500" /> Neural Knowledge
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeGeneration;
