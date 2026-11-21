'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DOWN_COLOR, UP_COLOR, formatPrice, type FxCandle } from '@/lib/fx';
import { bollinger, macd, rsi, sma, type Series } from '@/lib/fx-indicators';

export interface IndicatorSet {
  ma: boolean;
  bb: boolean;
  rsi: boolean;
  macd: boolean;
}

export const MA_LINES = [
  { period: 5, color: '#2563eb' },
  { period: 25, color: '#db2777' },
  { period: 75, color: '#7c3aed' },
] as const;
const BB_PERIOD = 20;
const BB_MULT = 2;
const BB_COLOR = '#0891b2';
const RSI_PERIOD = 14;
const RSI_COLOR = '#7c3aed';
const MACD_COLOR = '#2563eb';
const SIGNAL_COLOR = '#f97316';

// 指標の計算に使うため、表示する本数より前の足も要る（いちばん長い移動平均の 75 本ぶん以上）
export const WARMUP_CANDLES = 120;

const PAD = { top: 12, right: 68, bottom: 26, left: 8 };
const MIN_SLOT_PX = 7;     // 1本ぶんの幅の下限。これより狭くなるなら本数を減らす
const MAX_SLOTS = 120;
const PANE_GAP = 10;
const PRICE_COLOR = '#d97706';
const LABEL_STEPS_MIN = [5, 10, 15, 30, 60, 120, 180, 360, 720, 1440];
const JST_OFFSET_MIN = 9 * 60;

const TIME = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric' });
const DAY_TIME = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

// 最後の足に、いまの値を反映する（足はプラグインと同じく、エポックからの分を tf で割って区切る）
export function withLivePrice(candles: FxCandle[], tf: number, price: number | null, nowMs: number): FxCandle[] {
  if (price == null || candles.length === 0) return candles;
  const span = tf * 60;
  const bucket = Math.floor(nowMs / 1000 / span) * span;
  const last = candles[candles.length - 1];
  if (last.t === bucket) {
    return [...candles.slice(0, -1), { ...last, c: price, h: Math.max(last.h, price), l: Math.min(last.l, price) }];
  }
  if (last.t < bucket) {
    return [...candles, { t: bucket, o: last.c, h: Math.max(last.c, price), l: Math.min(last.c, price), c: price }];
  }
  return candles;
}

