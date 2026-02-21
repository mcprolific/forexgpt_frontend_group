// features/settings/settingsSlice.js

import { createSlice } from "@reduxjs/toolkit";

/**
 * Load settings from localStorage
 */
const loadSettings = () => {
  try {
    const stored = localStorage.getItem("tradingSettings");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const defaultSettings = {
  accountBalance: 10000,
  riskPercent: 2,
  leverage: 30,
  spread: 1.5,
  slippage: 0.5,
  commission: 0,
  lotSize: 0.1,
};

const initialState = loadSettings() || defaultSettings;

/**
 * Slice
 */

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      const updated = { ...state, ...action.payload };

      localStorage.setItem(
        "tradingSettings",
        JSON.stringify(updated)
      );

      return updated;
    },

    resetSettings: () => {
      localStorage.setItem(
        "tradingSettings",
        JSON.stringify(defaultSettings)
      );

      return defaultSettings;
    },
  },
});

export const { updateSettings, resetSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
