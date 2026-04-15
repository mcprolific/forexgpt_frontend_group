import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FiClock,
  FiCopy,
  FiCpu,
  FiDownload,
  FiSend,
  FiThumbsUp,
  FiZap,
} from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  analyzeBacktest,
  getConversationHistory,
  getConversations,
  getMentorConversationCacheKey,
  normalizeMentorMessageHistory,
} from '../../../services/mentorService';
import { streamMentorResponse } from '../../../features/mentor/mentorStream';
import { getGeneratedCodeDetail } from '../../../services/codeGenService';
import toast from 'react-hot-toast';
import { formatLongDateTime } from '../../../utils/formatters';
import { logError, normalizeError } from '../../../utils/errorHandling';

const STRATEGY_PATTERNS = [
  { label: 'mean reversion', regex: /mean\s*reversion/i },
  { label: 'RSI', regex: /\brsi\b/i },
  { label: 'MACD', regex: /\bmacd\b/i },
  { label: 'Bollinger Bands', regex: /bollinger\s*bands/i },
  { label: 'moving average', regex: /moving\s*average/i },
  { label: 'momentum', regex: /momentum/i },
  { label: 'trend following', regex: /trend\s*following/i },
];

const detectStrategyType = (text) =>
  STRATEGY_PATTERNS.find(({ regex }) => regex.test(text || ''))?.label ?? null;

const isCodegenCandidate = (content) => {
  const line = extractStrategyLine(content);
  if (!line) return false;
  return /(strategy|entry|exit|rule|indicator|signal|trade|setup|algorithm|logic)/i.test(
    line
  );
};

const extractStrategyLine = (content) => {
  if (!content) return '';
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  const cleaned = withoutCode
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\r/g, '')
    .trim();
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate =
    lines.find(
      (line) =>
        line.length <= 200 &&
        /(strategy|entry|exit|rule|indicator|signal|trade)/i.test(line)
    ) ||
    lines.find((line) => line.length <= 200) ||
    lines[0] ||
    cleaned;

  const sentence = candidate.split(/(?<=[.?!])\s+/)[0] || candidate;
  return sentence.trim();
};

const getDraftKey = (userId) => `fgpt_mentor_draft_${userId || 'anon'}`;
const getLastConversationKey = (userId) =>
  `fgpt_mentor_last_conversation_${userId || 'anon'}`;
const getAnalysisCacheKey = (userId, key) =>
  `fgpt_mentor_backtest_analysis_${userId || 'anon'}_${key || 'unknown'}`;
const getAnalysisInflightKey = (userId, key) =>
  `fgpt_mentor_backtest_inflight_${userId || 'anon'}_${key || 'unknown'}`;

const STREAM_RENDER_INTERVAL_MS = 16;
const STREAM_RENDER_MAX_PART_SIZE = 24;
const STREAM_RENDER_MAX_BATCH_CHARS = 120;
const STREAM_INACTIVITY_TIMEOUT_MS = 20000;

const splitRenderableStreamChunk = (chunk) => {
  if (!chunk) return [];

  const parts = chunk.match(/\S+\s*|\n+/g);
  if (!parts) {
    return chunk.match(new RegExp(`.{1,${STREAM_RENDER_MAX_PART_SIZE}}`, 'g')) || [chunk];
  }

  return parts.flatMap((part) => {
    if (part.length <= STREAM_RENDER_MAX_PART_SIZE) {
      return [part];
    }
    return part.match(new RegExp(`.{1,${STREAM_RENDER_MAX_PART_SIZE}}`, 'g')) || [part];
  });
};

const takeNextRenderableBatch = (queue) => {
  if (!Array.isArray(queue) || queue.length === 0) return '';

  let batch = '';
  while (queue.length > 0) {
    const nextPart = queue[0];
    if (!nextPart) {
      queue.shift();
      continue;
    }

    if (batch && batch.length + nextPart.length > STREAM_RENDER_MAX_BATCH_CHARS) {
      break;
    }

    batch += queue.shift();
    if (batch.length >= STREAM_RENDER_MAX_BATCH_CHARS) {
      break;
    }
  }

  return batch;
};

const parseStoredMessages = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return normalizeMentorMessageHistory(parsed);
  } catch {
    return [];
  }
};

