import axiosInstance from "../../services/axiosInstance";

/**
 * Send message to AI mentor
 */
export const askMentorAPI = async (payload) => {
  const conversationId = payload?.conversation_id || payload?.conversationId || null;
  const endpoint = conversationId
    ? `/mentor/conversations/${conversationId}/messages`
    : "/mentor/conversations";
  const response = await axiosInstance.post(endpoint, {
    message: payload?.message,
  });
  return response.data;
};

/**
 * Get chat history
 */
export const getMentorHistoryAPI = async () => {
  const response = await axiosInstance.get("/mentor/history");
  return response.data;
};

/**
 * Clear conversation
 */
export const clearMentorConversationAPI = async () => {
  const response = await axiosInstance.delete("/mentor/clear");
  return response.data;
};


