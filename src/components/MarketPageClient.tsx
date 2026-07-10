'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';

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

function MarketChart({ chartData, currentIndex }: { chartData: { date: string; index: number }[], currentIndex: number }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; point: { date: string; index: number; isCurrent?: boolean } } | null>(null);

  // chartDataの最後に現在のインデックスを「現在」として追加する
  const displayData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const extended: Array<{ date: string; index: number; isCurrent?: boolean }> = [...chartData];
    extended.push({
      date: new Date().toISOString(),
      index: currentIndex,
      isCurrent: true
    });
    return extended;
  }, [chartData, currentIndex]);

  if (displayData.length < 2) return null;

  const width = 1000;
  const height = 240;
  const padding = { top: 20, right: 60, bottom: 20, left: 20 }; // 右側にラベル用の余白を増やす

  const values = displayData.map(d => d.index);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  // 値の変動がない場合（rangeが0）も考慮
  const range = maxVal - minVal || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const toX = (i: number) => padding.left + (i / (displayData.length - 1)) * chartWidth;
  // 上下逆転させてY座標を計算
  const toY = (val: number) => padding.top + chartHeight - ((val - minVal) / range) * chartHeight;

  const points = displayData.map((d, i) => `${toX(i)},${toY(d.index)}`).join(' ');
  const firstPoint = displayData[0];
  const lastPoint = displayData[displayData.length - 1];
  const isPositive = lastPoint.index >= firstPoint.index;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  const fillPath = `M ${toX(0)},${toY(displayData[0].index)} ` +
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">全体相場インデックス (過去30日間)</h2>
      </div>
      <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={`bigChartGrad-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={fillPath} fill={`url(#bigChartGrad-${isPositive ? 'up' : 'down'})`} />

          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 最後のポイント（現在値）の強調 */}
          <circle
            cx={lastX}
            cy={lastY}
            r="4"
            fill={lineColor}
            stroke="white"
            strokeWidth="2"
          />
          {/* 最後のポイントのラベル（右側に常時表示） */}
          <text
            x={lastX + 8}
            y={lastY + 4}
            fill={lineColor}
            fontSize="12"
            fontWeight="bold"
          >
            {formatIndex(lastPoint.index)}
          </text>

          {displayData.map((d, i) => {
            const cx = toX(i);
            const cy = toY(d.index);
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: cx, y: cy, point: d })}
                />
                {hoveredPoint?.point.date === d.date && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill={lineColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-10 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg px-3 py-2 pointer-events-none shadow-xl whitespace-nowrap border border-white/10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-semibold text-gray-300 text-xs mb-0.5">{formatDate(hoveredPoint.point.date, hoveredPoint.point.isCurrent)}</div>
            <div className="font-bold tabular-nums">{formatIndex(hoveredPoint.point.index)}</div>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2 px-1 sm:px-5">
        <span className="text-xs text-gray-400 font-medium">{formatDate(displayData[0].date)}</span>
        <span className="text-xs text-gray-400 font-medium">現在</span>
      </div>
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function MarketPageClient() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [indexData, setIndexData] = useState<MarketIndexData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('price_desc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [blocksRes, indexRes] = await Promise.all([
          fetch('https://api.1necat.net/api/market/blocks'),
          fetch('https://api.1necat.net/api/market/index'),
        ]);
        if (!blocksRes.ok || !indexRes.ok) throw new Error('データの取得に失敗しました');

        const [blocksJson, indexJson] = await Promise.all([blocksRes.json(), indexRes.json()]);

        if (blocksJson.status === 'success') setItems(blocksJson.data.items);
        if (indexJson.status === 'success') setIndexData(indexJson.data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
        setError('相場データの取得に失敗しました。しばらくしてから再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

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

  // ローディング
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader indexData={null} lastUpdated={null} />
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
        <PageHeader indexData={null} lastUpdated={null} />
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
      <PageHeader indexData={indexData} lastUpdated={lastUpdated} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* グラフ */}
        {indexData && indexData.chartData30Days && (
          <MarketChart chartData={indexData.chartData30Days} currentIndex={indexData.currentIndex} />
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

function PageHeader({ indexData, lastUpdated }: { indexData: MarketIndexData | null; lastUpdated: Date | null }) {
  const isPositive = (indexData?.comparisonPreviousDay.value ?? 0) >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
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
            <p className="text-white/70 text-sm">いねさば経済圏の全アイテム価格と変動データ</p>
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
                    {changeArrow} {changeSign}{Math.abs(indexData.comparisonPreviousDay.value).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold">
                    {changeSign}{indexData.comparisonPreviousDay.percentage.toFixed(2)}%
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
