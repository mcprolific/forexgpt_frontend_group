import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getConversationHistory, askMentor } from '../../../services/mentorService';
import toast from 'react-hot-toast';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const MentorMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getConversationHistory(conversationId, user.id);
        setMessages(res.history || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user?.id) return;

    const userContent = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await askMentor(userContent, conversationId === 'new' ? null : conversationId, user.id);
      if (response && response.conversation_id) {
        const assistantMsg = {
          id: Date.now().toString() + "-assistant",
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp || new Date().toISOString()
        };

        if (conversationId === 'new') {
          // Store the assistant message so it can be shown after navigation if needed,
          // but usually the useEffect will fetch it. 
          // However, to be safe and responsive:
          navigate(`/dashboard/mentor/messages/${response.conversation_id}`, { replace: true });
        } else {
          setMessages(prev => [...prev, assistantMsg]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden">

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
                    {message.content}
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
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
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
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:grayscale shadow-lg shadow-yellow-500/20"
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