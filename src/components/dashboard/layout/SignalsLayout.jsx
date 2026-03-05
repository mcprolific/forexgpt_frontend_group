import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiPlus, FiSearch, FiStar, FiTrash2, 
  FiArchive, FiMenu, FiX, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';

const SignalsLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(`signals_history_${user?.id}`);
      if (saved) setSignals(JSON.parse(saved));
      else {
        const mockSignals = [
          { id: 1, title: 'ECB Rate Decision', pair: 'EUR/USD', direction: 'bullish', confidence: 0.85, source: 'Central Bank', strength: 'strong', status: 'active', created_at: '2024-03-31T15:30:00Z', expires_at: '2024-04-15T00:00:00Z' },
          { id: 2, title: 'Fed Powell Speech', pair: 'USD/JPY', direction: 'bearish', confidence: 0.72, source: 'Central Bank', strength: 'moderate', status: 'active', created_at: '2024-03-30T10:15:00Z', expires_at: '2024-04-10T00:00:00Z' }
        ];
        setSignals(mockSignals);
        localStorage.setItem(`signals_history_${user.id}`, JSON.stringify(mockSignals));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDirectionIcon = (direction) => (direction === 'bullish' ? '📈' : '📉');
  const getDirectionColor = () => 'text-yellow-400';
  const getStrengthColor = () => 'text-yellow-400 bg-[#121212] px-1.5 py-0.5 rounded-full';
  const getConfidenceColor = () => 'text-yellow-400 bg-[#121212] px-1.5 py-0.5 rounded-full';
  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FiCheckCircle className="w-3 h-3 text-yellow-400" />;
      case 'expired': return <FiAlertCircle className="w-3 h-3 text-yellow-400" />;
      default: return <FiAlertCircle className="w-3 h-3 text-yellow-400" />;
    }
  };

  const filteredSignals = signals.filter(signal =>
    signal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.pair?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSignals = filteredSignals.reduce((groups, signal) => {
    const dateKey = formatDate(signal.created_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(signal);
    return groups;
  }, {});

  const handleNewSignal = () => navigate('/signals/new');
  const deleteSignal = (id, e) => { 
    e.stopPropagation(); 
    const updated = signals.filter(s => s.id !== id); 
    setSignals(updated); 
    localStorage.setItem(`signals_history_${user.id}`, JSON.stringify(updated)); 
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">

      {/* Sidebar */}
      <div className={`transition-all duration-300 bg-[#121212] flex flex-col h-full overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
        {isSidebarOpen && (
          <>
            {/* New Signal */}
            <div className="p-4">
              <button
                onClick={handleNewSignal}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#121212] rounded-lg hover:bg-yellow-400 hover:text-black transition"
              >
                <span className="text-sm font-medium text-white">Extract new signal</span>
                <FiPlus className="w-4 h-4 text-yellow-400"/>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4"/>
                <input
                  type="text"
                  placeholder="Search signals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#121212] rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Signals List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : Object.entries(groupedSignals).length > 0 ? (
                Object.entries(groupedSignals).map(([date, sigs]) => (
                  <div key={date} className="mb-4">
                    <h3 className="text-xs font-medium text-white px-3 mb-2">{date}</h3>
                    <div className="space-y-1">
                      {sigs.map(signal => (
                        <div key={signal.id} className="group relative">
                          <Link
                            to={`/signals/${signal.id}`}
                            className="flex items-start space-x-3 px-3 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-[#121212] rounded-full flex items-center justify-center">
                              <FiActivity className="w-4 h-4 text-yellow-400"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-yellow-400 truncate">{signal.title}</p>
                                  {getStatusIcon(signal.status)}
                                </div>
                                <span className="text-xs text-white whitespace-nowrap ml-2">
                                  {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs font-medium ${getDirectionColor(signal.direction)}`}>
                                  {getDirectionIcon(signal.direction)} {signal.direction}
                                </span>
                                <span className={getStrengthColor()}>{signal.strength}</span>
                                <span className={getConfidenceColor()}>
                                  {Math.round(signal.confidence * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-white">{signal.pair}</span>
                                  <span className="text-xs text-white">•</span>
                                  <span className="text-xs text-white">{signal.source}</span>
                                </div>
                                {signal.status === 'active' && (
                                  <span className="text-xs text-white">
                                    Exp: {new Date(signal.expires_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          {/* Hover Actions */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-[#121212] rounded-lg p-1">
                            <button className="p-1.5 hover:bg-yellow-400 rounded-md transition-colors">
                              <FiStar className="w-3.5 h-3.5 text-yellow-400" />
                            </button>
                            <button className="p-1.5 hover:bg-yellow-400 rounded-md transition-colors">
                              <FiArchive className="w-3.5 h-3.5 text-yellow-400" />
                            </button>
                            <button onClick={(e) => deleteSignal(signal.id, e)} className="p-1.5 hover:bg-yellow-400 rounded-md transition-colors">
                              <FiTrash2 className="w-3.5 h-3.5 text-yellow-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white">
                  <div className="w-12 h-12 bg-[#121212] rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiActivity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-sm">No signals yet</p>
                  <p className="text-xs mt-1">Extract your first trading signal</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 z-10 p-2 bg-[#121212] rounded-lg transition-colors"
          style={{ left: isSidebarOpen ? '20rem' : '1rem' }}
        >
          {isSidebarOpen ? <FiX className="w-4 h-4 text-yellow-400"/> : <FiMenu className="w-4 h-4 text-yellow-400"/>}
        </button>

        <Outlet />
      </div>
    </div>
  );
};

export default SignalsLayout;