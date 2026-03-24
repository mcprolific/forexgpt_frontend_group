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

const MentorMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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
        console.error("Failed to load history:", error);
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

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

      analyzeBacktestResults(
        location.state.strategyType,
        location.state.results
      );
    }
  }, [location.state, analysisMode, analyzeBacktestResults]);

  // ==============================
  // ANALYZE BACKTEST
  // ==============================
  const analyzeBacktestResults = async (strategyType, results) => {
    try {
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
      console.error("Analysis failed:", error);
      toast.error("Analysis failed");
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
      console.error("Failed to send message:", error);
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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <Motion.div key={msg.id} className={msg.role === "user" ? "text-right" : ""}>
            <div className="p-3 rounded-lg bg-gray-800 text-white">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
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
