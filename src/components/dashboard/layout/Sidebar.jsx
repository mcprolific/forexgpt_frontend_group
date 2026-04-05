import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  FiHome,
  FiMessageCircle,
  FiActivity,
  FiCode,
  FiBarChart2,
  FiUser,
  FiClock,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMoreHorizontal,
  FiStar,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import Logo from "../../../assets/logo.png";
import { getConversations as getMentorConversations } from "../../../services/mentorService";
import { getConversations as getCodegenConversations } from "../../../services/codeGenService";
import { getUserSignals } from "../../../services/signalService";
import { getBacktestResults } from "../../../services/backtestService";
import { formatLongDate } from "../../../utils/formatters";
import toast from "react-hot-toast";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#0A0A0A";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [historyMeta, setHistoryMeta] = useState({});
  const [historyRefreshTick, setHistoryRefreshTick] = useState(0);
  const userId = user?.user_id || user?.id;

  const getMetaKey = (id) => `fgpt_sidebar_meta_${id || "anon"}`;

  const historyMode = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/dashboard/mentor")) return "mentor";
    if (path.includes("/dashboard/codegen")) return "codegen";
    if (path.includes("/dashboard/signals")) return "signals";
    if (path.includes("/dashboard/backtest")) return "backtest";
    return null;
  }, [location.pathname]);

  const maskEmail = (email) => {
    if (!email || typeof email !== "string") return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (!local) return `***@${domain}`;
    if (local.length === 1) return `${local}***@${domain}`;
    if (local.length === 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${"*".repeat(Math.max(local.length - 2, 3))}${local[local.length - 1]}@${domain}`;
  };

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard", end: true },
    { path: "/dashboard/codegen", icon: FiCode, label: "Code Generation" },
    { path: "/dashboard/mentor", icon: FiMessageCircle, label: "Mentor" },
    { path: "/dashboard/signals", icon: FiActivity, label: "Signal Extraction" },
    { path: "/dashboard/backtest", icon: FiBarChart2, label: "Backtesting" },
    { path: "/dashboard/activity", icon: FiClock, label: "Activity" },
    { path: "/dashboard/profile", icon: FiUser, label: "Profile Settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewChat = () => {
    if (historyMode === "mentor") {
      navigate("/dashboard/mentor/messages/new");
      return;
    }

    if (historyMode === "codegen") {
      navigate("/dashboard/codegen/session/new");
      return;
    }

    if (historyMode === "signals") {
      navigate("/dashboard/signals");
      return;
    }

    if (historyMode === "backtest") {
      navigate("/dashboard/backtest");
    }
  };

  useEffect(() => {
    const onClick = () => setOpenMenuId(null);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const onMentorUpdate = () => setHistoryRefreshTick((t) => t + 1);
    window.addEventListener("fgpt-mentor-history-updated", onMentorUpdate);
    return () => window.removeEventListener("fgpt-mentor-history-updated", onMentorUpdate);
  }, []);

  useEffect(() => {
    const onSignalUpdate = () => setHistoryRefreshTick((t) => t + 1);
    window.addEventListener("fgpt-signal-history-updated", onSignalUpdate);
    return () => window.removeEventListener("fgpt-signal-history-updated", onSignalUpdate);
  }, []);

  useEffect(() => {
    const onCodegenUpdate = () => setHistoryRefreshTick((t) => t + 1);
    window.addEventListener("fgpt-codegen-history-updated", onCodegenUpdate);
    return () => window.removeEventListener("fgpt-codegen-history-updated", onCodegenUpdate);
  }, []);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(getMetaKey(userId));
    if (!raw) {
      setHistoryMeta({});
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setHistoryMeta(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setHistoryMeta({});
    }
  }, [userId]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(getMetaKey(userId), JSON.stringify(historyMeta));
  }, [historyMeta, userId]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (!userId || !historyMode) {
        setHistoryItems([]);
        return;
      }

      setHistoryLoading(true);
      try {
        let data = [];
        if (historyMode === "mentor") {
          data = await getMentorConversations(userId);
        } else if (historyMode === "codegen") {
          data = await getCodegenConversations(userId);
        } else if (historyMode === "signals") {
          data = await getUserSignals(userId, 50);
        } else if (historyMode === "backtest") {
          data = await getBacktestResults(userId, 50, 0);
        }

        if (cancelled) return;

        const normalized = (Array.isArray(data) ? data : []).map((item) => {
          if (historyMode === "mentor") {
            return {
              id: item?.conversation_id || item?.id,
              title: item?.preview || "Mentor Conversation",
              date: item?.started_at || item?.created_at,
              href: `/dashboard/mentor/messages/${item?.conversation_id || item?.id}`,
            };
          }

          if (historyMode === "codegen") {
            return {
              id: item?.conversation_id || item?.id,
              title: item?.description || "Logic Session",
              date: item?.created_at || item?.started_at,
              href: `/dashboard/codegen/session/${item?.conversation_id || item?.id}`,
            };
          }

          if (historyMode === "signals") {
            return {
              id: item?.id || item?.signal_id,
              title:
                item?.source_label ||
                item?.company_name ||
                item?.base_currency ||
                "Signal",
              date: item?.created_at || item?.timestamp,
              href: `/dashboard/signals`,
            };
          }

          return {
            id: item?.id || item?.backtest_id,
            title:
              item?.strategy_name ||
              item?.pair ||
              item?.symbol ||
              item?.timeframe ||
              "Backtest",
            subtitle: item?.status || item?.state || null,
            date: item?.created_at || item?.timestamp,
            href: `/dashboard/backtest/${item?.id || item?.backtest_id}`,
          };
        }).filter((item) => item.id);

        setHistoryItems(normalized);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load sidebar history:", error);
          setHistoryItems([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [userId, historyMode, location.pathname, historyRefreshTick]);

  const updateMeta = (id, updates) => {
    setHistoryMeta((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates },
    }));
  };

  const handleStar = (item) => {
    const current = historyMeta[item.id]?.starred;
    updateMeta(item.id, { starred: !current });
    toast.success(!current ? "Starred" : "Unstarred");
  };

  const handleRename = (item) => {
    const currentTitle = historyMeta[item.id]?.title || item.title;
    const next = window.prompt("Rename conversation", currentTitle);
    if (!next || !next.trim()) return;
    updateMeta(item.id, { title: next.trim() });
    toast.success("Renamed");
  };

  const handleDelete = async (item) => {
    if (!userId) return;
    const confirm = window.confirm("Delete this conversation?");
    if (!confirm) return;

    try {
      if (historyMode === "mentor") {
        const { deleteConversation } = await import("../../../services/mentorService");
        await deleteConversation(item.id, userId);
      } else if (historyMode === "codegen") {
        const { deleteConversation } = await import("../../../services/codeGenService");
        await deleteConversation(item.id, userId);
      } else if (historyMode === "signals") {
        const { deleteSignal } = await import("../../../services/signalService");
        await deleteSignal(userId, item.id);
      } else if (historyMode === "backtest") {
        const { deleteBacktest } = await import("../../../services/backtestService");
        await deleteBacktest(userId, item.id);
      }

      setHistoryItems((prev) => prev.filter((entry) => entry.id !== item.id));
      setHistoryMeta((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });

      if (location.pathname.includes(item.id)) {
        if (historyMode === "mentor") {
          navigate("/dashboard/mentor/messages/new");
        } else if (historyMode === "codegen") {
          navigate("/dashboard/codegen/session/new");
        } else if (historyMode === "signals") {
          navigate("/dashboard/signals");
        } else if (historyMode === "backtest") {
          navigate("/dashboard/backtest");
        }
      }

      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Delete failed");
    }
  };

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full min-h-0 z-50 transition-all duration-300 border-r border-white/5 flex flex-col
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"}
      `}
      style={{ background: CHARCOAL }}
    >
      {/* Collapse Button (Desktop Only) */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex items-center w-full px-4 py-3 rounded-xl text-gray-500 hover:text-yellow-500 transition-all group relative"
      >
        {isOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
        {!isOpen && (
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider text-yellow-500 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 shadow-xl z-[60]">
            Expand Sidebar
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
          </div>
        )}
      </button>

      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/10 bg-white/5">
          <img src={Logo} alt="ForexGPT" className="w-8 h-8 object-contain" />
        </div>
        {(isOpen || !isOpen) && (
          <div className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
            <span className="text-lg font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              ForexGPT
            </span>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Premium AI</p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div
          className={`flex-1 min-h-0 px-3 py-4 space-y-4 ${
            isOpen ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"
          }`}
        >
          {/* Navigation */}
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />

                <span className={`ml-3 text-sm font-medium tracking-wide transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
                  {item.label}
                </span>

                {isOpen && <FiChevronRight className="ml-auto w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}

                {!isOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-yellow-500 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 shadow-xl z-[60] hidden md:block">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* Recents */}
          {historyMode && (
            <div className={`${isOpen ? "space-y-3" : "hidden md:hidden"}`}>
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-yellow-500 text-black hover:brightness-110"
              >
                <FiPlus className="w-4 h-4" />
                New chat
              </button>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold px-1">
                Recents
              </div>
              <div className="space-y-2">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-5 w-5 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                  </div>
                ) : historyItems.length > 0 ? (
                  historyItems.map((item) => {
                    const meta = historyMeta[item.id] || {};
                    const displayTitle = meta.title || item.title;
                    const isStarred = Boolean(meta.starred);
                    return (
                    <div key={item.id} className="relative group">
                      <NavLink
                        to={item.href}
                        state={historyMode === "signals" ? { selectedSignalId: item.id } : undefined}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-white/10 text-yellow-500"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`
                        }
                      >
                        <div className="truncate pr-10 flex items-center gap-2">
                          {isStarred && <FiStar className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                          <span className="truncate">{displayTitle}</span>
                        </div>
                      {(item.subtitle || item.date) && (
                        <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
                          {item.subtitle && (
                            <span className="uppercase tracking-widest text-[9px] text-yellow-500/70">
                              {String(item.subtitle)}
                            </span>
                          )}
                          {item.subtitle && item.date && <span className="text-white/10">•</span>}
                          {item.date && <span>{formatLongDate(item.date)}</span>}
                        </div>
                      )}
                      </NavLink>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                        }}
                        className="absolute right-2 top-2 p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Conversation options"
                      >
                        <FiMoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenuId === item.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-9 z-50 w-36 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl p-1"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStar(item);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
                          >
                            <FiStar className="w-3.5 h-3.5" />
                            Star
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(item);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )})
                ) : (
                  <div className="text-[11px] text-gray-600 px-3 py-2">
                    No recent chats yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        {/* Profile Section */}
        <div className={`px-3 py-3 rounded-xl bg-white/5 border border-white/5 mb-4 group cursor-pointer hover:border-yellow-500/20 transition-all relative ${!isOpen ? 'flex justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-xs uppercase flex-shrink-0`}>
              {(user?.display_name || user?.email || 'U').substring(0, 1)}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
              <p className="text-xs font-bold text-gray-200 truncate">{user?.display_name || user?.email?.split('@')[0] || 'Traders'}</p>
              <p className="text-[10px] text-gray-500 truncate">{maskEmail(user?.email)}</p>
            </div>
          </div>

          {!isOpen && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-[60] min-w-[150px] hidden md:block">
              <p className="text-xs font-bold text-yellow-500">{user?.display_name || 'Active Trader'}</p>
              <p className="text-[10px] text-gray-500 truncate">{maskEmail(user?.email)}</p>
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </div>

        <button
          onClick={() => {
            handleLogout();
            if (isOpen) toggleSidebar();
          }}
          className={`flex items-center w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all group relative ${!isOpen ? 'justify-center' : ''}`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
          <span className={`ml-3 text-sm font-medium transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:hidden'}`}>
            Log out
          </span>
          {!isOpen && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-red-500 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 shadow-xl z-[60] hidden md:block">
              Sign Out
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
