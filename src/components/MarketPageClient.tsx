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

// 物価指数（/api/market/price-index）。MarketPlugin 2.2.0 以降で返る
interface PriceIndexCandle {
  date: string; // YYYY-MM-DD（日本時間）
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceIndexEntry {
  code: string;            // 全体は 'ALL'、カテゴリ別は 'CAT:<カテゴリ>'
  category: string | null; // プラグインの config の category
  itemCount: number;
  current: number;
  todayOpen: number;
  comparisonPreviousDay: ComparisonData;
  candles: PriceIndexCandle[];
}

interface PriceIndexData {
  baseValue: number;
  // 基準改定をしていない間の基準日（記録の最初の日の始値が 100）
  baseDate: string | null;
  // いまの基準期間（この期間の平均が 100）。基準改定をしていなければ null。古い API では項目自体がない
  basePeriod?: { from: string; to: string; revisedDate: string } | null;
  indexes: PriceIndexEntry[];
}

// 各アイテムの日足の履歴（/api/market/history）
interface HistoryData {
  dates: string[]; // YYYY-MM-DD（古い順）
  hasVolume: boolean;
  items: Record<string, { close: (number | null)[]; turnover: (number | null)[] | null }>;
}

// チャートに渡す日足 1 本（物価指数・物価平均で共通）
interface ChartPoint {
  date: string; // YYYY-MM-DD（日本時間）
  open: number;
  high: number;
  low: number;
  close: number;
  isCurrent: boolean; // 当日分（終値が現在値）
}

type DisplayPoint = ChartPoint & { index: number };

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
  RED_SANDSTONE: { label: '赤い砂岩', category: '土・石材' },
  WHITE_CONCRETE: { label: '白色のコンクリート', category: '土・石材' },
  CYAN_TERRACOTTA: { label: '青緑色のテラコッタ', category: '土・石材' },
};

const CATEGORY_ORDER = ['鉱石・宝石', '木材', '土・石材'];

// プラグインの config の category（物価指数のカテゴリ）と、このページでの表示名の対応
const CATEGORY_CODE_LABELS: Record<string, string> = {
  ore: '鉱石・宝石',
  wood: '木材',
  stone: '土・石材',
};

function getCategoryLabel(category: string | null): string {
  if (!category) return '全体';
  return CATEGORY_CODE_LABELS[category] ?? category;
}

// ============================================================
// 表示期間
// ============================================================

type PeriodKey = '30' | '90' | 'all';

const PERIODS: { key: PeriodKey; label: string; days: number | null }[] = [
  { key: '30', label: '30日', days: 30 },
  { key: '90', label: '90日', days: 90 },
  { key: 'all', label: '全期間', days: null },
];

function getPeriod(key: PeriodKey) {
  return PERIODS.find(p => p.key === key) ?? PERIODS[0];
}

// 値動きの色（上昇 = 緑、下落 = 赤。ゲーム内の相場ボードと同じ）
const UP_COLOR = '#22c55e';
const DOWN_COLOR = '#ef4444';
const FLAT_COLOR = '#9ca3af';
// この割合（%）未満の変化は「変わらず」として扱う（表示が 0.00% になる範囲）
const FLAT_THRESHOLD_PCT = 0.005;

function getItemMeta(key: string): ItemMeta {
  return ITEM_META[key] ?? { label: key, category: 'その他' };
}

// ============================================================
// ユーティリティ
// ============================================================

