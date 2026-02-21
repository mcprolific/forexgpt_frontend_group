import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadTranscriptAPI, getTranscriptAPI } from "./transcriptAPI";

const initialState = {
  current: null,
  loading: false,
  error: null,
};

export const uploadTranscript = createAsyncThunk(
  "transcript/upload",
  async (payload, { rejectWithValue }) => {
    try {
      return await uploadTranscriptAPI(payload);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to upload transcript");
    }
  }
);

export const fetchTranscript = createAsyncThunk(
  "transcript/fetch",
  async (id, { rejectWithValue }) => {
    try {
      return await getTranscriptAPI(id);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch transcript");
    }
  }
);

const slice = createSlice({
  name: "transcript",
  initialState,
  reducers: {
    clearTranscript(state) {
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadTranscript.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadTranscript.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(uploadTranscript.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTranscript.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTranscript.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchTranscript.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTranscript } = slice.actions;
export default slice.reducer;
