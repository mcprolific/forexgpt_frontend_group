import axiosInstance from "./axiosInstance";

const encodeQueryValue = (value) => encodeURIComponent(String(value));

// Add a cache to prevent multiple calls
let dashboardStatsCache = null;
let dashboardStatsPromise = null;

export const getDashboardStats = async (userId) => {
    // Return cached result if available
    if (dashboardStatsCache !== undefined) {
        return dashboardStatsCache;
    }
    
    // Prevent multiple simultaneous calls
    if (dashboardStatsPromise) {
        return dashboardStatsPromise;
    }

    dashboardStatsPromise = (async () => {
        // Try the endpoints only once
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
                dashboardStatsCache = res.data;
                return dashboardStatsCache;
            } catch (error) {
                lastError = error;
                const status = error?.response?.status;
                // Endpoint not found - continue to next candidate
                if ([404, 405].includes(status)) continue;
                // For other errors (500, 403, etc.), log and continue
                console.warn(`Dashboard stats endpoint ${url} failed:`, error?.response?.status);
                continue;
            }
        }

        // If all endpoints fail, cache null to prevent future attempts
        console.warn('No dashboard stats endpoint available, using derived stats');
        dashboardStatsCache = null;
        return null;
    })();

    const result = await dashboardStatsPromise;
    dashboardStatsPromise = null;
    return result;
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