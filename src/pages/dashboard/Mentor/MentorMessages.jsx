<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSend,
  FiThumbsUp,
  FiThumbsDown,
  FiCopy,
  FiDownload,
  FiCpu,
  FiClock,
  FiZap
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getConversationHistory, askMentor } from '../../../services/mentorService';
import toast from 'react-hot-toast';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
=======
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import {
  getConversationHistory,
  askMentor,
  analyzeBacktest
} from "../../../services/mentorService";
import toast from "react-hot-toast";
>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)

const MentorMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const [newMessage, setNewMessage] = useState('');
=======
  const scrollRef = useRef(null);

>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
<<<<<<< HEAD
  const [errorMessage, setErrorMessage] = useState('');
  const scrollRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const formatMentorMessage = (content) => {
    if (typeof content !== 'string') return content;
    const sectionLabels = [
      "SHORT ANSWER",
      "LONG ANSWER",
      "Mathematical Definition",
      "Example calculation",
      "Intuitive Explanation",
      "Derivation",
      "Assumptions",
      "Real-World Application",
      "Limitations",
      "Practical Implementation",
      "Common Misconceptions",
      "Next Steps"
    ];
    const listSections = new Set([
      "Assumptions",
      "Limitations",
      "Practical Implementation",
      "Common Misconceptions",
      "Next Steps"
    ]);

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let activeListSection = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const labelMatch = sectionLabels.find((label) => line.toUpperCase().startsWith(label.toUpperCase() + ":"));
      if (labelMatch) {
        out.push('');
        out.push(`**${labelMatch}:**`);
        const rest = line.slice(labelMatch.length + 1).trim();
        if (rest) {
          out.push(rest);
        }
        activeListSection = listSections.has(labelMatch) ? labelMatch : null;
        continue;
      }

      if (!line) {
        out.push('');
        activeListSection = null;
        continue;
      }

      if (activeListSection) {
        if (/^[-*]\s+/.test(line)) {
          out.push(line);
        } else {
          out.push(`- ${line}`);
        }
      } else {
        out.push(rawLine);
      }
    }

    return out.join('\n');
  };

  const getErrorMessage = (error, fallback) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return fallback;
  };

  useEffect(() => {
    if (conversationId === 'new' && location.state?.prefilledQuestion) {
      setNewMessage(location.state.prefilledQuestion);
    }
  }, [conversationId, location.state]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      if (!conversationId || conversationId === 'new') {
        setMessages([]);
        setLoading(false);
        return;
      }
      setErrorMessage('');
      try {
        const res = await getConversationHistory(conversationId, user.id);
        const history = Array.isArray(res?.history)
          ? res.history
          : Array.isArray(res?.messages)
            ? res.messages
            : Array.isArray(res)
              ? res
              : [];
        setMessages(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      if (error?.response?.status === 403) {
        setErrorMessage("Not authorized to view this conversation.");
      } else {
        setErrorMessage(getErrorMessage(error, "Failed to load conversation history."));
      }
    } finally {
      setLoading(false);
    }
  };
=======

  const [analysisMode, setAnalysisMode] = useState(false);
  const [backtestData, setBacktestData] = useState(null);

  const { user } = useSelector((state) => state.auth);

  // ==============================
  // STRATEGY DETECTION
  // ==============================
  const detectStrategyKeywords = (text) => {
    if (!text) return false;

    const keywords = [
      /mean\s*reversion/i,
      /\brsi\b/i,
      /\bmacd\b/i,
      /bollinger\s*bands/i,
      /moving\s*average/i,
      /momentum/i,
      /trend\s*following/i
    ];

    return keywords.some((regex) => regex.test(text));
  };

  // ==============================
  // FETCH HISTORY
  // ==============================
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id || conversationId === "new") {
        setLoading(false);
        return;
      }

      try {
        const res = await getConversationHistory(conversationId, user.id);
        setMessages(res.history || []);
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)
    fetchHistory();
  }, [conversationId, user?.id]);

  // ==============================
  // AUTO SCROLL
  // ==============================
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // ==============================
  // ANALYSIS MODE
  // ==============================
  useEffect(() => {
    if (location.state?.mode === "analyze" && !analysisMode) {
      setAnalysisMode(true);
      setBacktestData(location.state);

<<<<<<< HEAD
    const userContent = newMessage;
    setNewMessage('');
    setSending(true);
    setErrorMessage('');

    // Optimistic update
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
=======
      analyzeBacktestResults(
        location.state.strategyType,
        location.state.results
      );
    }
  }, [location.state, analysisMode]);
