// features/mentor/mentorStream.js
// Streams AI responses from the backend using the native Fetch API + ReadableStream.
// Falls back to POST /mentor/conversations if the streaming endpoint returns 404.

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://127.0.0.1:8000";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const splitFallbackText = (text) => {
  if (!text) return [];

  const words = text.match(/\S+\s*|\n+/g);
  if (!words) return [text];

  return words.flatMap((part) => {
    if (part.length <= 20) return [part];
    return part.match(/.{1,20}/g) || [part];
  });
};

const emitFallbackStream = async (text, onChunk) => {
  const parts = splitFallbackText(text);

  for (const part of parts) {
    onChunk(part);
    await sleep(30);
  }
};

const extractTextCandidate = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const next = extractTextCandidate(item);
      if (next) return next;
    }
    return "";
  }
  if (!value || typeof value !== "object") return "";

  const candidates = [
    value?.choices?.[0]?.delta?.content,
    value?.choices?.[0]?.message?.content,
    value?.delta?.content,
    value?.chunk,
    value?.content,
    value?.text,
    value?.response,
    value?.answer,
    value?.analysis,
    value?.explanation,
    value?.message,
    value?.data,
    value?.payload,
    value?.result,
    value?.history?.[value?.history?.length - 1]?.response,
    value?.history?.[value?.history?.length - 1]?.answer,
    value?.history?.[value?.history?.length - 1]?.content,
    value?.messages?.[value?.messages?.length - 1]?.content,
  ];

  for (const candidate of candidates) {
    const next = extractTextCandidate(candidate);
    if (next) return next;
  }

  return "";
};

const processSseFrame = (frame, { onChunk, onDone, onConversationId }) => {
  for (const rawLine of frame.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) continue;

    const payload = line.slice(5).trim();
    if (!payload) continue;

    if (payload === "[DONE]") {
      onDone();
      return true;
    }

    try {
      const parsed = JSON.parse(payload);
      if (typeof parsed === "string") {
        if (parsed) onChunk(parsed);
        continue;
      }

      if (parsed?.error) {
        throw new Error(parsed.error);
      }

      if (parsed?.conversation_id && onConversationId) {
        onConversationId(parsed.conversation_id);
      }

      const chunk = extractTextCandidate(parsed);

      if (chunk) onChunk(chunk);
    } catch {
      if (payload) onChunk(payload);
    }
  }

  return false;
};

const readTokenPair = () => {
  const access =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const refresh =
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token");
  return { access, refresh };
};

const storeTokenPair = (access, refresh) => {
  const storage =
    localStorage.getItem("refresh_token") || localStorage.getItem("token")
      ? localStorage
      : sessionStorage;
  if (access) storage.setItem("token", access);
  if (refresh) storage.setItem("refresh_token", refresh);
};

const tryRefreshToken = async (refreshToken) => {
  if (!refreshToken) return null;
  const candidates = ["/refresh", "/auth/refresh"];
  let lastError;

  for (const path of candidates) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        lastError = new Error(`Refresh failed: ${res.status}`);
        continue;
      }
      const data = await res.json();
      const nextToken =
        data?.tokens?.access_token || data?.access_token || data?.token || null;
      const nextRefresh =
        data?.tokens?.refresh_token || data?.refresh_token || null;
      if (nextToken) storeTokenPair(nextToken, nextRefresh);
      return nextToken;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

/**
 * Stream a mentor response chunk-by-chunk.
 *
 * @param {object}   opts
 * @param {string}   opts.question        - The user's question
 * @param {string}   [opts.conversationId] - Optional existing conversation ID
 * @param {function} opts.onChunk         - Called with each text chunk (string)
 * @param {function} opts.onDone          - Called when the stream finishes
 * @param {function} opts.onError         - Called with an Error on failure
 * @param {function} [opts.onConversationId] - Called when a conversation id is discovered
 */
export async function streamMentorResponse({
  question,
  conversationId,
  userId,
  onChunk,
  onDone,
  onError,
  onConversationId,
}) {
  const { access, refresh } = readTokenPair();
  const headers = {
    "Content-Type": "application/json",
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };

  // Body matches the backend AskStreamRequest Pydantic model
  const body = JSON.stringify({
    message: question,
    ...(conversationId ? { conversation_id: conversationId } : {}),
    ...(userId ? { user_id: userId } : {}),
  });
  let streamedText = "";

  const emitChunk = (chunk) => {
    const nextChunk =
      typeof chunk === "string" ? chunk : String(chunk || "");
    if (!nextChunk) return;

    if (streamedText && nextChunk.startsWith(streamedText)) {
      const delta = nextChunk.slice(streamedText.length);
      if (delta) onChunk(delta);
      streamedText = nextChunk;
      return;
    }

    if (nextChunk === streamedText || streamedText.endsWith(nextChunk)) {
      return;
    }

    streamedText += nextChunk;
    onChunk(nextChunk);
  };

  const runStream = async (authToken) => {
    const nextHeaders = {
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    const response = await fetch(`${BASE_URL}/mentor/ask/stream`, {
      method: "POST",
      headers: nextHeaders,
      body,
    });
    return response;
  };

  const runFallback = async (authToken) => {
    const nextHeaders = {
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    const fallback = await fetch(`${BASE_URL}/mentor/conversations`, {
      method: "POST",
      headers: nextHeaders,
      body: JSON.stringify({
        message: question,
        ...(conversationId ? { conversation_id: conversationId } : {}),
        ...(userId ? { user_id: userId } : {}),
      }),
    });
    return fallback;
  };

  try {
    let response = await runStream(access);

    if (response.status === 401 && refresh) {
      try {
        const nextToken = await tryRefreshToken(refresh);
        response = await runStream(nextToken);
      } catch {
        // keep response as 401 for fallback handling below
      }
    }

    const headerConversationId =
      response.headers.get("x-conversation-id") ||
      response.headers.get("conversation-id") ||
      null;
    if (headerConversationId && onConversationId) {
      onConversationId(headerConversationId);
    }

    // --- Fallback: streaming endpoint not yet deployed ---
    if (response.status === 404 || response.status === 401 || !response.body) {
      const { access: latestAccess } = readTokenPair();
      const fallback = await runFallback(latestAccess);
      if (!fallback.ok) throw new Error(`Mentor API error: ${fallback.status}`);
      const data = await fallback.json();
      if (data?.conversation_id && onConversationId) {
        onConversationId(data.conversation_id);
      }
      const fallbackText = extractTextCandidate(data) || "Ok.";
      await emitFallbackStream(fallbackText, emitChunk);
      onDone();
      return;
    }

    if (!response.ok) {
      throw new Error(`Mentor streaming API error: ${response.status}`);
    }

    // --- True streaming via ReadableStream + SSE frame parsing ---
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        if (processSseFrame(frame, { onChunk: emitChunk, onDone, onConversationId })) {
          return;
        }
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const trailingFrames = buffer
        .split(/\r?\n\r?\n/)
        .map((frame) => frame.trim())
        .filter(Boolean);

      for (const frame of trailingFrames) {
        if (processSseFrame(frame, { onChunk: emitChunk, onDone, onConversationId })) {
          return;
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
