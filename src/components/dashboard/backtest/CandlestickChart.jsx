import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const CandlestickChart = ({ data, colors = {} }) => {
    const {
        backgroundColor = 'transparent',
        lineColor = '#eab308',
        textColor = '#a1a1aa',
        areaTopColor = '#eab308',
        areaBottomColor = 'rgba(234, 179, 8, 0)',
    } = colors;

    const chartContainerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

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
                vertLine: {
                    labelBackgroundColor: '#333',
                },
                horzLine: {
                    labelBackgroundColor: '#333',
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
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

        // Prepare data
        const candlestickData = data
            .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
            .map(d => ({
                time: new Date(d.date).getTime() / 1000,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }))
            .sort((a, b) => a.time - b.time);

        const equityLineData = data
            .map(d => ({
                time: new Date(d.date).getTime() / 1000,
                value: d.total_equity || d.capital,
            }))
            .sort((a, b) => a.time - b.time);

        if (candlestickData.length > 0) {
            candlestickSeries.setData(candlestickData);
        }
        
        equitySeries.setData(equityLineData);

        chart.timeScale().fitContent();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor]);

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
