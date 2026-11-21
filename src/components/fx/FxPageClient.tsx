'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import FxChart, { MA_LINES, WARMUP_CANDLES, withLivePrice, type IndicatorSet } from './FxChart';
import {
  DOWN_COLOR,
  TIMEFRAMES,
  UP_COLOR,
  candlesPath,
  fetchFx,
  formatPercent,
  formatPeriodEnd,
  formatDateTime,
  formatPoints,
  formatPrice,
  formatRemaining,
  formatSignedPrice,
  type FxCandle,
  type FxRankEntry,
  type FxStatus,
  type FxSymbol,
} from '@/lib/fx';

const RULES_PATH = '/announcements/fx';
const CANDLE_LIMIT = 120 + WARMUP_CANDLES; // 表示は最大 120 本。残りはテクニカル指標の計算に使う
const RANKING_PREVIEW = 10;

const INDICATOR_STORAGE_KEY = 'fx:indicators';
const DEFAULT_INDICATORS: IndicatorSet = { ma: true, bb: false, rsi: false, macd: false };
const INDICATOR_CHIPS: { key: keyof IndicatorSet; label: string }[] = [
  { key: 'ma', label: '移動平均' },
  { key: 'bb', label: 'ボリンジャーバンド' },
  { key: 'rsi', label: 'RSI' },
  { key: 'macd', label: 'MACD' },
];

// 選んだテクニカル指標は、この端末に覚えておく
function useIndicators() {
  const [indicators, setIndicators] = useState<IndicatorSet>(DEFAULT_INDICATORS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INDICATOR_STORAGE_KEY);
      if (raw) setIndicators({ ...DEFAULT_INDICATORS, ...JSON.parse(raw) });
    } catch {
      // 読めなければ最初の設定のまま
    }
  }, []);

  const toggle = (key: keyof IndicatorSet) =>
    setIndicators(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(INDICATOR_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 保存できなくても、開いている間は使える
      }
      return next;
    });

  return [indicators, toggle] as const;
}

function IndicatorGuide() {
  return (
    <details className="mt-3 text-xs text-gray-600 leading-relaxed">
      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">テクニカル指標の見方</summary>
      <ul className="mt-2 space-y-1.5 pl-1">
        <li>
          <span className="font-bold text-gray-800">移動平均</span>：直近
          {MA_LINES.map(line => (
            <span key={line.period} style={{ color: line.color }} className="font-bold">
              {' '}{line.period}本
            </span>
          ))}
          {' '}の終値の平均をつないだ線です。値動きの大まかな向きが見やすくなります。
        </li>
        <li>
          <span className="font-bold text-gray-800">ボリンジャーバンド</span>：直近20本の平均（点線）と、その上下の帯です。値動きが荒いときは帯が広がり、おだやかなときは狭まります。
        </li>
        <li>
          <span className="font-bold text-gray-800">RSI</span>：直近14本で、上がった幅と下がった幅のどちらが大きかったかを 0〜100 で表します。70以上は上がる動きが強かった、30以下は下がる動きが強かったという目安です。
        </li>
        <li>
          <span className="font-bold text-gray-800">MACD</span>：短い期間と長い期間の平均の差（青）と、その平均（シグナル、橙）です。棒は2本の線の差です。
        </li>
      </ul>
      <p className="mt-2 text-gray-500">
        どれも過去の値動きを見やすくするためのものです。このFXの値は乱数で動くため、先の値を当てるものではありません。
      </p>
    </details>
  );
}

// 画面が見えている間だけ、interval ごとに fn を呼ぶ。key が変わるとすぐに呼び直す
function usePolling(fn: () => void, interval: number, key = '') {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    const run = () => {
      if (!document.hidden) fnRef.current();
    };
    run();
    const timer = window.setInterval(run, interval);
    document.addEventListener('visibilitychange', run);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', run);
    };
  }, [interval, key]);
}

const changeColor = (value: number) => (value > 0 ? UP_COLOR : value < 0 ? DOWN_COLOR : '#6b7280');

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 pb-2 border-b-[3px] border-[#5b8064]">
      <h2 className="text-xl font-bold text-[#333333] leading-[1.3]">{children}</h2>
    </div>
  );
}

// ------------------------------------------------------------
// 開催状況
// ------------------------------------------------------------

type Phase = 'before' | 'open' | 'ended';

function phaseOf(status: FxStatus, now: number): Phase {
  if (status.start != null && now < status.start) return 'before';
  if (status.end != null && now >= status.end) return 'ended';
  return 'open';
}

function PeriodLine({ status, now }: { status: FxStatus; now: number }) {
  const phase = phaseOf(status, now);
  const range =
    status.start != null || status.end != null
      ? `${status.start != null ? formatDateTime(status.start) : ''} 〜 ${status.end != null ? formatPeriodEnd(status.end) : ''}`
      : null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {range && <span className="text-white/90">{range}</span>}
      {phase === 'open' && status.end != null && (
        <span className="font-bold">終了まで あと {formatRemaining(status.end - now)}</span>
      )}
      {phase === 'before' && status.start != null && (
        <span className="font-bold">開始まで あと {formatRemaining(status.start - now)}</span>
      )}
      {phase === 'ended' && <span className="font-bold">取引の期間は終わりました</span>}
    </div>
  );
}

