import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, confirmEmailAPI } from "./authAPI";

const readStorageValue = (key) => {
  if (typeof localStorage === "undefined" || typeof sessionStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const readStoredUser = () => {
  if (typeof localStorage === "undefined" || typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storedToken = readStorageValue("token");
const storedRefreshToken = readStorageValue("refresh_token");
const storedTokenExpiresAt = readStorageValue("token_expires_at");
const storedUser = readStoredUser();

const initialState = {
  user: storedUser,
  token: storedToken,
  refreshToken: storedRefreshToken,
  tokenExpiresAt: storedTokenExpiresAt ? Number(storedTokenExpiresAt) : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await loginAPI(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await registerAPI(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const confirmEmail = createAsyncThunk(
  "auth/confirm",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await confirmEmailAPI(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Confirmation failed");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    setTokens: (state, action) => {
      const token = action.payload?.token || null;
      const refreshToken = action.payload?.refreshToken || null;
      const expiresAt = action.payload?.tokenExpiresAt || null;
      const storage =
        typeof localStorage !== "undefined" && localStorage.getItem("refresh_token")
          ? localStorage
          : typeof sessionStorage !== "undefined"
            ? sessionStorage
            : null;
      if (storage && token) {
        storage.setItem("token", token);
      }
      if (storage && refreshToken) {
        storage.setItem("refresh_token", refreshToken);
      }
      if (storage && expiresAt) {
        storage.setItem("token_expires_at", String(expiresAt));
      }
      state.token = token || state.token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.tokenExpiresAt = expiresAt || state.tokenExpiresAt;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expires_at");
        localStorage.removeItem("user");
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("token_expires_at");
        sessionStorage.removeItem("user");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const token = action.payload?.token || null;
        const refreshToken = action.payload?.refreshToken || null;
        const expiresIn = action.payload?.expiresIn || null;
        const expiresAt = expiresIn ? Date.now() + Number(expiresIn) * 1000 : null;
        const user = action.payload?.user || null;
        const remember = Boolean(action.meta?.arg?.rememberMe);
        const storage =
          typeof localStorage !== "undefined" && remember
            ? localStorage
            : typeof sessionStorage !== "undefined"
              ? sessionStorage
              : null;
        if (storage && token) {
          storage.setItem("token", token);
        }
        if (storage && refreshToken) {
          storage.setItem("refresh_token", refreshToken);
        }
        if (storage && expiresAt) {
          storage.setItem("token_expires_at", String(expiresAt));
        }
        if (storage && user) {
          try {
            storage.setItem("user", JSON.stringify(user));
          } catch {
            // ignore
          }
        }
        state.token = token || state.token;
        state.refreshToken = refreshToken || state.refreshToken;
        state.tokenExpiresAt = expiresAt || state.tokenExpiresAt;
        state.user = user || state.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Do not auto-login after registration; require explicit login
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(confirmEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const token = action.payload?.tokens?.access_token || null;
        const refreshToken = action.payload?.tokens?.refresh_token || null;
        const expiresIn = action.payload?.tokens?.expires_in || null;
        const expiresAt = expiresIn ? Date.now() + Number(expiresIn) * 1000 : null;
        const user = action.payload?.user || null;
        const remember = Boolean(action.meta?.arg?.rememberMe);
        const storage =
          typeof localStorage !== "undefined" && remember
            ? localStorage
            : typeof sessionStorage !== "undefined"
              ? sessionStorage
              : null;
        if (storage && token) {
          storage.setItem("token", token);
        }
        if (storage && refreshToken) {
          storage.setItem("refresh_token", refreshToken);
        }
        if (storage && expiresAt) {
          storage.setItem("token_expires_at", String(expiresAt));
        }
        if (storage && user) {
          try {
            storage.setItem("user", JSON.stringify(user));
          } catch {
            // ignore
          }
        }
        state.token = token || state.token;
        state.refreshToken = refreshToken || state.refreshToken;
        state.tokenExpiresAt = expiresAt || state.tokenExpiresAt;
        state.user = user || state.user;
      })
      .addCase(confirmEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const { setUser, setTokens, logoutUser } = authSlice.actions;
export default authSlice.reducer;
