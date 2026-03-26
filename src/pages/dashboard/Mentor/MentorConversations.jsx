import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  deleteConversation,
  getConversations,
  getMentorConversationCacheKey,
} from '../../../services/mentorService';
import {
  FiChevronRight,
  FiClock,
  FiMessageCircle,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { formatLongDateTime } from '../../../utils/formatters';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#FFD700';

const MentorConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  const handleNewConversation = () => {
    navigate('/dashboard/mentor/messages/new');
  };

  const fetchConversations = async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getConversations(userId);
      const normalized = (Array.isArray(data) ? data : []).filter(
        (conversation) => conversation?.conversation_id
      );
      setConversations(normalized);
      localStorage.setItem(
        getMentorConversationCacheKey(userId),
        JSON.stringify(normalized)
      );
    } catch (error) {
      console.error('Error fetching mentor conversations:', error);
      setErrorMessage("Failed to load conversations. Please try again.");

      const cached = localStorage.getItem(getMentorConversationCacheKey(userId));
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setConversations(
            (Array.isArray(parsed) ? parsed : []).filter(
              (conversation) => conversation?.conversation_id
            )
          );
        } catch (cacheError) {
          console.error('Cache parse error:', cacheError);
          toast.error('Failed to fetch conversations');
        }
      } else {
        toast.error('Failed to fetch conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id || !userId) return;

    const loadingToast = toast.loading('Deleting conversation...');
    try {
      await deleteConversation(deleteModal.id, userId);
      toast.success('Conversation deleted', { id: loadingToast });
      setConversations((prev) =>
        prev.filter((c) => c.conversation_id !== deleteModal.id)
      );
      setDeleteModal({ open: false, id: null });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete', { id: loadingToast });
    }
  };

  const confirmDelete = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteModal({ open: true, id });
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiMessageCircle className="text-yellow-500" />
            Mentor{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
              }}
            >
              Intelligence
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Past intellectual exchanges with your AI Trading Mentor.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewConversation}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10"
        >
          <FiPlus size={16} /> New Chat
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3">
          {errorMessage}
        </div>
      )}

      <Motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Motion.div key={conversation.conversation_id} variants={item}>
              <Link
                to={`/dashboard/mentor/messages/${conversation.conversation_id}`}
                className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-500/20 transition-all flex items-center gap-5 relative overflow-hidden"
              >
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <FiMessageCircle className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors truncate">
                      {conversation.preview?.length > 30
                        ? `${conversation.preview.substring(0, 30)}...`
                        : conversation.preview || 'AI Conversation'}
                    </h4>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap font-black uppercase tracking-tighter flex items-center gap-1">
                      <FiClock size={10} />
                      {formatLongDateTime(conversation.started_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xl">
                    {conversation.preview ||
                      'Continue your analysis with AI-powered insights.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FiChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                  <button
                    type="button"
                    onClick={(event) =>
                      confirmDelete(event, conversation.conversation_id)
                    }
                    className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white transition-all z-20"
                    title="Delete Conversation"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Motion.div>
          ))
        ) : (
          <div className="text-center py-20 opacity-40">
            <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <FiMessageCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No archive entries found
            </p>
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-[0.2em]">
              Start a new conversation to build your knowledge base.
            </p>
          </div>
        )}
      </Motion.div>

      <AnimatePresence>
        {deleteModal.open && (
          <ConfirmModal
            open={deleteModal.open}
            onClose={() => setDeleteModal({ open: false, id: null })}
            onConfirm={handleDelete}
            title="Delete Conversation"
            message="Are you sure you want to delete this intellectual exchange? This action cannot be undone."
            confirmText="Delete Permanently"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorConversations;
