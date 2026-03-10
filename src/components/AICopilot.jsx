import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPaperPlane, FaUserCircle, FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { askMentor } from "../features/mentor/mentorSlice";
import aiImage from "../assets/ai_assistant.png";
import { useTheme } from "../contexts/ThemeContext";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Spinner from "./ui/Spinner";
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

const AICopilot = () => {
  const dispatch = useDispatch();
  const { toast, show } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Bawo! I am your ForexGPT Copilot. Ask in English or Yorùbá about signals, strategies, or backtests.",
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
  const [colorTheme] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("fgpt_theme") || "emerald" : "emerald"));
  const recognitionRef = useRef(null);
  const speechReadyRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const h = () => {
        speechReadyRef.current = true;
      };
      window.speechSynthesis.onvoiceschanged = h;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((vv) => vv.lang === language) || voices.find((vv) => vv.lang.startsWith(language.split("-")[0])) || null;
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };

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
    r.onend = () => {
      setRecording(false);
    };
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
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const q = input;
    setInput("");
    setSending(true);
    try {
      const res = await dispatch(askMentor({ question: q, language })).unwrap();
      const reply = res?.response || "Ok.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (speakResponses) speak(reply);
      show("Copilot answered", "success");
    } catch {
      const fallback = "Unable to reach mentor service.";
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
      if (speakResponses) speak(fallback);
      show("Network error while contacting Copilot", "error");
    } finally {
      setSending(false);
    }
  };

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
          borderColor: isLight ? "rgba(212,175,55,0.4)" : "#ffffff"
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
            className="fixed right-6 bottom-24 w-full max-w-[calc(100vw-3rem)] sm:w-[400px] h-[540px] z-50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border transition-colors duration-500"
            style={{
              background: isLight ? "rgba(255,255,255,0.95)" : "rgba(24,24,27,0.85)",
              borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
              color: isLight ? "#1A1A1A" : "#F3F4F6"
            }}
          >
            <div className={`flex items-center justify-between px-4 py-3 ${colorTheme === "violet" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600" : colorTheme === "sky" ? "bg-gradient-to-r from-sky-600 to-cyan-600" : "bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"} text-black`}>
              <div className="flex items-center gap-2">
                <img src={aiImage} className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-sm">ForexGPT Copilot</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.role === "assistant" && (
                    <img src={aiImage} className="w-6 h-6 rounded-full mt-1" />
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] transition-colors ${msg.role === "user"
                      ? `${colorTheme === "violet" ? "bg-violet-600" : colorTheme === "sky" ? "bg-sky-600" : "bg-[#D4AF37]"} text-black font-semibold shadow-md`
                      : isLight
                        ? "bg-black/5 border border-black/5 text-gray-800"
                        : "bg-white/10 border border-white/10 backdrop-blur text-gray-100"
                      }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <FaUserCircle className="text-gray-400 mt-1" />
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-2 justify-start">
                  <img src={aiImage} className="w-6 h-6 rounded-full mt-1" />
                  <div className={`px-3 py-2 rounded-lg max-w-[75%] ${isLight ? "bg-black/5 border border-black/5" : "bg-white/10 border border-white/10 backdrop-blur"}`}>
                    <div className={`h-3 w-48 rounded animate-pulse ${isLight ? "bg-black/10" : "bg-white/20"}`} />
                    <div className={`mt-2 h-3 w-32 rounded animate-pulse ${isLight ? "bg-black/5" : "bg-white/15"}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 py-2 border-t border-white/10 bg-zinc-950/40">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-xs border rounded px-2 py-1 transition-colors ${isLight ? "bg-white border-black/10 text-gray-800" : "bg-black/40 border-white/10 text-gray-100"}`}
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
                    label="Ask about signals, strategies, or backtests"
                    error={error}
                    loading={sending}
                    className="text-sm"
                  />
                </div>
                <Button onClick={sendMessage} loading={sending} variant="solid" color={colorTheme} aria-label="Send message">
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
