'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

interface ChartDataPoint {
  date: string;
  index: number;
}

interface ComparisonPreviousDay {
  value: number;
  percentage: number;
}

interface MarketIndexData {
  currentIndex: number;
  comparisonPreviousDay: ComparisonPreviousDay;
  chartData30Days: ChartDataPoint[];
}

interface MarketIndexResponse {
  status: string;
  data: MarketIndexData;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function MarketIndex() {
  const [data, setData] = useState<MarketIndexData | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; point: ChartDataPoint } | null>(null);

  useEffect(() => {
    const fetchMarketIndex = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [indexRes, candlesRes] = await Promise.all([
          fetch('https://api.1necat.net/api/market/index'),
          fetch('https://api.1necat.net/api/market/index/candles?timeframe=1d'),
        ]);
        if (!indexRes.ok) {
          throw new Error(`HTTP error! status: ${indexRes.status}`);
        }
        const indexJson: MarketIndexResponse = await indexRes.json();
        const candlesJson = candlesRes.ok ? await candlesRes.json() : null;

        if (indexJson.status === 'success') {
          setData(indexJson.data);
        } else {
          throw new Error('APIからデータを取得できませんでした');
        }

        if (candlesJson && candlesJson.status === 'success') {
          setCandles(candlesJson.data.candles);
        }
      } catch (err) {
        console.error('Failed to fetch market index:', err);
        setError('相場データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMarketIndex();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // 当日の始値との比較用の計算
  const todayCandle = useMemo(() => {
    if (!data) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRaw = candles.length > 0
      ? candles[candles.length - 1]
      : null;
    const todayIsToday = todayRaw ? new Date(todayRaw.time * 1000) >= today : false;
    return todayIsToday && todayRaw
      ? {
          open: todayRaw.open,
          high: Math.max(todayRaw.high, data.currentIndex),
          low: Math.min(todayRaw.low, data.currentIndex),
          close: data.currentIndex,
        }
      : {
          open: data.currentIndex,
          high: data.currentIndex,
          low: data.currentIndex,
          close: data.currentIndex,
        };
  }, [candles, data]);

  const formatIndex = (value: number) => {
    return value.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  };

  // SVGチャートの描画
  const renderChart = (chartData: ChartDataPoint[]) => {
    if (chartData.length < 2) return null;

    const width = 300;
    const height = 80;
    const padding = { top: 8, right: 8, bottom: 8, left: 8 };

    const values = chartData.map(d => d.index);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const toX = (i: number) => padding.left + (i / (chartData.length - 1)) * chartWidth;
    const toY = (val: number) => padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

    const points = chartData.map((d, i) => `${toX(i)},${toY(d.index)}`).join(' ');
    const lastPoint = chartData[chartData.length - 1];
    // 配色は「当日の始値」との比較で決定する
    const isPositive = lastPoint.index >= todayOpen;
    const lineColor = isPositive ? '#22c55e' : '#ef4444';


    // 塗りつぶし用パス
    const fillPath = `M ${toX(0)},${toY(chartData[0].index)} ` +
      chartData.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.index)}`).join(' ') +
      ` L ${toX(chartData.length - 1)},${height - padding.bottom} L ${toX(0)},${height - padding.bottom} Z`;

    return (
      <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* グラデーション塗りつぶし */}
          <defs>
            <linearGradient id={`chartGrad-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d={fillPath}
            fill={`url(#chartGrad-${isPositive ? 'up' : 'down'})`}
          />

          {/* 折れ線 */}
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* ホバー用インタラクション領域 */}
          {chartData.map((d, i) => {
            const cx = toX(i);
            const cy = toY(d.index);
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: cx, y: cy, point: d })}
                />
                {hoveredPoint?.point.date === d.date && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill={lineColor}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ツールチップ */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-gray-900 text-white text-xs rounded-md px-2 py-1 pointer-events-none shadow-lg whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <div className="font-semibold">{formatDate(hoveredPoint.point.date)}</div>
            <div>{formatIndex(hoveredPoint.point.index)}</div>
          </div>
        )}
      </div>
    );
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-[#5b8064] p-4 rounded-t-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">全体相場指標</h2>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5b8064]"></div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-[#5b8064] p-4 rounded-t-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">全体相場指標</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center text-gray-600">
            <span className="mr-2">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 当日の始値との比較を計算
  const todayOpen = todayCandle?.open ?? data?.currentIndex ?? 0;
  const changeValue = data ? data.currentIndex - todayOpen : 0;
  const changePercentage = todayOpen > 0 ? (changeValue / todayOpen) * 100 : 0;

  const isPositiveChange = changeValue >= 0;
  const changeColor = isPositiveChange ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositiveChange ? 'bg-green-50' : 'bg-red-50';
  const changeBorder = isPositiveChange ? 'border-green-200' : 'border-red-200';
  const changeSign = isPositiveChange ? '+' : '';
  const changeArrow = isPositiveChange ? '▲' : '▼';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-[#5b8064] p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-8 h-5 mr-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">全体相場指標</h2>
          </div>
          <span className="text-white/70 text-xs">過去30日</span>
        </div>
      </div>

      <div className="p-4">
        {/* 現在値と前日比 */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">現在の市場インデックス</div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatIndex(data.currentIndex)}
            </div>
          </div>
          <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${changeBg} ${changeBorder}`}>
            <div className={`text-sm font-bold tabular-nums ${changeColor}`}>
              {changeArrow} {changeSign}{formatIndex(Math.abs(changeValue))}
            </div>
            <div className={`text-xs font-semibold tabular-nums ${changeColor}`}>
              {changeSign}{changePercentage.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* チャート */}
        <div className="mt-2">
          {renderChart(data.chartData30Days)}
        </div>

        {/* 期間ラベル */}
        {data.chartData30Days.length >= 2 && (
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">
              {formatDate(data.chartData30Days[0].date)}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatDate(data.chartData30Days[data.chartData30Days.length - 1].date)}
            </span>
          </div>
        )}

        {/* 詳細を見るボタン */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href="/market"
            className="flex items-center justify-center w-full px-4 py-2 bg-[#5b8064]/8 hover:bg-[#5b8064]/15 text-[#5b8064] text-sm font-medium rounded-lg transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            アイテム相場の詳細を見る
            <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
