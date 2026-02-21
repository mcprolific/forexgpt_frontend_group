import axiosInstance from "../../services/axiosInstance";

/**
 * Run backtest
 */
export const runBacktestAPI = async (payload) => {
  const response = await axiosInstance.post("/backtest/run", payload);
  return response.data;
};

/**
 * Get backtest history
 */
export const getBacktestHistoryAPI = async () => {
  const response = await axiosInstance.get("/backtest/history");
  return response.data;
};

/**
 * Get single backtest result
 */
export const getBacktestResultAPI = async (id) => {
  const response = await axiosInstance.get(`/backtest/${id}`);
  return response.data;
};
