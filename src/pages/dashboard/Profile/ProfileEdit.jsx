import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiSave,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../../services/userService';

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    experience_level: 'Elite'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setFormData({
          display_name: data.display_name || '',
          experience_level: data.experience_level || 'Elite'
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      navigate('/dashboard/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiUser className="text-yellow-500" />
            Edit <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Intelligence</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Update your institutional trading credentials.</p>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex justify-center flex-col items-center gap-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-yellow-500/50">
            <FiUser size={48} className="text-gray-600 group-hover:text-yellow-500 transition-colors" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-yellow-500 rounded-xl text-black shadow-xl hover:scale-110 transition-transform">
            <FiCamera size={18} />
          </button>
        </div>
      </div>

      {/* Form Section */}
      <Motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Display Intelligence Name</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Communication Channel (Email)</label>
            <div className="relative group opacity-50">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                disabled
                value={authUser?.email || ''}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white cursor-not-allowed font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Experience Level</label>
            <div className="relative group">
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all font-bold appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Institutional">Institutional</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-4 bg-yellow-500 text-black font-black text-xs rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiSave size={16} /> {saving ? 'Updating...' : 'Update Credentials'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            disabled={saving}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-xs rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiX size={16} /> Abort
          </button>
        </div>
      </Motion.form>
    </div>
  );
};

export default ProfileEdit;
