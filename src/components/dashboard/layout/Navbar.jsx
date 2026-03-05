import React from 'react'
import { FiSearch, FiBell, FiSettings } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.includes('/mentor')) return 'Mentor'
    if (path.includes('/quant')) return 'Quant Finance'
    if (path.includes('/signals')) return 'Trading Signals'
    if (path.includes('/strategies')) return 'Trading Strategies'
    if (path.includes('/backtests')) return 'Backtest Engine'
    if (path.includes('/activity')) return 'Activity Log'
    if (path.includes('/profile')) return 'Profile'
    return 'ForexGPT'
  }

  return (
    <nav className="bg-black border-b border-gray-800 px-6 py-4 ml-64 fixed top-0 right-0 left-0 z-40">
      <div className="flex items-center justify-between">
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-yellow-500">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center space-x-6">

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-black border border-gray-700 text-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-64 placeholder-white"
            />
          </div>
          
          {/* Notifications */}
          <button className="flex items-center space-x-2 text-yellow-500 hover:text-white transition-colors duration-200">
            <FiBell className="w-5 h-5" />
            <span className="text-sm font-semibold">Notifications</span>
          </button>
          
          {/* Settings */}
          <button className="flex items-center space-x-2 text-yellow-500 hover:text-white transition-colors duration-200">
            <FiSettings className="w-5 h-5" />
            <span className="text-sm font-semibold">Settings</span>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-800">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
              FX
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-yellow-500">Tope</p>
              <p className="text-xs text-white">Advanced Trader</p>
            </div>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar