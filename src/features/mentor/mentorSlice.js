// features/mentor/mentorSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  askMentorAPI,
  getMentorHistoryAPI,
  clearMentorConversationAPI,
} from "./mentorAPI";

/**
 * Async Thunks
 */

// Send message
export const askMentor = createAsyncThunk(
  "mentor/ask",
  async (payload, { rejectWithValue }) => {
    try {
      return await askMentorAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Mentor request failed"
      );
    }
  }
);

// Fetch history
export const fetchMentorHistory = createAsyncThunk(
  "mentor/history",
  async (_, { rejectWithValue }) => {
    try {
      return await getMentorHistoryAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load history"
      );
    }
  }
);

// Clear chat
export const clearMentorConversation = createAsyncThunk(
  "mentor/clear",
  async (_, { rejectWithValue }) => {
    try {
      return await clearMentorConversationAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear conversation"
      );
    }
  }
);

/**
 * Initial State
 */

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

/**
 * Slice
 */

const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder

      // Ask Mentor
      .addCase(askMentor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(askMentor.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push({
          role: "assistant",
          content: action.payload.response,
          reasoning: action.payload.reasoning || null,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(askMentor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchMentorHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
      })

      // Clear Conversation
      .addCase(clearMentorConversation.fulfilled, (state) => {
        state.messages = [];
      });
  },
});

export const { addUserMessage } = mentorSlice.actions;

export default mentorSlice.reducer;
