import axiosInstance from "./axiosInstance";

export const getCodeGenConversationCacheKey = (userId) =>
  `fgpt_codegen_conversations_${userId || "anon"}`;

export const getCodeGenHistoryCacheKey = (conversationId) =>
  `fgpt_codegen_history_${conversationId}`;

const readCachedSessionList = (userId) => {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(getCodeGenConversationCacheKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedSessionList = (userId, sessions) => {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    getCodeGenConversationCacheKey(userId),
    JSON.stringify(Array.isArray(sessions) ? sessions : [])
  );
};

const readCachedHistory = (conversationId) => {
  if (typeof localStorage === "undefined" || !conversationId) return [];

  try {
    const raw = localStorage.getItem(getCodeGenHistoryCacheKey(conversationId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeSession = (item) => {
  if (!item || typeof item !== "object") return null;

  const conversation_id =
    item.conversation_id ||
    item.conversationId ||
    item.id ||
    item.chat_id ||
    item.session_id;

  if (!conversation_id) return null;

  const description =
    item.description ||
    item.strategy_description ||
    item.title ||
    item.prompt ||
    item.message ||
    item.question ||
    "Neural Logic";

  const created_at =
    item.created_at ||
    item.started_at ||
    item.updated_at ||
    item.timestamp ||
    new Date().toISOString();

  return {
    ...item,
    conversation_id,
    description,
    created_at,
  };
};

const mergeSessionLists = (...lists) => {
  const merged = new Map();

  lists
    .flat()
    .map(normalizeSession)
    .filter(Boolean)
    .forEach((session) => {
      const existing = merged.get(session.conversation_id);
      merged.set(session.conversation_id, {
        ...existing,
        ...session,
      });
    });

  return Array.from(merged.values()).sort((a, b) => {
    const first = new Date(b.created_at || 0).getTime();
    const second = new Date(a.created_at || 0).getTime();
    return first - second;
  });
};

const normalizeConversationList = (payload) => {
  if (Array.isArray(payload)) return mergeSessionLists(payload);
  if (Array.isArray(payload?.conversations)) {
    return mergeSessionLists(payload.conversations);
  }
  if (Array.isArray(payload?.codes)) return mergeSessionLists(payload.codes);
  if (Array.isArray(payload?.data)) return mergeSessionLists(payload.data);
  if (Array.isArray(payload?.items)) return mergeSessionLists(payload.items);
  if (Array.isArray(payload?.results)) return mergeSessionLists(payload.results);
  return [];
};

const normalizeHistory = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.history)) return payload.history;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/**
 * Code Generation Service
 * Communicates with the backend codegen endpoints.
 */

export const generateCode = async (
  message,
  conversationId = null,
  userId = null,
  previousCode = null,
  errorMessage = null
) => {
  const res = await axiosInstance.post("/codegen/generate", {
    strategy_description: message,
    conversation_id: conversationId,
    user_id: userId,
    previous_code: previousCode,
    error_message: errorMessage,
  });

  const nextConversationId = res.data?.conversation_id || conversationId || null;

  if (userId && nextConversationId) {
    const cached = readCachedSessionList(userId);
    const existing = cached.find(
      (session) => session.conversation_id === nextConversationId
    );

    writeCachedSessionList(
      userId,
      mergeSessionLists(cached, [
        {
          ...existing,
          conversation_id: nextConversationId,
          description: message,
          created_at:
            existing?.created_at ||
            res.data?.created_at ||
            res.data?.timestamp ||
            new Date().toISOString(),
          updated_at: res.data?.timestamp || new Date().toISOString(),
        },
      ])
    );
  }

  return res.data;
};

export const improveStrategy = async (
  userId,
  originalCode,
  backtestResults,
  mentorAnalysis,
  additionalRequirements = "",
  conversationId = null
) => {
  const res = await axiosInstance.post("/codegen/improve", {
    user_id: userId,
    original_code: originalCode,
    backtest_results: backtestResults,
    mentor_analysis: mentorAnalysis,
    additional_requirements: additionalRequirements,
    conversation_id: conversationId,
  });

  const nextConversationId = res.data?.conversation_id || conversationId || null;

  if (userId && nextConversationId) {
    const cached = readCachedSessionList(userId);
    const existing = cached.find(
      (session) => session.conversation_id === nextConversationId
    );

    writeCachedSessionList(
      userId,
      mergeSessionLists(cached, [
        {
          ...existing,
          conversation_id: nextConversationId,
          description:
            existing?.description ||
            additionalRequirements ||
            "Improved Strategy",
          created_at:
            existing?.created_at ||
            res.data?.created_at ||
            res.data?.timestamp ||
            new Date().toISOString(),
          updated_at: res.data?.timestamp || new Date().toISOString(),
        },
      ])
    );
  }

  return res.data;
};

export const getConversations = async (userId, limit = 20) => {
  const cached = readCachedSessionList(userId);

  try {
    const candidates = [
      `/codegen/codes/${userId}?limit=${limit}`,
      `/codegen/codes/${userId}`,
      `/codegen/conversations/${userId}`,
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get(url);
        const remote = normalizeConversationList(res.data);
        const merged = mergeSessionLists(remote, cached);

        writeCachedSessionList(userId, merged);
        return merged;
      } catch (error) {
        if ([404, 405].includes(error?.response?.status)) {
          continue;
        }
        throw error;
      }
    }

    return cached;
  } catch (error) {
    if (cached.length > 0) return cached;
    throw error;
  }
};

export const getCodeConversationHistory = async (conversationId, userId) => {
  const cached = readCachedHistory(conversationId);

  try {
    const candidates = [
      `/codegen/conversations/${userId}/${conversationId}`,
      `/codegen/codes/${userId}/${conversationId}`,
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get(url);
        const history = normalizeHistory(res.data?.history ?? res.data);
        const nextHistory = history.length > 0 ? history : cached;

        if (nextHistory.length > 0 && typeof localStorage !== "undefined") {
          localStorage.setItem(
            getCodeGenHistoryCacheKey(conversationId),
            JSON.stringify(nextHistory)
          );
        }

        return {
          ...res.data,
          history: nextHistory,
        };
      } catch (error) {
        if ([404, 405].includes(error?.response?.status)) {
          continue;
        }
        throw error;
      }
    }

    return { history: cached };
  } catch (error) {
    if (cached.length > 0) {
      return { history: cached };
    }
    throw error;
  }
};

export const deleteConversation = async (conversationId, userId) => {
  let response = null;
  const endpoints = [
    `/codegen/conversations/${userId}/${conversationId}`,
    `/codegen/codes/${userId}/${conversationId}`,
  ];

  for (const url of endpoints) {
    try {
      response = await axiosInstance.delete(url);
      break;
    } catch (error) {
      if ([404, 405].includes(error?.response?.status)) {
        continue;
      }
      throw error;
    }
  }

  if (typeof localStorage !== "undefined") {
    writeCachedSessionList(
      userId,
      readCachedSessionList(userId).filter(
        (session) =>
          session.conversation_id !== conversationId &&
          session.id !== conversationId
      )
    );
    localStorage.removeItem(getCodeGenHistoryCacheKey(conversationId));
  }

  return response?.data;
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
