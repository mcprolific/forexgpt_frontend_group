import axiosInstance from "./axiosInstance";

export const getBacktestListCacheKey = (userId) =>
  `fgpt_backtests_list_${userId || "anon"}`;

export const getBacktestDetailCacheKey = (backtestId) =>
  `fgpt_backtest_detail_${backtestId}`;

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

const normalizeStrategyNameForApi = (strategyName) => {
  const normalized = String(strategyName || "").trim().toLowerCase();

  if (!normalized) return strategyName;
  if (normalized === "sma" || normalized === "sma_cross") {
    return "moving_average_crossover";
  }
  if (normalized === "bollinger") {
    return "bollinger_bands";
  }

  return strategyName;
};

const normalizeBacktestPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  const strategyName = normalizeStrategyNameForApi(payload.strategy_name);
  const strategyType = normalizeStrategyNameForApi(payload.strategy_type);

  return {
    ...payload,
    ...(payload.strategy_name ? { strategy_name: strategyName } : {}),
    ...(payload.strategy_type ? { strategy_type: strategyType } : {}),
  };
};

const normalizeBacktest = (item) => {
  if (!item || typeof item !== "object") return null;

  const id = item.id || item.backtest_id;
  if (!id) return null;

  return {
    ...item,
    id,
    created_at: item.created_at || item.timestamp || new Date().toISOString(),
  };
};

const mergeBacktestLists = (...lists) => {
  const merged = new Map();

  lists
    .flat()
    .map(normalizeBacktest)
    .filter(Boolean)
    .forEach((backtest) => {
      merged.set(backtest.id, {
        ...merged.get(backtest.id),
        ...backtest,
      });
    });

  return Array.from(merged.values()).sort((a, b) => {
    const first = new Date(b.created_at || 0).getTime();
    const second = new Date(a.created_at || 0).getTime();
    return first - second;
  });
};

const updateBacktestListCache = (userId, backtests) => {
  writeCache(
    getBacktestListCacheKey(userId),
    mergeBacktestLists(Array.isArray(backtests) ? backtests : [])
  );
};

const cacheBacktestDetail = (backtest) => {
  const normalized = normalizeBacktest(backtest);
  if (!normalized?.id) return;
  writeCache(getBacktestDetailCacheKey(normalized.id), normalized);
};

const syncBacktestCaches = (userId, backtest) => {
  const normalized = normalizeBacktest(backtest);
  if (!userId || !normalized?.id) return;

  const cached = readCachedList(getBacktestListCacheKey(userId));
  updateBacktestListCache(userId, mergeBacktestLists([normalized], cached));
  cacheBacktestDetail(normalized);
};

export const runBacktest = async (userId, payload) => {
  const body = normalizeBacktestPayload({ user_id: userId, ...payload });
  const res = await axiosInstance.post("/backtest/run", body);
  syncBacktestCaches(userId, res.data);
  return res.data;
};

export const runCustomBacktest = async (payload) => {
  const res = await axiosInstance.post("/backtest/run/custom", payload);
  syncBacktestCaches(payload?.user_id, res.data);
  return res.data;
};

export const validateCustomBacktest = async (customCode) => {
  const res = await axiosInstance.post("/backtest/run/custom/validate", { custom_code: customCode });
  return res.data;
};

export const getBacktestResults = async (userId, limit = 200, offset = 0) => {
  const cached = readCachedList(getBacktestListCacheKey(userId));

  try {
    const res = await axiosInstance.get(`/backtest/user/${userId}`, {
      params: { limit, offset },
    });
    const normalized = mergeBacktestLists(Array.isArray(res.data) ? res.data : [], cached);
    updateBacktestListCache(userId, normalized);
    return normalized;
  } catch (error) {
    if (cached.length > 0) return cached;
    throw error;
  }
};

export const getBacktestResult = async (userId, backtestId) => {
  const cacheKey = getBacktestDetailCacheKey(backtestId);
  const cached = readCachedObject(cacheKey);

  try {
    const res = await axiosInstance.get(`/backtest/user/${userId}/${backtestId}`);
    cacheBacktestDetail(res.data);
    syncBacktestCaches(userId, res.data);
    return res.data;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
};

export const getBacktestTrades = async (userId, backtestId, limit = 500, offset = 0) => {
  const res = await axiosInstance.get(`/backtest/user/${userId}/${backtestId}/trades`, {
    params: { limit, offset },
  });
  return res.data;
};

export const updateBacktest = async (userId, backtestId, updates) => {
  const res = await axiosInstance.patch(`/backtest/user/${userId}/${backtestId}`, updates);
  cacheBacktestDetail(res.data);
  syncBacktestCaches(userId, res.data);
  return res.data;
};

export const deleteBacktest = async (userId, backtestId) => {
  const res = await axiosInstance.delete(`/backtest/${userId}/${backtestId}`);

  if (typeof localStorage !== "undefined") {
    updateBacktestListCache(
      userId,
      readCachedList(getBacktestListCacheKey(userId)).filter(
        (backtest) => backtest.id !== backtestId
      )
    );
    localStorage.removeItem(getBacktestDetailCacheKey(backtestId));
  }

  return res.data;
};

export const getBacktestStatus = async () => {
  const res = await axiosInstance.get("/backtest/status");
  return res.data;
};
