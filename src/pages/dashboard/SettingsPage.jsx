import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  FiSettings,
  FiBell,
  FiShield,
  FiEye,
  FiDatabase,
  FiChevronRight,
  FiZap,
  FiCheck
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const SETTINGS_STORAGE_KEY = "fgpt_ui_settings_v2";

const defaultSettings = {
  General: [
    { title: "AI Predictive Confidence Threshold", desc: "Alert only when signals exceed 85% probability.", active: true },
    { title: "Auto-Backtest on New Strategy", desc: "Execute historical validation immediately after generation.", active: false },
    { title: "Risk Guardrails", desc: "Warn when a strategy exceeds 2% risk per trade.", active: true },
    { title: "Strategy Versioning", desc: "Keep a snapshot for every generated code iteration.", active: true },
  ],
  Security: [
    { title: "Two-Factor Authentication (2FA)", desc: "Require a code from your authenticator app on login.", active: false },
    { title: "Session Timeout", desc: "Auto-log out after 30 minutes of inactivity.", active: true },
    { title: "Device Trust List", desc: "Only allow logins from approved devices.", active: false },
    { title: "IP Alerting", desc: "Notify me if login occurs from a new location.", active: true },
  ],
  Notifications: [
    { title: "Real-time Push Notifications", desc: "Receive instant alerts in your browser.", active: true },
    { title: "Trade Signal Digest", desc: "Daily summary of signal performance at 6pm.", active: false },
    { title: "Backtest Completion Alerts", desc: "Notify when long backtests complete.", active: true },
    { title: "System Status Updates", desc: "Alerts for outages and maintenance windows.", active: true },
  ],
  Display: [
    { title: "Institutional Dark Mode", desc: "Optimized high-contrast charcoal theme.", active: true },
    { title: "Compact Density", desc: "Tighter spacing for dense data workflows.", active: false },
    { title: "Reduced Motion", desc: "Disable non-essential animations.", active: false },
    { title: "High-Contrast Charts", desc: "Boost chart clarity for low-light environments.", active: true },
  ],
  Data: [
    { title: "Auto-Sync Research Notes", desc: "Sync mentor notes to the cloud automatically.", active: true },
    { title: "Data Retention", desc: "Keep conversations and code for 365 days.", active: true },
    { title: "Export on Delete", desc: "Create a backup before deleting sessions.", active: false },
    { title: "Anonymized Usage Analytics", desc: "Share anonymous usage to improve models.", active: false },
  ],
};

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('General');
  const [settingsByCategory, setSettingsByCategory] = useState(() => {
    if (typeof localStorage === "undefined") return [];
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const categories = [
    { id: 'General', icon: FiSettings },
    { id: 'Security', icon: FiShield },
    { id: 'Notifications', icon: FiBell },
    { id: 'Display', icon: FiEye },
    { id: 'Data', icon: FiDatabase },
  ];

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsByCategory));
  }, [settingsByCategory]);

  const toggleSwitch = (settingTitle) => {
    const isDarkModeSetting =
      activeTab === "Display" && settingTitle === "Institutional Dark Mode";

    if (isDarkModeSetting) {
      toggleTheme();
      return;
    }

    setSettingsByCategory((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map((setting) =>
        setting.title === settingTitle
          ? { ...setting, active: !setting.active }
          : setting
      ),
    }));
  };

  const activeSettings = (settingsByCategory?.[activeTab] || []).map((setting) => {
    if (activeTab === "Display" && setting.title === "Institutional Dark Mode") {
      return { ...setting, active: theme === "dark" };
    }
    return setting;
  });

  useEffect(() => {
    setSettingsByCategory((prev) => {
      const displaySettings = prev?.Display || defaultSettings.Display;
      const updatedDisplay = displaySettings.map((setting) => {
        if (setting.title !== "Institutional Dark Mode") return setting;
        return { ...setting, active: theme === "dark" };
      });

      return {
        ...prev,
        Display: updatedDisplay,
      };
    });
  }, [theme]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiSettings className="text-yellow-500" />
            System <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})` }}>Intelligence</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Configure your institutional AI trading environment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === cat.id
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-lg'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.id}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-transparent">
              <h3 className="font-extrabold text-white">{activeTab} Preferences</h3>
              <p className="text-xs text-gray-500 mt-1">Manage {activeTab.toLowerCase()} configuration settings.</p>
            </div>

            <div className="divide-y divide-white/5">
              {activeSettings.map((setting, i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-6 group hover:bg-white/[0.01] transition-colors">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">{setting.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{setting.desc}</p>
                  </div>

                  <button
                    onClick={() => toggleSwitch(setting.title)}
                    className={`w-12 h-6 rounded-full p-1 transition-all flex ${setting.active ? 'bg-yellow-500' : 'bg-white/10'}`}
                  >
                    <div className={`h-4 w-4 rounded-full transition-all ${setting.active ? 'bg-black ml-auto' : 'bg-gray-500'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Banner */}
          <div className="p-1 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent">
            <div className="bg-black/40 backdrop-blur-md rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <FiZap className="w-5 h-5 shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Cloud Sync Enabled</p>
                  <p className="text-xs text-gray-500">All configurations are encrypted and synced to institutional grid.</p>
                </div>
              </div>
              <button className="px-6 py-2 rounded-xl bg-yellow-500 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2">
                <FiCheck /> Synchronize System
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
