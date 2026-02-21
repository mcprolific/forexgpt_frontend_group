import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPaperPlane, FaUserCircle, FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { askMentor } from "../features/mentor/mentorSlice";
import aiImage from "../assets/ai_assistant.png";

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
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const q = input;
    setInput("");
    try {
      const res = await dispatch(askMentor({ question: q, language })).unwrap();
      const reply = res?.response || "Ok.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (speakResponses) speak(reply);
    } catch {
      const fallback = "Unable to reach mentor service.";
      setMessages((prev) => [...prev, { role: "assistant", text: fallback }]);
      if (speakResponses) speak(fallback);
    }
  };

  return (
    <>
      <Motion.button
        variants={floatPulse}
        animate="animate"
        whileHover={{ scale: 1.15 }}
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-50 w-16 h-16 rounded-full shadow-2xl border-4 border-white overflow-hidden bg-white"
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
            className="fixed right-6 bottom-24 w-[400px] h-[540px] z-50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/90 border"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
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
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <img src={aiImage} className="w-6 h-6 rounded-full mt-1" />
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[75%] ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <FaUserCircle className="text-gray-600 mt-1" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-3 py-2 border-t bg-white">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="yo-NG">Yorùbá (Nigeria)</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">Français (FR)</option>
                  <option value="es-ES">Español (ES)</option>
                </select>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`px-3 py-1 rounded text-white text-xs ${recording ? "bg-red-600" : "bg-indigo-600"} flex items-center gap-2`}
                >
                  {recording ? <FaStop /> : <FaMicrophone />}
                  {recording ? "Stop" : "Speak"}
                </button>
                <button
                  onClick={() => setSpeakResponses((v) => !v)}
                  className={`px-3 py-1 rounded text-white text-xs ${speakResponses ? "bg-green-600" : "bg-gray-500"} flex items-center gap-2`}
                  title="Read responses aloud"
                >
                  <FaVolumeUp />
                  {speakResponses ? "Voice On" : "Voice Off"}
                </button>
              </div>
              <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about signals, strategies, or backtests..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
              >
                <FaPaperPlane />
              </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
