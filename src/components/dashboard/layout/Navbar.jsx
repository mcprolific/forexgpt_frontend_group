import { FiSearch, FiBell, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { motion as Motion } from 'framer-motion'

const GOLD = "#CA8A04";
const GOLD_LIGHT = "#FFD700";

const Navbar = ({ isOpen, onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.includes('/codegen')) return 'Code Generation'
    if (path.includes('/mentor')) return 'Mentor AI'
    if (path.includes('/signals')) return 'Signals'
    if (path.includes('/backtest')) return 'Backtests'
    if (path.includes('/activity')) return 'Activity'
    if (path.includes('/profile')) return 'Profile Settings'
    return 'ForexGPT'
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 right-0 z-40 px-4 md:px-6 py-4 border-b border-white/5 backdrop-blur-md transition-all duration-300
      ${isOpen ? 'left-64' : 'left-0 md:left-20'}`}
      style={{
        background: 'rgba(26, 26, 26, 0.85)',
      }}>
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-yellow-500 hover:border-yellow-500/30 transition-all md:hidden"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          {/* Page Title */}
          <Motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={location.pathname}
            className="text-xl md:text-2xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}
          >
            {getPageTitle()}
          </Motion.h1>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">

          {/* Search Bar - Hidden on small screens */}
          <div className="relative hidden lg:block">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 bg-black/40 border border-white/10 text-yellow-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500/50 w-48 xl:w-64 placeholder-gray-500 text-sm transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200">
              <FiBell className="w-5 h-5" />
            </button>

            {/* Settings */}
            <Link to="/dashboard/settings" className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200">
              <FiSettings className="w-5 h-5" />
            </Link>

            {/* Logout */}
            {/* <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button> */}
          </div>

          {/* User Profile */}
          <Link to="/dashboard/profile" className="flex items-center space-x-3 pl-4 border-l border-white/10 hover:opacity-80 transition-opacity">
            <div className="flex flex-col text-right hidden sm:flex">
              <p className="text-sm font-semibold text-yellow-500">{user?.display_name || user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Trader</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-black text-sm"
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
              {(user?.display_name || user?.email || 'U').substring(0, 2).toUpperCase()}
            </div>
          </Link>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
