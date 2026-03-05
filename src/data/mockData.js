

// Activity Log Mock Data
export const mockActivityLog = [
  {
    id: "act1",
    user_id: "1",
    action: "signal_extracted",
    entity_type: "signal",
    entity_id: "sig1",
    metadata: {
      source_type: "central_bank",
      sentiment: "hawkish",
      pair: "EUR/USD"
    },
    created_at: "2024-03-15T08:30:00Z"
  },
  {
    id: "act2",
    user_id: "1",
    action: "backtest_completed",
    entity_type: "backtest",
    entity_id: "bt1",
    metadata: {
      pair: "EUR/USD",
      sharpe: 1.23,
      trades: 86
    },
    created_at: "2024-03-15T10:00:00Z"
  }
];

// Stats Mock Data
export const mockStats = {
  mentorQuestions: 234,
  quantQuestions: 156,
  signalsExtracted: 89,
  strategiesGenerated: 45,
  backtestsRun: 67,
  winRate: 68.5,
  totalProfit: 12450
};

// Backtest Trades Mock Data
export const mockBacktestTrades = [
  {
    id: "trade1",
    backtest_id: "bt1",
    user_id: "1",
    trade_number: 1,
    direction: "long",
    entry_time: "2024-01-02T08:00:00Z",
    exit_time: "2024-01-02T16:00:00Z",
    entry_price: 1.12345,
    exit_price: 1.12890,
    lot_size: 1.0,
    pnl_pips: 44.5,
    pnl_usd: 445.00,
    duration_hours: 8
  },
  {
    id: "trade2",
    backtest_id: "bt1",
    user_id: "1",
    trade_number: 2,
    direction: "short",
    entry_time: "2024-01-03T10:00:00Z",
    exit_time: "2024-01-03T18:00:00Z",
    entry_price: 1.12890,
    exit_price: 1.12500,
    lot_size: 1.5,
    pnl_pips: 39.0,
    pnl_usd: 585.00,
    duration_hours: 8
  }
];

// Backtests Mock Data
export const mockBacktests = [
  {
    id: "bt1",
    user_id: "1",
    strategy_id: "strat1",
    pair: "EUR/USD",
    start_date: "2024-01-01",
    end_date: "2024-03-01",
    timeframe: "H1",
    initial_capital: 10000,
    status: "completed",
    total_return_pct: 4.3,
    sharpe_ratio: 1.23,
    sortino_ratio: 1.89,
    calmar_ratio: 2.05,
    max_drawdown_pct: -2.1,
    win_rate_pct: 58.5,
    profit_factor: 1.52,
    total_trades: 86,
    is_saved: true,
    created_at: "2024-03-15T10:00:00Z"
  }
];

// Mentor Conversations Mock Data
export const mockMentorConversations = [
  {
    id: "conv1",
    user_id: "1",
    title: "Understanding Central Bank Policies",
    topic_tags: ["central_bank", "monetary_policy", "interest_rates"],
    difficulty: "intermediate",
    message_count: 12,
    is_archived: false,
    last_message_at: "2024-03-15T14:30:00Z",
    created_at: "2024-03-14T10:00:00Z"
  },
  {
    id: "conv2",
    user_id: "1",
    title: "Technical Analysis Patterns",
    topic_tags: ["technical_analysis", "chart_patterns", "indicators"],
    difficulty: "beginner",
    message_count: 8,
    is_archived: false,
    last_message_at: "2024-03-15T09:15:00Z",
    created_at: "2024-03-13T16:20:00Z"
  }
];

// Profiles Mock Data
export const mockProfiles = [
  {
    id: "1",
    email: "john.doe@example.com",
    display_name: "John Doe",
    experience_level: "advanced",
    preferred_pairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
    timezone: "America/New_York",
    mentor_questions_asked: 234,
    quant_questions_asked: 156,
    signals_extracted: 89,
    strategies_generated: 45,
    backtests_run: 67,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-03-15T10:30:00Z"
  }
];

