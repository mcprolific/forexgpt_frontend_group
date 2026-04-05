import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!config.skipAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let consecutive401Count = 0;
let refreshPromise = null;

const tryRefreshToken = async (refreshToken) => {
  if (!refreshToken) return null;
  const candidates = ["/refresh", "/auth/refresh"];
  let lastError;

  for (const path of candidates) {
    try {
      const res = await axios.post(
        `${baseURL}${path}`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (![404, 405].includes(status)) break;
    }
  }

  throw lastError;
};

axiosInstance.interceptors.response.use(
  (response) => {
    consecutive401Count = 0; // Reset on any success
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const originalRequest = error.config || {};

    if (status === 401 && !originalRequest?.skipAuthRedirect && !url.includes("/login")) {
      const refreshToken =
        localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
      const canRefresh = Boolean(refreshToken) && !originalRequest._retry;

      if (canRefresh) {
        originalRequest._retry = true;
        refreshPromise = refreshPromise || tryRefreshToken(refreshToken);

        return refreshPromise
          .then((data) => {
            refreshPromise = null;
            const nextToken = data?.tokens?.access_token || data?.access_token || data?.token || null;
            const nextRefresh = data?.tokens?.refresh_token || data?.refresh_token || null;
            const expiresIn = data?.tokens?.expires_in || data?.expires_in || null;
            const expiresAt = expiresIn ? Date.now() + Number(expiresIn) * 1000 : null;

            const storage =
              localStorage.getItem("refresh_token") ? localStorage : sessionStorage;
            if (nextToken) {
              storage.setItem("token", nextToken);
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${nextToken}`;
            }
            if (nextRefresh) {
              storage.setItem("refresh_token", nextRefresh);
            }
            if (expiresAt) {
              storage.setItem("token_expires_at", String(expiresAt));
            }

            return axiosInstance(originalRequest);
          })
          .catch(() => {
            refreshPromise = null;
            consecutive401Count += 1;
          });
      }

      consecutive401Count += 1;
      const path = typeof window !== "undefined" ? window.location.pathname : "";

      if (path.startsWith("/dashboard") && consecutive401Count >= 2) {
        consecutive401Count = 0;
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expires_at");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("token_expires_at");
        window.location.href = "/login";
      }
    } else if (status !== 401) {
      consecutive401Count = 0;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
