import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMessageCircle,
  FiTrendingUp,
  FiCode,
  FiBarChart2,
  FiActivity,
  FiZap,
  FiArrowUpRight,
  FiChevronRight,
  FiClock,
  FiUser
} from 'react-icons/fi'
import { motion as Motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { getDashboardStats, getActivityLogs } from '../../services/userService'
import { getForexNews } from '../../services/newsService'
import LoadingScreen from '../../components/ui/LoadingScreen'

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch news separately so it doesn't block on stats errors
        getForexNews().then(data => setNews(data || []));

        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(),
          getActivityLogs(5)
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-10">

      {/* Hero Welcome Section */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-3xl border border-white/5 overflow-hidden group"
        style={{ background: 'rgba(255, 255, 255, 0.02)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Secure AI Connection Active</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Welcome back, <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>{user?.display_name || user?.email?.split('@')[0] || 'Trader'}</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Your trading edge is sharpening. Market confluence levels are optimal for analysis today.
              Let's find your next high-probability setup.
            </p>
          </div>

          {/* <Link to="/dashboard/signals" className="group/btn flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Market Status</span>
              <span className="text-sm font-bold text-yellow-500">Volatile Bullish</span>
            </div>
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover/btn:scale-110 transition-transform">
              <FiZap className="w-5 h-5" />
            </div>
          </Link> */}
        </div>
      </Motion.div>
      {/* Forex Intelligence Marquee */}
      {news.length > 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full overflow-hidden py-3 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-2xl group"
        >
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

          <Motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [0, -2000] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...news, ...news, ...news].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-10 flex-shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded border ${item.type === 'ai'
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  : 'bg-white/5 text-gray-500 border-white/10'
                  }`}>
                  {item.source}
                </span>
                <span className="text-sm text-gray-300 font-medium tracking-wide">
                  {item.title}
                </span>
                <div className="h-1 w-1 rounded-full bg-yellow-500/20 mx-2" />
              </div>
            ))}
          </Motion.div>
        </Motion.div>
      )}
      {/* Trading Command Center - Real-time Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Market Sessions Tracker */}
        {/* <Motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Market Sessions</h3>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold uppercase">Live UTC</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: "Sydney", hours: "22:00 - 07:00", status: "Closed", color: "gray" },
              { name: "Tokyo", hours: "00:00 - 09:00", status: "Open", color: "green" },
              { name: "London", hours: "08:00 - 17:00", status: "Open", color: "green" },
              { name: "New York", hours: "13:00 - 22:00", status: "Closed", color: "gray" },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${session.color === 'green' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                  <span className="text-xs font-bold text-gray-200">{session.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/80">{session.hours}</p>
                  <p className={`text-[9px] font-bold uppercase ${session.color === 'green' ? 'text-green-500' : 'text-gray-500'}`}>{session.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Motion.div> */}

        {/* Economic Calendar - High Impact Alerts */}
        {/* {/* <Motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="lg:col-span-2 p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">High Impact Calendar</h3>
            <FiZap className="text-yellow-500 w-4 h-4 animate-bounce" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { event: "Non-Farm Payrolls (USD)", time: "Fri, 13:30", impact: "High", volatility: "Extreme" },
              { event: "CPI m/m (EUR)", time: "Thu, 10:00", impact: "High", volatility: "Medium" },
              { event: "Unemployment Rate (GBP)", time: "Tue, 07:00", impact: "High", volatility: "High" },
              { event: "FOMC Statement (USD)", time: "Wed, 19:00", impact: "High", volatility: "Fatal" },
            ].map((ev, i) => (
              <div key={i} className="group/item p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col justify-between h-24">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-gray-200 group-hover/item:text-yellow-500 transition-colors uppercase leading-tight">{ev.event}</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`h-1.5 w-1 rounded-full ${s <= 3 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] font-black text-white/60 uppercase">{ev.time}</span>
                  </div>
                  <span className="text-[9px] font-black text-red-500/80 uppercase tracking-tighter border border-red-500/20 px-2 py-0.5 rounded-full bg-red-500/5">
                    Impact: {ev.volatility}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Motion.div> */}
      </div>

      {/* Stats Grid */}
      <Motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          { label: "Active Insights", value: stats?.active_mentor_conversations || 0, icon: FiMessageCircle, color: GOLD },
          { label: "Signals Found", value: stats?.total_signals || 0, icon: FiTrendingUp, color: GOLD_LIGHT },
          { label: "Backtests Run", value: stats?.completed_backtests || 0, icon: FiBarChart2, color: GOLD_LIGHT },
        ].map((stat, i) => (
          <Motion.div
            key={i}
            variants={item}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={60} color={stat.color} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-green-500 font-bold">
                <FiArrowUpRight /> +12.5% vs last week
              </div>
            </div>
          </Motion.div>
        ))}
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions - 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Accelerator Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { to: "/dashboard/codegen", title: "Code Generation", desc: "Forge neural trading bots.", icon: FiCode },
              { to: "/dashboard/mentor", title: "Mentor AI", desc: "Complex concepts simplified.", icon: FiMessageCircle },
              { to: "/dashboard/signals", title: "Signals", desc: "News to trade ideas.", icon: FiActivity },
              { to: "/dashboard/backtest", title: "Backtests", desc: "Validate historical edge.", icon: FiBarChart2 },
              { to: "/dashboard/activity", title: "Activity", desc: "Monitor system operations.", icon: FiClock },
              // { to: "/dashboard/profile", title: "Profile Admin", desc: "Manage secure account.", icon: FiUser },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-yellow-500/30 transition-all flex items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">{action.title}</h4>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <FiChevronRight className="ml-auto w-4 h-4 text-gray-600 group-hover:text-yellow-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Recent Alpha</h3>
            <Link to="/dashboard/activity" className="text-[10px] font-bold text-yellow-500/60 hover:text-yellow-500 uppercase tracking-widest transition-colors">View All</Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50" />
                  <p className="text-xs text-gray-300 font-medium truncate max-w-[180px]">{activity.action}</p>
                </div>
                <span className="text-[10px] text-gray-600 whitespace-nowrap">
                  {new Date(activity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )) : (
              <p className="p-4 text-xs text-gray-500 text-center italic">No recent activity found.</p>
            )}
          </div>
        </div>

      </div>

      {/* Neural Pulse & Market Intelligence Section */}
      <Motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Sentiment Radar */}
        {/* <Motion.div
          variants={item}
          className="lg:col-span-2 p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Global Sentiment Pulse</h3>
                <p className="text-xs text-gray-500">Real-time aggregate of technical & news sentiment</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                High Confidence
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <Motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-600 to-yellow-400"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4 text-[9px] font-black uppercase tracking-widest text-white/40 mix-blend-difference">
                  <span>Extreme Fear</span>
                  <span>Extreme Greed</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "AI Accuracy", value: "94.2%", trend: "+2.1%" },
                  { label: "Neural Load", value: "Low", trend: "Optimal" },
                  { label: "Signal Density", value: "High", trend: "Rising" }
                ].map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="text-lg font-black text-white">{m.value}</p>
                    <p className="text-[9px] text-green-500 font-bold mt-1">{m.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Motion.div> */}

        {/* Neural Logic Shortcut */}
        {/* <Motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="p-8 rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FiZap size={150} color={GOLD} />
          </div>

          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-yellow-500 text-black flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
              <FiCode className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Forge Neural Logic</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Convert your late-market insights into production-ready algorithmic code in seconds.
            </p>
          </div>

          <Link
            to="/dashboard/codegen"
            className="relative z-10 w-full py-4 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 group-hover:gap-4 duration-300"
          >
            Start Synthesis
            <FiArrowUpRight className="w-4 h-4" />
          </Link>
        </Motion.div>*/}
      </Motion.div>

    </div>
  );
};

export default Dashboard;