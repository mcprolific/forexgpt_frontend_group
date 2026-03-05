// features/backtest/backtestSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  runBacktestAPI,
  getBacktestHistoryAPI,
  getBacktestResultAPI,
} from "./backtestAPI";

/*  Async Thunks  */

// Run Backtest
export const runBacktest = createAsyncThunk(
  "backtest/run",
  async (payload, { rejectWithValue }) => {
    try {
      return await runBacktestAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Backtest failed"
      );
    }
  }
);

// Fetch History
export const fetchBacktestHistory = createAsyncThunk(
  "backtest/history",
  async (_, { rejectWithValue }) => {
    try {
      return await getBacktestHistoryAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch history"
      );
    }
  }
);

// Fetch Single Result
export const fetchBacktestResult = createAsyncThunk(
  "backtest/result",
  async (id, { rejectWithValue }) => {
    try {
      return await getBacktestResultAPI(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch result"
      );
    }
  }
);

/*  Initial State */

const initialState = {
  currentResult: null,
  history: [],
  loading: false,
  error: null,
};

/* Slice */

const backtestSlice = createSlice({
  name: "backtest",
  initialState,
  reducers: {
    clearBacktest: (state) => {
      state.currentResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Run Backtest
      .addCase(runBacktest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload;
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchBacktestHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBacktestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchBacktestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Result
      .addCase(fetchBacktestResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBacktestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload;
      })
      .addCase(fetchBacktestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBacktest } = backtestSlice.actions;
export default backtestSlice.reducer;
