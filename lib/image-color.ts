import { decode } from 'jpeg-js'

// バナー画像から、トップのイベント表示の背景に使う「色のにじみ」の色を取り出す（サーバー側で実行）
//
// 1. Cloudflare Images で幅48pxのJPEGに縮めたものを取得する（元の画像は数MBあるため）
// 2. 色相ごとに画素を数え、多い色味を最大4つ選ぶ（似た色味は1つにまとめる）
// 3. それぞれの色が画像のどのあたりにあるか（重心）も求め、背景のにじみをその位置から出す
//
// 画像の配信元にブラウザ向けのCORS設定がないため、ブラウザ側では画像の色を読めない。そのためサーバーで行う。

const CLOUDFLARE_IMAGE_HOST = 'img.1necat.net'

export interface PaletteColor {
  /** にじみの色 */
  color: string
  /** 画像の中での位置（0〜1） */
  x: number
  y: number
  /** その色の多さ（0〜1、一番多い色が1） */
  weight: number
}

const cache = new Map<string, PaletteColor[]>()

type RGB = [number, number, number]

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h / 6, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const rgb = [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
  return '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

/** 画像の画素から、にじみに使う色を最大4つ選ぶ */
export function pickPalette(data: Uint8Array, width: number, height: number, maxColors = 4): PaletteColor[] {
  const BINS = 24
  const bins = Array.from({ length: BINS }, () => ({ weight: 0, count: 0, sin: 0, cos: 0, sat: 0, x: 0, y: 0 }))
  const total = width * height

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const [h, s, l] = rgbToHsl([data[i], data[i + 1], data[i + 2]])
      // 色味のない画素（白・黒・灰色）は数えない
      if (s < 0.2 || l < 0.12 || l > 0.9) continue
      const bin = bins[Math.min(BINS - 1, Math.floor(h * BINS))]
      bin.weight += s
      bin.count++
      bin.sin += Math.sin(h * 2 * Math.PI)
      bin.cos += Math.cos(h * 2 * Math.PI)
      bin.sat += s
      bin.x += x / (width - 1)
      bin.y += y / (height - 1)
    }
  }

  // となりの区分とまとめた重さで比べる（区分の境目に色がまたがっても割れないように）
  const neighbors = (b: number) => [(b + BINS - 1) % BINS, b, (b + 1) % BINS].map((k) => bins[k])
  const smoothed = bins.map((_, b) => neighbors(b).reduce((a, k) => a + k.weight, 0))
  const order = smoothed.map((w, b) => ({ w, b })).sort((a, b) => b.w - a.w)

  const picked: number[] = []
  for (const { b } of order) {
    if (picked.length >= maxColors) break
    const count = neighbors(b).reduce((a, k) => a + k.count, 0)
    if (count < total * 0.015) break // 画像の1.5%に満たない色は使わない
    // 色相が近すぎる色（45°以内）は同じ色とみなす
    if (picked.some((p) => Math.min(Math.abs(p - b), BINS - Math.abs(p - b)) < 3)) continue
    picked.push(b)
  }
  if (picked.length === 0) return []

  const strongest = smoothed[picked[0]]
  return picked.map((b) => {
    const ws = neighbors(b)
    const count = ws.reduce((a, k) => a + k.count, 0)
    let h = Math.atan2(ws.reduce((a, k) => a + k.sin, 0), ws.reduce((a, k) => a + k.cos, 0)) / (2 * Math.PI)
    if (h < 0) h += 1
    const s = ws.reduce((a, k) => a + k.sat, 0) / count
    return {
      // 明るさはそろえ、鮮やかさはほどほどに（白の上に薄く重ねるので、色そのものは少し濃いめにしておく）
      color: hslToHex(h, Math.min(Math.max(s, 0.45), 0.75), 0.62),
      x: ws.reduce((a, k) => a + k.x, 0) / count,
      y: ws.reduce((a, k) => a + k.y, 0) / count,
      weight: smoothed[b] / strongest,
    }
  })
}

/** バナー画像のURLから、にじみの色を求める。取り出せなければ空の配列 */
export async function getBandPalette(imageUrl: string | undefined): Promise<PaletteColor[]> {
  if (!imageUrl) return []
  const cached = cache.get(imageUrl)
  if (cached) return cached

  try {
    const url = new URL(imageUrl)
    if (url.hostname !== CLOUDFLARE_IMAGE_HOST) return []

    const small = `https://${CLOUDFLARE_IMAGE_HOST}/cdn-cgi/image/width=48,fit=scale-down,format=jpeg,quality=80${url.pathname}`
    const res = await fetch(small, { next: { revalidate: 60 * 60 * 24 } })
    if (!res.ok) return []

    const { data, width, height } = decode(new Uint8Array(await res.arrayBuffer()), { useTArray: true })
    const palette = pickPalette(data, width, height)
    cache.set(imageUrl, palette)
    return palette
  } catch {
    return []
  }
}
