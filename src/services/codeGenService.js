import axiosInstance from "./axiosInstance";

/**
 * Code Generation Service
 * Communicates with the backend codegen endpoints.
 * Backend routes in codegen.py:
 * - POST   /codegen/generate
 * - GET    /codegen/codes/{user_id}
 * - GET    /codegen/codes/{user_id}/{code_id}
 * - GET    /codegen/conversations/{user_id}/{conversation_id}
 */

export const generateCode = async (message, conversationId = null, userId = null, previousCode = null, errorMessage = null) => {
    const res = await axiosInstance.post(
        "/codegen/generate",
        {
            strategy_description: message,
            conversation_id: conversationId,
            user_id: userId,
            previous_code: previousCode,
            error_message: errorMessage
        },
        { timeout: 30000 }
    );
    return res.data;
};

export const getConversations = async (userId, limit = 20) => {
    const res = await axiosInstance.get(`/codegen/codes/${userId}?limit=${limit}`);
    return res.data;
};

export const getCodeConversationHistory = async (conversationId, userId) => {
    const res = await axiosInstance.get(`/codegen/conversations/${userId}/${conversationId}`);
    return res.data;
};

export const deleteConversation = async (conversationId, userId) => {
    const res = await axiosInstance.delete(`/codegen/conversations/${userId}/${conversationId}`);
    return res.data;
};

export const getGeneratedCodeDetail = async (codeId, userId) => {
    const res = await axiosInstance.get(`/codegen/codes/${userId}/${codeId}`);
    return res.data;
};

export const deleteGeneratedCode = async (codeId, userId) => {
    const res = await axiosInstance.delete(`/codegen/codes/${userId}/${codeId}`);
    return res.data;
};

export const updateGeneratedCode = async (codeId, userId, data) => {
    const res = await axiosInstance.patch(`/codegen/codes/${userId}/${codeId}`, data);
    return res.data;
};
