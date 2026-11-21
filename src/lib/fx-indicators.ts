// ============================================================
// FX のチャートに重ねるテクニカル指標
//   どれも終値の並びから計算する。計算に足りない最初のほうは null
// ============================================================

export type Series = (number | null)[];

// 単純移動平均：直近 period 本の平均
export function sma(values: number[], period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

// 指数移動平均。最初の period 本の平均から始める。null は飛ばす
export function ema(values: Series, period: number): Series {
  const out: Series = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  const seed: number[] = [];
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) continue;
    if (prev == null) {
      seed.push(v);
      if (seed.length === period) {
        prev = seed.reduce((a, b) => a + b, 0) / period;
        out[i] = prev;
      }
      continue;
    }
    prev = v * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// ボリンジャーバンド：直近 period 本の平均と、そこから標準偏差の mult 倍離れた線
export function bollinger(values: number[], period = 20, mult = 2): { mid: Series; upper: Series; lower: Series } {
  const mid = sma(values, period);
  const upper: Series = new Array(values.length).fill(null);
  const lower: Series = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const m = mid[i];
    if (m == null) continue;
    let sq = 0;
    for (let j = i - period + 1; j <= i; j++) sq += (values[j] - m) ** 2;
    const sd = Math.sqrt(sq / period);
    upper[i] = m + mult * sd;
    lower[i] = m - mult * sd;
  }
  return { mid, upper, lower };
}

// RSI（ワイルダーの平滑化）。0〜100
export function rsi(values: number[], period = 14): Series {
  const out: Series = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  const toRsi = (gain: number, loss: number) => (gain + loss === 0 ? 50 : 100 - 100 / (1 + gain / Math.max(loss, 1e-12)));
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d > 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  out[period] = toRsi(gain, loss);
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = toRsi(gain, loss);
  }
  return out;
}

// MACD：短期と長期の指数移動平均の差（line）、その指数移動平均（signal）、2本の差（hist）
export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9): { line: Series; signal: Series; hist: Series } {
  const f = ema(values, fast);
  const s = ema(values, slow);
  const line: Series = values.map((_, i) => {
    const a = f[i];
    const b = s[i];
    return a != null && b != null ? a - b : null;
  });
  const signal = ema(line, signalPeriod);
  const hist: Series = line.map((v, i) => {
    const sig = signal[i];
    return v != null && sig != null ? v - sig : null;
  });
  return { line, signal, hist };
}
