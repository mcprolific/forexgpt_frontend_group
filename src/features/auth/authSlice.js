import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, confirmEmailAPI } from "./authAPI";

const storedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
const storedRefreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refresh_token") : null;
const storedTokenExpiresAt = typeof localStorage !== "undefined" ? localStorage.getItem("token_expires_at") : null;
const storedUser = typeof localStorage !== "undefined" ? (() => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})() : null;

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
      return rejectWithValue(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Login failed"
      );
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
      return rejectWithValue(error.response?.data?.message || "Registration failed");
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
      return rejectWithValue(error.response?.data?.detail || "Confirmation failed");
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
        if (token && typeof localStorage !== "undefined") {
          localStorage.setItem("token", token);
        }
        if (refreshToken && typeof localStorage !== "undefined") {
          localStorage.setItem("refresh_token", refreshToken);
        }
        if (expiresAt && typeof localStorage !== "undefined") {
          localStorage.setItem("token_expires_at", String(expiresAt));
        }
        if (user && typeof localStorage !== "undefined") {
          try {
            localStorage.setItem("user", JSON.stringify(user));
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
        if (token && typeof localStorage !== "undefined") {
          localStorage.setItem("token", token);
        }
        if (refreshToken && typeof localStorage !== "undefined") {
          localStorage.setItem("refresh_token", refreshToken);
        }
        if (expiresAt && typeof localStorage !== "undefined") {
          localStorage.setItem("token_expires_at", String(expiresAt));
        }
        if (user && typeof localStorage !== "undefined") {
          try {
            localStorage.setItem("user", JSON.stringify(user));
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

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
