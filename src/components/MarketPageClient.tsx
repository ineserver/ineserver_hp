'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================
// 型定義
// ============================================================

interface ComparisonData {
  value: number;
  percentage: number;
}

interface MarketItem {
  itemKey: string;
  currentPrice: number;
  comparisonPreviousDay: ComparisonData;
  comparison30Days: ComparisonData;
}

interface MarketIndexData {
  currentIndex: number;
  comparisonPreviousDay: ComparisonData;
  chartData30Days: { date: string; index: number }[];
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleResponse {
  status: string;
  data: {
    timeframe: string;
    candles: CandleData[];
  };
}

// ============================================================
// アイテム表示名・カテゴリ定義
// ============================================================

interface ItemMeta {
  label: string;
  category: string;
}

const ITEM_META: Record<string, ItemMeta> = {
  DIAMOND: { label: 'ダイヤモンド', category: '鉱石・宝石' },
  EMERALD: { label: 'エメラルド', category: '鉱石・宝石' },
  NETHERITE_INGOT: { label: 'ネザライトインゴット', category: '鉱石・宝石' },
  GOLD_INGOT: { label: '金インゴット', category: '鉱石・宝石' },
  IRON_INGOT: { label: '鉄インゴット', category: '鉱石・宝石' },
  COPPER_INGOT: { label: '銅インゴット', category: '鉱石・宝石' },
  LAPIS_LAZULI: { label: 'ラピスラズリ', category: '鉱石・宝石' },
  COAL: { label: '石炭', category: '鉱石・宝石' },
  REDSTONE: { label: 'レッドストーン', category: '鉱石・宝石' },
  OAK_LOG: { label: 'オークの原木', category: '木材' },
  SPRUCE_LOG: { label: 'トウヒの原木', category: '木材' },
  BIRCH_LOG: { label: 'シラカバの原木', category: '木材' },
  JUNGLE_LOG: { label: 'ジャングルの原木', category: '木材' },
  ACACIA_LOG: { label: 'アカシアの原木', category: '木材' },
  DARK_OAK_LOG: { label: 'ダークオークの原木', category: '木材' },
  MANGROVE_LOG: { label: 'マングローブの原木', category: '木材' },
  CHERRY_LOG: { label: 'サクラの原木', category: '木材' },
  CRIMSON_STEM: { label: 'クリムゾンの幹', category: '木材' },
  WARPED_STEM: { label: 'ワープドの幹', category: '木材' },
  STONE: { label: '石', category: '土・石材' },
  DIRT: { label: '土', category: '土・石材' },
  SAND: { label: '砂', category: '土・石材' },
  GRAVEL: { label: '砂利', category: '土・石材' },
};

const CATEGORY_ORDER = ['鉱石・宝石', '木材', '土・石材'];

function getItemMeta(key: string): ItemMeta {
  return ITEM_META[key] ?? { label: key, category: 'その他' };
}

// ============================================================
// ユーティリティ
// ============================================================

function formatPrice(value: number): string {
  return value.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatChange(value: number, percentage: number): {
  valueStr: string; pctStr: string; isPositive: boolean; isZero: boolean;
} {
  const isZero = value === 0 && percentage === 0;
  const isPositive = value >= 0;
  const prefix = !isZero ? (isPositive ? '+' : '') : '';
  return {
    valueStr: `${prefix}${formatPrice(value)}`,
    pctStr: `${prefix}${percentage.toFixed(2)}%`,
    isPositive,
    isZero,
  };
}

// 変動バッジ
function ChangeBadge({
  value, percentage, size = 'md',
}: { value: number; percentage: number; size?: 'sm' | 'md' }) {
  const { valueStr, pctStr, isPositive, isZero } = formatChange(value, percentage);

  if (isZero) {
    return (
      <div className={`flex flex-col items-end ${size === 'sm' ? 'gap-0' : 'gap-0.5'}`}>
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-mono text-gray-400`}>±0</span>
        <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-gray-400`}>0.00%</span>
      </div>
    );
  }

  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <div className={`flex flex-col items-end ${size === 'sm' ? 'gap-0' : 'gap-0.5'}`}>
      <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-mono font-semibold ${colorClass}`}>
        {arrow} {valueStr}
      </span>
      <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-semibold ${colorClass}`}>
        {pctStr}
      </span>
    </div>
  );
}