// ------------------------------------------------------------
// 銘柄
// ------------------------------------------------------------

function SymbolCard({ symbol, selected, onSelect }: { symbol: FxSymbol; selected: boolean; onSelect: () => void }) {
  const diff = symbol.price - symbol.dayOpen;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`min-w-0 text-left bg-white rounded-lg border px-2.5 sm:px-4 py-2.5 sm:py-3.5 transition-shadow ${
        selected ? 'border-[#5b8064] ring-2 ring-[#5b8064]/30 shadow-sm' : 'border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <span className="font-bold text-gray-900">{symbol.name}</span>
        <span className="text-[11px] sm:text-xs text-gray-500">
          <span className="hidden sm:inline">1日の</span>荒さ {Math.round(symbol.dailyVolatility * 100)}%
        </span>
      </div>
      <p className="mt-1 text-lg sm:text-2xl font-bold text-gray-900 tabular-nums">{formatPrice(symbol.price)}</p>
      <p className="text-xs sm:text-sm font-medium tabular-nums" style={{ color: changeColor(diff) }}>
        <span className="hidden sm:inline">{formatSignedPrice(diff)}（</span>
        {formatPercent(symbol.dayChange)}
        <span className="hidden sm:inline">）</span>
        <span className="ml-1 text-[10px] sm:text-xs font-normal text-gray-400">前日比</span>
      </p>
    </button>
  );
}

// ------------------------------------------------------------
// ランキング
// ------------------------------------------------------------

function Ranking({ entries, failed }: { entries: FxRankEntry[] | null; failed: boolean }) {
  const [showAll, setShowAll] = useState(false);
  if (entries == null) {
    return <p className="py-8 text-center text-sm text-gray-400">{failed ? 'ランキングを読み込めませんでした' : '読み込み中…'}</p>;
  }
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">まだ決済した人はいません</p>;
  }
  const shown = showAll ? entries : entries.slice(0, RANKING_PREVIEW);
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 whitespace-nowrap">
              <th className="py-2 pr-2 text-left font-medium w-12">順位</th>
              <th className="py-2 pr-2 text-left font-medium">プレイヤー</th>
              <th className="py-2 pr-2 text-right font-medium">損益</th>
              <th className="py-2 text-right font-medium whitespace-nowrap">決済回数</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(entry => (
              <tr key={`${entry.rank}-${entry.name}`} className="border-b border-gray-100 last:border-0">
                <td className="py-2 pr-2 font-bold text-gray-700 tabular-nums">{entry.rank}</td>
                <td className="py-2 pr-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <Image
                      src={`https://minotar.net/helm/${encodeURIComponent(entry.name)}/24`}
                      alt=""
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded shrink-0 bg-gray-100"
                      unoptimized
                    />
                    <span className="truncate text-gray-900">{entry.name}</span>
                  </span>
                </td>
                <td className="py-2 pr-2 text-right font-bold tabular-nums whitespace-nowrap" style={{ color: changeColor(entry.pnl) }}>
                  {formatPoints(entry.pnl)}
                </td>
                <td className="py-2 text-right text-gray-600 tabular-nums">{entry.trades}回</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length > RANKING_PREVIEW && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="mt-3 w-full py-2 text-sm font-medium text-[#2f5a3c] border border-gray-200 rounded-md hover:bg-gray-50"
        >
          {showAll ? `上位${RANKING_PREVIEW}人だけ表示` : `すべて表示（${entries.length}人）`}
        </button>
      )}
    </>
  );
}

// ------------------------------------------------------------
// ページ
// ------------------------------------------------------------

