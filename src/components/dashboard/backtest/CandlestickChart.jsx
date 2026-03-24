import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, tick, index, colors = {}, onCrosshairMove, seekTime }) => {
    const {
        backgroundColor = 'transparent',
        lineColor = '#eab308',
        textColor = '#a1a1aa',
    } = colors;

    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();
    const equitySeriesRef = useRef();
    // Keep latest callback in a ref so the subscribed handler never goes stale
    const onCrosshairMoveRef = useRef(onCrosshairMove);
    // Track whether the crosshair move came from us (seekTime) to avoid echo loops
    const isProgrammaticSeek = useRef(false);

    useEffect(() => {
        onCrosshairMoveRef.current = onCrosshairMove;
    }, [onCrosshairMove]);

    // ── Chart initialisation ───────────────────────────────────────────────
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
                fontFamily: 'monospace',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                mode: 0,
                vertLine: { labelBackgroundColor: '#333' },
                horzLine: { labelBackgroundColor: '#333' },
            },
            rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        const equitySeries = chart.addSeries(LineSeries, {
            color: lineColor,
            lineWidth: 2,
            priceScaleId: 'left',
        });

        chart.priceScale('left').applyOptions({
            autoScale: true,
            visible: true,
            borderColor: 'rgba(255, 255, 255, 0.1)',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candlestickSeries;
        equitySeriesRef.current = equitySeries;

        window.addEventListener('resize', handleResize);

        // Only fire callback if the user actually moved the crosshair manually,
        // not when we programmatically sought to a position.
        const crosshairHandler = (param) => {
            if (isProgrammaticSeek.current) return;
            if (param.time == null || param.point == null) return;
            onCrosshairMoveRef.current?.(param.time);
        };

        chart.subscribeCrosshairMove(crosshairHandler);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.unsubscribeCrosshairMove(crosshairHandler);
            chart.remove();
        };
    }, [backgroundColor, lineColor, textColor]);

    // ── Incremental playback ticks ─────────────────────────────────────────
    useEffect(() => {
        if (tick && candleSeriesRef.current && equitySeriesRef.current) {
            try {
                candleSeriesRef.current.update(tick.candle);
                equitySeriesRef.current.update({ time: tick.time, value: tick.equity });
            } catch (err) {
                console.warn('Incremental update skipped:', err.message);
            }
        }
    }, [tick]);

    // ── Seeking / data slice ───────────────────────────────────────────────
    const prevIndexRef = useRef(-1);
    useEffect(() => {
        if (data && data.length > 0 && candleSeriesRef.current && equitySeriesRef.current) {
            // Only use the heavy .setData() method on initial load or large seeks!
            // During playback, we skip this so .update() handles the smooth flow (ALIVE effect)
            if (prevIndexRef.current === -1 || Math.abs((index || 0) - prevIndexRef.current) > 1) {
                const visibleData = data.slice(0, (index || 0) + 1);
                const visibleEquity = visibleData.map(d => ({ time: d.time, value: d.value }));
                candleSeriesRef.current.setData(visibleData);
                equitySeriesRef.current.setData(visibleEquity);
            }
            prevIndexRef.current = index;
        }
    }, [data, index]);

    // ── Scroll chart to follow playback position ───────────────────────────
    useEffect(() => {
        if (seekTime == null || !chartRef.current) return;
        isProgrammaticSeek.current = true;
        try {
            const ts = chartRef.current.timeScale();
            const visibleRange = ts.getVisibleLogicalRange();
            const coord = ts.timeToCoordinate(seekTime);
            if (coord !== null && visibleRange) {
                const logical = ts.coordinateToLogical(coord);
                if (logical !== null) {
                    const rangeSize = visibleRange.to - visibleRange.from;
                    // Only pan if current candle is near the edges (< 15% margin)
                    if (logical < visibleRange.from + rangeSize * 0.15 ||
                        logical > visibleRange.to - rangeSize * 0.15) {
                        ts.setVisibleLogicalRange({
                            from: logical - rangeSize * 0.7,
                            to: logical + rangeSize * 0.3,
                        });
                    }
                }
            }
        } catch (_) {}
        // Allow a tick before re-enabling crosshair callbacks
        requestAnimationFrame(() => { isProgrammaticSeek.current = false; });
    }, [seekTime]);

    return (
        <div className="w-full relative">
            <div ref={chartContainerRef} className="w-full h-[400px]" />
            <div className="absolute top-4 left-4 flex gap-4 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#eab308]" />
                    <span className="text-[10px] text-white/40 uppercase font-black">Equity Curve (Left)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[10px] text-white/40 uppercase font-black">Price Action (Right)</span>
                </div>
            </div>
        </div>
    );
};

export default CandlestickChart;
