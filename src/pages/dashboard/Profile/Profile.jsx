import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiClock,
  FiAward,
  FiEdit2,
  FiSave,
  FiX,
  FiTrendingUp,
  FiMessageCircle,
  FiCpu,
  FiActivity,
  FiCode,
  FiBarChart2
} from 'react-icons/fi';
import { mockProfiles } from '../../../data/mockData';
import PageHeader from '../../../components/dashboard/layout/PageHeader';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfiles[0]);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const getExperienceBadge = (level) => {
    switch(level) {
      case 'beginner': return 'bg-yellow-500 text-black px-2 py-0.5 rounded';
      case 'intermediate': return 'bg-yellow-500 text-black px-2 py-0.5 rounded';
      case 'advanced': return 'bg-yellow-500 text-black px-2 py-0.5 rounded';
      default: return 'bg-yellow-500 text-black px-2 py-0.5 rounded';
    }
  };

  return (
    <div className="space-y-6 bg-black min-h-screen p-6 text-white">
      <PageHeader 
        title="Profile"
        subtitle="Manage your account and preferences"
        className="text-yellow-500"
      />

      {/* Profile Header */}
      <div className="bg-black border border-white rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-12">
            <div className="w-24 h-24 bg-gray-900 rounded-xl border-4 border-white flex items-center justify-center text-yellow-500 text-3xl font-bold">
              {profile.display_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.display_name}
                        onChange={(e) => setEditedProfile({...editedProfile, display_name: e.target.value})}
                        className="border border-white rounded-lg px-3 py-1 bg-black text-white"
                      />
                    ) : (
                      profile.display_name || 'Add Display Name'
                    )}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiMail className="w-4 h-4 text-white" />
                    <span className="text-white">{profile.email}</span>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-white rounded-lg hover:bg-gray-900"
                  >
                    <FiEdit2 className="w-4 h-4 text-white" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-white rounded-lg hover:bg-gray-900"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="border border-white rounded-lg p-4">
              <p className="text-sm text-white">Experience Level</p>
              <p className="text-lg font-semibold mt-1">
                {isEditing ? (
                  <select
                    value={editedProfile.experience_level}
                    onChange={(e) => setEditedProfile({...editedProfile, experience_level: e.target.value})}
                    className="border border-white rounded-lg px-2 py-1 bg-black text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                ) : (
                  <span className={getExperienceBadge(profile.experience_level)}>
                    {profile.experience_level}
                  </span>
                )}
              </p>
            </div>
            <div className="border border-white rounded-lg p-4">
              <p className="text-sm text-white">Timezone</p>
              <p className="text-lg font-semibold mt-1 flex items-center">
                <FiClock className="w-4 h-4 mr-2 text-white" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.timezone}
                    onChange={(e) => setEditedProfile({...editedProfile, timezone: e.target.value})}
                    className="border border-white rounded-lg px-2 py-1 bg-black text-white"
                  />
                ) : (
                  profile.timezone
                )}
              </p>
            </div>
            <div className="border border-white rounded-lg p-4">
              <p className="text-sm text-white">Member Since</p>
              <p className="text-lg font-semibold mt-1 text-yellow-500">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="border border-white rounded-lg p-4">
              <p className="text-sm text-white">Preferred Pairs</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.preferred_pairs.join(', ')}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile, 
                      preferred_pairs: e.target.value.split(',').map(s => s.trim())
                    })}
                    className="border border-white rounded-lg px-2 py-1 w-full bg-black text-white"
                  />
                ) : (
                  profile.preferred_pairs.map((pair, index) => (
                    <span key={index} className="bg-yellow-500 text-black px-2 py-0.5 rounded">{pair}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Achievements sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-500">Activity Overview</h3>
          <div className="space-y-4">
            {/* Activity items */}
            {[
              { icon: FiMessageCircle, label: 'Mentor Questions', value: profile.mentor_questions_asked, color: 'bg-gray-800 text-yellow-500' },
              { icon: FiCpu, label: 'Quant Questions', value: profile.quant_questions_asked, color: 'bg-gray-800 text-yellow-500' },
              { icon: FiActivity, label: 'Signals Extracted', value: profile.signals_extracted, color: 'bg-gray-800 text-yellow-500' },
              { icon: FiCode, label: 'Strategies Generated', value: profile.strategies_generated, color: 'bg-gray-800 text-yellow-500' },
              { icon: FiBarChart2, label: 'Backtests Run', value: profile.backtests_run, color: 'bg-gray-800 text-yellow-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white">{item.label}</span>
                </div>
                <span className="text-yellow-500 text-xl font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-500">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FiAward, title: 'Signal Master', subtitle: 'Extracted 50+ signals', color: 'text-yellow-500' },
              { icon: FiTrendingUp, title: 'Strategy Pro', subtitle: 'Generated 25+ strategies', color: 'text-yellow-500' },
              { icon: FiCpu, title: 'Quant Expert', subtitle: '100+ quant questions', color: 'text-yellow-500' },
              { icon: FiBarChart2, title: 'Backtest Champion', subtitle: '50+ backtests completed', color: 'text-yellow-500' },
            ].map((item, idx) => (
              <div key={idx} className="border border-white rounded-lg p-4 text-center">
                <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                <p className="text-sm font-medium text-yellow-500">{item.title}</p>
                <p className="text-xs text-white">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;