// Quant Messages Mock Data
export const mockQuantMessages = [
  {
    id: "qmsg1",
    session_id: "quant1",
    user_id: "1",
    role: "user",
    content: "How do I calculate Value at Risk for a currency pair portfolio?",
    contains_formula: true,
    formula_latex: ["VaR_{\\alpha} = \\mu - \\sigma \\cdot z_{\\alpha}"],
    contains_code: true,
    code_snippets: ["def calculate_var(returns, confidence_level):\n    import numpy as np\n    mean = np.mean(returns)\n    std = np.std(returns)\n    z_score = {0: 1.645, 0.95: 1.96, 0.99: 2.576}\n    return mean - std * z_score[confidence_level]"],
    model_used: "claude-3",
    tokens_used: 320,
    created_at: "2024-03-15T11:20:00Z"
  },
  {
    id: "qmsg2",
    session_id: "quant1",
    user_id: "1",
    role: "assistant",
    content: "Value at Risk (VaR) measures the potential loss in value of a portfolio over a defined period. Here's how to calculate it...",
    contains_formula: true,
    formula_latex: ["VaR_{95\\%} = -1.645 \\sigma + \\mu"],
    model_used: "claude-3",
    tokens_used: 450,
    created_at: "2024-03-15T11:21:00Z"
  }
];

// Quant Sessions Mock Data
export const mockQuantSessions = [
  {
    id: "quant1",
    user_id: "1",
    title: "VAR Calculation for FX Portfolio",
    topic_tags: ["risk_models", "var", "portfolio"],
    quant_domain: "risk_models",
    difficulty: "advanced",
    message_count: 15,
    is_archived: false,
    last_message_at: "2024-03-15T11:20:00Z",
    created_at: "2024-03-12T08:00:00Z"
  }
];

// Recent Activity Mock Data
export const recentActivity = [
  {
    description: "New signal extracted from Fed minutes",
    time: "2 hours ago",
    type: "signal",
    badge: "success",
    color: "green"
  },
  {
    description: "Strategy validation passed for mean reversion",
    time: "5 hours ago",
    type: "strategy",
    badge: "info",
    color: "blue"
  },
  {
    description: "Backtest completed for EUR/USD",
    time: "1 day ago",
    type: "backtest",
    badge: "warning",
    color: "yellow"
  }
];

// Signals Mock Data
export const mockSignals = [
  {
    id: "sig1",
    user_id: "1",
    source_text: "The Fed remains committed to its tightening cycle...",
    source_type: "central_bank",
    source_label: "Fed FOMC Minutes - March 2024",
    base_currency: "USD",
    signal: true,
    direction: "long",
    magnitude: "strong",
    currency_pair: ["EUR/USD"],
    confidence: 0.85,
    reasoning: "Hawkish Fed stance suggests USD strength",
    time_horizon: "short_term",
    is_saved: true,
    created_at: "2024-03-15T08:30:00Z"
  }
];

// Strategies Mock Data
export const mockStrategies = [
  {
    id: "strat1",
    user_id: "1",
    name: "EUR/USD Mean Reversion",
    description: "Mean reversion strategy for EUR/USD using RSI and Bollinger Bands",
    strategy_type: "mean_reversion",
    target_pairs: ["EUR/USD"],
    timeframe: "H1",
    risk_per_trade: 1.0,
    code: "def generate_signals(data):\n    rsi = calculate_rsi(data, 14)\n    bb_upper, bb_lower = calculate_bollinger_bands(data, 20)\n    \n    long_signals = (rsi < 30) & (data['close'] < bb_lower)\n    short_signals = (rsi > 70) & (data['close'] > bb_upper)\n    \n    return long_signals, short_signals",
    parameters: {
      rsi_period: 14,
      rsi_oversold: 30,
      rsi_overbought: 70,
      bb_period: 20,
      bb_std: 2
    },
    complexity: "intermediate",
    sandbox_passed: true,
    is_saved: true,
    version: 2,
    created_at: "2024-03-14T15:45:00Z"
  }
];

// Mentor Messages Mock Data
export const mockMentorMessages = [
  {
    id: "msg1",
    conversation_id: "conv1",
    user_id: "1",
    role: "user",
    content: "Can you explain how Fed policy affects EUR/USD?",
    topic_tags: ["fed", "monetary_policy", "eur/usd"],
    related_concepts: ["interest_rate_differentials", "monetary_policy"],
    follow_up_questions: ["What about ECB policy?"],
    model_used: "gpt-4",
    tokens_used: 150,
    thumbs_up: true,
    created_at: "2024-03-15T14:30:00Z"
  },
  {
    id: "msg2",
    conversation_id: "conv1",
    user_id: "1",
    role: "assistant",
    content: "The Fed's monetary policy directly impacts the USD's strength. When the Fed raises rates, it typically strengthens the USD as higher yields attract foreign investment...",
    topic_tags: ["fed", "interest_rates", "usd"],
    related_concepts: ["interest_rate_parity", "capital_flows"],
    follow_up_questions: ["How does this affect other pairs?", "What's the typical lag time?"],
    model_used: "gpt-4",
    tokens_used: 245,
    thumbs_up: null,
    created_at: "2024-03-15T14:31:00Z"
  }
];
