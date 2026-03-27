import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiArchive,
  FiMenu,
  FiX,
  FiCpu
} from 'react-icons/fi';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  getConversations,
  deleteConversation,
  getMentorConversationCacheKey,
} from '../../../services/mentorService';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { formatLongDate, formatTime } from '../../../utils/formatters';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const MentorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  const fetchConversations = async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getConversations(userId);
      const normalized = (Array.isArray(data) ? data : []).filter(
        (conversation) => conversation?.conversation_id
      );
      setConversations(normalized);
    } catch (error) {
      console.error("Error fetching mentor conversations sidebar:", error);
      const cached = localStorage.getItem(getMentorConversationCacheKey(userId));

      if (!cached) return;

      try {
        const parsed = JSON.parse(cached);
        setConversations(
          (Array.isArray(parsed) ? parsed : []).filter(
            (conversation) => conversation?.conversation_id
          )
        );
      } catch (cacheError) {
        console.error("Error parsing mentor sidebar cache:", cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId, location.pathname]); // Re-fetch when path changes or user changes

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conv =>
    (conv.preview || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const dateKey = formatLongDate(conv.started_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(conv);
    return groups;
  }, {});

  const handleNewChat = () => {
    navigate('/dashboard/mentor/messages/new');
  };

  const handleDelete = async () => {
    if (!deleteModal.id || !userId) return;

    const loadingToast = toast.loading("Deleting conversation...");
    try {
      await deleteConversation(deleteModal.id, userId);
      toast.success("Conversation deleted", { id: loadingToast });
      fetchConversations();
      setDeleteModal({ open: false, id: null });
      if (location.pathname.includes(deleteModal.id)) {
        navigate('/dashboard/mentor/conversations');
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete", { id: loadingToast });
    }
  };

  const confirmDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ open: true, id });
  };

  return (
    <div className="flex h-full rounded-3xl border border-white/5 overflow-hidden bg-black/20 backdrop-blur-sm relative">

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 z-30 md:hidden cursor-pointer"
        />
      )}

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <Motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 p-3 rounded-xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 md:hidden"
          >
            <FiMenu className="w-5 h-5" />
          </Motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? (window.innerWidth < 768 ? '300px' : '320px') : '0px',
          x: isSidebarOpen ? 0 : (window.innerWidth < 768 ? -300 : 0)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-black/40 border-r border-white/5 flex flex-col h-full overflow-hidden z-40
          ${window.innerWidth < 768 ? 'fixed left-0 top-0 shadow-2xl' : 'relative'}
        `}
      >
        <div className="w-[300px] md:w-80 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleNewChat();
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-yellow-500/10"
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#000' }}
            >
              <FiPlus className="w-4 h-4" />
              New Mentor Chat
            </Motion.button>
          </div>

          {/* Search */}
          <div className="p-6 pb-2">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : Object.entries(groupedConversations).length > 0 ? (
              Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-3 mb-3">{date}</h3>

                  <div className="space-y-1.5">
                    {convs.map((conv) => (
                      <div key={conv.conversation_id} className="group relative">
                        <Link
                          to={`/dashboard/mentor/messages/${conv.conversation_id}`}
                          onClick={() => {
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                            else setIsSidebarOpen(false); // Consistently collapse
                          }}
                          className={`flex items-start space-x-3 px-3 py-3 rounded-xl transition-all duration-200 border ${location.pathname.includes(conv.conversation_id)
                            ? 'bg-white/10 border-yellow-500/30'
                            : 'hover:bg-white/[0.03] border-transparent hover:border-white/5'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${location.pathname.includes(conv.conversation_id) ? 'bg-yellow-500 text-black' : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                            <FiMessageCircle className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-bold transition-colors truncate ${location.pathname.includes(conv.conversation_id) ? 'text-yellow-500' : 'text-gray-200 group-hover:text-yellow-500'
                                }`}>
                                {conv.preview.length > 25 ? conv.preview.substring(0, 25) + '...' : conv.preview || 'AI Conversation'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-gray-500">
                                {conv.message_count} prompts
                              </p>
                              <span className="text-[10px] text-gray-600">•</span>
                              <span className="text-[10px] text-gray-600">
                                {formatTime(conv.started_at)}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-black/90 border border-white/10 rounded-lg p-1 shadow-xl">
                          <button
                            onClick={(e) => confirmDelete(e, conv.conversation_id)}
                            className="p-1.5 hover:text-red-500 transition-colors tooltip"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-40">
                <p className="text-[10px] text-gray-500 uppercase font-black">No conversations</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-white/5 p-6 bg-black/20">
            <div className="flex items-center space-x-3 rounded-2xl p-2 hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-500/10">
                <FiCpu className="w-5 h-5 text-black" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-yellow-500 uppercase tracking-wider">AI Mentor v4.2</p>
                <p className="text-[10px] text-gray-500 truncate">Online & Ready</p>
              </div>
              <FiMoreVertical className="ml-auto w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {deleteModal.open && (
            <ConfirmModal
              open={deleteModal.open}
              onClose={() => setDeleteModal({ open: false, id: null })}
              onConfirm={handleDelete}
              title="Delete Conversation"
              message="Are you sure you want to delete this conversation history?"
            />
          )}
        </AnimatePresence>
      </Motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-transparent relative min-w-0">
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Close mentor sidebar' : 'Open mentor sidebar'}
          className="absolute left-4 top-4 z-50 p-1.5 bg-black border border-white/10 rounded-full hover:border-yellow-500/50 transition-all shadow-xl hidden lg:flex"
        >
          {isSidebarOpen ? <FiX className="w-3.5 h-3.5 text-yellow-500" /> : <FiMenu className="w-3.5 h-3.5 text-yellow-500" />}
        </button>

        <main className="flex-1 overflow-hidden h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;
