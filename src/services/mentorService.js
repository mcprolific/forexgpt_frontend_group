import axiosInstance from "./axiosInstance";

// Ask Mentor
export const askMentor = async (message, conversationId, userId) => {
  const res = await axiosInstance.post("/mentor/ask", {
    message,
    conversation_id: conversationId,
    user_id: userId
  });
  return res.data;
};

// Get Conversations
export const getConversations = async (userId) => {
  const res = await axiosInstance.get(`/mentor/conversations/${userId}`);
  return res.data;
};

// Get History
export const getConversationHistory = async (conversationId, userId) => {
  const res = await axiosInstance.get(
    `/mentor/conversations/${userId}/${conversationId}`
  );
  return res.data;
};

// Delete Conversation
export const deleteConversation = async (conversationId, userId) => {
  const res = await axiosInstance.delete(
    `/mentor/conversations/${userId}/${conversationId}`
  );
  return res.data;
};

// ✅ Analyze Backtest
export const analyzeBacktest = async (payload) => {
  const res = await axiosInstance.post("/mentor/analyze-backtest", payload);
  return res.data;
};