// ============================================================
// ソート・フィルタ型
// ============================================================

type SortKey =
  | 'price_desc' | 'price_asc'
  | 'change1d_desc' | 'change1d_asc'
  | 'change30d_desc' | 'change30d_asc'
  | 'name';
type CategoryFilter = 'all' | string;

// ============================================================
// グラフコンポーネント
// ============================================================

function MarketChart({
  chartData,
  currentIndex,
  candles,
  todayCandle,
}: {
  chartData: { date: string; index: number }[];
  currentIndex: number;
  candles: CandleData[];
  todayCandle: { open: number; high: number; low: number; close: number } | null;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; point: { date: string; index: number; isCurrent?: boolean; open: number; close: number; high: number; low: number } } | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const svgRef = React.useRef<SVGSVGElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 折れ線グラフ用: chartDataの最後に現在のインデックスを「現在」として追加する
  // chartData30Days が空（データ蓄積前）の場合でも currentIndex のみで表示できるようにする
  const lineDisplayData = useMemo(() => {
    const baseData: Array<{ date: string; index: number; isCurrent?: boolean; open: number; close: number; high: number; low: number }> = (chartData ?? []).map(d => ({
      ...d,
      isCurrent: false,
      open: d.index,
      close: d.index,
      high: d.index,
      low: d.index,
    }));
    baseData.push({
      date: new Date().toISOString(),
      index: currentIndex,
      isCurrent: true,
      open: currentIndex,
      close: currentIndex,
      high: currentIndex,
      low: currentIndex,
    });
    return baseData;
  }, [chartData, currentIndex]);

  // ローソク足グラフ用: APIから取得したキャンドルデータをチャート形式に変換し、当日分を末尾に追加
  // candles が空（データ蓄積前）の場合でも currentIndex のみで当日分を表示できるようにする
  const candleDisplayData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 今日の0時

    const mapped = (candles ?? []).map(c => ({
      date: new Date(c.time * 1000).toISOString(),
      index: c.close,
      isCurrent: false,
      open: c.open,
      close: c.close,
      high: c.high,
      low: c.low,
    }));

    // APIの最後のキャンドルが今日のものかチェック
    const lastCandle = mapped.length > 0 ? mapped[mapped.length - 1] : null;
    const lastCandleDate = lastCandle ? new Date(lastCandle.date) : null;
    const lastCandleIsToday = lastCandleDate !== null && lastCandleDate >= today;

    if (lastCandleIsToday && lastCandle) {
      // 最新キャンドルが今日分なら、closeをcurrentIndexで上書き（high/lowも更新）
      mapped[mapped.length - 1] = {
        ...lastCandle,
        close: currentIndex,
        index: currentIndex,
        isCurrent: true,
        high: Math.max(lastCandle.high, currentIndex),
        low: Math.min(lastCandle.low, currentIndex),
      };
    } else {
      // 今日分がなければ新規追加: 前日終値を始値とし、currentIndex を終値とする
      const prevClose = mapped.length > 0 ? mapped[mapped.length - 1].close : currentIndex;
      mapped.push({
        date: new Date().toISOString(),
        index: currentIndex,
        isCurrent: true,
        open: prevClose,
        close: currentIndex,
        high: Math.max(prevClose, currentIndex),
        low: Math.min(prevClose, currentIndex),
      });
    }

    return mapped;
  }, [candles, currentIndex]);

  const displayData = chartType === 'candlestick' ? candleDisplayData : lineDisplayData;

  // データが1点のみ（蓄積前）かどうか
  const isSinglePoint = displayData.length === 1;

  const isMobile = windowWidth < 640;
  
  // スマホなど横スクロールが発生する場合、常に一番右（最新データ）を表示する
  useEffect(() => {
    if (scrollContainerRef.current) {
      // 描画後にスクロール位置を調整するため少し遅らせる
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayData.length, isMobile, chartType]);

  const width = 1000;
  const height = isMobile ? 500 : 300;
  const padding = { top: 20, right: 90, bottom: 35, left: 20 }; // 右側の余白を広げて価格軸とバッジを収める

  // 横軸の目盛りを表示するインデックスを決定
  const tickIndices = useMemo(() => {
    const indices: number[] = [];
    const step = Math.max(1, Math.ceil(displayData.length / 6)); // 最大6個程度の目盛り
    for (let i = 0; i < displayData.length; i += step) {
      indices.push(i);
    }
    // 最後の要素が含まれておらず、かつ最後から離れている場合は追加
    if (indices.length > 0 && indices[indices.length - 1] !== displayData.length - 1) {
      if (displayData.length - 1 - indices[indices.length - 1] > step / 2) {
        indices.push(displayData.length - 1);
      } else {
        indices[indices.length - 1] = displayData.length - 1;
      }
    }
    return indices;
  }, [displayData.length]);

  const rawMinVal = chartType === 'candlestick'
    ? Math.min(...displayData.map(d => d.low))
    : Math.min(...displayData.map(d => d.index));
  const rawMaxVal = chartType === 'candlestick'
    ? Math.max(...displayData.map(d => d.high))
    : Math.max(...displayData.map(d => d.index));
  const rawRange = rawMaxVal - rawMinVal || 1;

  // 上下に10%のマージンを追加して、グラフの端がクリップされるのを防ぐ
  const minVal = rawMinVal - rawRange * 0.1;
  const maxVal = rawMaxVal + rawRange * 0.1;
  const range = maxVal - minVal;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 最新（一番右端）のローソク足や線がY軸と重なって削れないように右側にマージンを設ける
  const chartMarginRight = 10;
  const usableWidth = chartWidth - chartMarginRight;

  // データが少ない場合でも左右に広がりすぎないように、最低30日分の幅を基準にする
  const minPoints = 30;
  const xPoints = Math.max(minPoints, displayData.length - 1);
  const pointSpacing = usableWidth / (xPoints || 1);

  // 右寄せで最新データが Y軸の Y軸線より chartMarginRight だけ左に来るようにX座標を計算する
  const toX = (i: number) => padding.left + usableWidth - ((displayData.length - 1 - i) * pointSpacing);
  // 上下逆転させてY座標を計算
  const toY = (val: number) => padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

  // きりの良いステップ値を用いてY軸目盛り（グリッド線・ラベル用）を動的に計算する
  const yTicks = useMemo(() => {
    if (range <= 0) return [minVal];
    const targetTicks = 5;
    const rawStep = range / (targetTicks - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    let step = magnitude;
    if (normalized < 1.5) {
      step = magnitude * 1;
    } else if (normalized < 3) {
      step = magnitude * 2;
    } else if (normalized < 7) {
      step = magnitude * 5;
    } else {
      step = magnitude * 10;
    }
    const start = Math.ceil(minVal / step) * step;
    const ticks: number[] = [];
    for (let val = start; val <= maxVal; val += step) {
      ticks.push(val);
    }
    if (ticks.length < 3 || ticks.length > 8) {
      const fallbackTicks: number[] = [];
      for (let i = 0; i < targetTicks; i++) {
        fallbackTicks.push(minVal + (range * i) / (targetTicks - 1));
      }
      return fallbackTicks;
    }
    return ticks;
  }, [minVal, maxVal, range]);

  const points = displayData.map((d, i) => `${toX(i)},${toY(d.index)}`).join(' ');
  const lastPoint = displayData[displayData.length - 1];
  // 配色は「当日の始値」との比較で決定する
  const todayOpen = todayCandle?.open ?? lastPoint.index;
  const isOverallPositive = lastPoint.index >= todayOpen;
  const lineColor = isOverallPositive ? '#22c55e' : '#ef4444';

  const fillPath = isSinglePoint ? '' :
    `M ${toX(0)},${toY(displayData[0].index)} ` +
    displayData.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.index)}`).join(' ') +
    ` L ${toX(displayData.length - 1)},${height - padding.bottom} L ${toX(0)},${height - padding.bottom} Z`;

  const formatDate = (dateStr: string, isCurrent?: boolean) => {
    if (isCurrent) return '現在';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  };
  const formatIndex = (value: number) => {
    return value.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 最後のポイントの座標
  const lastX = toX(displayData.length - 1);
  const lastY = toY(lastPoint.index);

  const candleWidth = Math.max(2, (chartWidth / Math.max(minPoints + 1, displayData.length)) * 0.6);

  const handlePointerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    
    const x = clientX - rect.left;
    const scaleX = width / rect.width;
    const svgX = x * scaleX;
    
    let index = Math.round(displayData.length - 1 - (padding.left + usableWidth - svgX) / pointSpacing);
    index = Math.max(0, Math.min(displayData.length - 1, index));
    
    const d = displayData[index];
    const pointX = toX(index);
    const pointY = toY(chartType === 'candlestick' ? d.close : d.index);
    setHoveredPoint({ x: pointX, y: pointY, point: d });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">全体相場インデックス (過去30日間)</h2>
        
        {/* PC用: セグメントコントロール */}
        <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'line' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            折れ線
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'candlestick' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ローソク（1日足）
          </button>
        </div>

        {/* スマホ用: 2段目・右揃えのプルダウン */}
        <div className="w-full sm:hidden flex justify-end">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'line' | 'candlestick')}
            className="text-xs font-medium border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5b8064]/20 focus:border-[#5b8064] text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_10px_center] bg-no-repeat"
          >
            <option value="line">折れ線グラフ</option>
            <option value="candlestick">ローソク足（1日足）</option>
          </select>
        </div>
      </div>
      
      {/* スマホ用には横スクロールを許可するラッパー */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="relative min-w-[700px] sm:min-w-full" style={{ aspectRatio: `${width}/${height}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full"
            onMouseLeave={() => setHoveredPoint(null)}
            onMouseMove={handlePointerInteraction}
            onTouchStart={handlePointerInteraction}
            onTouchMove={handlePointerInteraction}
            onTouchEnd={() => setHoveredPoint(null)}
            onTouchCancel={() => setHoveredPoint(null)}
          >
            <defs>
            <linearGradient id={`bigChartGrad-${isOverallPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isOverallPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isOverallPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
            <clipPath id="chart-area-clip">
              <rect
                x={padding.left}
                y={padding.top}
                width={chartWidth}
                height={chartHeight}
              />
            </clipPath>
          </defs>

          {/* Y軸のグリッド線と目盛りラベル */}
          {yTicks.map((val, idx) => {
            const cy = toY(val);
            return (
              <g key={`y-tick-${idx}`}>
                {/* 水平グリッド線 */}
                <line
                  x1={padding.left}
                  y1={cy}
                  x2={width - padding.right}
                  y2={cy}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {/* 目盛りラベル */}
                <text
                  x={width - padding.right + 8}
                  y={cy + 4.5}
                  className="fill-gray-400 font-medium select-none"
                  fontSize="12"
                >
                  {formatIndex(val)}
                </text>
              </g>
            );
          })}

          {/* Y軸の線 */}
          <line
            x1={width - padding.right}
            y1={padding.top}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth={1.5}
          />

          {chartType === 'line' ? (
            <>
              {!isSinglePoint && (
                <path d={fillPath} fill={`url(#bigChartGrad-${isOverallPositive ? 'up' : 'down'})`} />
              )}

              {!isSinglePoint && (
                <polyline
                  points={points}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* 点を消して線のみにする（線を描画できないデータ1点のみの時だけ小さい点を入れる） */}
              {isSinglePoint && (
                <circle
                  cx={lastX}
                  cy={lastY}
                  r="3"
                  fill={lineColor}
                />
              )}
            </>
          ) : (
            <g clipPath="url(#chart-area-clip)">
              {displayData.map((d, i) => {
                const cx = toX(i);
                const isUp = d.close >= d.open;
                const color = isUp ? '#22c55e' : '#ef4444';

                return (
                  <g key={`candle-${i}`}>
                    <line
                      x1={cx} y1={toY(d.high)}
                      x2={cx} y2={toY(d.low)}
                      stroke={color} strokeWidth={2}
                    />
                    <rect
                      x={cx - candleWidth / 2}
                      y={toY(Math.max(d.open, d.close))}
                      width={candleWidth}
                      height={Math.max(1, Math.abs(toY(d.open) - toY(d.close)))}
                      fill={color}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* X軸の目盛りラベルのみ描画（横線とティック線は削除） */}
          {tickIndices.map(i => {
            const cx = toX(i);
            const d = displayData[i];
            return (
              <g key={`tick-${i}`}>
                <text
                  x={cx}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className="fill-gray-400 font-medium select-none"
                  fontSize="12"
                >
                  {formatDate(d.date, d.isCurrent)}
                </text>
              </g>
            );
          })}

          {/* 最新価格のバッジ（右端のY軸上に重ねる、角丸をなくし直角化） */}
          <g>
            <rect
              x={width - padding.right + 4}
              y={lastY - 10}
              width={76}
              height={20}
              fill={isOverallPositive ? '#149884' : '#ef4444'}
            />
            <text
              x={width - padding.right + 8}
              y={lastY + 4.5}
              className="fill-white font-bold select-none"
              fontSize="12"
            >
              {formatIndex(lastPoint.index)}
            </text>
          </g>

          {/* ホバー用レイヤー */}
          {displayData.map((d, i) => {
            const cx = toX(i);
            const cy = toY(chartType === 'candlestick' ? d.close : d.index);
            return (
              <g key={`hover-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={chartType === 'candlestick' ? Math.max(16, candleWidth) : 16}
                  fill="transparent"
                />
                {hoveredPoint?.point.date === d.date && chartType === 'line' && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill={lineColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
                {hoveredPoint?.point.date === d.date && chartType === 'candlestick' && (
                  <rect
                    x={cx - candleWidth / 2 - 2}
                    y={toY(Math.max(d.open, d.close)) - 2}
                    width={candleWidth + 4}
                    height={Math.max(1, Math.abs(toY(d.open) - toY(d.close))) + 4}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-50 min-w-[200px] bg-gray-900/95 backdrop-blur-md text-white rounded-xl px-5 py-4 pointer-events-none shadow-2xl border border-white/20 transition-transform duration-75"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: `translate(${hoveredPoint.x > width * 0.6 ? '-100%' : hoveredPoint.x < width * 0.4 ? '0%' : '-50%'}, ${hoveredPoint.y < height * 0.3 ? '15%' : '-115%'})`,
            }}
          >
            <div className="font-semibold text-gray-300 text-sm border-b border-gray-700/50 pb-2 mb-2">{formatDate(hoveredPoint.point.date, hoveredPoint.point.isCurrent)}</div>
            {chartType === 'line' ? (
              <div className="font-bold tabular-nums text-xl">{formatIndex(hoveredPoint.point.index)}</div>
            ) : (
              <div className="flex flex-col gap-y-2 text-sm sm:text-base">
                <div className="flex justify-between items-center gap-8"><span className="text-gray-400 font-medium">始値</span><span className="font-mono font-semibold">{formatIndex(hoveredPoint.point.open)}</span></div>
                <div className="flex justify-between items-center gap-8"><span className="text-gray-400 font-medium">高値</span><span className="font-mono font-semibold">{formatIndex(hoveredPoint.point.high)}</span></div>
                <div className="flex justify-between items-center gap-8"><span className="text-gray-400 font-medium">終値</span><span className="font-mono font-semibold">{formatIndex(hoveredPoint.point.close)}</span></div>
                <div className="flex justify-between items-center gap-8"><span className="text-gray-400 font-medium">安値</span><span className="font-mono font-semibold">{formatIndex(hoveredPoint.point.low)}</span></div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* 本日のOHLバー */}
      {todayCandle && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1 text-gray-700">
          <div className="flex items-baseline">
            <span className="text-xs text-gray-400 font-medium mr-1.5">始値</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{formatIndex(todayCandle.open)}</span>
            <span className="text-xs text-gray-400 ml-0.5">ine</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xs text-gray-400 font-medium mr-1.5">高値</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{formatIndex(todayCandle.high)}</span>
            <span className="text-xs text-gray-400 ml-0.5">ine</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-xs text-gray-400 font-medium mr-1.5">安値</span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">{formatIndex(todayCandle.low)}</span>
            <span className="text-xs text-gray-400 ml-0.5">ine</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function MarketPageClient() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [indexData, setIndexData] = useState<MarketIndexData | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('price_desc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAll = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [blocksRes, indexRes, candlesRes] = await Promise.all([
        fetch('https://api.1necat.net/api/market/blocks'),
        fetch('https://api.1necat.net/api/market/index'),
        fetch('https://api.1necat.net/api/market/index/candles?timeframe=1d'),
      ]);
      if (!blocksRes.ok || !indexRes.ok) throw new Error('データの取得に失敗しました');

      const [blocksJson, indexJson] = await Promise.all([blocksRes.json(), indexRes.json()]);
      const candlesJson: CandleResponse = candlesRes.ok ? await candlesRes.json() : { status: 'error', data: { timeframe: '1d', candles: [] } };

      if (blocksJson.status === 'success') setItems(blocksJson.data.items);
      if (indexJson.status === 'success') setIndexData(indexJson.data);
      if (candlesJson.status === 'success') setCandles(candlesJson.data.candles);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('相場データの取得に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    setIsLoading(true);
    fetchAll(true);
  }, [fetchAll]);

  // 自動更新（30秒間隔）
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAll(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAll]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => cats.add(getItemMeta(item.itemKey).category));
    return [
      'all',
      ...CATEGORY_ORDER.filter(c => cats.has(c)),
      ...Array.from(cats).filter(c => !CATEGORY_ORDER.includes(c)),
    ];
  }, [items]);

  const filteredSorted = useMemo(() => {
    let result = items.filter(item => {
      const meta = getItemMeta(item.itemKey);
      const matchCat = categoryFilter === 'all' || meta.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === '' ||
        meta.label.toLowerCase().includes(q) ||
        item.itemKey.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'price_desc': return b.currentPrice - a.currentPrice;
        case 'price_asc': return a.currentPrice - b.currentPrice;
        case 'change1d_desc': return b.comparisonPreviousDay.percentage - a.comparisonPreviousDay.percentage;
        case 'change1d_asc': return a.comparisonPreviousDay.percentage - b.comparisonPreviousDay.percentage;
        case 'change30d_desc': return b.comparison30Days.percentage - a.comparison30Days.percentage;
        case 'change30d_asc': return a.comparison30Days.percentage - b.comparison30Days.percentage;
        case 'name': return getItemMeta(a.itemKey).label.localeCompare(getItemMeta(b.itemKey).label, 'ja');
        default: return 0;
      }
    });

    return result;
  }, [items, categoryFilter, searchQuery, sortKey]);

  // 当日の始値データを事前に計算
  const todayCandle = useMemo(() => {
    if (!indexData) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRaw = candles.length > 0
      ? candles[candles.length - 1]
      : null;
    const todayIsToday = todayRaw ? new Date(todayRaw.time * 1000) >= today : false;
    return todayIsToday && todayRaw
      ? {
          open: todayRaw.open,
          high: Math.max(todayRaw.high, indexData.currentIndex),
          low: Math.min(todayRaw.low, indexData.currentIndex),
          close: indexData.currentIndex,
        }
      : {
          open: indexData.currentIndex,
          high: indexData.currentIndex,
          low: indexData.currentIndex,
          close: indexData.currentIndex,
        };
  }, [candles, indexData]);

  // ローディング
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader indexData={null} lastUpdated={null} todayCandle={null} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#5b8064]/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b8064]"></div>
            </div>
            <p className="text-gray-500 text-sm">相場データを取得中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader indexData={null} lastUpdated={null} todayCandle={null} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader indexData={indexData} lastUpdated={lastUpdated} todayCandle={todayCandle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* グラフ */}
        {indexData && indexData.chartData30Days && (
          <MarketChart
            chartData={indexData.chartData30Days}
            currentIndex={indexData.currentIndex}
            candles={candles}
            todayCandle={todayCandle}
          />
        )}

        {/* 自動更新トグル＆30秒間隔） */}
        <div className="flex items-center justify-end mb-4 -mt-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400 mr-3">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${autoRefresh
              ? 'bg-[#5b8064] text-white border-[#5b8064] shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#5b8064] hover:text-[#5b8064]'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
            自動更新 {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* コントロールバー */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
          {/* 検索 */}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="アイテムを検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064] bg-gray-50 transition"
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            {/* カテゴリフィルタ */}
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${categoryFilter === cat
                    ? 'bg-[#5b8064] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat === 'all' ? 'すべて' : cat}
                </button>
              ))}
            </div>

            {/* ソート */}
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064] cursor-pointer transition"
            >
              <option value="price_desc">価格：高い順</option>
              <option value="price_asc">価格：低い順</option>
              <option value="change1d_desc">前日比：高い順</option>
              <option value="change1d_asc">前日比：低い順</option>
              <option value="change30d_desc">30日比：高い順</option>
              <option value="change30d_asc">30日比：低い順</option>
              <option value="name">名前順</option>
            </select>
          </div>
        </div>

        {/* 件数 */}
        <div className="text-xs text-gray-500 mb-3 px-1">
          {filteredSorted.length} アイテム表示中（全 {items.length} 件）
        </div>

        {/* テーブル（デスクトップ） */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">アイテム</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">現在価格</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">前日比</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">30日比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    該当するアイテムが見つかりません
                  </td>
                </tr>
              ) : (
                filteredSorted.map((item, idx) => {
                  const meta = getItemMeta(item.itemKey);
                  const change1d = item.comparisonPreviousDay;
                  const change30d = item.comparison30Days;
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';

                  return (
                    <tr key={item.itemKey} className={`${rowBg} hover:bg-[#5b8064]/5 transition-colors`}>
                      <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums font-mono">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">                          <div>
                          <div className="font-semibold text-gray-900">{meta.label}</div>
                          <div className="text-xs text-gray-400 font-mono">{item.itemKey}</div>
                        </div>
                          <span className="ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                            {meta.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-base font-bold text-gray-900 tabular-nums font-mono">
                          {formatPrice(item.currentPrice)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">ine</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ChangeBadge value={change1d.value} percentage={change1d.percentage} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ChangeBadge value={change30d.value} percentage={change30d.percentage} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* カード（モバイル） */}
        <div className="md:hidden space-y-3 mb-8">
          {filteredSorted.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              該当するアイテムが見つかりません
            </div>
          ) : (
            filteredSorted.map((item, idx) => {
              const meta = getItemMeta(item.itemKey);
              const change1d = item.comparisonPreviousDay;
              const change30d = item.comparison30Days;

              return (
                <div key={item.itemKey} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{meta.label}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.itemKey}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                          {meta.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 tabular-nums font-mono">
                        {formatPrice(item.currentPrice)}
                        <span className="text-sm text-gray-400 ml-0.5">ine</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">#{idx + 1}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">前日比</div>
                      <ChangeBadge value={change1d.value} percentage={change1d.percentage} size="sm" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">30日比</div>
                      <ChangeBadge value={change30d.value} percentage={change30d.percentage} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ページヘッダー（インデックスバナー）
// ============================================================

function PageHeader({
  indexData,
  lastUpdated,
  todayCandle,
}: {
  indexData: MarketIndexData | null;
  lastUpdated: Date | null;
  todayCandle: { open: number; high: number; low: number; close: number } | null;
}) {
  // 当日の始値との比較を計算
  const todayOpen = todayCandle?.open ?? indexData?.currentIndex ?? 0;
  const changeValue = indexData ? indexData.currentIndex - todayOpen : 0;
  const changePercentage = todayOpen > 0 ? (changeValue / todayOpen) * 100 : 0;

  const isPositive = changeValue >= 0;
  const changeColor = isPositive ? 'text-emerald-300' : 'text-red-300';
  const changeSign = isPositive ? '+' : '';
  const changeArrow = isPositive ? '▲' : '▼';

  return (
    <div className="bg-[#5b8064] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくず */}
        <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
          <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white/90">アイテム市場相場</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold">アイテム市場相場</h1>
            </div>
            <p className="text-white/70 text-sm mb-3">いねさば経済圏の全アイテム価格と変動データ</p>
            <Link
              href="/economy/market"
              className="inline-flex items-center text-sm font-medium text-white hover:text-white/80 underline decoration-white/40 hover:decoration-white transition-all underline-offset-4"
            >
              取引の方法はこちら
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {indexData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 self-start sm:self-auto">
              <div className="text-xs text-white/60 mb-0.5">全体相場インデックス</div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tabular-nums">
                  {indexData.currentIndex.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className={`flex flex-col items-end pb-0.5 ${changeColor}`}>
                  <span className="text-sm font-bold tabular-nums">
                    {changeArrow} {changeSign}{Math.abs(changeValue).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold">
                    {changeSign}{changePercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              {lastUpdated && (
                <div className="text-[10px] text-white/40 mt-1 text-right">
                  {lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 更新
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
