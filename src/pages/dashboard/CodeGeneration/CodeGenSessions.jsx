import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getConversations, deleteConversation } from "../../../services/codeGenService";
import { FiCode, FiPlus, FiClock, FiChevronRight, FiTrash2, FiCpu } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import toast from "react-hot-toast";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const CodeGenSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleNewSession = () => {
        navigate('/dashboard/codegen/session/new');
    };

    // FIX: Wrapped in useCallback so it can be safely included in useEffect deps
    const fetchSessions = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getConversations(user.id);
            // FIX: Filter out any sessions with missing conversation_id to prevent broken navigation
            const validSessions = (data || []).filter(
                (session) => session?.conversation_id
            );
            setSessions(validSessions);
        } catch (error) {
            console.error("Error fetching code generation history:", error);
            toast.error("Failed to fetch sessions");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const handleDelete = async () => {
        if (!deleteModal.id || !user?.id) return;

        const loadingToast = toast.loading("Deleting logic session...");
        try {
            await deleteConversation(deleteModal.id, user.id);
            toast.success("Session deleted successfully", { id: loadingToast });
            fetchSessions();
            setDeleteModal({ open: false, id: null });
        } catch (error) {
            console.error("Error deleting session:", error);
            toast.error("Failed to delete session", { id: loadingToast });
        }
    };

    const confirmDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ open: true, id });
    };

    // FIX: fetchSessions now stable via useCallback, safe to include in deps
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // FIX: Safe description truncation helper — handles null/undefined gracefully
    const truncateDescription = (description, maxLength = 30) => {
        const safe = description || 'Neural Logic';
        return safe.length > maxLength ? safe.substring(0, maxLength) + '...' : safe;
    };

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <FiCpu className="text-yellow-500" />
                        Logic <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Intelligence</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
                        Past algorithmic blueprints from your Neural Logic Architect.
                    </p>
                </div>

                <button
                    onClick={handleNewSession}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-black font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10"
                >
                    <FiPlus size={16} /> New Logic
                </button>
            </div>

            {/* Session List */}
            <Motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
            >
                {sessions.length > 0 ? (
                    sessions.map((session) => (
                        <Motion.div key={session.id || session.conversation_id} variants={item}>
                            <Link
                                to={`/dashboard/codegen/session/${session.conversation_id}`}
                                className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-500/20 transition-all flex items-center gap-5 relative overflow-hidden"
                            >
                                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                    <FiCode className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* FIX: Safe description truncation via helper */}
                                        <h4 className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors truncate">
                                            {truncateDescription(session.description)}
                                        </h4>
                                        <span className="text-[10px] text-gray-600 whitespace-nowrap font-black uppercase tracking-tighter flex items-center gap-1">
                                            <FiClock size={10} />
                                            {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xl">
                                        {session.description || 'Algorithmic logic blueprint generated by AI.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FiChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                                    <button
                                        onClick={(e) => confirmDelete(e, session.conversation_id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white transition-all z-20"
                                        title="Delete Session"
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
                            <FiCode className="w-8 h-8 text-yellow-500" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No neural blueprints found</p>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-[0.2em]">Start a new session to build your algorithmic core.</p>
                    </div>
                )}
            </Motion.div>

            <AnimatePresence>
                {deleteModal.open && (
                    <ConfirmModal
                        open={deleteModal.open}
                        onClose={() => setDeleteModal({ open: false, id: null })}
                        onConfirm={handleDelete}
                        title="Delete Logic Session"
                        message="Are you sure you want to delete this neural blueprint? This action will permanently remove all associated conversation history."
                        confirmText="Delete Permanently"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CodeGenSessions;
