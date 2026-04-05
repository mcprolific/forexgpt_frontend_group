import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiClock,
  FiAward,
  FiArrowLeft,
  FiEdit2,
  FiSave,
  FiX,
  FiTrendingUp,
  FiMessageCircle,
  FiZap,
  FiActivity,
  FiBarChart2,
  FiChevronRight
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfile, updateProfile, getDashboardStats } from '../../../services/userService';
import LoadingScreen from '../../../components/ui/LoadingScreen';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const Profile = () => {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          getProfile(),
          getDashboardStats()
        ]);
        setProfile(profileData);
        setStats(statsData);
        setEditedProfile({
          display_name: profileData.display_name,
          experience_level: profileData.experience_level,
          preferred_pairs: profileData.preferred_pairs || []
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(editedProfile);
      setProfile(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      display_name: profile.display_name,
      experience_level: profile.experience_level,
      preferred_pairs: profile.preferred_pairs || []
    });
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const returnTo = location.state?.returnTo || '/dashboard';
  const returnLabel = location.state?.returnLabel || 'Dashboard';

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">

      <button
        type="button"
        onClick={() => navigate(returnTo)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-300 transition-all hover:border-yellow-500/30 hover:text-yellow-500"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to {returnLabel}
      </button>

      {/* Premium Profile Header Card */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl border border-white/5 overflow-hidden bg-white/[0.02] backdrop-blur-sm shadow-2xl"
      >
        <div className="h-40 bg-gradient-to-r from-yellow-500/20 via-yellow-500/5 to-transparent relative">
          <div className="absolute inset-0 dot-grid opacity-20" />
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 gap-6 relative z-10">
            <div className="w-32 h-32 bg-black rounded-2xl border-4 border-white/10 flex items-center justify-center text-yellow-500 text-5xl font-black shadow-2xl relative group">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors" />
              {(profile?.display_name || authUser?.email || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.display_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, display_name: e.target.value })}
                      className="bg-white/5 border border-yellow-500/30 rounded-xl px-4 py-1 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    />
                  ) : (
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>
                      {profile?.display_name || authUser?.email?.split('@')[0]}
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2 mt-2 text-gray-400">
                  <FiMail className="w-4 h-4" />
                  <span className="text-sm font-medium">{authUser?.email}</span>
                </div>
              </div>

              {!isEditing ? (
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all font-bold text-sm text-yellow-500"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Intelligence Profile
                </Motion.button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold text-sm hover:brightness-110 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiX className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Profile Details Grid */}
      <Motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            label: "Expertise",
            value: isEditing ? (
              <select
                value={editedProfile.experience_level}
                onChange={(e) => setEditedProfile({ ...editedProfile, experience_level: e.target.value })}
                className="bg-black/40 border border-yellow-500/20 rounded-lg px-2 py-0.5 text-xs text-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Institutional">Institutional</option>
              </select>
            ) : profile?.experience_level || 'Elite',
            icon: FiAward
          },
          { label: "Timezone", value: profile?.timezone || 'UTC', icon: FiClock },
          { label: "Member Since", value: new Date(profile?.created_at).toLocaleDateString(), icon: FiZap },
          { label: "Target Alpha", value: profile?.preferred_pairs?.join(', ') || 'Global', icon: FiTrendingUp },
        ].map((stat, i) => (
          <Motion.div
            key={i}
            variants={item}
            className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3 mb-3 shrink-0">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-gray-200 truncate">{stat.value}</div>
          </Motion.div>
        ))}
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Summary */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Alpha Performance Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: FiMessageCircle, label: 'Mentor Interactions', value: stats?.active_mentor_conversations || 0 },
              { icon: FiActivity, label: 'Signals Identified', value: stats?.total_signals || 0 },
              { icon: FiBarChart2, label: 'Backtests Executed', value: stats?.completed_backtests || 0 },
              { icon: FiTrendingUp, label: 'Market Precision', value: '92.4%' },
            ].map((metric, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-yellow-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-400">{metric.label}</span>
                </div>
                <span className="text-xl font-black text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Rankings / Status */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.25em]">Institutional Status</h3>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FiAward size={80} color={GOLD} />
            </div>
            <div className="relative z-10">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mb-4 animate-pulse" />
              <p className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-1">Premium Tier One</p>
              <h4 className="text-2xl font-black text-white mb-4">Master Trader</h4>

              <div className="space-y-3">
                {[
                  "LIFETIME ACCESS",
                  "PRIORITY COMPUTE",
                  "UNLIMITED SIGNALS"
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest">
                    <FiChevronRight className="text-yellow-500" /> {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
