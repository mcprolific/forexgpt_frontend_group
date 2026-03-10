import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
    const res = await axiosInstance.get("/me/dashboard");
    return res.data;
};

export const getActivityLogs = async (limit = 50) => {
    const res = await axiosInstance.get(`/activity?limit=${limit}`);
    return res.data;
};

export const updateProfile = async (profileData) => {
    const res = await axiosInstance.patch("/me", profileData);
    return res.data;
};

export const getProfile = async () => {
    const res = await axiosInstance.get("/me");
    return res.data;
};
