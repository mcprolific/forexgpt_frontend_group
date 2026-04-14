import axiosInstance from "./axiosInstance";

export const getSignalListCacheKey = (userId) =>
  `fgpt_signals_list_${userId || "anon"}`;

export const getSignalStatsCacheKey = (userId) =>
  `fgpt_signals_stats_${userId || "anon"}`;

const readCachedList = (key) => {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readCachedObject = (key) => {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const sanitizeSignalText = (value) => {
  if (value == null) return "";

  return String(value)
    .replace(/\uFFFD/g, "")
    .trim();
};

const normalizeSignal = (item) => {
  if (!item || typeof item !== "object") return null;

  const signal_id = item.signal_id || item.id;
  if (!signal_id) return null;

  return {
    ...item,
    signal_id,
    id: item.id || signal_id,
    direction:
      sanitizeSignalText(item.direction || item.primary_direction) || "NEUTRAL",
    company_name:
      sanitizeSignalText(item.company_name || item.source_label) ||
      "Signal Extract",
    currency_pair:
      sanitizeSignalText(
        item.currency_pair || item.affected_pairs?.[0] || item.base_currency
      ) || null,
    created_at: item.created_at || item.timestamp || new Date().toISOString(),
  };
};

const mergeSignalLists = (...lists) => {
  const merged = new Map();

  lists
    .flat()
    .map(normalizeSignal)
    .filter(Boolean)
    .forEach((signal) => {
      merged.set(signal.signal_id, {
        ...merged.get(signal.signal_id),
        ...signal,
      });
    });

  return Array.from(merged.values()).sort((a, b) => {
    const first = new Date(b.created_at || 0).getTime();
    const second = new Date(a.created_at || 0).getTime();
    return first - second;
  });
};

const updateSignalCache = (userId, signals) => {
  writeCache(
    getSignalListCacheKey(userId),
    mergeSignalLists(Array.isArray(signals) ? signals : [])
  );
};

export const buildSignalStats = (signals) => {
  const normalized = mergeSignalLists(Array.isArray(signals) ? signals : []);
  const by_direction = {
    LONG: 0,
    SHORT: 0,
    NEUTRAL: 0,
    UNKNOWN: 0,
  };
  const by_currency_pair = {};
  const by_magnitude = {};

  let confidenceSum = 0;
  let confidenceCount = 0;

  normalized.forEach((signal) => {
    const direction = String(signal.direction || signal.primary_direction || "UNKNOWN").toUpperCase();
    if (by_direction[direction] == null) {
      by_direction.UNKNOWN += 1;
    } else {
      by_direction[direction] += 1;
    }

    const pair = signal.currency_pair || signal.affected_pairs?.[0] || signal.base_currency;
    if (pair) {
      by_currency_pair[pair] = (by_currency_pair[pair] || 0) + 1;
    }

    const magnitude = signal.magnitude || signal.primary_strength;
    if (magnitude) {
      by_magnitude[magnitude] = (by_magnitude[magnitude] || 0) + 1;
    }

    const rawConfidence = Number(signal.confidence);
    if (!Number.isNaN(rawConfidence)) {
      confidenceSum += rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;
      confidenceCount += 1;
    }
  });

  return {
    total_signals: normalized.length,
    by_currency_pair,
    by_direction,
    by_magnitude,
    average_confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
  };
};

const updateSignalCaches = (userId, signals) => {
  const merged = mergeSignalLists(Array.isArray(signals) ? signals : []);
  updateSignalCache(userId, merged);
  writeCache(getSignalStatsCacheKey(userId), buildSignalStats(merged));
  return merged;
};

// POST /signals/extract
export const extractSignal = async (
  transcript,
  companyName = null,
  userId = null,
  saveToDb = true
) => {
  const res = await axiosInstance.post("/signals/extract", {
    transcript,
    company_name: companyName,
    user_id: userId,
    save_to_db: saveToDb,
  });

  const signal = normalizeSignal(res.data);
  if (saveToDb && userId && signal?.signal_id) {
    const cached = readCachedList(getSignalListCacheKey(userId));
    updateSignalCaches(userId, mergeSignalLists([signal], cached));
  }

  return res.data;
};

// POST /signals/batch
export const batchExtract = async (transcripts, userId = null, saveToDb = true) => {
  const res = await axiosInstance.post("/signals/batch", {
    transcripts,
    user_id: userId,
    save_to_db: saveToDb,
  });

  if (saveToDb && userId) {
    const cached = readCachedList(getSignalListCacheKey(userId));
    const incoming = Array.isArray(res.data?.signals) ? res.data.signals : [];
    updateSignalCaches(userId, mergeSignalLists(incoming, cached));
  }

  return res.data;
};

// GET /signals/user/{user_id}?limit=50&currency_pair=...&direction=...
export const getUserSignals = async (
  userId,
  limit = 200,
  currencyPair = null,
  direction = null
) => {
  const params = { limit };
  if (currencyPair) params.currency_pair = currencyPair;
  if (direction) params.direction = direction;

  const cached = readCachedList(getSignalListCacheKey(userId));

  try {
    const res = await axiosInstance.get(`/signals/user/${userId}`, { params });
    const normalized = mergeSignalLists(Array.isArray(res.data) ? res.data : [], cached);
    updateSignalCaches(userId, normalized);
    return normalized;
  } catch (error) {
    if (cached.length > 0) return cached;
    throw error;
  }
};

// GET /signals/user/{user_id}/{signal_id}
export const getSignalDetail = async (userId, signalId) => {
  const res = await axiosInstance.get(`/signals/user/${userId}/${signalId}`);
  return res.data;
};

// GET /signals/statistics/{user_id}
export const getSignalStats = async (userId) => {
  const cacheKey = getSignalStatsCacheKey(userId);
  const cached = readCachedObject(cacheKey);

  try {
    const res = await axiosInstance.get(`/signals/statistics/${userId}`);
    const remoteStats = res.data;
    const cachedSignals = readCachedList(getSignalListCacheKey(userId));

    if ((remoteStats?.total_signals || 0) === 0 && cachedSignals.length > 0) {
      const derived = buildSignalStats(cachedSignals);
      writeCache(cacheKey, derived);
      return derived;
    }

    writeCache(cacheKey, remoteStats);
    return remoteStats;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
};

// DELETE /signals/{user_id}/{signal_id}
export const deleteSignal = async (userId, signalId) => {
  const res = await axiosInstance.delete(`/signals/${userId}/${signalId}`);
  const cached = readCachedList(getSignalListCacheKey(userId));
  updateSignalCaches(
    userId,
    cached.filter((signal) => signal.signal_id !== signalId && signal.id !== signalId)
  );
  return res.data;
};
