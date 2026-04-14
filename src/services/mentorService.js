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

  const activity_at =
    item.updated_at ||
    item.started_at ||
    item.created_at ||
    item.timestamp ||
    new Date().toISOString();

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
    activity_at,
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
    const first = new Date(b.activity_at || b.updated_at || b.started_at || 0).getTime();
    const second = new Date(a.activity_at || a.updated_at || a.started_at || 0).getTime();
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
  if (Array.isArray(payload?.items)) return payload.items;
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

const pickFirstText = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) || "";

const normalizeSuggestionList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const buildSuggestionContent = (suggestions) => {
  if (!suggestions.length) return "";
  return `Improvement Suggestions\n\n${suggestions
    .map((suggestion) => `- ${suggestion}`)
    .join("\n")}`;
};

const normalizeRole = (item) => {
  const rawRole = String(
    item?.role ||
      item?.sender ||
      item?.source ||
      item?.author ||
      item?.message_role ||
      ""
  ).toLowerCase();

  if (
    rawRole.includes("user") ||
    rawRole.includes("human") ||
    rawRole.includes("client")
  ) {
    return "user";
  }

  if (
    rawRole.includes("assistant") ||
    rawRole.includes("mentor") ||
    rawRole.includes("ai") ||
    rawRole.includes("bot") ||
    rawRole.includes("system")
  ) {
    return "assistant";
  }

  return null;
};

const buildHistoryMessage = (item, role, index, content) => {
  const text =
    typeof content === "string" ? content.trim() : String(content || "").trim();
  if (!text) return null;

  const timestamp =
    item?.timestamp ||
    item?.created_at ||
    item?.updated_at ||
    item?.started_at ||
    new Date().toISOString();

  return {
    id:
      item?.message_id ||
      item?.id ||
      `${role}-${index}-${timestamp}`,
    role,
    content: text,
    conversation_id:
      item?.conversation_id ||
      item?.conversationId ||
      item?.chat_id ||
      item?.session_id ||
      null,
    code_id: item?.code_id || null,
    strategy_name: item?.strategy_name || null,
    strategy_config: item?.strategy_config || null,
    educational_analysis:
      item?.educational_analysis || item?.analysis || item?.explanation || null,
    improvement_suggestions: normalizeSuggestionList(item?.improvement_suggestions),
    timestamp,
  };
};

const normalizeHistoryEntry = (item, index) => {
  if (typeof item === "string") {
    return [
      buildHistoryMessage(
        { timestamp: new Date().toISOString() },
        "assistant",
        index,
        item
      ),
    ].filter(Boolean);
  }

  if (!item || typeof item !== "object") return [];

  const normalizedRole = normalizeRole(item);
  const directContent = pickFirstText(
    item.content,
    item.text,
    item.message,
    item.body
  );

  if (normalizedRole && directContent) {
    return [
      buildHistoryMessage(item, normalizedRole, index, directContent),
    ].filter(Boolean);
  }

  const promptText = pickFirstText(
    item.prompt,
    item.question,
    item.user_message,
    item.request
  );
  const improvementSuggestions = normalizeSuggestionList(
    item.improvement_suggestions
  );
  const responseText = pickFirstText(
    item.response,
    item.answer,
    item.educational_analysis,
    item.analysis,
    item.explanation,
    item.assistant_message,
    item.mentor_response,
    buildSuggestionContent(improvementSuggestions),
    !normalizedRole ? item.content : ""
  );

  const messages = [];

  if (promptText) {
    messages.push(
      buildHistoryMessage(item, "user", `${index}-user`, promptText)
    );
  }

  if (responseText) {
    messages.push(
      buildHistoryMessage(item, "assistant", `${index}-assistant`, responseText)
    );
  }

  return messages.filter(Boolean);
};

export const normalizeMentorMessageHistory = (payload) => {
  const rawHistory = normalizeHistory(payload);
  const dedupe = new Set();

  return rawHistory.flatMap(normalizeHistoryEntry).filter((message) => {
    const key = [message.role, message.timestamp, message.content].join("|");
    if (dedupe.has(key)) return false;
    dedupe.add(key);
    return true;
  });
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
export const getConversations = async (userId, limit = 500) => {
  const cached = readCachedConversationList(userId);

  try {
    const candidates = [
      `/mentor/conversations/${userId}?limit=${limit}`,
      `/mentor/conversations/${userId}`,
      `/mentor/conversations?user_id=${userId}&limit=${limit}`,
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
          normalizeMentorMessageHistory(res.data?.history ?? res.data),
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

    return { history: normalizeMentorMessageHistory([]) };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { history: normalizeMentorMessageHistory([]) };
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
