import axiosInstance from "./axiosInstance";

// ==============================
// ASK MENTOR
// ==============================
export const askMentor = async (message, conversationId, userId) => {
  try {
    const res = await axiosInstance.post("/mentor/ask", {
      message,
      conversation_id: conversationId,
      user_id: userId
    });
    return res.data;
  } catch (error) {
    console.error("Ask Mentor Error:", error);
    throw error;
  }
};

// ==============================
// GET CONVERSATIONS
// ==============================
export const getConversations = async (userId) => {
  try {
    const res = await axiosInstance.get(`/mentor/conversations/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get Conversations Error:", error);
    throw error;
  }
};

// ==============================
// GET HISTORY
// ==============================
export const getConversationHistory = async (conversationId, userId) => {
  try {
    const res = await axiosInstance.get(
      `/mentor/conversations/${userId}/${conversationId}`
    );
    return res.data;
  } catch (error) {
    console.error("Get History Error:", error);
    throw error;
  }
};

// ==============================
// DELETE CONVERSATION
// ==============================
export const deleteConversation = async (conversationId, userId) => {
  try {
    const res = await axiosInstance.delete(
      `/mentor/conversations/${userId}/${conversationId}`
    );
    return res.data;
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    throw error;
  }
};

// ==============================
// ANALYZE BACKTEST
// ==============================
export const analyzeBacktest = async (payload) => {
  try {
    const res = await axiosInstance.post("/mentor/analyze-backtest", payload);
    return res.data;
  } catch (error) {
    console.error("Analyze Backtest Error:", error);
    throw error;
  }
};