// きりの良い間隔で目盛りを決める
function niceTicks(min: number, max: number, target: number): number[] {
  const range = max - min;
  if (!(range > 0)) return [min];
  const raw = range / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / magnitude;
  const step = (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * magnitude;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
  return ticks;
}

// null で途切れる線の path
function linePath(values: (number | null)[], toX: (i: number) => number, toY: (v: number) => number): string {
  let d = '';
  let pen = false;
  values.forEach((v, i) => {
    if (v == null) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`;
    pen = true;
  });
  return d;
}

const fmt = (v: number | null | undefined, digits = 2) =>
  v == null ? '—' : v.toLocaleString('ja-JP', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export default function FxChart({
  candles,
  tf,
  price,
  state,
  indicators,
}: {
  candles: FxCandle[];
  tf: number;
  price: number | null;
  state: 'loading' | 'error' | 'ready';
  indicators: IndicatorSet;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(entries => setWidth(Math.floor(entries[0].contentRect.width)));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const narrow = width > 0 && width < 640;
  const mainH = narrow ? 300 : 380;
  const paneH = narrow ? 84 : 100;
  const panes = (['rsi', 'macd'] as const).filter(p => indicators[p]);
  const height = mainH + panes.length * (paneH + PANE_GAP);
  const paneTop = (k: number) => mainH + PANE_GAP + k * (paneH + PANE_GAP);

  const chartW = Math.max(0, width - PAD.left - PAD.right);
  const chartH = mainH - PAD.top - PAD.bottom;
  const slots = Math.max(20, Math.min(MAX_SLOTS, Math.floor(chartW / MIN_SLOT_PX)));
  const visible = useMemo(() => candles.slice(-slots), [candles, slots]);
  const offset = candles.length - visible.length;
  const slot = chartW / slots;

  // 指標は前の足も使って計算し、表示する分だけ切り出す
  const calc = useMemo(() => {
    const closes = candles.map(c => c.c);
    const cut = (s: Series) => s.slice(offset);
    const bb = bollinger(closes, BB_PERIOD, BB_MULT);
    const m = macd(closes);
    return {
      ma: MA_LINES.map(line => cut(sma(closes, line.period))),
      bbUpper: cut(bb.upper),
      bbMid: cut(bb.mid),
      bbLower: cut(bb.lower),
      rsi: cut(rsi(closes, RSI_PERIOD)),
      macd: cut(m.line),
      signal: cut(m.signal),
      hist: cut(m.hist),
    };
  }, [candles, offset]);

  const scale = useMemo(() => {
    if (visible.length === 0) return null;
    const values: number[] = [];
    for (const c of visible) values.push(c.h, c.l);
    if (price != null) values.push(price);
    const extra: Series[] = [];
    if (indicators.ma) extra.push(...calc.ma);
    if (indicators.bb) extra.push(calc.bbUpper, calc.bbLower);
    for (const s of extra) for (const v of s) if (v != null) values.push(v);
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const margin = (hi - lo || hi * 0.01 || 1) * 0.08;
    return { min: lo - margin, max: hi + margin };
  }, [visible, price, calc, indicators.ma, indicators.bb]);

  const toY = (v: number) => (scale ? PAD.top + chartH - ((v - scale.min) / (scale.max - scale.min)) * chartH : 0);
  // 右に寄せて並べる（本数が少なくても1本の幅は変えない）
  const toX = (i: number) => PAD.left + chartW - (visible.length - i - 0.5) * slot;
  const bodyW = Math.max(1, Math.min(14, slot * 0.65));

  const ticks = scale ? niceTicks(scale.min, scale.max, mainH < 340 ? 4 : 6) : [];

  // 横軸の時刻。きりの良い時刻の足にだけ付け、0時の足は日付にする
  const timeLabels = useMemo(() => {
    if (visible.length === 0) return [];
    const maxLabels = Math.max(2, Math.floor(chartW / 65));
    const spanMinutes = visible.length * tf;
    const step = LABEL_STEPS_MIN.find(s => s >= tf && spanMinutes / s <= maxLabels) ?? 1440;
    const labels: { i: number; text: string }[] = [];
    visible.forEach((c, i) => {
      const jstMinute = Math.floor(c.t / 60) + JST_OFFSET_MIN;
      if (jstMinute % step !== 0) return;
      const date = new Date(c.t * 1000);
      labels.push({ i, text: jstMinute % 1440 === 0 ? DAY.format(date) : TIME.format(date) });
    });
    return labels;
  }, [visible, chartW, tf]);

  // MACD の欄は 0 を真ん中にする
  const macdRange = useMemo(() => {
    let m = 0;
    for (const s of [calc.macd, calc.signal, calc.hist]) for (const v of s) if (v != null) m = Math.max(m, Math.abs(v));
    return m > 0 ? m * 1.15 : 1;
  }, [calc]);

  const pointAt = (clientX: number) => {
    const box = boxRef.current;
    if (!box || visible.length === 0) return;
    const x = clientX - box.getBoundingClientRect().left;
    const i = Math.round(visible.length - 0.5 - (PAD.left + chartW - x) / slot);
    setHover(i >= 0 && i < visible.length ? i : null);
  };

  const hovered = hover != null ? visible[hover] : null;
  const at = hover ?? visible.length - 1; // 凡例の値は、カーソルの足か最新の足

  const bbArea = (() => {
    if (!indicators.bb) return '';
    const idx = calc.bbUpper.map((v, i) => (v != null ? i : -1)).filter(i => i >= 0);
    if (idx.length < 2) return '';
    const up = idx.map(i => `${toX(i).toFixed(1)},${toY(calc.bbUpper[i]!).toFixed(1)}`);
    const down = [...idx].reverse().map(i => `${toX(i).toFixed(1)},${toY(calc.bbLower[i]!).toFixed(1)}`);
    return `M${up.join('L')}L${down.join('L')}Z`;
  })();

  const ready = state === 'ready' && scale != null && width > 0;

  return (
    <div>
      {ready && (indicators.ma || indicators.bb) && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1 text-[11px] tabular-nums">
          {indicators.ma &&
            MA_LINES.map((line, k) => (
              <span key={line.period} style={{ color: line.color }}>
                MA{line.period} {fmt(calc.ma[k][at])}
              </span>
            ))}
          {indicators.bb && (
            <span style={{ color: BB_COLOR }}>
              BB({BB_PERIOD},{BB_MULT}) {fmt(calc.bbUpper[at])} / {fmt(calc.bbLower[at])}
            </span>
          )}
        </div>
      )}

      <div ref={boxRef} className="relative w-full select-none" style={{ height }}>
        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            {state === 'error' ? 'チャートを読み込めませんでした' : '読み込み中…'}
          </div>
        ) : (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="block touch-pan-y"
            onMouseMove={e => pointAt(e.clientX)}
            onMouseLeave={() => setHover(null)}
            onTouchStart={e => pointAt(e.touches[0].clientX)}
            onTouchMove={e => pointAt(e.touches[0].clientX)}
            onTouchEnd={() => setHover(null)}
          >
            <defs>
              <clipPath id="fx-main-clip">
                <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
              </clipPath>
            </defs>

            {/* 価格の目盛り */}
            {ticks.map(v => (
              <g key={v}>
                <line x1={PAD.left} x2={PAD.left + chartW} y1={toY(v)} y2={toY(v)} stroke="#f0f0f0" />
                <text x={PAD.left + chartW + 8} y={toY(v) + 4} fontSize={11} className="fill-gray-400">
                  {formatPrice(v)}
                </text>
              </g>
            ))}
            <line x1={PAD.left + chartW} x2={PAD.left + chartW} y1={PAD.top} y2={height} stroke="#e5e7eb" />

            {/* 時刻 */}
            {timeLabels.filter(({ i }) => toX(i) > PAD.left + 18).map(({ i, text }) => (
              <text key={i} x={toX(i)} y={mainH - 8} fontSize={11} textAnchor="middle" className="fill-gray-400">
                {text}
              </text>
            ))}

            <g clipPath="url(#fx-main-clip)">
              {/* ボリンジャーバンド（足の後ろ） */}
              {indicators.bb && (
                <g>
                  <path d={bbArea} fill={BB_COLOR} fillOpacity={0.07} />
                  <path d={linePath(calc.bbUpper, toX, toY)} fill="none" stroke={BB_COLOR} strokeWidth={1} />
                  <path d={linePath(calc.bbLower, toX, toY)} fill="none" stroke={BB_COLOR} strokeWidth={1} />
                  <path d={linePath(calc.bbMid, toX, toY)} fill="none" stroke={BB_COLOR} strokeWidth={1} strokeDasharray="3 3" />
                </g>
              )}

              {/* ローソク足 */}
              {visible.map((c, i) => {
                const color = c.c >= c.o ? UP_COLOR : DOWN_COLOR;
                const x = toX(i);
                const top = toY(Math.max(c.o, c.c));
                return (
                  <g key={c.t}>
                    <line x1={x} x2={x} y1={toY(c.h)} y2={toY(c.l)} stroke={color} strokeWidth={1} />
                    <rect
                      x={x - bodyW / 2}
                      y={top}
                      width={bodyW}
                      height={Math.max(1, toY(Math.min(c.o, c.c)) - top)}
                      fill={color}
                    />
                  </g>
                );
              })}

              {/* 移動平均（足の前） */}
              {indicators.ma &&
                MA_LINES.map((line, k) => (
                  <path
                    key={line.period}
                    d={linePath(calc.ma[k], toX, toY)}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                ))}
            </g>

            {/* いまの値（ゲーム内のチャートと同じく黄色） */}
            {price != null && (
              <g>
                <line
                  x1={PAD.left}
                  x2={PAD.left + chartW}
                  y1={toY(price)}
                  y2={toY(price)}
                  stroke={PRICE_COLOR}
                  strokeDasharray="4 3"
                />
                <rect x={PAD.left + chartW + 2} y={toY(price) - 10} width={PAD.right - 4} height={20} rx={3} fill={PRICE_COLOR} />
                <text x={PAD.left + chartW + 7} y={toY(price) + 4} fontSize={11} fontWeight={700} fill="#fff">
                  {formatPrice(price)}
                </text>
              </g>
            )}

            {/* RSI・MACD の欄 */}
            {panes.map((pane, k) => {
              const top = paneTop(k);
              if (pane === 'rsi') {
                const y = (v: number) => top + (1 - v / 100) * paneH;
                const value = calc.rsi[at];
                return (
                  <g key={pane}>
                    <line x1={PAD.left} x2={PAD.left + chartW} y1={top - PANE_GAP / 2} y2={top - PANE_GAP / 2} stroke="#e5e7eb" />
                    <rect x={PAD.left} y={y(70)} width={chartW} height={y(30) - y(70)} fill={RSI_COLOR} fillOpacity={0.05} />
                    {[70, 30].map(level => (
                      <g key={level}>
                        <line x1={PAD.left} x2={PAD.left + chartW} y1={y(level)} y2={y(level)} stroke="#d1d5db" strokeDasharray="3 3" />
                        <text x={PAD.left + chartW + 8} y={y(level) + 4} fontSize={11} className="fill-gray-400">{level}</text>
                      </g>
                    ))}
                    <path d={linePath(calc.rsi, toX, y)} fill="none" stroke={RSI_COLOR} strokeWidth={1.5} />
                    <text x={PAD.left + 4} y={top + 12} fontSize={11} className="fill-gray-500">
                      RSI({RSI_PERIOD}) <tspan fill={RSI_COLOR} fontWeight={700}>{fmt(value, 1)}</tspan>
                    </text>
                  </g>
                );
              }
              const y = (v: number) => top + paneH / 2 - (v / macdRange) * (paneH / 2);
              return (
                <g key={pane}>
                  <line x1={PAD.left} x2={PAD.left + chartW} y1={top - PANE_GAP / 2} y2={top - PANE_GAP / 2} stroke="#e5e7eb" />
                  <line x1={PAD.left} x2={PAD.left + chartW} y1={y(0)} y2={y(0)} stroke="#d1d5db" />
                  <text x={PAD.left + chartW + 8} y={y(0) + 4} fontSize={11} className="fill-gray-400">0</text>
                  {calc.hist.map((v, i) =>
                    v == null ? null : (
                      <rect
                        key={i}
                        x={toX(i) - bodyW / 2}
                        y={Math.min(y(0), y(v))}
                        width={bodyW}
                        height={Math.max(0.5, Math.abs(y(v) - y(0)))}
                        fill={v >= 0 ? UP_COLOR : DOWN_COLOR}
                        fillOpacity={0.45}
                      />
                    ),
                  )}
                  <path d={linePath(calc.macd, toX, y)} fill="none" stroke={MACD_COLOR} strokeWidth={1.5} />
                  <path d={linePath(calc.signal, toX, y)} fill="none" stroke={SIGNAL_COLOR} strokeWidth={1.5} />
                  <text x={PAD.left + 4} y={top + 12} fontSize={11} className="fill-gray-500">
                    MACD <tspan fill={MACD_COLOR} fontWeight={700}>{fmt(calc.macd[at])}</tspan>
                    <tspan dx={10}>シグナル </tspan>
                    <tspan fill={SIGNAL_COLOR} fontWeight={700}>{fmt(calc.signal[at])}</tspan>
                  </text>
                </g>
              );
            })}

            {/* カーソルの位置 */}
            {hover != null && (
              <line x1={toX(hover)} x2={toX(hover)} y1={PAD.top} y2={height} stroke="#9ca3af" strokeDasharray="3 3" />
            )}
          </svg>
        )}

        {hovered && hover != null && (
          <div
            className="absolute top-2 pointer-events-none bg-white/95 border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs text-gray-700 tabular-nums"
            style={toX(hover) > width / 2 ? { left: PAD.left + 4 } : { right: PAD.right + 4 }}
          >
            <p className="font-bold text-gray-900 mb-1">
              {DAY_TIME.format(new Date(hovered.t * 1000))}
              {tf > 1 && <span className="font-normal text-gray-500">から{tf === 60 ? '1時間' : `${tf}分`}</span>}
            </p>
            <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
              <dt className="text-gray-500">始値</dt><dd className="text-right">{formatPrice(hovered.o)}</dd>
              <dt className="text-gray-500">高値</dt><dd className="text-right">{formatPrice(hovered.h)}</dd>
              <dt className="text-gray-500">安値</dt><dd className="text-right">{formatPrice(hovered.l)}</dd>
              <dt className="text-gray-500">終値</dt>
              <dd className="text-right font-bold" style={{ color: hovered.c >= hovered.o ? UP_COLOR : DOWN_COLOR }}>
                {formatPrice(hovered.c)}
              </dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
