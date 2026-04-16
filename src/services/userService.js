import axiosInstance from "./axiosInstance";

const encodeQueryValue = (value) => encodeURIComponent(String(value));

export const getDashboardStats = async (userId) => {
    const candidates = [
        "/me/dashboard",
        "/me/dashboard/stats",
        "/users/me/dashboard",
        "/users/me/dashboard/stats",
        "/dashboard",
        "/dashboard/stats",
        userId ? `/me/dashboard?user_id=${encodeQueryValue(userId)}` : null,
        userId ? `/dashboard?user_id=${encodeQueryValue(userId)}` : null,
    ].filter(Boolean);

    let lastError;

    for (const url of candidates) {
        try {
            const res = await axiosInstance.get(url);
            return res.data;
        } catch (error) {
            lastError = error;
            const status = error?.response?.status;
            // Common "endpoint not found" / "wrong method" cases across deployments.
            if ([404, 405].includes(status)) continue;
        }
    }

    throw lastError;
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