const normalizeSuggestionList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const readAnalysisCache = (userId, key) => {
  if (!userId || !key || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getAnalysisCacheKey(userId, key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeAnalysisCache = (userId, key, payload) => {
  if (!userId || !key || typeof localStorage === 'undefined') return;
  localStorage.setItem(getAnalysisCacheKey(userId, key), JSON.stringify(payload));
};

const markAnalysisInflight = (userId, key) => {
  if (!userId || !key || typeof localStorage === 'undefined') return;
  localStorage.setItem(getAnalysisInflightKey(userId, key), String(Date.now()));
};

const clearAnalysisInflight = (userId, key) => {
  if (!userId || !key || typeof localStorage === 'undefined') return;
  localStorage.removeItem(getAnalysisInflightKey(userId, key));
};

const isAnalysisInflight = (userId, key, ttlMs = 2 * 60 * 1000) => {
  if (!userId || !key || typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem(getAnalysisInflightKey(userId, key));
  if (!raw) return false;
  const started = Number(raw);
  if (!Number.isFinite(started)) return false;
  if (Date.now() - started > ttlMs) {
    localStorage.removeItem(getAnalysisInflightKey(userId, key));
    return false;
  }
  return true;
};

const updateMentorConversationCache = (userId, entry) => {
  if (!userId || !entry || typeof localStorage === 'undefined') return;
  const cacheKey = getMentorConversationCacheKey(userId);
  let list = [];
  try {
    const raw = localStorage.getItem(cacheKey);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }
  if (!Array.isArray(list)) list = [];

  const existingIndex = list.findIndex(
    (item) => item?.conversation_id === entry.conversation_id
  );
  const nextEntry = {
    ...list[existingIndex],
    ...entry,
  };
  if (existingIndex >= 0) {
    list[existingIndex] = nextEntry;
  } else {
    list.unshift(nextEntry);
  }

  localStorage.setItem(cacheKey, JSON.stringify(list));
};

// ─── Markdown renderer with proper spacing ───────────────────────────────────
const MarkdownComponents = {
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-base font-black text-white mb-4 mt-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-black text-white mb-4 mt-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-yellow-400 mb-2 mt-3">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 pl-4 space-y-1 list-disc list-outside">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 pl-4 space-y-1 list-decimal list-outside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => (
    <hr className="my-5 border-0 h-px bg-white/10" />
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-yellow-500/40 pl-3 my-3 text-gray-400 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
      <table className="min-w-full text-xs text-left text-gray-200">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-gray-400">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/10">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-white/5">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-bold text-gray-300">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-gray-200 align-top">{children}</td>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-300">{children}</em>
  ),
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (match && match[1] === 'mermaid') {
      const diagram = String(children).replace(/\n$/, '');
      return <MermaidBlock diagram={diagram} />;
    }
    return match ? (
      <div className="rounded-lg overflow-hidden my-4 border border-white/10 relative group/code">
        <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
              toast.success('Snippet copied');
            }}
            className="p-1.5 bg-black/50 backdrop-blur-sm rounded-md hover:text-yellow-500 transition-colors text-gray-400"
          >
            <FiCopy size={12} />
          </button>
        </div>
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.75rem',
            backgroundColor: '#0d0d0d',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code
        className="bg-white/10 px-1.5 py-0.5 rounded text-yellow-400 font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    );
  },
};

const shouldRequestDiagram = (text) =>
  /(diagram|chart|flowchart|graph|plot|visual|timeline|mermaid)/i.test(text || '');

const stripDiagramDirective = (text) => {
  if (!text) return text;
  return String(text).replace(
    /\n\nReturn ONLY a Mermaid diagram[\s\S]*$/i,
    ''
  );
};

const MERMAID_KEYWORDS =
  /(gantt|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|pie)/i;
const hasMermaidFence = (text) => /```mermaid[\s\S]*?```/i.test(text || '');
const looksLikeMermaid = (text) => MERMAID_KEYWORDS.test(text || '');

const cleanMermaidLines = (lines) =>
  lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/^mermaid diagram$/i.test(trimmed)) return false;
    if (/^copy$/i.test(trimmed)) return false;
    return true;
  });

const sanitizeMermaidDiagram = (text) => {
  if (!text) return '';
  const cleaned = String(text)
    .replace(/```/g, '')
    .replace(/\r/g, '')
    .trim();
  const lines = cleanMermaidLines(cleaned.split('\n'));
  return lines.join('\n').trim();
};

const simplifyMermaidDiagram = (text) => {
  const raw = sanitizeMermaidDiagram(text);
  if (!raw) return '';
  const lines = raw.split('\n');
  const keep = lines.filter((line) => {
    const t = line.trim();
    if (!t) return false;
    if (/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|journey|pie)\b/i.test(t)) return true;
    if (/^(subgraph|end|direction)\b/i.test(t)) return true;
    if (/^%%/.test(t)) return true;
    if (/-->|---|==>|-.->/.test(t)) return true;
    if (/^\w+[[()]/.test(t)) return true;
    return false;
  });
  return keep.join('\n').trim();
};

const extractMermaidBlock = (text) => {
  if (!text) return { markdown: text, diagram: null };
  const normalized = ensureMermaidFence(text);
  const match = normalized.match(/```mermaid\s*([\s\S]*?)```/i);
  if (!match) return { markdown: normalized, diagram: null };
  const diagram = match[1].trim();
  const markdown = normalized.replace(match[0], '').trim();
  return { markdown, diagram: diagram || null };
};

const ensureMermaidFence = (text) => {
  if (!text || hasMermaidFence(text)) return text;
  if (!looksLikeMermaid(text)) return text;

  const rawLines = String(text).split('\n');
  const lines = cleanMermaidLines(rawLines);
  const startIdx = lines.findIndex((line) => MERMAID_KEYWORDS.test(line));
  if (startIdx === -1) return text;

  const before = lines.slice(0, startIdx).join('\n').trimEnd();
  const diagram = lines.slice(startIdx).join('\n').trimEnd();

  return `${before}\n\n\`\`\`mermaid\n${diagram}\n\`\`\``.trim();
};

const MermaidBlock = ({ diagram }) => {
  const [svgMarkup, setSvgMarkup] = useState('');
  const [renderError, setRenderError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (typeof window === 'undefined') return;
      setSvgMarkup('');
      setRenderError('');
      let mermaid = window.mermaid;
      if (!mermaid?.render) {
        try {
          const mod = await import('mermaid');
          mermaid = mod?.default || mod;
          if (mermaid?.initialize) {
            mermaid.initialize({
              startOnLoad: false,
              theme: 'dark',
              securityLevel: 'loose',
            });
          }
          window.mermaid = mermaid;
        } catch (error) {
          console.error('Mermaid library unavailable:', error);
          setRenderError('Mermaid library failed to load.');
          return;
        }
      }

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const renderFn = mermaid.render;
        const legacyRender = mermaid.mermaidAPI?.render;
        let svg = '';

        const attemptRender = async (source) => {
          const safeSource = sanitizeMermaidDiagram(source);
          if (!safeSource) return '';

          if (mermaid.parse) {
            await mermaid.parse(safeSource);
          }

          if (renderFn) {
            const result = await renderFn.call(mermaid, id, safeSource);
            return typeof result === 'string' ? result : result?.svg || '';
          }

          if (legacyRender) {
            let legacySvg = '';
            await new Promise((resolve) => {
              legacyRender.call(mermaid.mermaidAPI, id, safeSource, (code) => {
                legacySvg = code || '';
                resolve();
              });
            });
            return legacySvg;
          }

          if (mermaid.run) {
            const temp = document.createElement('div');
            temp.style.position = 'absolute';
            temp.style.left = '-9999px';
            temp.style.top = '-9999px';
            temp.innerHTML = `<pre class="mermaid">${safeSource}</pre>`;
            document.body.appendChild(temp);
            try {
              await mermaid.run({ nodes: [temp] });
              const svgEl = temp.querySelector('svg');
              return svgEl ? svgEl.outerHTML : '';
            } finally {
              document.body.removeChild(temp);
            }
          }

          return '';
        };

        svg = await attemptRender(diagram);
        if (!svg) {
          svg = await attemptRender(simplifyMermaidDiagram(diagram));
        }

        if (!svg) {
          setRenderError('Mermaid did not return an SVG.');
          return;
        }
        if (cancelled) return;
        setSvgMarkup(svg);
      } catch (error) {
        console.error('Mermaid render failed:', error);
        setRenderError('Could not render this diagram.');
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [diagram]);

  return (
    <div className="my-4 rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10 flex items-center justify-between">
        <span>Mermaid Diagram</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(diagram);
            toast.success('Diagram copied');
          }}
          className="text-gray-400 hover:text-yellow-500 transition-colors"
        >
          Copy
        </button>
      </div>
      {svgMarkup ? (
        <div
          className="p-4 text-gray-200"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : renderError ? (
        <div className="p-4 text-[11px] text-red-300">{renderError}</div>
      ) : (
        <pre className="p-4 text-[11px] text-gray-300 whitespace-pre-wrap">
          {diagram}
        </pre>
      )}
    </div>
  );
};


