import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
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
import { mockMentorConversations } from '../../../../data/mockData';

const MentorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations] = useState(mockMentorConversations);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.last_message_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(conv);
    return groups;
  }, {});

  const handleNewChat = () => {
    const newId = conversations.length + 1;
    navigate(`/mentor/messages/${newId}`);
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-black border-r border-gray-800 flex flex-col overflow-hidden`}>

        {isSidebarOpen && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-between px-4 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition-all duration-200"
              >
                <span className="text-sm font-semibold">New Chat</span>
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-xs text-white px-3 mb-2">{date}</h3>

                  <div className="space-y-1">
                    {convs.map((conv) => (
                      <div key={conv.id} className="group relative">
                        <Link
                          to={`/mentor/messages/${conv.id}`}
                          className="flex items-start space-x-3 px-3 py-3 rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                        >
                          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center group-hover:bg-black transition">
                            <FiMessageCircle className="w-4 h-4 text-black group-hover:text-yellow-500" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <p className="text-sm font-semibold text-yellow-500 group-hover:text-black truncate">
                                {conv.title}
                              </p>
                              <span className="text-xs text-white group-hover:text-black">
                                {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-xs text-white group-hover:text-black mt-1">
                              {conv.message_count} messages
                            </p>
                          </div>
                        </Link>

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-black border border-gray-700 rounded-lg p-1">
                          <button className="p-1.5 hover:bg-white hover:text-black rounded-md transition">
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-white hover:text-black rounded-md transition">
                            <FiArchive className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-white hover:text-black rounded-md transition">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <FiCpu className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-500">AI Mentor</p>
                  <p className="text-xs text-white">ForexGPT Assistant</p>
                </div>
                <button className="ml-auto p-1.5 hover:bg-white hover:text-black rounded-lg transition">
                  <FiMoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-black">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-4 top-4 z-10 p-2 bg-black border border-gray-700 rounded-lg hover:bg-white hover:text-black transition"
          style={{ left: isSidebarOpen ? '21rem' : '1rem' }}
        >
          {isSidebarOpen ? <FiX className="w-4 h-4 text-yellow-500" /> : <FiMenu className="w-4 h-4 text-yellow-500" />}
        </button>

        <Outlet />
      </div>
    </div>
  );
};

export default MentorLayout;