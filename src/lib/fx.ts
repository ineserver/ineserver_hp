// ============================================================
// FX（JobsPointFX）API の型と表示用の関数
//   api.1necat.net の /api/fx/* が、プラグインの API を中継している
// ============================================================

// 手元で別の API を使うときは NEXT_PUBLIC_FX_API_BASE で切り替える
export const FX_API_BASE = process.env.NEXT_PUBLIC_FX_API_BASE ?? 'https://api.1necat.net';

// ------------------------------------------------------------
// 型
// ------------------------------------------------------------

export interface FxStatus {
  now: number;           // プラグインの現在時刻（ミリ秒）
  open: boolean;         // いま建てられるか
  start: number | null;  // 期間の始まり（ミリ秒）。null なら最初から
  end: number | null;    // 期間の終わり（ミリ秒）。null なら終わらない
  notice: string;
}

export interface FxSymbol {
  id: string;
  name: string;
  price: number;
  dayOpen: number;          // 0時の値
  dayChange: number;        // 前日比（0.025 = +2.5%）
  dailyVolatility: number;  // 1日の荒さ（0.03 = 3%）
}

// t は足の始まり（秒）。最後の1本はまだできあがっていない
export interface FxCandle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface FxRankEntry {
  rank: number;
  name: string;
  pnl: number;     // 決済した損益の合計（手数料を引く前）
  trades: number;  // 決済した回数
}

// ------------------------------------------------------------
// 取得
// ------------------------------------------------------------

export type FxResponse<T> = { ok: true; data: T } | { ok: false };

export async function fetchFx<T>(path: string, init?: RequestInit): Promise<FxResponse<T>> {
  try {
    const res = await fetch(`${FX_API_BASE}/api/fx${path}`, { cache: 'no-store', ...init });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    if (json?.status !== 'success') return { ok: false };
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false };
  }
}

export const candlesPath = (symbol: string, tf: number, limit: number) =>
  `/candles?symbol=${encodeURIComponent(symbol)}&tf=${tf}&limit=${limit}`;

// ------------------------------------------------------------
// 表記
// ------------------------------------------------------------

// ゲーム内のチャートと同じく、上がった足は緑、下がった足は赤
export const UP_COLOR = '#16a34a';
export const DOWN_COLOR = '#dc2626';

export const TIMEFRAMES = [
  { tf: 1, label: '1分足' },
  { tf: 5, label: '5分足' },
  { tf: 15, label: '15分足' },
  { tf: 60, label: '1時間足' },
] as const;

export function formatPrice(value: number): string {
  return value.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatSignedPrice(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return sign + formatPrice(Math.abs(value));
}

export function formatPercent(ratio: number, digits = 2): string {
  const value = ratio * 100;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function formatPoints(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return `${sign}${Math.abs(value).toLocaleString('ja-JP', { maximumFractionDigits: 2 })}pt`;
}

const DATE_TIME = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(ms: number): string {
  return DATE_TIME.format(new Date(ms));
}

// 期間の終わりは「12/5 0:00」より「12/4 いっぱい」のほうが伝わるので、0時ちょうどなら前日の 24:00 と書く
export function formatPeriodEnd(ms: number): string {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(ms));
  const hour = Number(parts.find(p => p.type === 'hour')?.value);
  const minute = Number(parts.find(p => p.type === 'minute')?.value);
  if (hour === 0 && minute === 0) {
    const day = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(new Date(ms - 1));
    return `${day} 24:00`;
  }
  return formatDateTime(ms);
}

// 残り時間（「3日 4時間」「4時間 12分」「12分」）
export function formatRemaining(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}日 ${hours}時間`;
  if (hours > 0) return `${hours}時間 ${mins}分`;
  return `${mins}分`;
}
