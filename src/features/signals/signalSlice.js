// features/signals/signalSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  generateSignalAPI,
  getSignalsAPI,
  getSignalHistoryAPI,
  executeSignalAPI,
} from "./signalAPI";

/**
 * Async Thunks
 */

// Generate AI Signal
export const generateSignal = createAsyncThunk(
  "signals/generate",
  async (payload, { rejectWithValue }) => {
    try {
      return await generateSignalAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Signal generation failed"
      );
    }
  }
);

// Fetch Latest Signals
export const fetchSignals = createAsyncThunk(
  "signals/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getSignalsAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch signals"
      );
    }
  }
);

// Fetch Signal History
export const fetchSignalHistory = createAsyncThunk(
  "signals/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await getSignalHistoryAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch signal history"
      );
    }
  }
);

// Execute Signal
export const executeSignal = createAsyncThunk(
  "signals/execute",
  async (signalId, { rejectWithValue }) => {
    try {
      return await executeSignalAPI(signalId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to execute signal"
      );
    }
  }
);

/**
 * Initial State
 */

const initialState = {
  signals: [],
  history: [],
  latestSignal: null,
  loading: false,
  error: null,
};

/**
 * Slice
 */

const signalSlice = createSlice({
  name: "signals",
  initialState,
  reducers: {
    clearSignalError: (state) => {
      state.error = null;
    },
    clearLatestSignal: (state) => {
      state.latestSignal = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Generate Signal
      .addCase(generateSignal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSignal.fulfilled, (state, action) => {
        state.loading = false;
        state.latestSignal = action.payload;
        state.signals.unshift(action.payload); // add to top
      })
      .addCase(generateSignal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Signals
      .addCase(fetchSignals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSignals.fulfilled, (state, action) => {
        state.loading = false;
        state.signals = action.payload;
      })
      .addCase(fetchSignals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchSignalHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSignalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchSignalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Execute Signal
      .addCase(executeSignal.pending, (state) => {
        state.loading = true;
      })
      .addCase(executeSignal.fulfilled, (state, action) => {
        state.loading = false;

        // Update signal in list
        const updated = action.payload;

        state.signals = state.signals.map((signal) =>
          signal.id === updated.id ? updated : signal
        );

        state.history.unshift(updated);
      })
      .addCase(executeSignal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSignalError, clearLatestSignal } = signalSlice.actions;

export default signalSlice.reducer;