>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)

  // ==============================
  // ANALYZE BACKTEST
  // ==============================
  const analyzeBacktestResults = async (strategyType, results) => {
    try {
<<<<<<< HEAD
      const response = await askMentor(userContent, conversationId === 'new' ? null : conversationId, user.id);
      if (!response?.response) {
        throw new Error("Mentor returned no response.");
      }

      const assistantMsg = {
        id: Date.now().toString() + "-assistant",
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (response?.conversation_id && conversationId === 'new') {
        navigate(`/dashboard/mentor/messages/${response.conversation_id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const message = error?.response?.status === 403
        ? "Not authorized to send messages to this conversation."
        : getErrorMessage(error, "Unable to reach mentor service.");
      setErrorMessage(message);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "-assistant-error",
          role: 'assistant',
          content: `Error: ${message}`,
          timestamp: new Date().toISOString()
        }
      ]);
=======
      setSending(true);

      const data = await analyzeBacktest({
        user_id: user.id,
        strategy_type: strategyType,
        results
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `**${data.verdict}**\n\n${data.explanation}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      toast.error("Analysis failed");
>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)
    } finally {
      setSending(false);
    }
  };

  // ==============================
  // SEND MESSAGE
  // ==============================
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: newMessage
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setSending(true);

    try {
      const res = await askMentor(
        newMessage,
        conversationId === "new" ? null : conversationId,
        user.id
      );

      if (conversationId === "new") {
        navigate(`/dashboard/mentor/messages/${res.conversation_id}`);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: res.response,
          timestamp: res.timestamp
        }
      ]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ==============================
  // IMPROVE STRATEGY
  // ==============================
  const handleImproveStrategy = () => {
    if (!backtestData) return;

    navigate("/codegen", {
      state: {
        mode: "improve",
        originalCode: backtestData?.strategyCode || "",
        backtestResults: backtestData?.results || {},
        mentorAnalysis: messages[messages.length - 1]?.content || ""
      }
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden">

      {/* Header */}
      <div className="bg-white/[0.02] border-b border-white/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Mentor Intelligence</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">AI Node Active • {messages.length} Exchanges</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-yellow-500 hover:border-yellow-500/30 transition-all">
            <FiDownload /> Export Logs
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {errorMessage ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3">
            {errorMessage}
          </div>
        ) : null}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <FiZap size={48} className="text-yellow-500 mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Input Query</p>
          </div>
        ) : (
          messages.map((message, idx) => (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id || idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 transition-all
                ${message.role === 'user'
                  ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/10'
                  : 'bg-white/[0.03] border border-white/5 text-gray-200'}
              `}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">AI MENTOR</span>
                  </div>
                )}

                <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    breaks
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="rounded-lg overflow-hidden my-4 border border-white/10 relative group/code">
                            <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(String(children));
                                  toast.success("Snippet copied");
                                }}
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
                                backgroundColor: '#0d0d0d'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-white/10 px-1.5 py-0.5 rounded text-yellow-500 font-mono text-xs" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {formatMentorMessage(message.content)}
                  </ReactMarkdown>
                </div>

                <div className={`mt-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-tighter
                  ${message.role === 'user' ? 'text-black/40' : 'text-gray-600'}
                `}>
                  <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <button className="hover:text-yellow-500"><FiCopy /></button>
                      <button className="hover:text-yellow-500"><FiThumbsUp /></button>
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
=======
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <Motion.div key={msg.id} className={msg.role === "user" ? "text-right" : ""}>
            <div className="p-3 rounded-lg bg-gray-800 text-white">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
>>>>>>> e00fa0c (Add mentor message, conversation, service, and axios instance)
            </div>

            {/* Generate Code */}
            {msg.role === "assistant" && detectStrategyKeywords(msg.content) && (
              <button
                onClick={() =>
                  navigate("/codegen", {
                    state: {
                      fromMentor: true,
                      strategyText: msg.content
                    }
                  })
                }
                className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded"
              >
                Generate Code
              </button>
            )}

            {/* Improve Strategy */}
            {msg.role === "assistant" &&
              analysisMode &&
              idx === messages.length - 1 && (
                <button
                  onClick={handleImproveStrategy}
                  className="mt-2 px-3 py-1 bg-green-500 text-black rounded"
                >
                  Improve Strategy
                </button>
              )}
          </Motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 bg-black text-white"
          placeholder="Ask mentor..."
        />
        <button onClick={handleSendMessage}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default MentorMessages;
