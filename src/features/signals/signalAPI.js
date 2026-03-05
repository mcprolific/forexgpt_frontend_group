import axiosInstance from "../../services/axiosInstance";

/**
 * Generate AI Signal
 */
export const generateSignalAPI = async (payload) => {
  const response = await axiosInstance.post("/signals/extract", payload);
  return response.data;
};

/**
 * Get Latest Signals
 */
export const getSignalsAPI = async () => {
  const response = await axiosInstance.get("/signals");
  return response.data;
};

/**
 * Get Signal History
 */
export const getSignalHistoryAPI = async () => {
  const response = await axiosInstance.get("/signals/history");
  return response.data;
};

/**
 * Mark Signal as Executed
 */
export const executeSignalAPI = async (signalId) => {
  const response = await axiosInstance.patch(`/signals/${signalId}/execute`);
  return response.data;
};
