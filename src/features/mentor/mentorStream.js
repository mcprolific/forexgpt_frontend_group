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
export async function streamMentorResponse({ question, conversationId, userId, onChunk, onDone, onError, onConversationId }) {
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
      } catch (refreshErr) {
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
      await emitFallbackStream(data?.response || data?.answer || "Ok.", onChunk);
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

      // SSE frames are separated by double newlines
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? ""; // Keep last (possibly incomplete) frame

      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data: ")) continue;

          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed === "string") {
              // Our backend sends JSON-encoded plain strings
              if (parsed) onChunk(parsed);
            } else if (parsed?.error) {
              throw new Error(parsed.error);
            } else {
              if (parsed?.conversation_id && onConversationId) {
                onConversationId(parsed.conversation_id);
              }
              // OpenAI-compatible SSE fallback
              const chunk =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.chunk ??
                parsed?.content ??
                parsed?.text ??
                "";
              if (chunk) onChunk(chunk);
            }
          } catch (jsonErr) {
            // Not JSON — treat as raw plain-text chunk
            if (payload) onChunk(payload);
          }
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}


