import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  FiCode,
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiArchive,
  FiMenu,
  FiX,
  FiGitBranch,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";

const CodeGenerationLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(`code_history_${user?.id}`);
      if (saved) setSessions(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredSessions = sessions.filter(
    (session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const dateKey = formatDate(session.timestamp);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
    return groups;
  }, {});

  const handleNewSession = () => navigate("/code");

  const deleteSession = (sessionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (user)
      localStorage.setItem(
        `code_history_${user.id}`,
        JSON.stringify(updated)
      );
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* SIDEBAR */}
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out bg-black border-r border-gray-800 flex flex-col h-full overflow-hidden`}
      >
        {isSidebarOpen && (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={handleNewSession}
                className="w-full flex items-center justify-between px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition"
              >
                <span className="text-sm font-semibold">
                  New Code Session
                </span>
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-4 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search code sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-600"
                />
              </div>
            </div>

            {/* SESSION LIST */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : Object.entries(groupedSessions).length > 0 ? (
                Object.entries(groupedSessions).map(([date, sess]) => (
                  <div key={date} className="mb-4">
                    <h3 className="text-xs font-medium text-yellow-500 px-3 mb-2">
                      {date}
                    </h3>

                    <div className="space-y-1">
                      {sess.map((session) => (
                        <div key={session.id} className="group relative">
                          <Link
                            to={`/code/session/${session.id}`}
                            className="flex items-start space-x-3 px-3 py-3 rounded-lg hover:bg-white hover:text-black transition"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                              <FiCode className="w-4 h-4 text-black" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {session.title || "Untitled Session"}
                                </p>
                                <span className="text-xs ml-2">
                                  {new Date(
                                    session.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-yellow-600 text-black rounded-full">
                                  {session.language || "python"}
                                </span>
                                <span className="text-xs">
                                  {session.type || "generation"}
                                </span>
                              </div>

                              {session.description && (
                                <p className="text-xs truncate mt-1">
                                  {session.description}
                                </p>
                              )}
                            </div>
                          </Link>

                          {/* HOVER ACTIONS */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-black border border-gray-700 rounded-lg p-1">
                            <button className="p-1.5 hover:bg-white hover:text-black rounded-md transition">
                              <FiEdit className="w-3.5 h-3.5" />
                            </button>

                            <button className="p-1.5 hover:bg-white hover:text-black rounded-md transition">
                              <FiArchive className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) =>
                                deleteSession(session.id, e)
                              }
                              className="p-1.5 hover:bg-white hover:text-black rounded-md transition"
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
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCode className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-sm text-white">
                    No code sessions yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start generating strategies
                  </p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-800 p-4 bg-black">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <FiGitBranch className="w-4 h-4 text-black" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-500">
                    Code Assistant
                  </p>
                  <p className="text-xs text-white">
                    {sessions.length} total sessions
                  </p>
                </div>

                <button className="p-1.5 hover:bg-white hover:text-black rounded-lg transition">
                  <FiMoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full bg-black">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 z-10 p-2 bg-yellow-600 text-black rounded-lg hover:bg-white transition"
          style={{ left: isSidebarOpen ? "21rem" : "1rem" }}
        >
          {isSidebarOpen ? (
            <FiX className="w-4 h-4" />
          ) : (
            <FiMenu className="w-4 h-4" />
          )}
        </button>

        <Outlet />
      </div>
    </div>
  );
};

export default CodeGenerationLayout;