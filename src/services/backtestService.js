import axiosInstance from "./axiosInstance";

export const runBacktest = async (userId, payload) => {
    const body = { user_id: userId, ...payload };
    const res = await axiosInstance.post("/backtest/run", body);
    return res.data;
};

export const getBacktestResults = async (userId, limit = 20, offset = 0) => {
    const res = await axiosInstance.get(`/backtest/user/${userId}`, {
        params: { limit, offset }
    });
    return res.data;
};

export const getBacktestResult = async (userId, backtestId) => {
    const res = await axiosInstance.get(`/backtest/user/${userId}/${backtestId}`);
    return res.data;
};

export const getBacktestTrades = async (userId, backtestId, limit = 500, offset = 0) => {
    const res = await axiosInstance.get(`/backtest/user/${userId}/${backtestId}/trades`, {
        params: { limit, offset }
    });
    return res.data;
};

export const updateBacktest = async (userId, backtestId, updates) => {
    const res = await axiosInstance.patch(`/backtest/user/${userId}/${backtestId}`, updates);
    return res.data;
};

export const deleteBacktest = async (userId, backtestId) => {
    const res = await axiosInstance.delete(`/backtest/${userId}/${backtestId}`);
    return res.data;
};

export const getBacktestStatus = async () => {
    const res = await axiosInstance.get("/backtest/status");
    return res.data;
};