export default function FxPageClient() {
  const [status, setStatus] = useState<FxStatus | null>(null);
  const [symbols, setSymbols] = useState<FxSymbol[] | null>(null);
  const [ranking, setRanking] = useState<FxRankEntry[] | null>(null);
  const [candles, setCandles] = useState<{ key: string; data: FxCandle[] } | null>(null);
  const [failed, setFailed] = useState({ status: false, symbols: false, candles: false, ranking: false });
  const [selected, setSelected] = useState<string | null>(null);
  const [tf, setTf] = useState(5);
  const [indicators, toggleIndicator] = useIndicators();
  const [now, setNow] = useState(() => Date.now());
  const candleKey = selected ? `${selected}:${tf}` : '';
  const candleKeyRef = useRef(candleKey);
  useEffect(() => {
    candleKeyRef.current = candleKey;
  }, [candleKey]);

  const markFailed = (name: keyof typeof failed, value: boolean) =>
    setFailed(prev => (prev[name] === value ? prev : { ...prev, [name]: value }));

  usePolling(() => {
    fetchFx<FxStatus>('/status').then(res => {
      if (res.ok) setStatus(res.data);
      markFailed('status', !res.ok);
    });
  }, 60_000);

  usePolling(() => {
    fetchFx<FxSymbol[]>('/symbols').then(res => {
      if (res.ok) {
        setSymbols(res.data);
        setSelected(prev => (prev && res.data.some(s => s.id === prev) ? prev : res.data[0]?.id ?? null));
      }
      markFailed('symbols', !res.ok);
      setNow(Date.now());
    });
  }, 3_000);

  usePolling(() => {
    fetchFx<FxRankEntry[]>('/ranking').then(res => {
      if (res.ok) setRanking(res.data);
      markFailed('ranking', !res.ok);
    });
  }, 60_000);

  usePolling(
    () => {
      if (!selected) return;
      const key = candleKey;
      fetchFx<FxCandle[]>(candlesPath(selected, tf, CANDLE_LIMIT)).then(res => {
        if (key !== candleKeyRef.current) return; // 銘柄や足を切り替えたあとに届いた古い結果
        if (res.ok) setCandles({ key, data: res.data });
        markFailed('candles', !res.ok);
      });
    },
    15_000,
    candleKey,
  );

  // 残り時間の表示を進める（値の更新が止まっていても動くように）
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // サーバーの時計と大きくずれている端末だけ、サーバーの時刻に合わせる
  const offset = status && Math.abs(status.now - now) > 60_000 ? status.now - now : 0;
  const serverNow = now + offset;

  const current = symbols?.find(s => s.id === selected) ?? null;
  const chartCandles =
    candles && candles.key === candleKey ? withLivePrice(candles.data, tf, current?.price ?? null, serverNow) : [];
  const chartState = candles && candles.key === candleKey ? 'ready' : failed.candles ? 'error' : 'loading';
  const unavailable = symbols == null && failed.symbols;

  return (
    <div className="bg-gray-50 min-h-full pb-12">
      {/* 上の帯 */}
      <div className="bg-[#2f5a3c] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-7">
          <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">職業ポイントFX</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">職業ポイントFX</h1>
          {status ? (
            <PeriodLine status={status} now={serverNow} />
          ) : (
            <p className="text-sm text-white/70">{failed.status ? '開催状況を読み込めませんでした' : '読み込み中…'}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={RULES_PATH}
              className="px-4 py-2 rounded-md bg-white text-[#2f5a3c] text-sm font-bold hover:bg-[#ecf3ee] transition-colors"
            >
              遊び方・ルール
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900 leading-relaxed">
          職業ポイントFXは乱数です。取引はゲーム内の
          <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-amber-200 text-xs">/fx</code>
          をご利用下さい。
        </div>

        {unavailable ? (
          <div className="bg-white border border-gray-200 rounded-lg px-6 py-12 text-center">
            <p className="font-bold text-gray-800 mb-1">FX の情報を表示できません</p>
            <p className="text-sm text-gray-500">サーバーが停止しているか、FX の開催が終わった可能性があります。</p>
          </div>
        ) : (
          <>
            {/* 銘柄 */}
            <section>
              <SectionTitle>銘柄</SectionTitle>
              {symbols ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {symbols.map(symbol => (
                    <SymbolCard
                      key={symbol.id}
                      symbol={symbol}
                      selected={symbol.id === selected}
                      onSelect={() => setSelected(symbol.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-[92px] sm:h-[106px] rounded-lg bg-white border border-gray-200 animate-pulse" />
                  ))}
                </div>
              )}
            </section>

            {/* チャート */}
            <section>
              <SectionTitle>{current ? `${current.name}のチャート` : 'チャート'}</SectionTitle>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="足の長さ">
                    {TIMEFRAMES.map(item => (
                      <button
                        key={item.tf}
                        type="button"
                        onClick={() => setTf(item.tf)}
                        aria-pressed={tf === item.tf}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          tf === item.tf ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: UP_COLOR }} />上がった</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DOWN_COLOR }} />下がった</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#d97706]" />いまの値</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-3" role="group" aria-label="テクニカル指標">
                  <span className="text-xs text-gray-500 mr-1">テクニカル</span>
                  {INDICATOR_CHIPS.map(chip => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => toggleIndicator(chip.key)}
                      aria-pressed={indicators[chip.key]}
                      className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                        indicators[chip.key]
                          ? 'bg-[#2f5a3c] border-[#2f5a3c] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <FxChart
                  candles={chartCandles}
                  tf={tf}
                  price={current?.price ?? null}
                  state={chartState}
                  indicators={indicators}
                />
                <IndicatorGuide />
              </div>
            </section>

            {/* ランキング */}
            <section>
              <SectionTitle>損益ランキング</SectionTitle>
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <Ranking entries={ranking} failed={failed.ranking} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
