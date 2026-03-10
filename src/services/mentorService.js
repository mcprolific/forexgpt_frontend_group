import axiosInstance from "./axiosInstance";

/**
 * Mentor Service
 * Communicates with the backend mentor endpoints.
 * Backend routes in mentor.py:
 * - POST   /mentor/ask
 * - GET    /mentor/conversations/{user_id}
 * - GET    /mentor/conversations/{user_id}/{conversation_id}
 * - DELETE /mentor/conversations/{user_id}/{conversation_id}
 */

export const askMentor = async (message, conversationId = null, userId = null) => {
    const res = await axiosInstance.post("/mentor/ask", {
        message,
        conversation_id: conversationId,
        user_id: userId
    });
    return res.data;
};

export const getConversations = async (userId) => {
    const res = await axiosInstance.get(`/mentor/conversations/${userId}`);
    return res.data;
};

export const getConversationHistory = async (conversationId, userId) => {
    const res = await axiosInstance.get(`/mentor/conversations/${userId}/${conversationId}`);
    return res.data;
};

export const deleteConversation = async (conversationId, userId) => {
    const res = await axiosInstance.delete(`/mentor/conversations/${userId}/${conversationId}`);
    return res.data;
};
