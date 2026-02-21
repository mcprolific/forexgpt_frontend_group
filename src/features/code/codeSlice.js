// features/code/codeSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  generateCodeAPI,
  explainCodeAPI,
  optimizeCodeAPI,
} from "./codeAPI";

/**
 * Async Thunks
 */

// Generate Code
export const generateCode = createAsyncThunk(
  "code/generate",
  async (payload, { rejectWithValue }) => {
    try {
      return await generateCodeAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Code generation failed"
      );
    }
  }
);

// Explain Code
export const explainCode = createAsyncThunk(
  "code/explain",
  async (payload, { rejectWithValue }) => {
    try {
      return await explainCodeAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Code explanation failed"
      );
    }
  }
);

// Optimize Strategy
export const optimizeCode = createAsyncThunk(
  "code/optimize",
  async (payload, { rejectWithValue }) => {
    try {
      return await optimizeCodeAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Optimization failed"
      );
    }
  }
);

/**
 * Initial State
 */

const initialState = {
  generatedCode: null,
  explanation: null,
  optimizedCode: null,
  loading: false,
  error: null,
};

/**
 * Slice
 */

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    clearCodeState: (state) => {
      state.generatedCode = null;
      state.explanation = null;
      state.optimizedCode = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Generate Code
      .addCase(generateCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCode.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCode = action.payload.code;
      })
      .addCase(generateCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Explain Code
      .addCase(explainCode.fulfilled, (state, action) => {
        state.explanation = action.payload.explanation;
      })

      // Optimize Code
      .addCase(optimizeCode.fulfilled, (state, action) => {
        state.optimizedCode = action.payload.optimizedCode;
      });
  },
});

export const { clearCodeState } = codeSlice.actions;

export default codeSlice.reducer;
