import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateStrategyAPI, optimizeStrategyAPI } from "./strategyAPI";

const initialState = {
  code: "",
  loading: false,
  error: null,
};

export const generateStrategy = createAsyncThunk(
  "strategy/generate",
  async (payload, { rejectWithValue }) => {
    try {
      return await generateStrategyAPI(payload);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to generate strategy");
    }
  }
);

export const optimizeStrategy = createAsyncThunk(
  "strategy/optimize",
  async (payload, { rejectWithValue }) => {
    try {
      return await optimizeStrategyAPI(payload);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to optimize strategy");
    }
  }
);

const slice = createSlice({
  name: "strategy",
  initialState,
  reducers: {
    clearStrategy(state) {
      state.code = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.code = action.payload?.code || "";
      })
      .addCase(generateStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(optimizeStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(optimizeStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.code = action.payload?.code || state.code;
      })
      .addCase(optimizeStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStrategy } = slice.actions;
export default slice.reducer;
