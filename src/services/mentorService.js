import axiosInstance from "./axiosInstance";

export const getMentorConversationCacheKey = (userId) =>
  `fgpt_mentor_conversations_${userId || "anon"}`;

const readCachedConversationList = (userId) => {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(getMentorConversationCacheKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedConversationList = (userId, conversations) => {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    getMentorConversationCacheKey(userId),
    JSON.stringify(Array.isArray(conversations) ? conversations : [])
  );
};

const normalizeConversation = (item) => {
  if (!item || typeof item !== "object") return null;

  const conversation_id =
    item.conversation_id ||
    item.conversationId ||
    item.id ||
    item.chat_id ||
    item.session_id;

  if (!conversation_id) return null;

  const preview =
    item.preview ||
    item.title ||
    item.subject ||
    item.message ||
    item.question ||
    item.last_message ||
    item.prompt ||
    "AI Conversation";

  const started_at =
    item.started_at ||
    item.created_at ||
    item.updated_at ||
    item.timestamp ||
    new Date().toISOString();

  return {
    ...item,
    conversation_id,
    preview,
    started_at,
    message_count:
      item.message_count ||
      item.exchange_count ||
      item.prompt_count ||
      item.messages?.length ||
      0,
  };
};

const mergeConversationLists = (...lists) => {
  const merged = new Map();

  lists
    .flat()
    .map(normalizeConversation)
    .filter(Boolean)
    .forEach((conversation) => {
      const existing = merged.get(conversation.conversation_id);
      merged.set(conversation.conversation_id, {
        ...existing,
        ...conversation,
        message_count: Math.max(
          existing?.message_count || 0,
          conversation.message_count || 0
        ),
      });
    });

  return Array.from(merged.values()).sort((a, b) => {
    const first = new Date(b.started_at || 0).getTime();
    const second = new Date(a.started_at || 0).getTime();
    return first - second;
  });
};

const normalizeConversationList = (payload) => {
  if (Array.isArray(payload)) return mergeConversationLists(payload);
  if (Array.isArray(payload?.conversations)) {
    return mergeConversationLists(payload.conversations);
  }
  if (Array.isArray(payload?.history)) return mergeConversationLists(payload.history);
  if (Array.isArray(payload?.data)) return mergeConversationLists(payload.data);
  if (Array.isArray(payload?.items)) return mergeConversationLists(payload.items);
  if (Array.isArray(payload?.results)) return mergeConversationLists(payload.results);
  return [];
};

const normalizeHistory = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.history)) return payload.history;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const filterHistoryForConversation = (history, conversationId) => {
  if (!Array.isArray(history)) return [];

  const matching = history.filter((item) => {
    const itemConversationId =
      item?.conversation_id ||
      item?.conversationId ||
      item?.chat_id ||
      item?.session_id;
    return itemConversationId === conversationId;
  });

  return matching.length > 0 ? matching : history;
};

// ==============================
// ASK MENTOR
// ==============================
export const askMentor = async (message, conversationId, userId) => {
  try {
    const endpoint = conversationId
      ? `/mentor/conversations/${conversationId}/messages`
      : "/mentor/conversations";
    const res = await axiosInstance.post(endpoint, {
      message,
      conversation_id: conversationId,
      user_id: userId,
    });

    const nextConversationId = res.data?.conversation_id || conversationId || null;

    if (userId && nextConversationId) {
      const cached = readCachedConversationList(userId);
      const existing = cached.find(
        (item) => item.conversation_id === nextConversationId
      );

      writeCachedConversationList(
        userId,
        mergeConversationLists(cached, [
          {
            ...existing,
            conversation_id: nextConversationId,
            // Keep original preview/title once set to avoid changing history name each message
            preview: existing?.preview || message,
            started_at:
              existing?.started_at ||
              res.data?.started_at ||
              res.data?.timestamp ||
              new Date().toISOString(),
            updated_at: res.data?.timestamp || new Date().toISOString(),
            message_count: (existing?.message_count || 0) + 1,
          },
        ])
      );
    }

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
  const cached = readCachedConversationList(userId);

  try {
    const candidates = [
      `/mentor/conversations/${userId}`,
      `/mentor/conversations?user_id=${userId}`,
      `/mentor/conversations?user_id=${userId}&limit=50`,
      `/mentor/history?user_id=${userId}`,
      "/mentor/history",
      "/mentor/conversations",
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get(url);
        const remote = normalizeConversationList(res.data);
        const merged = mergeConversationLists(remote, cached);

        writeCachedConversationList(userId, merged);
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
    console.error("Get Conversations Error:", error);
    throw error;
  }
};

// ==============================
// GET HISTORY
// ==============================
export const getConversationHistory = async (conversationId, userId) => {
  try {
    const candidates = [
      `/mentor/conversations/${userId}/${conversationId}`,
      `/mentor/history/${userId}/${conversationId}`,
      `/mentor/history?user_id=${userId}&conversation_id=${conversationId}`,
      `/mentor/history?conversation_id=${conversationId}`,
      "/mentor/history",
    ];

    for (const url of candidates) {
      try {
        const res = await axiosInstance.get(url);
        const history = filterHistoryForConversation(
          normalizeHistory(res.data?.history ?? res.data),
          conversationId
        );

        return {
          ...res.data,
          history,
        };
      } catch (error) {
        if ([404, 405].includes(error?.response?.status)) {
          continue;
        }
        throw error;
      }
    }

    return { history: [] };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { history: [] };
    }
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
      `/mentor/conversations/${conversationId}`
    );
    writeCachedConversationList(
      userId,
      readCachedConversationList(userId).filter(
        (item) => item.conversation_id !== conversationId
      )
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
    const metrics =
      payload?.metrics ||
      payload?.results ||
      payload?.backtest_results ||
      payload?.backtestResults ||
      {};

    const requestBody = {
      backtest_context: {
        strategy_type:
          payload?.strategy_type ||
          payload?.strategyType ||
          metrics?.strategy_name ||
          "custom",
        metrics,
        parameters: payload?.parameters || payload?.strategy_params || {},
        backtest_id: payload?.backtest_id || payload?.backtestId || metrics?.backtest_id || null,
      },
    };

    const res = await axiosInstance.post("/mentor/backtest-conversations", requestBody);
    return res.data;
  } catch (error) {
    console.error("Analyze Backtest Error:", error);
    throw error;
  }
};
