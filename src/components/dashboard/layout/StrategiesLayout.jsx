import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  FiCode, FiPlus, FiSearch, FiMoreVertical,
  FiEdit, FiTrash2, FiArchive, FiMenu, FiX,
  FiCheckCircle, FiClock, FiStar, FiGitBranch, FiCopy
} from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';

const StrategiesLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(`strategies_history_${user?.id}`);
      if (saved) setStrategies(JSON.parse(saved));
      else {
        const mockStrategies = [
          { id:1, name:'Mean Reversion on EUR/USD', type:'mean_reversion', complexity:'intermediate', status:'active', win_rate:68.5, sharpe_ratio:1.42, total_return:12.4, pairs:['EUR/USD','GBP/USD'], timeframe:'H1', is_validated:true, is_favorite:true, version:'2.1.0', created_at:'2024-03-31T15:30:00Z' },
          { id:2, name:'Trend Following System', type:'trend_following', complexity:'advanced', status:'active', win_rate:62.3, sharpe_ratio:1.28, total_return:8.7, pairs:['GBP/USD','USD/JPY'], timeframe:'H4', is_validated:true, is_favorite:false, version:'3.0.0', created_at:'2024-03-30T10:15:00Z' },
          { id:3, name:'Breakout Scanner', type:'breakout', complexity:'simple', status:'draft', win_rate:58.7, sharpe_ratio:1.15, total_return:6.2, pairs:['USD/JPY','AUD/USD'], timeframe:'M15', is_validated:false, is_favorite:false, version:'1.5.0', created_at:'2024-03-29T08:45:00Z' },
          { id:4, name:'Momentum Strategy', type:'momentum', complexity:'simple', status:'active', win_rate:65.2, sharpe_ratio:1.35, total_return:9.8, pairs:['AUD/USD','NZD/USD'], timeframe:'M30', is_validated:true, is_favorite:false, version:'1.2.0', created_at:'2024-03-28T11:20:00Z' }
        ];
        setStrategies(mockStrategies);
        localStorage.setItem(`strategies_history_${user.id}`, JSON.stringify(mockStrategies));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date(), yesterday = new Date(today);
    yesterday.setDate(today.getDate()-1);
    if(date.toDateString() === today.toDateString()) return 'Today';
    if(date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  };

  const getTypeIcon = (type) => {
    switch(type){
      case 'mean_reversion': return '🔄';
      case 'trend_following': return '📈';
      case 'breakout': return '🚀';
      case 'carry_trade': return '💹';
      case 'momentum': return '⚡';
      default: return '📊';
    }
  };

  const toggleFavorite = (strategyId,e)=>{
    e.preventDefault(); e.stopPropagation();
    const updated = strategies.map(s=>s.id===strategyId?{...s,is_favorite:!s.is_favorite}:s);
    setStrategies(updated);
    if(user) localStorage.setItem(`strategies_history_${user.id}`, JSON.stringify(updated));
  }

  const deleteStrategy = (strategyId,e)=>{
    e.preventDefault(); e.stopPropagation();
    const updated = strategies.filter(s=>s.id!==strategyId);
    setStrategies(updated);
    if(user) localStorage.setItem(`strategies_history_${user.id}`, JSON.stringify(updated));
  }

  const filteredStrategies = strategies.filter(s=>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())||
    s.type.toLowerCase().includes(searchQuery.toLowerCase())||
    s.pairs.some(p=>p.toLowerCase().includes(searchQuery.toLowerCase()))||
    s.complexity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedStrategies = filteredStrategies.reduce((groups,s)=>{
    const key=formatDate(s.created_at);
    if(!groups[key]) groups[key]=[];
    groups[key].push(s);
    return groups;
  },{})

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`${isSidebarOpen?'w-80':'w-0'} transition-all duration-300 ease-in-out bg-black border-r border-white flex flex-col h-full overflow-hidden`}>
        {isSidebarOpen && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white">
              <button onClick={()=>navigate('/strategies/new')} className="w-full flex items-center justify-between px-4 py-3 bg-black border border-white rounded-lg hover:bg-yellow-400 hover:text-black transition-all group">
                <span className="text-sm font-medium text-yellow-400 group-hover:text-black">New strategy</span>
                <FiPlus className="w-4 h-4 text-yellow-400 group-hover:text-black"/>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4"/>
                <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="Search strategies..."
                  className="w-full pl-9 pr-4 py-2 bg-black border border-white rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="px-4 py-2">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {['All Strategies','Active','Draft','Validated','Favorites'].map((f,i)=>
                  <button key={i} className="px-3 py-1 bg-black text-yellow-400 border border-white rounded-full text-xs whitespace-nowrap hover:bg-yellow-400 hover:text-black">{f}</button>
                )}
              </div>
            </div>

            {/* Strategies List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {loading ? <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div> :
              Object.entries(groupedStrategies).length>0 ? Object.entries(groupedStrategies).map(([date,strs])=>(
                <div key={date} className="mb-4">
                  <h3 className="text-xs font-medium text-white px-3 mb-2">{date}</h3>
                  <div className="space-y-1">
                    {strs.map(s=>(
                      <Link key={s.id} to={`/strategies/${s.id}`} className="group relative flex items-start space-x-3 px-3 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <FiCode className="w-4 h-4 text-black"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-yellow-400 truncate">{s.name}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-xs">
                            <span>{getTypeIcon(s.type)}</span>
                            <span className="px-1.5 py-0.5 border border-white rounded-full">{s.complexity}</span>
                            <span className="px-1.5 py-0.5 border border-white rounded-full">{s.status}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-yellow-400">+{s.total_return}%</span>
                            <span className="text-white">Sharpe: {s.sharpe_ratio}</span>
                            <span className="text-white">{s.timeframe}</span>
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-black rounded-lg p-1 border border-white">
                          <button onClick={e=>toggleFavorite(s.id,e)} className="p-1.5 hover:bg-yellow-400 hover:text-black rounded-md transition-colors">
                            <FiStar className={`w-3.5 h-3.5 ${s.is_favorite?'text-yellow-400':'text-white'}`}/>
                          </button>
                          <button className="p-1.5 hover:bg-yellow-400 hover:text-black rounded-md transition-colors"><FiCopy className="w-3.5 h-3.5 text-white"/></button>
                          <button className="p-1.5 hover:bg-yellow-400 hover:text-black rounded-md transition-colors"><FiEdit className="w-3.5 h-3.5 text-white"/></button>
                          <button onClick={e=>deleteStrategy(s.id,e)} className="p-1.5 hover:bg-yellow-400 hover:text-black rounded-md transition-colors"><FiTrash2 className="w-3.5 h-3.5 text-white"/></button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )) : <p className="text-center py-8 text-white">No strategies yet</p>}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        <button onClick={()=>setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute top-4 z-10 p-2 bg-black border border-white rounded-lg hover:bg-yellow-400 hover:text-black transition-colors"
          style={{ left: isSidebarOpen?'21rem':'1rem' }}>
          {isSidebarOpen?<FiX className="w-4 h-4 text-yellow-400"/>:<FiMenu className="w-4 h-4 text-yellow-400"/>}
        </button>
        <Outlet/>
      </div>
    </div>
  );
};

export default StrategiesLayout;