const MentorMessages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisMode, setAnalysisMode] = useState(false);
  const [backtestData, setBacktestData] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId !== 'new' ? conversationId : null
  );

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const streamAccumulator = useRef('');
  const streamQueueRef = useRef([]);
  const streamTimerRef = useRef(null);
  const streamFinalizeRef = useRef(false);
  const streamFinalizedRef = useRef(false);
  const streamWatchdogRef = useRef(null);
  const activeConversationIdRef = useRef(activeConversationId);
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;
  const userIdRef = useRef(userId);
  const lastUserPromptRef = useRef('');
  const isMountedRef = useRef(true);
  const analysisKeyRef = useRef(null);
  const analysisRunningRef = useRef(false);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      if (streamWatchdogRef.current) {
        clearTimeout(streamWatchdogRef.current);
        streamWatchdogRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setActiveConversationId(conversationId !== 'new' ? conversationId : null);
  }, [conversationId]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 160);
    el.style.height = `${next}px`;
  }, [newMessage]);

  const primeMentorConversationCache = useCallback((nextId, preview) => {
    if (!nextId || !userIdRef.current || typeof localStorage === 'undefined') return;

    const cacheKey = getMentorConversationCacheKey(userIdRef.current);
    const raw = localStorage.getItem(cacheKey);
    let list = [];
    try {
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
    if (!Array.isArray(list)) list = [];

    const match = list.find(
      (item) =>
        item?.conversation_id === nextId ||
        item?.id === nextId ||
        item?.conversationId === nextId
    );

    const now = new Date().toISOString();
    const nextItem = {
      ...(match || {}),
      conversation_id: nextId,
      preview: match?.preview || preview || 'AI Conversation',
      started_at: match?.started_at || match?.created_at || now,
      updated_at: now,
      message_count: Math.max(match?.message_count || 0, 1),
    };

    const nextList = [
      nextItem,
      ...list.filter(
        (item) =>
          !(
            item?.conversation_id === nextId ||
            item?.id === nextId ||
            item?.conversationId === nextId
          )
      ),
    ];

    localStorage.setItem(cacheKey, JSON.stringify(nextList));
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId || !userId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      if (conversationId === 'new') {
        setMessages(
          parseStoredMessages(localStorage.getItem(getDraftKey(userId)))
        );
        setLoading(false);
        return;
      }

      if (location.state?.skipFetch) {
        setLoading(false);
        return;
      }

      const cacheKey = `fgpt_mentor_history_${conversationId}`;
      const cachedHistory = parseStoredMessages(localStorage.getItem(cacheKey));

      try {
        setErrorMessage('');
        const res = await getConversationHistory(conversationId, userId);
        const history = normalizeMentorMessageHistory(res.history);
        const nextHistory = history.length > 0 ? history : cachedHistory;
        setMessages(nextHistory);
        localStorage.setItem(cacheKey, JSON.stringify(nextHistory));
        localStorage.setItem(getLastConversationKey(userId), conversationId);
      } catch (error) {
        logError('Mentor history load failed:', error);
        if (cachedHistory.length > 0) {
          setMessages(cachedHistory);
        } else {
          toast.error(normalizeError(error, { fallback: 'Failed to load history.' }));
        }
        setErrorMessage(
          normalizeError(error, { fallback: 'Failed to load conversation. Please try again.' })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [conversationId, userId]);

  useEffect(() => {
    if (!userId) return;
    const draftKey = getDraftKey(userId);
    if (conversationId === 'new') {
      localStorage.setItem(draftKey, JSON.stringify(messages));
      return;
    }
    localStorage.removeItem(draftKey);
  }, [conversationId, messages, userId]);

  useEffect(() => {
    if (
      location.state?.prefilledQuestion &&
      conversationId === 'new' &&
      !messages.length
    ) {
      setNewMessage((current) => current || location.state.prefilledQuestion);
    }
  }, [conversationId, location.state, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, sending, streamingContent]);

  useEffect(() => {
    if (analysisMode && sending && messages.length > 0) {
      setSending(false);
    }
  }, [analysisMode, messages.length, sending]);

  useEffect(() => {
    if (!sending) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant') {
      setSending(false);
    }
  }, [messages, sending]);

  useEffect(() => {
    let state = location.state;
    if (!state?.mode && typeof localStorage !== 'undefined' && userId) {
      const pendingKey = `fgpt_mentor_backtest_pending_${userId || 'anon'}`;
      const raw = localStorage.getItem(pendingKey);
      if (raw) {
        try {
          state = JSON.parse(raw);
          localStorage.removeItem(pendingKey);
        } catch {
          // ignore
        }
      }
    }
    const incomingResults = state?.metricsForMentor || state?.results;
    const incomingStrategyType = state?.strategyType || state?.metricsForMentor?.strategy_name;
    const incomingStrategyCode =
      state?.strategyCode ||
      state?.metricsForMentor?.custom_code ||
      state?.results?.custom_code ||
      '';
    const nextBacktestData = {
      ...state,
      strategyType: incomingStrategyType,
      strategyCode: incomingStrategyCode,
      results: incomingResults,
    };

    if (!userId || state?.mode !== 'analyze' || !incomingResults) {
      return;
    }

    setBacktestData(nextBacktestData);

    if (location.state?.mode === 'analyze') {
      navigate(location.pathname, { replace: true, state: null });
    }

    const analysisKey =
      state?.backtestId ||
      incomingResults?.backtest_id ||
      `${incomingStrategyType || 'analysis'}-${incomingResults?.pair || ''}-${incomingResults?.start_date || ''}-${incomingResults?.end_date || ''}`;
    if (analysisKeyRef.current === analysisKey) return;
    analysisKeyRef.current = analysisKey;

    let cancelled = false;

    if (analysisRunningRef.current) return;

    if (isAnalysisInflight(userId, analysisKey)) {
      return;
    }

    const cached = readAnalysisCache(userId, analysisKey);
    if (cached?.analysis) {
      if (state?.skipToImprovement && incomingStrategyCode) {
        navigate('/dashboard/codegen/session/new', {
          state: {
            mode: 'improve',
            originalCode: incomingStrategyCode,
            backtestResults: incomingResults || {},
            mentorAnalysis: cached.analysis || '',
            educationalAnalysis: cached.educational_analysis || cached.analysis || '',
            improvementSuggestions: normalizeSuggestionList(
              cached.improvement_suggestions
            ),
            strategyConfig: cached.strategy_config || null,
            strategyName:
              cached.strategy_name || incomingStrategyType || incomingResults?.strategy_name || '',
            codeId: cached.code_id || null,
            fromBacktest: true,
          },
        });
        return;
      }
      if (cached.conversation_id) {
        activeConversationIdRef.current = cached.conversation_id;
        setActiveConversationId(cached.conversation_id);
        localStorage.setItem(getLastConversationKey(userId), cached.conversation_id);
        if (conversationId === 'new') {
          navigate(`/dashboard/mentor/messages/${cached.conversation_id}`, {
            replace: true,
          });
        }
      }
      if (isMountedRef.current) {
        setSending(false);
        setAnalysisMode(false);
      }
      return;
    }

    const runBacktestAnalysis = async () => {
      setAnalysisMode(true);
      setSending(true);
      analysisRunningRef.current = true;
      markAnalysisInflight(userId, analysisKey);

      try {
        const data = await analyzeBacktest({
          user_id: userId,
          strategy_type: incomingStrategyType,
          strategy_code: incomingStrategyCode || null,
          results: incomingResults,
        });

        const analysisContent =
          data?.analysis ||
          data?.educational_analysis ||
          (data?.verdict || data?.explanation
            ? `**${data.verdict || 'Analysis'}**\n\n${data.explanation || ''}`
            : '');
        const nextConversationId = data?.conversation_id || null;
        const nextSuggestions = normalizeSuggestionList(data?.improvement_suggestions);


        setMessages((prev) => {
          const nextTimestamp = data?.timestamp || new Date().toISOString();
          const nextId = `${nextConversationId || 'analysis'}-${nextTimestamp}`;
          const alreadyExists = prev.some(
            (msg) =>
              msg?.role === 'assistant' &&
              msg?.timestamp === nextTimestamp &&
              (msg?.id === nextId ||
                msg?.content === analysisContent)
          );
          if (alreadyExists) return prev;
          return [
            ...prev,
            {
              id: nextId,
              role: 'assistant',
              content: analysisContent || 'Analysis completed, but no details were returned.',
              code_id: data?.code_id || null,
              strategy_name: data?.strategy_name || incomingStrategyType || null,
              strategy_config: data?.strategy_config || null,
              educational_analysis:
                data?.educational_analysis || analysisContent || null,
              improvement_suggestions: nextSuggestions,
              timestamp: nextTimestamp,
            },
          ];
        });

        if (conversationId && conversationId !== 'new') {
          const nextTimestamp = data?.timestamp || new Date().toISOString();
          const nextId = `${nextConversationId || 'analysis'}-${nextTimestamp}`;
          const nextEntry = {
            id: nextId,
            role: 'assistant',
            content: analysisContent || 'Analysis completed, but no details were returned.',
            code_id: data?.code_id || null,
            strategy_name: data?.strategy_name || incomingStrategyType || null,
            strategy_config: data?.strategy_config || null,
            educational_analysis:
              data?.educational_analysis || analysisContent || null,
            improvement_suggestions: nextSuggestions,
            timestamp: nextTimestamp,
          };
          const nextHistory = messages.some(
            (msg) =>
              msg?.role === 'assistant' &&
              msg?.timestamp === nextTimestamp &&
              (msg?.id === nextId || msg?.content === nextEntry.content)
          )
            ? messages
            : [...messages, nextEntry];
          localStorage.setItem(
            `fgpt_mentor_history_${conversationId}`,
            JSON.stringify(nextHistory)
          );
        }


        if (isMountedRef.current) {
          setSending(false);
          setAnalysisMode(false);
        }

        if (nextConversationId) {
          activeConversationIdRef.current = nextConversationId;
          setActiveConversationId(nextConversationId);
          localStorage.setItem(getLastConversationKey(userId), nextConversationId);
        }

        if (nextConversationId) {
          const preview =
            lastUserPromptRef.current || analysisContent || 'Backtest analysis';
          updateMentorConversationCache(userId, {
            conversation_id: nextConversationId,
            preview,
            started_at: data?.timestamp || new Date().toISOString(),
            updated_at: data?.timestamp || new Date().toISOString(),
            message_count: 1,
            is_backtest: true,
          });
          window.dispatchEvent(new Event('fgpt-mentor-history-updated'));

          // Also refresh from backend in the background so sidebar stays in sync.
          (async () => {
            try {
              await getConversations(userId);
            } catch (error) {
              logError('Mentor history refresh failed:', error);
            } finally {
              window.dispatchEvent(new Event('fgpt-mentor-history-updated'));
            }
          })();
        }

        writeAnalysisCache(userId, analysisKey, {
          analysis: analysisContent || 'Analysis completed, but no details were returned.',
          conversation_id: nextConversationId,
          code_id: data?.code_id || null,
          strategy_name: data?.strategy_name || incomingStrategyType || null,
          strategy_config: data?.strategy_config || null,
          educational_analysis:
            data?.educational_analysis || analysisContent || null,
          improvement_suggestions: nextSuggestions,
          timestamp: data?.timestamp || new Date().toISOString(),
        });

        if (state?.skipToImprovement && incomingStrategyCode) {
          navigate('/dashboard/codegen/session/new', {
            state: {
              mode: 'improve',
              originalCode: incomingStrategyCode,
              backtestResults: incomingResults || {},
              mentorAnalysis: analysisContent || '',
              educationalAnalysis:
                data?.educational_analysis || analysisContent || '',
              improvementSuggestions: nextSuggestions,
              strategyConfig: data?.strategy_config || null,
              strategyName:
                data?.strategy_name || incomingStrategyType || incomingResults?.strategy_name || '',
              codeId: data?.code_id || null,
              fromBacktest: true,
            },
          });
          return;
        }
        clearAnalysisInflight(userId, analysisKey);
      } catch (error) {
        if (!cancelled) {
          logError('Mentor analysis failed:', error);
          toast.error(normalizeError(error, { fallback: 'Analysis failed.' }));
        }
        clearAnalysisInflight(userId, analysisKey);
        if (isMountedRef.current) {
          setSending(false);
          setAnalysisMode(false);
        }
      } finally {
        clearAnalysisInflight(userId, analysisKey);
        analysisRunningRef.current = false;
        if (isMountedRef.current) {
          setSending(false);
          setAnalysisMode(false);
        }
      }
    };

    runBacktestAnalysis();
    return () => {
      cancelled = true;
      if (isMountedRef.current) {
        setSending(false);
      }
    };
  }, [conversationId, location.state, userId]);

  const handleCopy = async (text, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (error) {
      logError('Copy failed:', error);
      toast.error(normalizeError(error, { fallback: 'Could not copy.' }));
    }
  };

  // ─── Streaming send ────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending || !userId) return;

    const userContent = newMessage.trim();
    const requestContent = shouldRequestDiagram(userContent)
      ? `${userContent}\n\nReturn ONLY a Mermaid diagram in a \`\`\`mermaid\`\`\` code block. Use FLOWCHART syntax only and keep it valid Mermaid (no extra commentary or data blocks).`
      : userContent;
    lastUserPromptRef.current = userContent;
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];
      if (conversationId && conversationId !== 'new') {
        localStorage.setItem(
          `fgpt_mentor_history_${conversationId}`,
          JSON.stringify(next)
        );
      }
      return next;
    });

    setNewMessage('');
    setSending(true);
    setStreamingContent('');
    streamAccumulator.current = '';
    streamQueueRef.current = [];
    streamFinalizeRef.current = false;
    streamFinalizedRef.current = false;
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    if (streamWatchdogRef.current) {
      clearTimeout(streamWatchdogRef.current);
      streamWatchdogRef.current = null;
    }

    const currentConvId = activeConversationId;

    const enqueueChunk = (chunk) => {
      if (!chunk) return;
      const parts = splitRenderableStreamChunk(chunk);
      streamQueueRef.current.push(...parts);
      if (!streamTimerRef.current) {
        streamTimerRef.current = setInterval(() => {
          if (!isMountedRef.current) return;
          const nextBatch = takeNextRenderableBatch(streamQueueRef.current);
          if (nextBatch) {
            setStreamingContent((prev) => prev + nextBatch);
          }
          if (streamQueueRef.current.length === 0 && streamFinalizeRef.current) {
            if (streamTimerRef.current) {
              clearInterval(streamTimerRef.current);
              streamTimerRef.current = null;
            }
            if (!streamFinalizedRef.current) {
              streamFinalizedRef.current = true;
              const finalContent =
                streamAccumulator.current || 'No response returned.';
              const assistantMessage = {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content: finalContent,
                timestamp: new Date().toISOString(),
              };

              setMessages((prev) => {
                const next = [...prev, assistantMessage];
                const targetId =
                  activeConversationIdRef.current || currentConvId || conversationId;
                if (targetId && targetId !== 'new') {
                  localStorage.setItem(
                    `fgpt_mentor_history_${targetId}`,
                    JSON.stringify(next)
                  );
                }
                return next;
              });

              setStreamingContent('');
              streamAccumulator.current = '';
              setSending(false);

              if (typeof window !== 'undefined' && conversationId === 'new') {
                (async () => {
                  try {
                    if (activeConversationIdRef.current) {
                      primeMentorConversationCache(
                        activeConversationIdRef.current,
                        lastUserPromptRef.current
                      );
                    }
                    if (userIdRef.current) {
                      await getConversations(userIdRef.current);
                    }
                  } catch (error) {
                    logError('Failed to refresh mentor history:', error);
                  } finally {
                    window.dispatchEvent(new Event('fgpt-mentor-history-updated'));
                  }
                })();
              }

              if (conversationId === 'new') {
                localStorage.removeItem(getDraftKey(userId));
                if (activeConversationIdRef.current) {
                  localStorage.setItem(
                    getLastConversationKey(userId),
                    activeConversationIdRef.current
                  );
                  navigate(`/dashboard/mentor/messages/${activeConversationIdRef.current}`, {
                    replace: true,
                    state: { skipFetch: true },
                  });
                }
              }
            }
          }
        }, STREAM_RENDER_INTERVAL_MS);
      }
    };

    const resetStreamWatchdog = () => {
      if (streamWatchdogRef.current) {
        clearTimeout(streamWatchdogRef.current);
      }
      streamWatchdogRef.current = setTimeout(() => {
        if (!streamFinalizedRef.current) {
          finalizeForce();
        }
      }, STREAM_INACTIVITY_TIMEOUT_MS);
    };

    const finalizeIfIdle = () => {
      streamFinalizeRef.current = true;
      if (streamWatchdogRef.current) {
        clearTimeout(streamWatchdogRef.current);
        streamWatchdogRef.current = null;
      }
      if (streamQueueRef.current.length === 0 && !streamFinalizedRef.current) {
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        streamFinalizedRef.current = true;
        const finalContent = streamAccumulator.current || 'No response returned.';
        const assistantMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: finalContent,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => {
          const next = [...prev, assistantMessage];
          const targetId =
            activeConversationIdRef.current || currentConvId || conversationId;
          if (targetId && targetId !== 'new') {
            localStorage.setItem(
              `fgpt_mentor_history_${targetId}`,
              JSON.stringify(next)
            );
          }
          return next;
        });

        setStreamingContent('');
        streamAccumulator.current = '';
        setSending(false);

        if (typeof window !== 'undefined' && conversationId === 'new') {
          (async () => {
            try {
              if (activeConversationIdRef.current) {
                primeMentorConversationCache(
                  activeConversationIdRef.current,
                  lastUserPromptRef.current
                );
              }
              if (userIdRef.current) {
                await getConversations(userIdRef.current);
              }
            } catch (error) {
              logError('Failed to refresh mentor history:', error);
            } finally {
              window.dispatchEvent(new Event('fgpt-mentor-history-updated'));
            }
          })();
        }

        if (conversationId === 'new') {
          localStorage.removeItem(getDraftKey(userId));
          if (activeConversationIdRef.current) {
            localStorage.setItem(
              getLastConversationKey(userId),
              activeConversationIdRef.current
            );
            navigate(`/dashboard/mentor/messages/${activeConversationIdRef.current}`, {
              replace: true,
              state: { skipFetch: true },
            });
          }
        }
      }
    };

    const finalizeForce = () => {
      streamQueueRef.current = [];
      streamFinalizeRef.current = true;
      finalizeIfIdle();
    };

    resetStreamWatchdog();

    streamMentorResponse({
      question: requestContent,
      conversationId: currentConvId,
      userId,
      onConversationId: (nextId) => {
        if (!nextId || nextId === activeConversationIdRef.current) return;
        activeConversationIdRef.current = nextId;
        setActiveConversationId(nextId);
        primeMentorConversationCache(nextId, lastUserPromptRef.current);
      },
      onChunk: (chunk) => {
        resetStreamWatchdog();
        streamAccumulator.current += chunk;
        enqueueChunk(chunk);
      },
      onDone: () => {
        if (streamWatchdogRef.current) {
          clearTimeout(streamWatchdogRef.current);
          streamWatchdogRef.current = null;
        }
        streamFinalizeRef.current = true;
        if (!streamTimerRef.current) {
          streamTimerRef.current = setInterval(() => {
            if (!isMountedRef.current) return;
            const nextBatch = takeNextRenderableBatch(streamQueueRef.current);
            if (nextBatch) {
              setStreamingContent((prev) => prev + nextBatch);
            }
            if (streamQueueRef.current.length === 0 && streamFinalizeRef.current) {
              if (streamTimerRef.current) {
                clearInterval(streamTimerRef.current);
                streamTimerRef.current = null;
              }
              if (!streamFinalizedRef.current) {
                streamFinalizedRef.current = true;
                const finalContent =
                  streamAccumulator.current || 'No response returned.';
                const assistantMessage = {
                  id: `${Date.now()}-assistant`,
                  role: 'assistant',
                  content: finalContent,
                  timestamp: new Date().toISOString(),
                };

                setMessages((prev) => {
                  const next = [...prev, assistantMessage];
                  const targetId =
                    activeConversationIdRef.current || currentConvId || conversationId;
                  if (targetId && targetId !== 'new') {
                    localStorage.setItem(
                      `fgpt_mentor_history_${targetId}`,
                      JSON.stringify(next)
                    );
                  }
                  return next;
                });

                setStreamingContent('');
                streamAccumulator.current = '';
                setSending(false);

                if (typeof window !== 'undefined' && conversationId === 'new') {
                  (async () => {
                    try {
                      if (activeConversationIdRef.current) {
                        primeMentorConversationCache(
                          activeConversationIdRef.current,
                          lastUserPromptRef.current
                        );
                      }
                      if (userIdRef.current) {
                        await getConversations(userIdRef.current);
                      }
                    } catch (error) {
                      logError('Failed to refresh mentor history:', error);
                    } finally {
                      window.dispatchEvent(new Event('fgpt-mentor-history-updated'));
                    }
                  })();
                }

                if (conversationId === 'new') {
                  localStorage.removeItem(getDraftKey(userId));
                  if (activeConversationIdRef.current) {
                    localStorage.setItem(
                      getLastConversationKey(userId),
                      activeConversationIdRef.current
                    );
                    navigate(`/dashboard/mentor/messages/${activeConversationIdRef.current}`, {
                      replace: true,
                      state: { skipFetch: true },
                    });
                  }
                }
              }
            }
          }, STREAM_RENDER_INTERVAL_MS);
        }
        finalizeIfIdle();
      },
      onError: (err) => {
        logError('Mentor stream failed:', err);
        const msg = normalizeError(err, {
          fallback: 'Failed to send message. Please try again.',
        });
        toast.error(msg);
        setErrorMessage(msg);
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setStreamingContent('');
        streamAccumulator.current = '';
        streamQueueRef.current = [];
        streamFinalizeRef.current = false;
        streamFinalizedRef.current = false;
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        if (streamWatchdogRef.current) {
          clearTimeout(streamWatchdogRef.current);
          streamWatchdogRef.current = null;
        }
        setSending(false);
      },
    });
  }, [newMessage, sending, userId, conversationId, activeConversationId]);

  const handleGenerateCode = (content) => {
    // Build a concise prompt instead of dumping the full response
    const strategyType = detectStrategyType(content) || 'trading';
    const extractedLine = extractStrategyLine(content);
    const truncated =
      extractedLine.length > 220
        ? extractedLine.slice(0, 220).replace(/\s+\S*$/, '') + '...'
        : extractedLine;
    const prompt = `Create a ${strategyType} strategy based on: ${truncated}`;

    navigate('/dashboard/codegen/session/new', {
      state: {
        fromMentor: true,
        strategyType,
        context: content,
        strategyText: prompt,
      },
    });
  };

  const handleImproveStrategy = async (message = messages[messages.length - 1]) => {
    const strategyCodeFromBacktest =
      backtestData?.strategyCode ||
      backtestData?.results?.custom_code ||
      backtestData?.code ||
      '';
    const codeId = message?.code_id || backtestData?.code_id || null;
    let strategyCode = strategyCodeFromBacktest;

    if (!strategyCode && codeId && userId) {
      try {
        const detail = await getGeneratedCodeDetail(codeId, userId);
        strategyCode =
          detail?.code ||
          detail?.generated_code ||
          detail?.python_code ||
          detail?.strategy_code ||
          '';
      } catch (error) {
        logError('Failed to load source strategy code:', error);
      }
    }

    if (!strategyCode) {
      toast.error('No strategy code is available to improve.');
      return;
    }

    navigate('/dashboard/codegen/session/new', {
      state: {
        mode: 'improve',
        originalCode: strategyCode,
        backtestResults:
          backtestData?.results ||
          (message?.strategy_name ? { strategy_name: message.strategy_name } : {}),
        mentorAnalysis:
          message?.educational_analysis ||
          message?.content ||
          messages[messages.length - 1]?.content ||
          '',
        educationalAnalysis: message?.educational_analysis || '',
        improvementSuggestions: normalizeSuggestionList(
          message?.improvement_suggestions
        ),
        strategyConfig: message?.strategy_config || backtestData?.strategy_config || null,
        strategyName:
          message?.strategy_name ||
          backtestData?.strategyType ||
          backtestData?.results?.strategy_name ||
          '',
        codeId,
      },
    });
  };

  const hasMessages = messages.length > 0 || sending;
  const mentorSuggestions = [
    'Explain a simple mean-reversion setup for EUR/USD using RSI.',
    'Design a trend-following strategy with moving averages and ATR stops.',
    'How should I size positions with 2% risk per trade?',
    'Summarize what my backtest metrics say about risk and drawdown.',
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (!hasMessages) {
      root.classList.add('no-dashboard-scroll');
      root.classList.remove('has-dashboard-messages');
    } else {
      root.classList.remove('no-dashboard-scroll');
      root.classList.add('has-dashboard-messages');
    }

    return () => {
      root.classList.remove('no-dashboard-scroll');
      root.classList.remove('has-dashboard-messages');
    };
  }, [hasMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full flex-1 bg-black/20 backdrop-blur-sm border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="bg-white/[0.02] border-b border-white/5 p-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <FiCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Mentor Intelligence
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  AI Node Active • {messages.length} Exchanges
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-yellow-500 hover:border-yellow-500/30 transition-all"
          >
            <FiDownload /> Export Logs
          </button>
        </div>
      </div>

      {/* Messages area — grows; centers content when empty */}
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 p-3 custom-scrollbar ${
          !hasMessages
            ? 'flex flex-col items-center justify-center overflow-hidden'
            : 'space-y-3 overflow-y-auto'
        }`}
      >
        {errorMessage && (
          <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold px-4 py-3 mb-4">
            {errorMessage}
          </div>
        )}

        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center w-full max-w-2xl">
            <div className="flex flex-col items-center justify-center opacity-30">
              <FiZap size={48} className="text-yellow-500 mb-4" />
              <p className="font-black uppercase tracking-[0.3em] text-xs">
                Awaiting Input Query
              </p>
            </div>
            <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mentorSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setNewMessage(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-400 hover:text-white hover:border-yellow-500/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {messages.map((message, idx) => {
              const showGenerateCode =
                message.role === 'assistant' &&
                Boolean(detectStrategyType(message.content)) &&
                isCodegenCandidate(message.content);
              const showImproveStrategy =
                message.role === 'assistant' &&
                idx === messages.length - 1 &&
                Boolean(
                  backtestData?.strategyCode ||
                  backtestData?.results?.custom_code ||
                  backtestData?.code ||
                  message?.code_id
                );

              return (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id || idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 transition-all ${
                      message.role === 'user'
                        ? 'bg-yellow-600 text-black font-bold shadow-lg shadow-black/20'
                        : 'bg-white/[0.03] border border-white/5 text-gray-200'
                    }`}
                  >
                    {(() => {
                      const { markdown, diagram } = extractMermaidBlock(message.content);
                      return (
                        <div className="text-sm leading-relaxed max-w-none">
                          {diagram && <MermaidBlock diagram={diagram} />}
                          {markdown && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                        {message.role === 'user' ? stripDiagramDirective(markdown) : markdown}
                      </ReactMarkdown>
                          )}
                        </div>
                      );
                    })()}

                    {(showGenerateCode || showImproveStrategy) && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {showGenerateCode && (
                          <button
                            type="button"
                            onClick={() => handleGenerateCode(message.content)}
                            className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                          >
                            Generate Code
                          </button>
                        )}
                        {showImproveStrategy && (
                          <button
                            type="button"
                            onClick={() => handleImproveStrategy(message)}
                            className="px-4 py-2 rounded-lg bg-green-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                          >
                            Improve Strategy
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`mt-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-tighter ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-600'
                      }`}
                    >
                      <span>{formatLongDateTime(message.timestamp)}</span>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(message.content, 'Message copied')}
                            className="hover:text-yellow-500"
                          >
                            <FiCopy />
                          </button>
                          <button type="button" className="hover:text-yellow-500">
                            <FiThumbsUp />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Motion.div>
              );
            })}

            {/* Live streaming bubble */}
            {sending && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  {streamingContent ? (
                    <>
                      {(() => {
                        const { markdown, diagram } = extractMermaidBlock(streamingContent);
                        return (
                          <div className="text-sm leading-relaxed text-gray-200 max-w-none">
                            {diagram && <MermaidBlock diagram={diagram} />}
                            {markdown && (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {markdown}
                              </ReactMarkdown>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce" />
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
              </Motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input — at bottom when messages exist, centered when empty */}
      <div className={`${hasMessages ? 'sticky bottom-0 z-10 p-6 bg-white/[0.02] border-t border-white/5 flex-shrink-0' : 'p-6 bg-white/[0.02] border-t border-white/5 flex-shrink-0'}`}>
        <div className="relative group w-full">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            placeholder="Input market analysis query..."
            ref={inputRef}
            rows={1}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-sm text-white focus:outline-none focus:border-yellow-500/30 transition-all font-medium placeholder-gray-600 disabled:opacity-50 resize-none overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:grayscale shadow-lg shadow-yellow-500/20"
          >
            <FiSend size={18} />
          </button>
        </div>
        {hasMessages && (
          <div className="mt-3 flex items-center justify-center gap-6">
            <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
              <FiZap className="text-yellow-500" /> High-Compute Node
            </span>
            <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1">
              <FiClock className="text-yellow-500" /> Real-time Knowledge
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorMessages;
