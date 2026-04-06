export const logError = (label, error) => {
  // Centralized logging for debugging (kept out of user-facing UI)
  // eslint-disable-next-line no-console
  console.error(label, error?.response?.data || error);
};

export const normalizeError = (error, options = {}) => {
  const fallback =
    options.fallback || "Something went wrong. Please try again.";
  const status = error?.response?.status;
  const detail =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "";
  const message = String(detail || "").trim();
  const lowered = message.toLowerCase();

  if (status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (status >= 500) {
    return "Service is temporarily unavailable. Please try again.";
  }

  if (
    lowered.includes("data sources failed") ||
    lowered.includes("csv file not found") ||
    lowered.includes("twelvedata") ||
    lowered.includes("alphavantage") ||
    lowered.includes("yfinance") ||
    lowered.includes("histdata") ||
    lowered.includes("data/")
  ) {
    return "Market data is temporarily unavailable for this pair. Please try another pair or come back later.";
  }

  if (
    lowered.includes("failed to fetch") ||
    lowered.includes("network error") ||
    lowered.includes("networkerror") ||
    lowered.includes("timeout") ||
    lowered.includes("timed out")
  ) {
    return "Network issue detected. Please check your connection and try again.";
  }

  if (message) {
    return message;
  }

  return fallback;
};

