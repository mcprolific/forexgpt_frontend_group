import axiosInstance from "../../services/axiosInstance";

/**
 * Generate AI Signal
 */
export const generateSignalAPI = async (payload) => {
  const response = await axiosInstance.post("/signals/extract", payload);
  return response.data;
};

/**
 * Get User Signals
 */
export const getSignalsAPI = async (userId, { limit = 50, currency_pair, direction } = {}) => {
  let uid = userId;
  if (!uid && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      uid = u?.user_id || u?.id || null;
    } catch { /* ignore */ }
  }
  const params = { limit };
  if (currency_pair) params.currency_pair = currency_pair;
  if (direction) params.direction = direction;
  const response = await axiosInstance.get(`/signals/user/${uid}`, { params });
  return response.data;
};

/**
 * Get Signal History (alias for user signals)
 */
export const getSignalHistoryAPI = async (userId, { limit = 50 } = {}) => {
  return getSignalsAPI(userId, { limit });
};

/**
 * Delete Signal
 */
export const executeSignalAPI = async (signalId, userId) => {
  let uid = userId;
  if (!uid && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      uid = u?.user_id || u?.id || null;
    } catch { /* ignore */ }
  }
  const response = await axiosInstance.delete(`/signals/${uid}/${signalId}`);
  return response.data;
};
