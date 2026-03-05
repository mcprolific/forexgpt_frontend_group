import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiMessageCircle, 
  FiTrendingUp, 
  FiCode, 
  FiBarChart2,
  FiActivity,
  FiArrowUp
} from 'react-icons/fi'
import { mockStats, recentActivity } from '../../../data/mockData'

const Dashboard = () => {

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6 bg-black min-h-screen p-6">

      {/* Welcome Section */}
      <div className="bg-black border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-1">
          Welcome back 👋
        </h2>
        <p className="text-sm text-white">
          Your trading journey continues. Here's your daily summary.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Mentor */}
        <div className="bg-black border border-gray-800 rounded-lg p-4 hover:bg-white hover:text-black transition-all duration-200 group">
          <FiMessageCircle className="w-6 h-6 text-yellow-500 group-hover:text-black mb-2" />
          <p className="text-xs text-white group-hover:text-black">
            Mentor Questions
          </p>
          <p className="text-lg font-bold text-yellow-500 group-hover:text-black">
            {mockStats.mentorQuestions}
          </p>
        </div>

        {/* Signals */}
        <div className="bg-black border border-gray-800 rounded-lg p-4 hover:bg-white hover:text-black transition-all duration-200 group">
          <FiTrendingUp className="w-6 h-6 text-yellow-500 group-hover:text-black mb-2" />
          <p className="text-xs text-white group-hover:text-black">
            Signals Exraction
          </p>
          <p className="text-lg font-bold text-yellow-500 group-hover:text-black">
            {mockStats.signalsExtracted}
          </p>
        </div>

        {/* Strategies
        <div className="bg-black border border-gray-800 rounded-lg p-4 hover:bg-white hover:text-black transition-all duration-200 group">
          <FiCode className="w-6 h-6 text-yellow-500 group-hover:text-black mb-2" />
          <p className="text-xs text-white group-hover:text-black">
            Strategies
          </p>
          <p className="text-lg font-bold text-yellow-500 group-hover:text-black">
            {mockStats.strategiesGenerated}
          </p>
        </div> */}

        {/* Backtests */}
        <div className="bg-black border border-gray-800 rounded-lg p-4 hover:bg-white hover:text-black transition-all duration-200 group">
          <FiBarChart2 className="w-6 h-6 text-yellow-500 group-hover:text-black mb-2" />
          <p className="text-xs text-white group-hover:text-black">
            Backtests
          </p>
          <p className="text-lg font-bold text-yellow-500 group-hover:text-black">
            {mockStats.backtestsRun}
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-yellow-500 mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <Link 
            to="/mentor/conversations"
            className="bg-black border border-gray-800 rounded-lg p-4 text-center hover:bg-white hover:text-black transition-all duration-200 group"
          >
            <FiMessageCircle className="w-6 h-6 mx-auto text-yellow-500 group-hover:text-black mb-2" />
            <span className="text-sm font-medium text-yellow-500 group-hover:text-black">
              Ask Mentor
            </span>
          </Link>

          <Link 
            to="/signals"
            className="bg-black border border-gray-800 rounded-lg p-4 text-center hover:bg-white hover:text-black transition-all duration-200 group"
          >
            <FiActivity className="w-6 h-6 mx-auto text-yellow-500 group-hover:text-black mb-2" />
            <span className="text-sm font-medium text-yellow-500 group-hover:text-black">
              Extract Signals
            </span>
          </Link>

          <Link 
            to="/code"
            className="bg-black border border-gray-800 rounded-lg p-4 text-center hover:bg-white hover:text-black transition-all duration-200 group"
          >
            <FiCode className="w-6 h-6 mx-auto text-yellow-500 group-hover:text-black mb-2" />
            <span className="text-sm font-medium text-yellow-500 group-hover:text-black">
              Generate Code
            </span>
          </Link>

          <Link 
            to="/backtests"
            className="bg-black border border-gray-800 rounded-lg p-4 text-center hover:bg-white hover:text-black transition-all duration-200 group"
          >
            <FiBarChart2 className="w-6 h-6 mx-auto text-yellow-500 group-hover:text-black mb-2" />
            <span className="text-sm font-medium text-yellow-500 group-hover:text-black">
              Run Backtest
            </span>
          </Link>

        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-yellow-500 mb-4">
          Recent Activity
        </h3>

        {recentActivity.slice(0, 4).map((activity, index) => (
          <div 
            key={index}
            className="flex justify-between items-center py-3 border-b border-gray-800 hover:bg-white hover:text-black transition-all duration-200 px-2 rounded"
          >
            <p className="text-sm text-white">
              {activity.description}
            </p>
            <span className="text-xs text-yellow-500">
              {activity.time}
            </span>
          </div>
        ))}
      </div>

      {/* Performance Section
      <div className="bg-black border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-yellow-500 mb-3">
          Portfolio Performance
        </h3> */}

        <div className="h-32 border border-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FiBarChart2 className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-xs text-white">
              Chart visualization coming soon
            </p>
          </div>
        </div>
      </div>

  
  )
}

export default Dashboard