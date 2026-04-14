/**
 * Institutional-Grade Forex Playback Engine
 * Controls time, price interpolation, and execution latency.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

const parsePlaybackTimestamp = (value) => {
    if (!value) return NaN;

    const raw = String(value).replace(' ', 'T');
    const normalized = raw.includes('Z') || /[+-]\d\d:\d\d$/.test(raw)
        ? raw
        : `${raw}Z`;
    return new Date(normalized).getTime();
};

export class ForexPlaybackEngine {
    constructor(candlestickData, equityData, trades, options = {}) {
        this.candlestickData = candlestickData || [];
        this.equityData = equityData || [];
        this.trades = trades || [];

        this.speed = options.speed || 1;
        this.executionDelay = options.executionDelay || 120;

        this.pointer = 0;
        this.isPlaying = false;
        this.isComplete = false;

        this.onTick = null;
        this.onComplete = null;
        this.onTradeFill = null;

        this.timer = null;
        this.lastTradeNotificationKey = null;
    }

    setSpeed(speed) {
        this.speed = Number(speed);
    }

    setPointer(index) {
        this.pointer = Math.max(0, Math.min(index, this.candlestickData.length - 1));
        this.emitCurrentState();
    }

    play() {
        if (this.isPlaying || this.isComplete) return;
        this.isPlaying = true;
        this.loop();
    }

    pause() {
        this.isPlaying = false;
        if (this.timer) clearTimeout(this.timer);
    }

    step(direction = 1) {
        this.pause();
        const nextPointer = this.pointer + direction;
        if (nextPointer >= 0 && nextPointer < this.candlestickData.length) {
            this.pointer = nextPointer;
            this.emitCurrentState();
            this.notifyTradeFills(this.pointer, 0);
        }
    }

    loop() {
        if (!this.isPlaying) return;

        if (this.pointer >= this.candlestickData.length) {
            this.isPlaying = false;
            this.isComplete = true;
            this.onComplete?.();
            return;
        }

        this.processTicks();
        this.pointer++;

        // Base delay is 800ms per candle, scaled by speed
        const delay = 800 / this.speed;
        this.timer = setTimeout(() => this.loop(), delay);
    }

    processTicks() {
        const candle = this.candlestickData[this.pointer];
        const equity =
            this.equityData[this.pointer] ||
            this.equityData[this.equityData.length - 1] ||
            { value: 10000 };

        if (!candle) return;

        // --- Micro-Tick Interpolation ---
        // We simulate 6 internal ticks per candle for that "live" flow
        const steps = 6;
        const subDelay = (800 / this.speed) / (steps + 1);
        const currentEquityValue = Number(equity?.value ?? equity?.equity ?? 10000);

        for (let i = 0; i < steps; i++) {
            const progress = (i + 1) / steps;

            // Path: Open -> High/Low -> Close
            let subPrice;
            if (progress < 0.3) {
                subPrice = candle.open + (candle.low - candle.open) * (progress / 0.3);
            } else if (progress < 0.7) {
                subPrice = candle.low + (candle.high - candle.low) * ((progress - 0.3) / 0.4);
            } else {
                subPrice = candle.high + (candle.close - candle.high) * ((progress - 0.7) / 0.3);
            }

            // Sync Equity (Hydraulic glide)
            const prevEquity = this.pointer > 0
                ? Number(this.equityData[this.pointer - 1]?.value ?? this.equityData[0]?.value ?? 10000)
                : Number(this.equityData[0]?.value ?? 10000);
            const subEquity = prevEquity + (currentEquityValue - prevEquity) * progress;

            // Emit micro-tick
            setTimeout(() => {
                if (!this.isPlaying && i > 0) return; // Stop if paused mid-candle
                this.onTick?.({
                    candle: { ...candle, close: subPrice },
                    equity: subEquity,
                    time: candle.time,
                    isInternal: true
                });
            }, i * subDelay);
        }

        // --- Final Candle Sync ---
        // Emit final state after micro-ticks to ensure report is 100% accurate at candle close
        setTimeout(() => {
            if (!this.isPlaying) return;
            this.onTick?.({
                candle,
                equity: currentEquityValue,
                time: candle.time,
                isInternal: false
            });
        }, steps * subDelay);

        this.notifyTradeFills(this.pointer, this.executionDelay / this.speed);
    }

    getTradesForPointer(pointer) {
        const candle = this.candlestickData[pointer];
        if (!candle) return [];

        const candleTimeMs = candle.time * 1000;
        const previousCandle = this.candlestickData[pointer - 1];
        const nextCandle = this.candlestickData[pointer + 1];
        const previousTimeMs = previousCandle ? previousCandle.time * 1000 : candleTimeMs - DAY_MS;
        const fallbackIntervalMs = Math.max(
            (nextCandle ? (nextCandle.time * 1000) - candleTimeMs : candleTimeMs - previousTimeMs) || DAY_MS,
            1
        );
        const nextCandleTimeMs = nextCandle
            ? nextCandle.time * 1000
            : candleTimeMs + fallbackIntervalMs;
        const currentTrades = this.trades.filter(t => {
            const entryTime = parsePlaybackTimestamp(t.entry_date || t.entry_time);
            const exitTime = parsePlaybackTimestamp(t.exit_date || t.exit_time);

            const entryMatches =
                Number.isFinite(entryTime) &&
                entryTime >= candleTimeMs &&
                entryTime < nextCandleTimeMs;
            const exitMatches =
                Number.isFinite(exitTime) &&
                exitTime >= candleTimeMs &&
                exitTime < nextCandleTimeMs;

            return entryMatches || exitMatches;
        });
    }

    notifyTradeFills(pointer, delayMs = 0) {
        const currentTrades = this.getTradesForPointer(pointer);

        if (currentTrades.length > 0) {
            const key = `${pointer}:${currentTrades
                .map((trade) => trade.id || trade.trade_id || `${trade.entry_time || trade.entry_date}-${trade.exit_time || trade.exit_date}`)
                .join(',')}`;
            if (key === this.lastTradeNotificationKey) {
                return;
            }
            this.lastTradeNotificationKey = key;
            setTimeout(() => {
                this.onTradeFill?.(currentTrades);
            }, Math.max(delayMs, 0));
        }
    }

    emitCurrentState() {
        const candle = this.candlestickData[this.pointer];
        const equity =
            this.equityData[this.pointer] ||
            this.equityData[this.equityData.length - 1];
        if (candle && equity) {
            this.onTick?.({
                candle,
                equity: Number(equity?.value ?? equity?.equity ?? 10000),
                time: candle.time,
                isInternal: false
            });
        }
    }

    destroy() {
        this.pause();
        this.onTick = null;
        this.onComplete = null;
        this.onTradeFill = null;
    }
}
