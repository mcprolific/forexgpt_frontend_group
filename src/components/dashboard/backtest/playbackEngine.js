/**
 * Institutional-Grade Forex Playback Engine
 * Controls time, price interpolation, and execution latency.
 */
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
        const equity = this.equityData[this.pointer];

        // --- Micro-Tick Interpolation ---
        // We simulate 6 internal ticks per candle for that "live" flow
        const steps = 6;
        const subDelay = (800 / this.speed) / (steps + 1);

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
            const prevEquity = this.pointer > 0 ? this.equityData[this.pointer - 1]?.value : (this.equityData[0]?.value || 10000);
            const subEquity = prevEquity + (equity.value - prevEquity) * progress;

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
                equity: equity.value,
                time: candle.time,
                isInternal: false
            });
        }, steps * subDelay);

        // Check for trade executions at this candle
        const candleTimeMs = candle.time * 1000;
        const currentTrades = this.trades.filter(t => {
            const entryTime = new Date(t.entry_date).getTime();
            const exitTime = t.exit_date ? new Date(t.exit_date).getTime() : Infinity;
            return entryTime === candleTimeMs || exitTime === candleTimeMs;
        });

        if (currentTrades.length > 0) {
            setTimeout(() => {
                this.onTradeFill?.(currentTrades);
            }, this.executionDelay / this.speed);
        }
    }

    emitCurrentState() {
        const candle = this.candlestickData[this.pointer];
        const equity = this.equityData[this.pointer];
        if (candle && equity) {
            this.onTick?.({
                candle,
                equity: equity.value,
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
