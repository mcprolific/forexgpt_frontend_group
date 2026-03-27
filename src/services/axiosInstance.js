import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

let refreshPromise = null;

const getStoredAuth = () => ({
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  refreshToken: typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null,
  tokenExpiresAt: typeof localStorage !== "undefined"
    ? Number(localStorage.getItem("token_expires_at") || 0)
    : 0,
});

const applyTokenUpdate = (data) => {
  const accessToken = data?.access_token || data?.token || null;
  const refreshToken = data?.refresh_token || null;
  const expiresIn = data?.expires_in || null;
  const expiresAt = expiresIn ? Date.now() + Number(expiresIn) * 1000 : null;

  if (accessToken && typeof localStorage !== "undefined") {
    localStorage.setItem("token", accessToken);
  }
  if (refreshToken && typeof localStorage !== "undefined") {
    localStorage.setItem("refresh_token", refreshToken);
  }
  if (expiresAt && typeof localStorage !== "undefined") {
    localStorage.setItem("token_expires_at", String(expiresAt));
  }

  return accessToken;
};

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;
  const { refreshToken } = getStoredAuth();
  if (!refreshToken) return null;

  refreshPromise = axios
    .post(
      `${baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((res) => applyTokenUpdate(res.data))
    .catch(async () => {
      const res = await axios.post(
        `${baseURL}/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );
      return applyTokenUpdate(res.data);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const { token, refreshToken, tokenExpiresAt } = getStoredAuth();
    const shouldRefresh =
      !!refreshToken &&
      tokenExpiresAt &&
      tokenExpiresAt - Date.now() <= REFRESH_WINDOW_MS;

    if (shouldRefresh) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    }

    if (!config.skipAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !error.config?.skipAuthRedirect && !url.includes("/login")) {
      const retryRequest = error.config || {};
      if (!retryRequest._retry) {
        retryRequest._retry = true;
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            retryRequest.headers = retryRequest.headers || {};
            retryRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance.request(retryRequest);
          }
        } catch {
          // ignore and fall through to logout
        }
      }

      const path = typeof window !== "undefined" ? window.location.pathname : "";
      if (path.startsWith("/dashboard")) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expires_at");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
