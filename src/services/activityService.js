import axiosInstance from "./axiosInstance";
import { getBacktestResults } from "./backtestService";
import {
  getConversations as getCodeGenConversations,
} from "./codeGenService";
import { getConversations as getMentorConversations } from "./mentorService";
import { getUserSignals } from "./signalService";

const asArray = (value) => (Array.isArray(value) ? value : []);

const truncate = (value, maxLength = 90) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const asTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortNewestFirst = (items) =>
  [...items].sort(
    (first, second) => asTimestamp(second.created_at) - asTimestamp(first.created_at)
  );

const dedupeActivityItems = (items) => {
  const merged = new Map();

  items.forEach((item) => {
    if (!item?.id) return;
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

const humanizeAction = (action) =>
  String(action || "activity")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildSignalActivity = (signal) => {
  const signalId = signal?.signal_id || signal?.id;
  if (!signalId) return null;

  const pair = signal.currency_pair || signal.affected_pairs?.[0] || signal.base_currency || null;
  const company = signal.company_name || signal.source_label || null;

  return {
    id: `signal-${signalId}`,
    entity_id: signalId,
    entity_type: "signal",
    action: "signal_extracted",
    title: pair ? `Signal extracted for ${pair}` : "Signal extracted",
    details: truncate(company || signal.reasoning || "AI market signal stored in your archive."),
    created_at: signal.created_at || signal.timestamp || new Date().toISOString(),
  };
};

const buildBacktestActivity = (backtest) => {
  const backtestId = backtest?.id || backtest?.backtest_id;
  if (!backtestId) return null;

  const pair = backtest.pair || backtest.symbol || null;
  const strategy = backtest.strategy_name || backtest.strategy_id || null;
  const details = [strategy, backtest.timeframe, backtest.status]
    .filter(Boolean)
    .join(" - ");

  return {
    id: `backtest-${backtestId}`,
    entity_id: backtestId,
    entity_type: "backtest",
    action: "backtest_completed",
    title: pair ? `Backtest completed for ${pair}` : "Backtest completed",
    details: truncate(details || "Historical simulation added to your archive."),
    created_at: backtest.created_at || backtest.timestamp || new Date().toISOString(),
  };
};

const buildMentorActivity = (conversation) => {
  const conversationId = conversation?.conversation_id;
  if (!conversationId) return null;

  return {
    id: `mentor-${conversationId}`,
    entity_id: conversationId,
    entity_type: "mentor",
    action: "mentor_conversation_started",
    title: "Mentor conversation started",
    details: truncate(
      conversation.preview || "A new AI mentor exchange was added to your archive."
    ),
    created_at:
      conversation.started_at ||
      conversation.updated_at ||
      conversation.created_at ||
      new Date().toISOString(),
  };
};

const buildCodeGenActivity = (session) => {
  const conversationId = session?.conversation_id;
  if (!conversationId) return null;

  return {
    id: `codegen-${conversationId}`,
    entity_id: conversationId,
    entity_type: "codegen",
    action: "code_generation_started",
    title: "Code generation session started",
    details: truncate(
      session.description || "A new strategy generation session was added to your archive."
    ),
    created_at:
      session.created_at ||
      session.updated_at ||
      session.timestamp ||
      new Date().toISOString(),
  };
};

const buildAuthActivity = (activity) => {
  const activityId =
    activity?.id ||
    `${activity?.action || "activity"}-${activity?.created_at || activity?.timestamp || Date.now()}`;

  return {
    id: `auth-${activityId}`,
    entity_id: activity?.entity_id || activityId,
    entity_type: activity?.entity_type || "auth",
    action: activity?.action || "activity",
    title: humanizeAction(activity?.action),
    details: truncate(
      activity?.metadata?.message ||
        activity?.metadata?.detail ||
        activity?.description ||
        "Account event recorded successfully."
    ),
    created_at: activity?.created_at || activity?.timestamp || new Date().toISOString(),
  };
};

export const getServerActivityLogs = async (limit = 50) => {
  const res = await axiosInstance.get(`/activity?limit=${limit}`);
  return asArray(res.data).map(buildAuthActivity).filter(Boolean);
};

export const getUnifiedActivityLogs = async (userId, limit = 50) => {
  const requests = [
    getServerActivityLogs(limit),
    userId ? getUserSignals(userId, limit) : Promise.resolve([]),
    userId ? getBacktestResults(userId, limit, 0) : Promise.resolve([]),
    userId ? getMentorConversations(userId) : Promise.resolve([]),
    userId ? getCodeGenConversations(userId, limit) : Promise.resolve([]),
  ];

  const [authResult, signalResult, backtestResult, mentorResult, codeGenResult] =
    await Promise.allSettled(requests);

  const authActivities = authResult.status === "fulfilled" ? authResult.value : [];
  const signalActivities =
    signalResult.status === "fulfilled"
      ? asArray(signalResult.value).map(buildSignalActivity).filter(Boolean)
      : [];
  const backtestActivities =
    backtestResult.status === "fulfilled"
      ? asArray(backtestResult.value).map(buildBacktestActivity).filter(Boolean)
      : [];
  const mentorActivities =
    mentorResult.status === "fulfilled"
      ? asArray(mentorResult.value).map(buildMentorActivity).filter(Boolean)
      : [];
  const codeGenActivities =
    codeGenResult.status === "fulfilled"
      ? asArray(codeGenResult.value).map(buildCodeGenActivity).filter(Boolean)
      : [];

  return sortNewestFirst(
    dedupeActivityItems([
      ...authActivities,
      ...signalActivities,
      ...backtestActivities,
      ...mentorActivities,
      ...codeGenActivities,
    ])
  ).slice(0, limit);
};

