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
    item.saved_description ||
    item.strategy_description ||
    item.title ||
    item.prompt ||
    item.message ||
    item.question ||
    "Neural Logic";

  const activity_at =
    item.updated_at ||
    item.created_at ||
    item.started_at ||
    item.timestamp ||
    new Date().toISOString();

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
    activity_at,
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
    const first = new Date(b.activity_at || b.updated_at || b.created_at || 0).getTime();
    const second = new Date(a.activity_at || a.updated_at || a.created_at || 0).getTime();
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
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
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
    rawRole.includes("ai") ||
    rawRole.includes("bot") ||
    rawRole.includes("system")
  ) {
    return "assistant";
  }

  return null;
};

const buildHistoryMessage = (item, role, index, content, extras = {}) => {
  const text =
    typeof content === "string" ? content.trim() : String(content || "").trim();

  if (!text && !extras.code) return null;

  const timestamp =
    item?.timestamp ||
    item?.created_at ||
    item?.updated_at ||
    item?.date ||
    new Date().toISOString();

  return {
    id:
      extras.id ||
      item?.message_id ||
      item?.id ||
      item?.code_id ||
      `${role}-${index}-${timestamp}`,
    role,
    content: text,
    conversation_id:
      item?.conversation_id ||
      item?.conversationId ||
      item?.chat_id ||
      item?.session_id ||
      null,
    code:
      extras.code ??
      item?.code ??
      item?.generated_code ??
      item?.python_code ??
      item?.strategy_code ??
      null,
    code_id: extras.code_id ?? item?.code_id ?? null,
    strategy_name: extras.strategy_name ?? item?.strategy_name ?? null,
    strategy_config: extras.strategy_config ?? item?.strategy_config ?? null,
    educational_analysis:
      extras.educational_analysis ?? item?.educational_analysis ?? null,
    improvement_suggestions:
      extras.improvement_suggestions ??
      normalizeSuggestionList(item?.improvement_suggestions),
    saved_description:
      extras.saved_description ??
      item?.description ??
      item?.saved_description ??
      null,
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
    item.description,
    item.saved_description,
    item.prompt,
    item.question,
    item.strategy_description,
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
    item.explanation,
    item.assistant_message,
    buildSuggestionContent(improvementSuggestions),
    !normalizedRole ? item.content : ""
  );
  const code =
    item.code ??
    item.generated_code ??
    item.python_code ??
    item.strategy_code ??
    null;

  const messages = [];

  if (promptText) {
    messages.push(
      buildHistoryMessage(item, "user", `${index}-user`, promptText, {
        id: item?.prompt_id || item?.user_message_id || `${item?.id || index}-user`,
        saved_description:
          item?.description || item?.saved_description || item?.strategy_description,
      })
    );
  }

  if (responseText || code) {
    messages.push(
      buildHistoryMessage(item, "assistant", `${index}-assistant`, responseText, {
        id:
          item?.response_id ||
          item?.assistant_message_id ||
          item?.code_id ||
          `${item?.id || index}-assistant`,
        code,
        code_id: item?.code_id || null,
        strategy_name: item?.strategy_name || null,
        strategy_config: item?.strategy_config || null,
        educational_analysis:
          item?.educational_analysis || item?.analysis || item?.explanation || null,
        improvement_suggestions: improvementSuggestions,
      })
    );
  }

  return messages.filter(Boolean);
};

export const normalizeCodeGenMessageHistory = (payload) => {
  const rawHistory = normalizeHistory(payload);
  const dedupe = new Set();

  return rawHistory.flatMap(normalizeHistoryEntry).filter((message) => {
    const key = [
      message.role,
      message.timestamp,
      message.content,
      message.code || "",
    ].join("|");

    if (dedupe.has(key)) return false;
    dedupe.add(key);
    return true;
  });
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

export const getConversations = async (userId, limit = 500) => {
  const cached = readCachedSessionList(userId);

  try {
    const candidates = [
      `/codegen/codes/${userId}?limit=${limit}`,
      `/codegen/codes/${userId}`,
      `/codegen/conversations/${userId}`,
      `/codegen/codes?user_id=${userId}&limit=${limit}`,
      `/codegen/conversations?user_id=${userId}`,
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
        const history = normalizeCodeGenMessageHistory(res.data?.history ?? res.data);
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

    return { history: normalizeCodeGenMessageHistory(cached) };
  } catch (error) {
    if (cached.length > 0) {
      return { history: normalizeCodeGenMessageHistory(cached) };
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
