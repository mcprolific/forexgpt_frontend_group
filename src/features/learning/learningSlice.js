import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getModulesAPI, getLessonAPI } from "./learningAPI";

const initialState = {
  modules: [],
  currentLesson: null,
  loading: false,
  error: null,
};

export const fetchModules = createAsyncThunk(
  "learning/modules",
  async (_, { rejectWithValue }) => {
    try {
      return await getModulesAPI();
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to load modules");
    }
  }
);

export const fetchLesson = createAsyncThunk(
  "learning/lesson",
  async (id, { rejectWithValue }) => {
    try {
      return await getLessonAPI(id);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to load lesson");
    }
  }
);

const slice = createSlice({
  name: "learning",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload || [];
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload || null;
      })
      .addCase(fetchLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slice.reducer;
