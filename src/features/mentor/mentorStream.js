// features/mentor/mentorStream.js
// Streams AI responses from the backend using the native Fetch API + ReadableStream.
// Falls back to POST /mentor/conversations if the streaming endpoint returns 404.

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://127.0.0.1:8000";

/**
 * Stream a mentor response chunk-by-chunk.
 *
 * @param {object}   opts
 * @param {string}   opts.question        - The user's question
 * @param {string}   [opts.conversationId] - Optional existing conversation ID
 * @param {function} opts.onChunk         - Called with each text chunk (string)
 * @param {function} opts.onDone          - Called when the stream finishes
 * @param {function} opts.onError         - Called with an Error on failure
 */
export async function streamMentorResponse({ question, conversationId, onChunk, onDone, onError }) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Body matches the backend AskStreamRequest Pydantic model
  const body = JSON.stringify({
    message: question,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  });

  try {
    const response = await fetch(`${BASE_URL}/mentor/ask/stream`, {
      method: "POST",
      headers,
      body,
    });

    // --- Fallback: streaming endpoint not yet deployed ---
    if (response.status === 404 || !response.body) {
      const fallback = await fetch(`${BASE_URL}/mentor/conversations`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: question }),
      });
      if (!fallback.ok) throw new Error(`Mentor API error: ${fallback.status}`);
      const data = await fallback.json();
      onChunk(data?.response || data?.answer || "Ok.");
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
              // OpenAI-compatible SSE fallback
              const chunk =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.chunk ??
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


