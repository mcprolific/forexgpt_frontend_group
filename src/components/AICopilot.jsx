import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPaperPlane, FaUserCircle, FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { streamMentorResponse } from "../features/mentor/mentorStream";
import aiImage from "../assets/ai_assistant.png";
import { useTheme } from "../contexts/ThemeContext";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Toast from "./ui/Toast";
import useToast from "../hooks/useToast";

const floatPulse = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

const slideFadeRight = {
  hidden: { opacity: 0, x: 120, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
  exit: { opacity: 0, x: 120, scale: 0.95 },
};

/** Custom renderer components for react-markdown */
const buildMarkdownComponents = (isLight) => ({
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            borderRadius: "8px",
            fontSize: "0.75rem",
            margin: "0.5rem 0",
            padding: "0.75rem",
          }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="px-1 py-0.5 rounded text-xs font-mono"
        style={{
          background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)",
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-1 space-y-0.5 text-xs">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-1 space-y-0.5 text-xs">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  h1({ children }) {
    return <h1 className="text-sm font-bold mb-1 mt-2">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xs font-bold mb-1 mt-2">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-xs font-semibold mb-0.5 mt-1">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote
        className="border-l-2 pl-2 italic opacity-75 my-1 text-xs"
        style={{ borderColor: "currentColor" }}
      >
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="underline opacity-80 hover:opacity-100">
        {children}
      </a>
    );
  },
});

const AICopilot = () => {
  const { toast, show } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Bawo! I am your ForexGPT Copilot. Ask in English or Yorùbá about signals, strategies, or backtests.",
      isStreaming: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState("yo-NG");
  const [speakResponses, setSpeakResponses] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { theme: currentTheme } = useTheme();
  const isLight = currentTheme === "light";
  const [colorTheme] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("fgpt_theme") || "emerald" : "emerald"
  );
  const recognitionRef = useRef(null);
  const speechReadyRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const h = () => { speechReadyRef.current = true; };
      window.speechSynthesis.onvoiceschanged = h;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const v =
      voices.find((vv) => vv.lang === language) ||
      voices.find((vv) => vv.lang.startsWith(language.split("-")[0])) ||
      null;
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, [language]);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = language;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      setInput(t);
    };
    r.onend = () => { setRecording(false); };
    recognitionRef.current = r;
    setRecording(true);
    r.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
  };

  const sendMessage = async () => {
    setError("");
    if (!input.trim()) {
      setError("Please type a message");
      return;
    }

    const q = input;
    setInput("");
    setSending(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: q, isStreaming: false }]);

    // Add an empty assistant message that we'll stream into
    const streamingId = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "", isStreaming: true, id: streamingId },
    ]);

    let fullText = "";

    streamMentorResponse({
      question: q,
      language,
      onChunk: (chunk) => {
        fullText += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId ? { ...m, text: fullText } : m
          )
        );
      },
      onDone: () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId ? { ...m, isStreaming: false } : m
          )
        );
        setSending(false);
        if (speakResponses && fullText) speak(fullText);
        show("Copilot answered", "success");
      },
      onError: (err) => {
        console.error("Streaming error:", err);
        const fallback = "Unable to reach mentor service.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? { ...m, text: fallback, isStreaming: false }
              : m
          )
        );
        setSending(false);
        if (speakResponses) speak(fallback);
        show("Network error while contacting Copilot", "error");
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const mdComponents = buildMarkdownComponents(isLight);

  const accentGradient =
    colorTheme === "violet"
      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
      : colorTheme === "sky"
      ? "bg-gradient-to-r from-sky-600 to-cyan-600"
      : "bg-gradient-to-r from-[#D4AF37] to-[#FFD700]";

  return (
    <>
      <Motion.button
        variants={floatPulse}
        animate="animate"
        whileHover={{ scale: 1.15 }}
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-50 w-16 h-16 rounded-full shadow-2xl border-4 overflow-hidden"
        style={{
          background: isLight ? "#ffffff" : "#1A1A1A",
          borderColor: isLight ? "rgba(212,175,55,0.4)" : "#ffffff",
        }}
      >
        <img src={aiImage} alt="AI" className="w-full h-full object-cover" />
      </Motion.button>

      <AnimatePresence>
        {open && (
          <Motion.div
            variants={slideFadeRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-6 bottom-24 w-full max-w-[calc(100vw-3rem)] sm:w-[420px] h-[560px] z-50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border transition-colors duration-500 flex flex-col"
            style={{
              background: isLight ? "rgba(255,255,255,0.97)" : "rgba(18,18,20,0.92)",
              borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
              color: isLight ? "#1A1A1A" : "#F3F4F6",
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 ${accentGradient} text-black flex-shrink-0`}>
              <div className="flex items-center gap-2">
                <img src={aiImage} className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-sm">ForexGPT Copilot</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
              {messages.map((msg, i) => (
                <div
                  key={msg.id ?? i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <img src={aiImage} className="w-6 h-6 rounded-full mt-1 flex-shrink-0" />
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[80%] transition-colors text-xs leading-relaxed ${
                      msg.role === "user"
                        ? `${
                            colorTheme === "violet"
                              ? "bg-violet-600"
                              : colorTheme === "sky"
                              ? "bg-sky-600"
                              : "bg-[#D4AF37]"
                          } text-black font-medium shadow-md`
                        : isLight
                        ? "bg-black/5 border border-black/8 text-gray-800"
                        : "bg-white/8 border border-white/10 backdrop-blur text-gray-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.text
                    ) : (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={mdComponents}
                        >
                          {msg.text || (msg.isStreaming ? " " : "")}
                        </ReactMarkdown>
                        {msg.isStreaming && (
                          <span
                            className="inline-block ml-0.5 animate-pulse"
                            style={{ animationDuration: "0.7s" }}
                          >
                            ▌
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <FaUserCircle className="text-gray-400 mt-1 flex-shrink-0" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div
              className="px-3 py-2 border-t flex-shrink-0"
              style={{
                borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
                background: isLight ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-xs border rounded px-2 py-1 transition-colors ${
                    isLight
                      ? "bg-white border-black/10 text-gray-800"
                      : "bg-black/40 border-white/10 text-gray-100"
                  }`}
                >
                  <option value="yo-NG">Yorùbá (Nigeria)</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">Français (FR)</option>
                  <option value="es-ES">Español (ES)</option>
                </select>
                <Button
                  onClick={recording ? stopRecording : startRecording}
                  variant="solid"
                  color={recording ? "emerald" : colorTheme}
                  className={recording ? "bg-red-600 hover:bg-red-500 text-white" : ""}
                >
                  {recording ? <FaStop /> : <FaMicrophone />}
                  {recording ? "Stop" : "Speak"}
                </Button>
                <Button
                  onClick={() => setSpeakResponses((v) => !v)}
                  variant="glass"
                  title="Read responses aloud"
                >
                  <FaVolumeUp />
                  {speakResponses ? "Voice On" : "Voice Off"}
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="copilot-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    label="Ask about signals, strategies, or backtests"
                    error={error}
                    loading={sending}
                    className="text-sm"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  loading={sending}
                  variant="solid"
                  color={colorTheme}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </Button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default AICopilot;