function formatPrice(value: number): string {
  return value.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// API の日付は日本時間基準の YYYY-MM-DD。今日・N 日前の日付を同じ形式で返す
const JST_DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' });

function dateStrOf(date: Date): string {
  return JST_DATE_FORMAT.format(date);
}

function dateStrDaysAgo(days: number): string {
  return dateStrOf(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
}

// 0.01 未満の小さな値は桁を増やして表示する（「-0」のように見えるのを防ぐ）
function formatDiff(value: number): string {
  const abs = Math.abs(value);
  const digits = abs > 0 && abs < 0.01 ? 4 : 2;
  return abs.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

// 変化の向き。差額は API 側で丸められて 0 になることがあるので、変化率を優先して判定する
function changeDirection(value: number, percentage: number): 1 | 0 | -1 {
  if (Math.abs(percentage) >= FLAT_THRESHOLD_PCT) return percentage > 0 ? 1 : -1;
  if (percentage === 0 && value !== 0) return value > 0 ? 1 : -1;
  return 0;
}

function formatChange(value: number, percentage: number): {
  valueStr: string; pctStr: string; isPositive: boolean; isZero: boolean;
} {
  const direction = changeDirection(value, percentage);
  const isZero = direction === 0;
  const isPositive = direction >= 0;
  const sign = isZero ? '' : (isPositive ? '+' : '-');
  return {
    valueStr: `${sign}${formatDiff(value)}`,
    pctStr: `${sign}${Math.abs(percentage).toFixed(2)}%`,
    isPositive,
    isZero,
  };
}

// 開始値と現在値から、差額と変化率を作る
function comparisonOf(current: number, base: number | null): ComparisonData | null {
  if (base === null || !(base > 0)) return null;
  const value = current - base;
  return { value, percentage: (value / base) * 100 };
}

// 変動バッジ
function ChangeBadge({
  value, percentage, size = 'md', hideValue = false,
}: { value: number; percentage: number; size?: 'sm' | 'md'; hideValue?: boolean }) {
  const { valueStr, pctStr, isPositive, isZero } = formatChange(value, percentage);

  if (isZero) {
    return (
      <div className={`flex flex-col items-end ${size === 'sm' ? 'gap-0' : 'gap-0.5'}`}>
        {!hideValue && <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-400 tabular-nums`}>±0</span>}
        <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} text-gray-400 tabular-nums`}>0.00%</span>
      </div>
    );
  }

  // 上昇は緑、下落は赤で表示する
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <div className={`flex flex-col items-end ${size === 'sm' ? 'gap-0' : 'gap-0.5'}`}>
      {!hideValue && (
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-semibold tabular-nums ${colorClass}`}>
          {arrow} {valueStr}
        </span>
      )}
      <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-semibold tabular-nums ${colorClass}`}>
        {hideValue ? `${arrow} ` : ''}{pctStr}
      </span>
    </div>
  );
}

// 一覧やカードに置く小さな折れ線。期間の最初より上がっていれば緑、下がっていれば赤
function Sparkline({
  values, width = 96, height = 28,
}: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = 2;
  const toX = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  // 値が動いていない場合は中央に水平線を引く
  const toY = (v: number) => range === 0
    ? height / 2
    : pad + (1 - (v - min) / range) * (height - pad * 2);
  const first = values[0];
  const last = values[values.length - 1];
  const pct = first > 0 ? ((last - first) / first) * 100 : 0;
  const color = Math.abs(pct) < FLAT_THRESHOLD_PCT ? FLAT_COLOR : pct > 0 ? UP_COLOR : DOWN_COLOR;
  const pointsAttr = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="inline-block">
      <polyline points={pointsAttr} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
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
  title,
  unit,
  points,
  periodDays,
  baseline,
  controls,
}: {
  title: string;
  unit: string;               // 値の単位（物価平均は 'ine'、物価指数は単位なしの ''）
  points: ChartPoint[];       // 記録がある全期間の日足（古い順、最後が当日）
  periodDays: number | null;  // 表示する日数（null = 全期間）
  baseline: number | null;    // 基準線を引く値（物価指数の 100）。引かないなら null
  controls?: React.ReactNode; // タイトルの右に置く切替
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; point: DisplayPoint } | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const svgRef = React.useRef<SVGSVGElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 表示期間に入る日足だけを取り出す。折れ線は終値（当日は現在値）を結ぶ
  const displayData = useMemo<DisplayPoint[]>(() => {
    const cutoff = periodDays === null ? null : dateStrDaysAgo(periodDays);
    const visible = cutoff === null ? points : points.filter(p => p.date >= cutoff);
    const source = visible.length > 0 ? visible : points.slice(-1);
    return source.map(p => ({ ...p, index: p.close }));
  }, [points, periodDays]);

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

  // データが少ない場合でも左右に広がりすぎないように、表示期間の日数ぶんの幅を基準にする（全期間は最低30日分）
  const minPoints = periodDays ?? 30;
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

  const linePoints = displayData.map((d, i) => `${toX(i)},${toY(d.index)}`).join(' ');
  const lastPoint = displayData[displayData.length - 1];
  // 配色は「表示期間の最初」との比較で決定する（全期間は最初の日の始値、それ以外は開始日の終値）
  const periodStart = periodDays === null ? displayData[0].open : displayData[0].index;
  const isOverallPositive = lastPoint.index >= periodStart;
  const lineColor = isOverallPositive ? UP_COLOR : DOWN_COLOR;
  const todayPoint = lastPoint.isCurrent ? lastPoint : null;
  const unitLabel = unit ? <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span> : null;
  const unitLabelSmall = unit ? <span className="text-[10px] font-normal text-gray-400 ml-0.5">{unit}</span> : null;

  const fillPath = isSinglePoint ? '' :
    `M ${toX(0)},${toY(displayData[0].index)} ` +
    displayData.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.index)}`).join(' ') +
    ` L ${toX(displayData.length - 1)},${height - padding.bottom} L ${toX(0)},${height - padding.bottom} Z`;

  const formatDate = (dateStr: string, isCurrent?: boolean) => {
    if (isCurrent) return '現在';
    // YYYY-MM-DD をそのまま 月/日 にする（見る人のタイムゾーンで日付がずれないようにする）
    const [, month, day] = dateStr.split('-');
    return `${Number(month)}/${Number(day)}`;
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
        <h2 className="text-base sm:text-lg font-bold text-gray-800">{title}</h2>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {controls}

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

        {/* スマホ用: 右揃えのプルダウン */}
        <div className="sm:hidden flex justify-end ml-auto">
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
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
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

          {/* 基準線（物価指数の 100）。表示範囲に入っているときだけ引く */}
          {baseline !== null && baseline > minVal && baseline < maxVal && (
            <g>
              <line
                x1={padding.left}
                y1={toY(baseline)}
                x2={width - padding.right}
                y2={toY(baseline)}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
              <text
                x={padding.left + 4}
                y={toY(baseline) - 5}
                className="fill-gray-400 font-medium select-none"
                fontSize="11"
              >
                基準 {baseline}
              </text>
            </g>
          )}

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
                  points={linePoints}
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
                const color = isUp ? UP_COLOR : DOWN_COLOR;

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
              fill={lineColor}
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
            className="absolute z-[100] min-w-[200px] whitespace-nowrap bg-gray-900/95 backdrop-blur-md text-white rounded-xl px-5 py-4 pointer-events-none shadow-2xl border border-white/20 transition-transform duration-75"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: chartType === 'line'
                ? `clamp(80px, ${hoveredPoint.y}px, calc(100% - 80px))`
                : `clamp(120px, ${hoveredPoint.y}px, calc(100% - 140px))`,
              transform: `translate(${hoveredPoint.x > width * 0.6 ? '-100%' : hoveredPoint.x < width * 0.4 ? '0%' : '-50%'}, -50%)`,
            }}
          >
            <div className="font-semibold text-gray-300 text-sm border-b border-gray-700/50 pb-2 mb-2">{formatDate(hoveredPoint.point.date, hoveredPoint.point.isCurrent)}</div>
            {chartType === 'line' ? (
              <div className="flex items-baseline font-bold text-xl">
                <span className="tabular-nums">{formatIndex(hoveredPoint.point.index)}</span>
                {unitLabel}
              </div>
            ) : (
              <div className="flex flex-col gap-y-2 text-sm sm:text-base">
                <div className="flex justify-between items-center gap-6"><span className="text-gray-400 font-medium">始値</span><div className="flex items-baseline"><span className="tabular-nums font-semibold">{formatIndex(hoveredPoint.point.open)}</span>{unitLabelSmall}</div></div>
                <div className="flex justify-between items-center gap-6"><span className="text-gray-400 font-medium">高値</span><div className="flex items-baseline"><span className="tabular-nums font-semibold">{formatIndex(hoveredPoint.point.high)}</span>{unitLabelSmall}</div></div>
                <div className="flex justify-between items-center gap-6"><span className="text-gray-400 font-medium">終値</span><div className="flex items-baseline"><span className="tabular-nums font-semibold">{formatIndex(hoveredPoint.point.close)}</span>{unitLabelSmall}</div></div>
                <div className="flex justify-between items-center gap-6"><span className="text-gray-400 font-medium">安値</span><div className="flex items-baseline"><span className="tabular-nums font-semibold">{formatIndex(hoveredPoint.point.low)}</span>{unitLabelSmall}</div></div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* 本日のOHLバー */}
      {todayPoint && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1 text-gray-700">
          {([['本日の始値', todayPoint.open], ['本日の高値', todayPoint.high], ['本日の安値', todayPoint.low]] as const).map(([label, value]) => (
            <div key={label} className="flex items-baseline">
              <span className="text-xs text-gray-400 font-medium mr-1.5">{label}</span>
              <span className="text-lg font-bold text-gray-900 tabular-nums">{formatIndex(value)}</span>
              {unit && <span className="text-xs text-gray-400 ml-0.5">{unit}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// データの取得と組み立て
// ============================================================

// 既定は本番の API。手元で確かめるときは NEXT_PUBLIC_MARKET_API_BASE で向き先を変えられる
const MARKET_API_BASE = process.env.NEXT_PUBLIC_MARKET_API_BASE ?? 'https://api.1necat.net';

// なくても表示を続けられるデータの取得。失敗したら null を返す（古い API・プラグインでも動くようにする）
async function fetchOptional<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === 'success' ? (json.data as T) : null;
  } catch {
    return null;
  }
}

// 当日分の日足を、現在値で締めた形にする。当日分がなければ前日の終値から作る
function withToday(points: ChartPoint[], current: number): ChartPoint[] {
  const todayStr = dateStrOf(new Date());
  const result = points.map(p => ({ ...p, isCurrent: false }));
  const last = result.length > 0 ? result[result.length - 1] : null;
  if (last && last.date >= todayStr) {
    result[result.length - 1] = {
      ...last,
      close: current,
      high: Math.max(last.high, current),
      low: Math.min(last.low, current),
      isCurrent: true,
    };
  } else {
    const prevClose = last ? last.close : current;
    result.push({
      date: todayStr,
      open: prevClose,
      close: current,
      high: Math.max(prevClose, current),
      low: Math.min(prevClose, current),
      isCurrent: true,
    });
  }
  return result;
}

// 物価平均（全アイテムの価格の合計）の日足
function buildAveragePoints(candles: CandleData[], currentIndex: number): ChartPoint[] {
  return withToday(candles.map(c => ({
    date: dateStrOf(new Date(c.time * 1000)),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    isCurrent: false,
  })), currentIndex);
}

// 物価指数の日足
function buildIndexPoints(entry: PriceIndexEntry): ChartPoint[] {
  return withToday(entry.candles.map(c => ({ ...c, isCurrent: false })), entry.current);
}

// 期間の開始値。全期間は最初の日の始値、それ以外は開始日（今日から N 日前）の終値
function periodBaseOfPoints(points: ChartPoint[], days: number | null): number | null {
  if (points.length === 0) return null;
  if (days === null) return points[0].open;
  const cutoff = dateStrDaysAgo(days);
  const first = points.find(p => p.date >= cutoff);
  return first ? first.close : null;
}

// 期間に入る終値の並び（小さな折れ線用）
function periodCloses(points: ChartPoint[], days: number | null): number[] {
  if (days === null) return points.map(p => p.close);
  const cutoff = dateStrDaysAgo(days);
  return points.filter(p => p.date >= cutoff).map(p => p.close);
}

// アイテムの履歴のうち、期間の最初の位置
function historyStart(history: HistoryData, days: number | null): number {
  if (days === null) return 0;
  const cutoff = dateStrDaysAgo(days);
  const index = history.dates.findIndex(d => d >= cutoff);
  return index < 0 ? history.dates.length : index;
}

// アイテムの期間の開始値（開始日の終値。その日にまだ市場になければ、最初に記録された終値）
function periodBaseOfItem(history: HistoryData, itemKey: string, days: number | null): number | null {
  const closes = history.items[itemKey]?.close;
  if (!closes) return null;
  for (let i = historyStart(history, days); i < closes.length; i++) {
    const value = closes[i];
    if (value !== null && value > 0) return value;
  }
  return null;
}

// アイテムの期間の終値の並び（最後は現在価格）
function periodClosesOfItem(history: HistoryData, itemKey: string, days: number | null, currentPrice: number): number[] {
  const closes = history.items[itemKey]?.close;
  if (!closes) return [];
  const todayStr = dateStrOf(new Date());
  const values: number[] = [];
  for (let i = historyStart(history, days); i < closes.length; i++) {
    const value = closes[i];
    if (value === null) continue;
    values.push(history.dates[i] >= todayStr ? currentPrice : value);
  }
  if (history.dates.length === 0 || history.dates[history.dates.length - 1] < todayStr) {
    values.push(currentPrice);
  }
  return values;
}

// 前日比の差額は API 側で小数 2 桁に丸められ、0 になることがある。そのときは変化率から差額を出し直す
function repairComparison(comparison: ComparisonData, currentPrice: number): ComparisonData {
  if (comparison.value !== 0 || comparison.percentage === 0) return comparison;
  return {
    value: (currentPrice * comparison.percentage) / (100 + comparison.percentage),
    percentage: comparison.percentage,
  };
}

interface ItemRow {
  item: MarketItem;
  meta: ItemMeta;
  change1d: ComparisonData;
  changePeriod: ComparisonData;
  spark: number[];
}

// ============================================================
// 切替ボタン（期間・指数の種類）
// ============================================================

function SegmentedControl<T extends string>({
  options, value, onChange, ariaLabel,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1" role="group" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          aria-pressed={value === option.key}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${value === option.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// 指数のまとめ（期間ごとの変化・カテゴリ別・上げ下げの品目数）
// ============================================================

function IndexOverview({
  seriesLabel,
  points,
  categoryIndexes,
  periodLabel,
  periodDays,
  breadth,
  baseDate,
  basePeriod,
  showIndexNote,
  selectedCategory,
  onSelectCategory,
}: {
  seriesLabel: string;
  points: ChartPoint[];
  categoryIndexes: { entry: PriceIndexEntry; label: string; points: ChartPoint[] }[];
  periodLabel: string;
  periodDays: number | null;
  breadth: { up: number; flat: number; down: number };
  baseDate: string | null;
  basePeriod: { from: string; to: string } | null;
  showIndexNote: boolean;
  selectedCategory: string;
  onSelectCategory: (label: string) => void;
}) {
  const current = points.length > 0 ? points[points.length - 1].close : 0;
  const stats = ([['7日', 7], ['30日', 30], ['90日', 90], ['全期間', null]] as const).map(([label, days]) => ({
    label,
    comparison: comparisonOf(current, periodBaseOfPoints(points, days)),
  }));
  const total = breadth.up + breadth.flat + breadth.down;
  const formatBaseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${year}年${Number(month)}月${Number(day)}日`;
  };
  // 何を 100 としているかの説明。基準改定後は「◯年◯月の平均」、改定前は記録の最初の日
  const baseText = (() => {
    if (basePeriod) {
      const [fromYear, fromMonth, fromDay] = basePeriod.from.split('-').map(Number);
      const [toYear, toMonth, toDay] = basePeriod.to.split('-').map(Number);
      const lastDayOfMonth = new Date(toYear, toMonth, 0).getDate();
      const isWholeMonth = fromYear === toYear && fromMonth === toMonth && fromDay === 1 && toDay === lastDayOfMonth;
      return isWholeMonth
        ? `${fromYear}年${fromMonth}月の平均を`
        : `${formatBaseDate(basePeriod.from)}から${formatBaseDate(basePeriod.to)}までの平均を`;
    }
    return baseDate ? `${formatBaseDate(baseDate)}を` : '記録を始めた日を';
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* 期間ごとの変化 */}
      <div className="text-xs text-gray-500 mb-2">{seriesLabel}の変化</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{stat.label}</span>
            {stat.comparison
              ? <ChangeBadge value={stat.comparison.value} percentage={stat.comparison.percentage} size="md" hideValue />
              : <span className="text-xs text-gray-400">---</span>}
          </div>
        ))}
      </div>

      {/* カテゴリ別の物価指数 */}
      {categoryIndexes.length > 0 && (
        <>
          <div className="text-xs text-gray-500 mt-5 mb-2">カテゴリ別の物価指数（{periodLabel}）</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categoryIndexes.map(({ entry, label, points: categoryPoints }) => {
              const comparison = comparisonOf(entry.current, periodBaseOfPoints(categoryPoints, periodDays));
              const isSelected = selectedCategory === label;
              return (
                <button
                  key={entry.code}
                  onClick={() => onSelectCategory(isSelected ? 'all' : label)}
                  aria-pressed={isSelected}
                  title={`${label}のアイテムだけを一覧に表示`}
                  className={`text-left rounded-lg px-4 py-3 border transition-colors cursor-pointer ${isSelected ? 'bg-[#5b8064]/10 border-[#5b8064]' : 'bg-gray-50 border-transparent hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500">{label}<span className="text-gray-400 ml-1">{entry.itemCount}品目</span></div>
                      <div className="text-xl font-bold text-gray-900 tabular-nums">
                        {entry.current.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Sparkline values={periodCloses(categoryPoints, periodDays)} width={88} height={26} />
                      {comparison
                        ? <ChangeBadge value={comparison.value} percentage={comparison.percentage} size="sm" hideValue />
                        : <span className="text-[10px] text-gray-400">---</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 上げ・下げの品目数 */}
      {total > 0 && (
        <>
          <div className="flex items-center justify-between text-xs mt-5 mb-1.5">
            <span className="text-green-600 font-semibold">上げ {breadth.up}</span>
            <span className="text-gray-500">{periodLabel}の値動き（変わらず {breadth.flat}）</span>
            <span className="text-red-600 font-semibold">下げ {breadth.down}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100" role="img"
            aria-label={`${periodLabel}の値動き: 上げ ${breadth.up} 品目、変わらず ${breadth.flat} 品目、下げ ${breadth.down} 品目`}>
            <div style={{ width: `${(breadth.up / total) * 100}%`, backgroundColor: UP_COLOR }} />
            <div style={{ width: `${(breadth.flat / total) * 100}%`, backgroundColor: '#d1d5db' }} />
            <div style={{ width: `${(breadth.down / total) * 100}%`, backgroundColor: DOWN_COLOR }} />
          </div>
        </>
      )}

      {showIndexNote && (
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          物価指数は、{baseText}100とした市場全体の値段の水準です。
          取引の規模が大きいアイテムほど重く数えるので、値段の高いアイテム1つの動きに引っ張られません。
          物価平均は、全アイテムの価格をそのまま足した値です。
        </p>
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
  const [priceIndex, setPriceIndex] = useState<PriceIndexData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('price_desc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [series, setSeries] = useState<'index' | 'average'>('index');
  // 履歴は 1 日 1 回変わるだけなので、最初と日付が変わったときだけ取り直す
  const historyDateRef = React.useRef<string | null>(null);

  const fetchAll = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const todayStr = dateStrOf(new Date());
      const needHistory = historyDateRef.current !== todayStr;
      const [blocksRes, indexRes, candlesRes, priceIndexData, historyData] = await Promise.all([
        fetch(`${MARKET_API_BASE}/api/market/blocks`),
        fetch(`${MARKET_API_BASE}/api/market/index`),
        fetch(`${MARKET_API_BASE}/api/market/index/candles?timeframe=1d`),
        fetchOptional<PriceIndexData>(`${MARKET_API_BASE}/api/market/price-index`),
        needHistory ? fetchOptional<HistoryData>(`${MARKET_API_BASE}/api/market/history?days=800`) : Promise.resolve(null),
      ]);
      if (!blocksRes.ok || !indexRes.ok) throw new Error('データの取得に失敗しました');

      const [blocksJson, indexJson] = await Promise.all([blocksRes.json(), indexRes.json()]);
      const candlesJson: CandleResponse = candlesRes.ok ? await candlesRes.json() : { status: 'error', data: { timeframe: '1d', candles: [] } };

      if (blocksJson.status === 'success') setItems(blocksJson.data.items);
      if (indexJson.status === 'success') setIndexData(indexJson.data);
      if (candlesJson.status === 'success') setCandles(candlesJson.data.candles);
      // 取れなかったときは前回の内容を残す
      if (priceIndexData) setPriceIndex(priceIndexData);
      if (historyData) {
        setHistory(historyData);
        historyDateRef.current = todayStr;
      }
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

  const periodInfo = getPeriod(period);
  // アイテムの履歴が取れないとき（古い API）は、一覧の期間は API が返す 30 日比で固定する
  const listPeriodDays = history ? periodInfo.days : 30;
  const listPeriodLabel = history ? periodInfo.label : '30日';
  const listChangeLabel = listPeriodDays === null ? '全期間' : `${listPeriodLabel}比`;

  // 物価指数（全体とカテゴリ別）
  const allIndex = useMemo(
    () => priceIndex?.indexes.find(entry => entry.code === 'ALL' && entry.candles.length > 0) ?? null,
    [priceIndex],
  );
  const indexPoints = useMemo(() => (allIndex ? buildIndexPoints(allIndex) : []), [allIndex]);
  const averagePoints = useMemo(
    () => (indexData ? buildAveragePoints(candles, indexData.currentIndex) : []),
    [candles, indexData],
  );
  const categoryIndexes = useMemo(() => {
    if (!priceIndex) return [];
    const entries = priceIndex.indexes
      .filter(entry => entry.code !== 'ALL' && entry.candles.length > 0)
      .map(entry => ({ entry, label: getCategoryLabel(entry.category), points: buildIndexPoints(entry) }));
    // このページのカテゴリの並びに合わせる
    const order = (label: string) => {
      const index = CATEGORY_ORDER.indexOf(label);
      return index < 0 ? CATEGORY_ORDER.length : index;
    };
    return entries.sort((a, b) => order(a.label) - order(b.label));
  }, [priceIndex]);

  // 物価指数がまだない（古いプラグイン）ときは物価平均だけを表示する
  const hasPriceIndex = allIndex !== null;
  const activeSeries = hasPriceIndex ? series : 'average';
  const activePoints = activeSeries === 'index' ? indexPoints : averagePoints;
  const activeLabel = activeSeries === 'index' ? '物価指数' : '物価平均';
  const activeUnit = activeSeries === 'index' ? '' : 'ine';

  const rows = useMemo<ItemRow[]>(() => items.map(item => {
    const base = history ? periodBaseOfItem(history, item.itemKey, listPeriodDays) : null;
    return {
      item,
      meta: getItemMeta(item.itemKey),
      change1d: repairComparison(item.comparisonPreviousDay, item.currentPrice),
      changePeriod: comparisonOf(item.currentPrice, base) ?? repairComparison(item.comparison30Days, item.currentPrice),
      spark: history ? periodClosesOfItem(history, item.itemKey, listPeriodDays, item.currentPrice) : [],
    };
  }), [items, history, listPeriodDays]);

  const breadth = useMemo(() => {
    const result = { up: 0, flat: 0, down: 0 };
    for (const row of rows) {
      const direction = changeDirection(row.changePeriod.value, row.changePeriod.percentage);
      if (direction > 0) result.up++;
      else if (direction < 0) result.down++;
      else result.flat++;
    }
    return result;
  }, [rows]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    rows.forEach(row => cats.add(row.meta.category));
    return [
      'all',
      ...CATEGORY_ORDER.filter(c => cats.has(c)),
      ...Array.from(cats).filter(c => !CATEGORY_ORDER.includes(c)),
    ];
  }, [rows]);

  const filteredSorted = useMemo(() => {
    let result = rows.filter(row => {
      const matchCat = categoryFilter === 'all' || row.meta.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === '' ||
        row.meta.label.toLowerCase().includes(q) ||
        row.item.itemKey.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'price_desc': return b.item.currentPrice - a.item.currentPrice;
        case 'price_asc': return a.item.currentPrice - b.item.currentPrice;
        case 'change1d_desc': return b.change1d.percentage - a.change1d.percentage;
        case 'change1d_asc': return a.change1d.percentage - b.change1d.percentage;
        case 'change30d_desc': return b.changePeriod.percentage - a.changePeriod.percentage;
        case 'change30d_asc': return a.changePeriod.percentage - b.changePeriod.percentage;
        case 'name': return a.meta.label.localeCompare(b.meta.label, 'ja');
        default: return 0;
      }
    });

    return result;
  }, [rows, categoryFilter, searchQuery, sortKey]);

  // ページ上部の帯に出す値（当日の始値との比較）
  const headline = useMemo(() => {
    const today = activePoints.length > 0 ? activePoints[activePoints.length - 1] : null;
    if (!today) return null;
    return { label: activeLabel, unit: activeUnit, value: today.close, open: today.open };
  }, [activePoints, activeLabel, activeUnit]);

  // ローディング
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader headline={null} />
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
        <PageHeader headline={null} />
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
      <PageHeader headline={headline} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 表示期間の切替・自動更新トグル（30秒間隔） */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">表示期間</span>
            <SegmentedControl
              options={PERIODS.map(p => ({ key: p.key, label: p.label }))}
              value={period}
              onChange={setPeriod}
              ariaLabel="表示期間"
            />
          </div>
          <div className="flex items-center">
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
        </div>

        {/* グラフ */}
        {activePoints.length > 0 && (
          <MarketChart
            title={`いねさば${activeLabel}（${periodInfo.days === null ? '全期間' : `過去${periodInfo.label}間`}）`}
            unit={activeUnit}
            points={activePoints}
            periodDays={periodInfo.days}
            baseline={activeSeries === 'index' ? (priceIndex?.baseValue ?? 100) : null}
            controls={hasPriceIndex ? (
              <SegmentedControl
                options={[{ key: 'index', label: '物価指数' }, { key: 'average', label: '物価平均' }]}
                value={series}
                onChange={setSeries}
                ariaLabel="表示する指数"
              />
            ) : undefined}
          />
        )}

        {/* 指数のまとめ */}
        {activePoints.length > 0 && (
          <IndexOverview
            seriesLabel={activeLabel}
            points={activePoints}
            categoryIndexes={categoryIndexes}
            periodLabel={listPeriodLabel}
            periodDays={periodInfo.days}
            breadth={breadth}
            baseDate={priceIndex?.baseDate ?? null}
            basePeriod={priceIndex?.basePeriod ?? null}
            showIndexNote={hasPriceIndex}
            selectedCategory={categoryFilter}
            onSelectCategory={label => setCategoryFilter(label === 'all' || categories.includes(label) ? label : 'all')}
          />
        )}

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
              <option value="change30d_desc">{listChangeLabel}：高い順</option>
              <option value="change30d_asc">{listChangeLabel}：低い順</option>
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
                {history && (
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{listPeriodLabel}の推移</th>
                )}
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">前日比</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{listChangeLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={history ? 6 : 5} className="px-6 py-12 text-center text-gray-400">
                    該当するアイテムが見つかりません
                  </td>
                </tr>
              ) : (
                filteredSorted.map(({ item, meta, change1d, changePeriod, spark }, idx) => {
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';

                  return (
                    <tr key={item.itemKey} className={`${rowBg} hover:bg-[#5b8064]/5 transition-colors`}>
                      <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">                          <div>
                          <div className="font-semibold text-gray-900">{meta.label}</div>
                          <div className="text-xs text-gray-400">{item.itemKey}</div>
                        </div>
                          <span className="ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                            {meta.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-base font-bold text-gray-900 tabular-nums">
                          {formatPrice(item.currentPrice)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">ine</span>
                      </td>
                      {history && (
                        <td className="px-5 py-3.5 text-center">
                          <Sparkline values={spark} />
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-right">
                        <ChangeBadge value={change1d.value} percentage={change1d.percentage} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ChangeBadge value={changePeriod.value} percentage={changePeriod.percentage} />
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
            filteredSorted.map(({ item, meta, change1d, changePeriod, spark }, idx) => {
              return (
                <div key={item.itemKey} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{meta.label}</div>
                        <div className="text-xs text-gray-400">{item.itemKey}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                          {meta.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 tabular-nums">
                        {formatPrice(item.currentPrice)}
                        <span className="text-sm text-gray-400 ml-0.5">ine</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">#{idx + 1}</div>
                    </div>
                  </div>

                  <div className={`mt-3 pt-3 border-t border-gray-100 grid ${history ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">前日比</div>
                      <ChangeBadge value={change1d.value} percentage={change1d.percentage} size="sm" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{listChangeLabel}</div>
                      <ChangeBadge value={changePeriod.value} percentage={changePeriod.percentage} size="sm" />
                    </div>
                    {history && (
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 mb-1">推移</div>
                        <Sparkline values={spark} width={80} height={26} />
                      </div>
                    )}
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
  headline,
}: {
  headline: { label: string; unit: string; value: number; open: number } | null;
}) {
  // 当日の始値との比較を計算
  const changeValue = headline ? headline.value - headline.open : 0;
  const changePercentage = headline && headline.open > 0 ? (changeValue / headline.open) * 100 : 0;

  const direction = changeDirection(changeValue, changePercentage);
  // 上昇は緑、下落は赤（帯の濃い緑の上で読める明るさにする）
  const changeColor = direction > 0 ? 'text-lime-200' : direction < 0 ? 'text-red-200' : 'text-white/80';
  const changeSign = direction > 0 ? '+' : direction < 0 ? '-' : '±';
  const changeArrow = direction > 0 ? '▲ ' : direction < 0 ? '▼ ' : '';
  const formatValue = (value: number) => value.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-[#5b8064] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくず */}
        <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
          <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white/90">いねさばアイテム市場</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold">いねさばアイテム市場</h1>
            </div>
            <p className="text-white/70 text-sm mb-3">いねさばアイテム市場で取引可能なアイテムの価格と値動き</p>
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

          {headline && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 self-start sm:self-auto">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-white/60 mb-0.5">{headline.label}</div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold tabular-nums">{formatValue(headline.value)}</span>
                    {headline.unit && <span className="text-sm text-white/60 ml-1 font-normal">{headline.unit}</span>}
                  </div>
                </div>
                <div className={`flex flex-col items-end ${changeColor}`}>
                  <div className="text-[10px] text-white/60 font-normal mb-0.5 leading-none">前日比</div>
                  <span className="text-sm font-bold flex items-baseline">
                    <span className="tabular-nums">{changeArrow}{changeSign}{formatValue(Math.abs(changeValue))}</span>
                    {headline.unit && <span className="text-[10px] opacity-80 font-normal ml-0.5">{headline.unit}</span>}
                  </span>
                  <span className="text-xs font-semibold tabular-nums">
                    {changeSign}{Math.abs(changePercentage).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
