import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!config.skipAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track consecutive 401s — only force-logout after 2 in a row to avoid
// logging users out due to transient backend auth errors on non-critical endpoints.
let consecutive401Count = 0;

axiosInstance.interceptors.response.use(
  (response) => {
    consecutive401Count = 0; // Reset on any success
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !error.config?.skipAuthRedirect && !url.includes("/login")) {
      consecutive401Count += 1;
      const path = typeof window !== "undefined" ? window.location.pathname : "";

      if (path.startsWith("/dashboard") && consecutive401Count >= 2) {
        consecutive401Count = 0;
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else if (status !== 401) {
      consecutive401Count = 0;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
