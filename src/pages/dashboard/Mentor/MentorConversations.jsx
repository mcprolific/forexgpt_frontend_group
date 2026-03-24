import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getConversations, deleteConversation } from "../../../services/mentorService";
import { FiMessageCircle, FiPlus, FiClock, FiChevronRight, FiTrash2 } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import toast from "react-hot-toast";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const MentorConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Navigate to new conversation
  const handleNewConversation = () => {
    navigate("/dashboard/mentor/messages/new");
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error("Error fetching mentor conversations:", error);
      if (error?.response?.status === 403) {
        toast.error("Not authorized to view conversations");
      } else {
        toast.error("Failed to fetch conversations");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const handleDelete = async () => {
    if (!deleteModal.id || !user?.id) return;

    const loadingToast = toast.loading("Deleting conversation...");
    try {
      await deleteConversation(deleteModal.id, user.id);
      toast.success("Conversation deleted", { id: loadingToast });
      fetchConversations();
      setDeleteModal({ open: false, id: null });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      if (error?.response?.status === 403) {
        toast.error("Not authorized to delete this conversation", { id: loadingToast });
      } else {
        toast.error("Failed to delete", { id: loadingToast });
      }
    }
  };

  // Confirm deletion modal
  const confirmDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ open: true, id });
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  // Framer Motion animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiMessageCircle className="text-yellow-500" />
            Mentor{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
            >
              Intelligence
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Past intellectual exchanges with your AI Trading Mentor.
          </p>
        </div>

        <button
          onClick={handleNewConversation}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10"
        >
          <FiPlus size={16} /> New Chat
        </button>
      </div>

      {/* Conversation List */}
      <Motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Motion.div key={conversation.conversation_id} variants={item}>
              <Link
                to={`/dashboard/mentor/messages/${conversation.conversation_id}`}
                className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-500/20 transition-all flex items-center gap-5 relative overflow-hidden"
              >
                {/* Icon */}
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <FiMessageCircle className="w-6 h-6" />
                </div>

                {/* Conversation Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors truncate">
                      {conversation.preview.length > 30
                        ? conversation.preview.substring(0, 30) + "..."
                        : conversation.preview || "AI Conversation"}
                    </h4>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap font-black uppercase tracking-tighter flex items-center gap-1">
                      <FiClock size={10} />
                      {new Date(conversation.started_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xl">
                    {conversation.preview || "Continue your analysis with AI-powered insights."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <FiChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                  <button
                    onClick={(e) => confirmDelete(e, conversation.conversation_id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white transition-all z-20"
                    title="Delete Conversation"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Background Gradient */}
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

      {/* Delete Modal */}
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
