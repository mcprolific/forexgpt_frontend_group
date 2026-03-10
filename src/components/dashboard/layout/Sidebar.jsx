import { NavLink, useNavigate } from "react-router-dom";
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
  FiChevronRight
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import { motion as Motion } from "framer-motion";
import Logo from "../../../assets/logo.png";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const CHARCOAL = "#0A0A0A";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
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

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full z-50 transition-all duration-300 border-r border-white/5 flex flex-col
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

      {/* Navigation */}
      <nav className={`flex-1 px-3 py-6 space-y-1.5 custom-scrollbar ${isOpen ? 'overflow-y-auto' : 'overflow-visible'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isOpen) toggleSidebar();
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
      </nav>

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
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {!isOpen && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-[60] min-w-[150px] hidden md:block">
              <p className="text-xs font-bold text-yellow-500">{user?.display_name || 'Active Trader'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
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
