'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

// ============================================================
// 型定義
// ============================================================

interface GameCoords {
  x: number;
  z: number;
}

interface Station {
  id: string;
  name: string;
  nameEn: string;
  code: string | null;
  x: number;
  y: number;
  lines: string[];
  description: string;
  gameCoords: GameCoords | null;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

interface Service {
  name: string;
  color: string;
  borderColor: string;
  stations: string[];
}

interface Line {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  stations: string[];
  services?: Service[];
}

interface Meta {
  title: string;
  description: string;
}

interface RouteMapData {
  meta: Meta;
  lines: Line[];
  stations: Station[];
}

// ============================================================
// 定数
// ============================================================

const SVG_W = 1200;
const SVG_H = 680;
const PADDING = 200;
const LINE_GAP = 5; // parallel line gap (px in SVG space)

const LINE_GROUP_MAPPING: Record<string, string> = {
  'chuo-west': 'chuo',
  'chuo-east': 'chuo',
  'chuo-kanjyo': 'chuo-kanjyo'
};
const UNIQUE_GROUPS = ['chuo', 'chuo-kanjyo'];

const LINE_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  'chuo-west': { symbol: 'CW', color: '#f97316' },
  'chuo-east': { symbol: 'CE', color: '#f97316' },
  'chuo-kanjyo': { symbol: 'CK', color: '#3b82f6' }
};

// ============================================================
// ヘルパー
// ============================================================

/** マップ座標 → SVG座標の変換パラメータを計算 */
function computeMapTransform(stations: Station[]) {
  if (stations.length === 0) {
    return { scale: 30, ox: SVG_W / 2, oy: SVG_H / 2 };
  }

  const xs = stations.map((s) => s.x);
  const ys = stations.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dataW = maxX - minX || 20;
  const dataH = maxY - minY || 20;

  const usableW = SVG_W - PADDING * 2;
  const usableH = SVG_H - PADDING * 2;

  const scaleX = usableW / dataW;
  const scaleY = usableH / dataH;
  const scale = Math.min(scaleX, scaleY, 60);

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const ox = SVG_W / 2 - cx * scale;
  const oy = SVG_H / 2 + cy * scale; // Y軸反転

  return { scale, ox, oy };
}

/** マップ座標 → SVG座標 */
function toSVG(
  x: number,
  y: number,
  mt: { scale: number; ox: number; oy: number }
) {
  return { x: x * mt.scale + mt.ox, y: -y * mt.scale + mt.oy };
}

/**
 * 平行路線のオフセット付きポリラインポイントを滑らかな角丸パスに変換する
 */
function pointsToRoundedPath(pointsStr: string, radius: number): string {
  const pts = pointsStr
    .split(' ')
    .map((p) => {
      const [x, y] = p.split(',').map(Number);
      return { x, y };
    })
    .filter((p) => !isNaN(p.x) && !isNaN(p.y));

  if (pts.length < 2) return '';
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }

  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < pts.length - 1; i++) {
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[i + 1];

    const d1x = p2.x - p1.x;
    const d1y = p2.y - p1.y;
    const l1 = Math.sqrt(d1x * d1x + d1y * d1y) || 1;

    const d2x = p3.x - p2.x;
    const d2y = p3.y - p2.y;
    const l2 = Math.sqrt(d2x * d2x + d2y * d2y) || 1;

    // 隣り合う辺の長さの半分を超えないように半径を制限する
    const r = Math.min(radius, l1 / 2, l2 / 2);

    const startX = p2.x - (d1x / l1) * r;
    const startY = p2.y - (d1y / l1) * r;
    const endX = p2.x + (d2x / l2) * r;
    const endY = p2.y + (d2y / l2) * r;

    d += ` L ${startX} ${startY} Q ${p2.x} ${p2.y} ${endX} ${endY}`;
  }

  d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  return d;
}

/**
 * 平行路線のオフセット付きポリラインポイントを計算
 * lineIdx: この路線のインデックス (0-)
 * totalLines: 各セグメントの総路線数
 */
function computeLinePoints(
  line: Line,
  lineIdx: number,
  totalLinesOnSegments: number,
  stations: Station[],
  mt: { scale: number; ox: number; oy: number }
): string {
  const stationObjs = line.stations
    .map((id) => {
      const found = stations.find((s) => s.id === id);
      if (found) return found;
      if (id.startsWith('wp:')) {
        const [x, y] = id.replace('wp:', '').split(',').map(Number);
        return {
          id,
          name: '',
          nameEn: '',
          code: null,
          x,
          y,
          lines: [line.id],
          description: '',
          gameCoords: null
        } as Station;
      }
      return null;
    })
    .filter(Boolean) as Station[];

  if (stationObjs.length < 2) {
    return stationObjs
      .map((s) => {
        const p = toSVG(s.x, s.y, mt);
        return `${p.x},${p.y}`;
      })
      .join(' ');
  }

  const offset = (lineIdx - (totalLinesOnSegments - 1) / 2) * LINE_GAP;

  return stationObjs
    .map((s, i) => {
      const p = toSVG(s.x, s.y, mt);

      // セグメント方向ベクトルを計算して垂直オフセットを適用
      const prev = i > 0 ? stationObjs[i - 1] : null;
      const next = i < stationObjs.length - 1 ? stationObjs[i + 1] : null;

      let nx = 0,
        ny = 0;

      const addDir = (a: Station, b: Station) => {
        const ap = toSVG(a.x, a.y, mt);
        const bp = toSVG(b.x, b.y, mt);
        let dx = bp.x - ap.x;
        let dy = bp.y - ap.y;

        // 常に右方向（X軸の正方向、Xが同じならY軸の正方向）に正規化
        if (dx < 0 || (dx === 0 && dy < 0)) {
          dx = -dx;
          dy = -dy;
        }

        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        nx += dx / len;
        ny += dy / len;
      };

      if (prev) addDir(prev, s);
      if (next) addDir(s, next);

      const len = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= len;
      ny /= len;

      // 垂直方向: (-ny, nx)
      return `${p.x + -ny * offset},${p.y + nx * offset}`;
    })
    .join(' ');
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function RouteMapClient() {
  const [data, setData] = useState<RouteMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // ズーム・パン
  const [vt, setVt] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // パネルアニメーション
  const [panelVisible, setPanelVisible] = useState(false);

  // 検索機能
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // データ取得
  useEffect(() => {
    fetch('/data/route_map.json')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((d: RouteMapData) => {
        // 各駅の lines プロパティを路線データから自動逆引きして算出する
        const initializedStations = d.stations.map((s) => ({
          ...s,
          lines: d.lines.filter((l) => l.stations.includes(s.id)).map((l) => l.id),
        }));
        setData({
          ...d,
          stations: initializedStations,
        });
        setIsLoading(false);
      })
      .catch(() => {
        setError('路線図データの読み込みに失敗しました。');
        setIsLoading(false);
      });
  }, []);

  // 選択駅変更でパネルアニメーション
  useEffect(() => {
    if (selectedStation) {
      setPanelVisible(false);
      const t = setTimeout(() => setPanelVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setPanelVisible(false);
    }
  }, [selectedStation]);

  // 選択駅の路線一覧 (グループ名で重複排除)
  const selectedLines = useMemo(() => {
    if (!selectedStation || !data) return [];
    const seen = new Set<string>();
    const result: Line[] = [];
    data.lines.forEach((l) => {
      if (selectedStation.lines.includes(l.id)) {
        const groupName = LINE_GROUP_MAPPING[l.id] || l.id;
        if (!seen.has(groupName)) {
          seen.add(groupName);
          result.push(l);
        }
      }
    });
    return result;
  }, [selectedStation, data]);

  // マップ変換パラメータ
  const mt = useMemo(
    () => computeMapTransform(data?.stations ?? []),
    [data]
  );



  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: e.clientX - vt.x, y: e.clientY - vt.y });
    },
    [vt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setHasDragged(true);
      setVt((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const focusStation = useCallback((station: Station) => {
    setSelectedStation(station);
    const pos = toSVG(station.x, station.y, mt);
    const targetScale = 1.5;
    setVt({
      x: SVG_W / 2 - pos.x * targetScale,
      y: SVG_H / 2 - pos.y * targetScale,
      scale: targetScale
    });
  }, [mt]);

  const handleStationClick = useCallback(
    (station: Station, e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasDragged) return;
      setSelectedStation((prev) =>
        prev?.id === station.id ? null : station
      );
    },
    [hasDragged]
  );

  const handleBgClick = useCallback(() => {
    if (!hasDragged) setSelectedStation(null);
  }, [hasDragged]);

  const resetView = useCallback(() => setVt({ x: 0, y: 0, scale: 1 }), []);
  const zoomIn = useCallback(() => {
    setVt((p) => {
      if (p.scale === 1.5) return p;
      const targetScale = 1.5;
      const ratio = targetScale / p.scale;
      const mx = SVG_W / 2;
      const my = SVG_H / 2;
      return {
        x: mx - ratio * (mx - p.x),
        y: my - ratio * (my - p.y),
        scale: targetScale,
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setVt((p) => {
      if (p.scale === 1.0) return p;
      const targetScale = 1.0;
      const ratio = targetScale / p.scale;
      const mx = SVG_W / 2;
      const my = SVG_H / 2;
      return {
        x: mx - ratio * (mx - p.x),
        y: my - ratio * (my - p.y),
        scale: targetScale,
      };
    });
  }, []);

  // ローディング
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5b8064] border-t-transparent" />
          <p className="text-gray-500 text-sm font-semibold select-none">路線図を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center select-none">
          <div className="text-4xl mb-3">🚃</div>
          <p className="font-semibold">{error ?? 'データを読み込めませんでした。'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* 操作ヒント */}
      <p className="text-xs text-gray-400 text-center select-none font-medium">
        ドラッグで移動・ホイールでズーム・駅をクリックで詳細表示
      </p>

      {/* マップエリア */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-lg"
        style={{ height: '65vh', minHeight: '460px', background: '#ffffff' }}
      >
        {/* ─── 検索窓 ─── */}
        <div className="absolute top-4 left-4 z-20 w-64 sm:w-80">
          <div className="relative">
            <div className="flex items-center bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-2xl px-3 py-2">
              <svg
                className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="駅名で検索..."
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-0 p-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer flex-shrink-0 ml-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* サジェストリスト */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl max-h-60 overflow-y-auto z-30 p-1.5 flex flex-col gap-0.5">
                {data.stations
                  .filter((station) => {
                    const q = searchQuery.toLowerCase().trim();
                    return (
                      station.name.toLowerCase().includes(q) ||
                      (station.nameEn && station.nameEn.toLowerCase().includes(q)) ||
                      (station.code && station.code.toLowerCase().includes(q))
                    );
                  })
                  .map((station) => {
                    const stationLines = data.lines.filter((l) => l.stations.includes(station.id));

                    return (
                      <button
                        key={station.id}
                        onMouseDown={() => {
                          focusStation(station);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 text-left transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{station.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 font-sans">{station.nameEn}</p>
                        </div>
                        <div className="flex gap-1">
                          {stationLines.map((line) => {
                            const info = LINE_SYMBOLS[line.id] || { symbol: '??' };
                            const actualStations = line.stations.filter((id) => !id.startsWith('wp:'));
                            const stationIdx = actualStations.indexOf(station.id);
                            const numStr = stationIdx !== -1 ? String(stationIdx + 1).padStart(2, '0') : '00';
                            return (
                              <span
                                key={line.id}
                                className="inline-flex flex-col items-center justify-center bg-white border border-slate-200 rounded w-5 h-5 select-none"
                                style={{ borderColor: line.color }}
                              >
                                <span className="text-[5px] font-extrabold text-slate-700 leading-none mb-0.5">{info.symbol}</span>
                                <span className="text-[8px] font-extrabold text-slate-900 leading-none font-mono">{numStr}</span>
                              </span>
                            );
                          })}
                        </div>
                      </button>
                    );
                  })}
                {data.stations.filter((station) => {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    station.name.toLowerCase().includes(q) ||
                    (station.nameEn && station.nameEn.toLowerCase().includes(q)) ||
                    (station.code && station.code.toLowerCase().includes(q))
                  );
                }).length === 0 && (
                    <p className="text-slate-400 text-xs text-center py-4 font-semibold select-none">見つかりませんでした</p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* SVG路線図 */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleBgClick}
        >
          {/* 背景 */}
          <rect width={SVG_W} height={SVG_H} fill="#ffffff" />

          {/* ズーム・パン変換グループ */}
          <g transform={`translate(${vt.x},${vt.y}) scale(${vt.scale})`}>
            {/* ─── 路線 ─── */}
            {data.lines.map((line) => {
              const groupName = LINE_GROUP_MAPPING[line.id] || line.id;
              const groupIdx = UNIQUE_GROUPS.indexOf(groupName);
              const totalGroups = UNIQUE_GROUPS.length;
              const points = computeLinePoints(
                line,
                groupIdx,
                totalGroups,
                data.stations,
                mt
              );
              const roundedPath = pointsToRoundedPath(points, 20 / vt.scale);
              return (
                <path
                  key={line.id}
                  d={roundedPath}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={6 / vt.scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.88}
                />
              );
            })}

            {/* ─── 駅 ─── */}
            {data.stations.map((station) => {
              const pos = toSVG(station.x, station.y, mt);
              const isSelected = selectedStation?.id === station.id;


              // 所属路線のナンバリングデータを取得
              const numberings = station.lines.map((lineId) => {
                const line = data.lines.find((l) => l.id === lineId);
                const info = LINE_SYMBOLS[lineId] || { symbol: '??', color: '#888' };
                const actualStations = line ? line.stations.filter((id) => !id.startsWith('wp:')) : [];
                const stationIdx = actualStations.indexOf(station.id);
                const numStr = stationIdx !== -1 ? String(stationIdx + 1).padStart(2, '0') : '00';
                return {
                  lineId,
                  color: line?.color ?? '#888',
                  symbol: info.symbol,
                  numStr
                };
              });

              // 各路線上のドット位置を計算 (computeLinePoints と同様のオフセットロジック)
              const dots = station.lines.map((lineId) => {
                const line = data.lines.find((l) => l.id === lineId);
                if (!line) return null;

                const groupName = LINE_GROUP_MAPPING[lineId] || lineId;
                const groupIdx = UNIQUE_GROUPS.indexOf(groupName);
                const totalGroups = UNIQUE_GROUPS.length;
                const offset = (groupIdx - (totalGroups - 1) / 2) * LINE_GAP;

                // 進行方向ベクトルを計算
                const stationIdx = line.stations.indexOf(station.id);
                const prevId = stationIdx > 0 ? line.stations[stationIdx - 1] : null;
                const nextId = stationIdx < line.stations.length - 1 ? line.stations[stationIdx + 1] : null;

                const resolveStation = (id: string | null) => {
                  if (!id) return null;
                  const found = data.stations.find((s) => s.id === id);
                  if (found) return found;
                  if (id.startsWith('wp:')) {
                    const [x, y] = id.replace('wp:', '').split(',').map(Number);
                    return {
                      id,
                      name: '',
                      nameEn: '',
                      code: null,
                      x,
                      y,
                      lines: [lineId],
                      description: '',
                      gameCoords: null
                    } as Station;
                  }
                  return null;
                };

                const prev = resolveStation(prevId);
                const next = resolveStation(nextId);

                let nx = 0, ny = 0;

                const addDir = (a: Station, b: Station) => {
                  const ap = toSVG(a.x, a.y, mt);
                  const bp = toSVG(b.x, b.y, mt);
                  let dx = bp.x - ap.x;
                  let dy = bp.y - ap.y;

                  // 常に右方向に正規化
                  if (dx < 0 || (dx === 0 && dy < 0)) {
                    dx = -dx;
                    dy = -dy;
                  }

                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  nx += dx / len;
                  ny += dy / len;
                };

                if (prev) addDir(prev, station);
                if (next) addDir(station, next);

                const len = Math.sqrt(nx * nx + ny * ny) || 1;
                nx /= len;
                ny /= len;

                // 垂直オフセット適用後座標
                const cx = pos.x + -ny * offset;
                const cy = pos.y + nx * offset;

                return {
                  lineId,
                  cx,
                  cy,
                  color: line.color
                };
              }).filter(Boolean) as { lineId: string; cx: number; cy: number; color: string }[];

              // 各種UIサイズ
              const N = numberings.length;
              const hasCode = station.code !== null;

              // ナンバリングアイコンのサイズ定義
              const iconSize = 18 / vt.scale;
              const iconGap = 3.5 / vt.scale;
              const totalWidth = N * iconSize + (N - 1) * iconGap;

              let plateW = 0;
              let plateH = 0;
              let xOffset = 0;
              let yOffset = 0;
              let startX = 0;

              const labelPos = station.labelPosition || 'top';

              if (hasCode) {
                // 3路線なら116px、2路線なら96pxの幅に拡大
                const baseWidth = (N === 3) ? 116 : 96;
                plateW = baseWidth / vt.scale;
                plateH = 48 / vt.scale;
                startX = -totalWidth / 2;

                if (labelPos === 'bottom') {
                  xOffset = 0;
                  yOffset = 44 / vt.scale;
                } else if (labelPos === 'left') {
                  xOffset = -(plateW / 2 + 16 / vt.scale);
                  yOffset = 0;
                } else if (labelPos === 'right') {
                  xOffset = (plateW / 2 + 16 / vt.scale);
                  yOffset = 0;
                } else {
                  // top
                  xOffset = 0;
                  yOffset = -44 / vt.scale;
                }
              } else {
                // 1列レイアウト: ナンバリング + 駅名文字幅 + 左右余白 (1文字あたり約12.5px)
                const nameW = (station.name.length * 12.5) / vt.scale;
                plateW = totalWidth + nameW + 22 / vt.scale;
                plateH = 26 / vt.scale;

                if (labelPos === 'bottom') {
                  xOffset = 0;
                  yOffset = 23 / vt.scale;
                  startX = -plateW / 2 + 8 / vt.scale;
                } else if (labelPos === 'left') {
                  xOffset = -(plateW / 2 + 16 / vt.scale);
                  yOffset = 0;
                  startX = -plateW / 2 + 8 / vt.scale;
                } else if (labelPos === 'right') {
                  xOffset = (plateW / 2 + 16 / vt.scale);
                  yOffset = 0;
                  startX = -plateW / 2 + 8 / vt.scale;
                } else {
                  // top
                  xOffset = 0;
                  yOffset = -23 / vt.scale;
                  startX = -plateW / 2 + 8 / vt.scale;
                }
              }

              const plateX = pos.x + xOffset;
              const plateY = pos.y + yOffset;

              return (
                <g
                  key={station.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleStationClick(station, e)}
                >
                  {/* 選択時のハイライト */}
                  {isSelected && (
                    <rect
                      x={plateX - (plateW + 10 / vt.scale) / 2}
                      y={plateY - (plateH + 10 / vt.scale) / 2}
                      width={plateW + 10 / vt.scale}
                      height={plateH + 10 / vt.scale}
                      rx={hasCode ? 8 / vt.scale : 6 / vt.scale}
                      fill="none"
                      stroke="#5b8064"
                      strokeWidth={2.5 / vt.scale}
                      opacity={0.8}
                    />
                  )}

                  {/* 路線上の正確な停車ドット（丸） */}
                  {dots.map((dot) => (
                    <circle
                      key={dot.lineId}
                      cx={dot.cx}
                      cy={dot.cy}
                      r={6 / vt.scale}
                      fill={dot.color}
                      stroke="#ffffff"
                      strokeWidth={1.75 / vt.scale}
                    />
                  ))}


                  {/* 駅プレート本体 (グレー背景プレートに駅名・コード・ナンバリングを内包) */}
                  <g transform={`translate(${plateX}, ${plateY})`}>
                    {/* 背景プレート */}
                    <rect
                      x={-plateW / 2}
                      y={-plateH / 2}
                      width={plateW}
                      height={plateH}
                      rx={hasCode ? 5 / vt.scale : 4 / vt.scale}
                      fill="#3f3f46"
                      stroke="#18181b"
                      strokeWidth={1.5 / vt.scale}
                    />

                    {hasCode ? (
                      /* ─── A. コードあり駅: 2段レイアウト ─── */
                      <>
                        {/* ─── 上段: 駅名 ＆ コード ─── */}
                        <g transform={`translate(0, ${-10 / vt.scale})`}>
                          {/* 駅名 (左寄せ) */}
                          <text
                            x={-plateW / 2 + 10 / vt.scale}
                            y={0}
                            dominantBaseline="middle"
                            fontSize={14 / vt.scale}
                            fill="#ffffff"
                            fontWeight="bold"
                            fontFamily='"Noto Sans JP", sans-serif'
                          >
                            {station.name}
                          </text>
                          {/* 駅コードカプセル (右寄せ) */}
                          <g transform={`translate(${plateW / 2 - 32 / vt.scale}, 0)`}>
                            <rect
                              x={0}
                              y={-7.5 / vt.scale}
                              width={24 / vt.scale}
                              height={15 / vt.scale}
                              rx={2.5 / vt.scale}
                              fill="#000000"
                              stroke="#ffffff"
                              strokeWidth={0.85 / vt.scale}
                            />
                            <text
                              x={12 / vt.scale}
                              y={0}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={8 / vt.scale}
                              fill="#ffffff"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {station.code}
                            </text>
                          </g>
                        </g>

                        {/* ─── 下段: ナンバリングアイコン ─── */}
                        <g transform={`translate(0, ${12 / vt.scale})`}>
                          {numberings.map((num, idx) => {
                            const iconX = startX + idx * (iconSize + iconGap);
                            return (
                              <g key={num.lineId} transform={`translate(${iconX}, ${-iconSize / 2})`}>
                                {/* 正方形の白背景＆各路線のカラー太枠 */}
                                <rect
                                  x={0}
                                  y={0}
                                  width={iconSize}
                                  height={iconSize}
                                  fill="#ffffff"
                                  stroke={num.color}
                                  strokeWidth={1.75 / vt.scale}
                                  rx={2 / vt.scale}
                                />
                                {/* 略号 (CW, CE, CK等) */}
                                <text
                                  x={iconSize / 2}
                                  y={6 / vt.scale}
                                  textAnchor="middle"
                                  fontSize={5.5 / vt.scale}
                                  fontWeight="bold"
                                  fill="#0f172a"
                                >
                                  {num.symbol}
                                </text>
                                {/* 駅番号 (01, 02等) */}
                                <text
                                  x={iconSize / 2}
                                  y={13.5 / vt.scale}
                                  textAnchor="middle"
                                  fontSize={8.5 / vt.scale}
                                  fontWeight="extrabold"
                                  fill="#0f172a"
                                  fontFamily="monospace"
                                >
                                  {num.numStr}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      </>
                    ) : (
                      /* ─── B. コードなし駅: 1列レイアウト ─── */
                      <>
                        {/* 左側: ナンバリングアイコン群 */}
                        <g transform={`translate(${startX}, 0)`}>
                          {numberings.map((num, idx) => {
                            const iconX = idx * (iconSize + iconGap);
                            return (
                              <g key={num.lineId} transform={`translate(${iconX}, ${-iconSize / 2})`}>
                                <rect
                                  x={0}
                                  y={0}
                                  width={iconSize}
                                  height={iconSize}
                                  fill="#ffffff"
                                  stroke={num.color}
                                  strokeWidth={1.75 / vt.scale}
                                  rx={2 / vt.scale}
                                />
                                <text
                                  x={iconSize / 2}
                                  y={6 / vt.scale}
                                  textAnchor="middle"
                                  fontSize={5.5 / vt.scale}
                                  fontWeight="bold"
                                  fill="#0f172a"
                                >
                                  {num.symbol}
                                </text>
                                <text
                                  x={iconSize / 2}
                                  y={13.5 / vt.scale}
                                  textAnchor="middle"
                                  fontSize={8.5 / vt.scale}
                                  fontWeight="extrabold"
                                  fill="#0f172a"
                                  fontFamily="monospace"
                                >
                                  {num.numStr}
                                </text>
                              </g>
                            );
                          })}
                        </g>

                        {/* 右側: 駅名テキスト */}
                        <text
                          x={startX + totalWidth + 6 / vt.scale}
                          y={0}
                          textAnchor="start"
                          dominantBaseline="middle"
                          fontSize={13 / vt.scale}
                          fill="#ffffff"
                          fontWeight="bold"
                          fontFamily='"Noto Sans JP", sans-serif'
                        >
                          {station.name}
                        </text>
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ─── ズームコントロール ─── */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
          <button
            id="route-map-zoom-in"
            onClick={zoomIn}
            disabled={vt.scale >= 1.5}
            className="w-8 h-8 bg-white/90 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center transition-colors text-base font-bold shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="拡大"
          >
            +
          </button>
          <button
            id="route-map-zoom-out"
            onClick={zoomOut}
            disabled={vt.scale <= 1.0}
            className="w-8 h-8 bg-white/90 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center transition-colors text-base font-bold shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="縮小"
          >
            −
          </button>
          <button
            id="route-map-reset"
            onClick={resetView}
            disabled={vt.scale === 1.0 && vt.x === 0 && vt.y === 0}
            className="w-8 h-8 bg-white/90 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-center transition-colors text-xs shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="リセット"
            title="表示をリセット"
          >
            ⌂
          </button>
        </div>

        {/* ─── 凡例 ─── */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-3 z-20 shadow-md">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
            路線一覧
          </p>
          <div className="flex flex-col gap-1.5">
            {Array.from(new Set(data.lines.map((l) => LINE_GROUP_MAPPING[l.id] || l.id))).map((groupId) => {
              const line = data.lines.find((l) => (LINE_GROUP_MAPPING[l.id] || l.id) === groupId);
              if (!line) return null;
              return (
                <div key={groupId} className="flex items-center gap-2">
                  <div
                    className="w-6 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="text-slate-700 text-xs font-semibold select-none">{line.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 駅情報パネル ─── */}
        {selectedStation && (
          <div
            className="absolute top-3 right-3 z-30"
            style={{
              width: '280px',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              opacity: panelVisible ? 1 : 0,
              transform: panelVisible ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
              {/* パネルヘッダー（路線カラー帯） */}
              <div
                className="h-1.5"
                style={{
                  background: selectedLines.length === 1
                    ? selectedLines[0].color
                    : `linear-gradient(to right, ${selectedLines.map((l) => l.color).join(', ')})`,
                }}
              />

              <div className="p-4 relative">
                {/* 閉じるボタン */}
                <button
                  id="route-map-close-panel"
                  onClick={() => setSelectedStation(null)}
                  className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors cursor-pointer"
                  aria-label="閉じる"
                >
                  ✕
                </button>

                {/* 駅コード + 駅名 */}
                <div className="flex items-start gap-3 mb-3 pr-8">
                  {selectedStation.code && (
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md"
                      style={{
                        background:
                          selectedLines.length === 1
                            ? selectedLines[0].color
                            : `linear-gradient(135deg, ${selectedLines[0]?.color ?? '#555'}, ${selectedLines[1]?.color ?? '#888'})`,
                      }}
                    >
                      {selectedStation.code}
                    </div>
                  )}
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg leading-tight select-none">
                      {selectedStation.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5 select-none">
                      {selectedStation.nameEn}
                    </p>
                  </div>
                </div>

                {/* 路線バッジ */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedLines.map((line) => {
                    const activeServices = line.services?.filter(
                      (service) => service.stations.includes(selectedStation.id)
                    ) ?? [];

                    return (
                      <span
                        key={line.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold select-none"
                        style={{ backgroundColor: line.color + 'dd' }}
                      >
                        {line.name}

                        {/* 種別バッジ（路線バッジの内部に入れ子として動的描画） */}
                        {activeServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white border select-none ml-1 first:ml-1.5"
                            style={{ color: service.color, borderColor: service.borderColor }}
                          >
                            {service.name}
                          </span>
                        ))}
                      </span>
                    );
                  })}
                </div>

                {/* 説明文 */}
                {selectedStation.description && (
                  <p className="text-slate-600 text-xs leading-relaxed mb-3 font-medium">
                    {selectedStation.description}
                  </p>
                )}

                {/* ゲーム内座標 */}
                {selectedStation.gameCoords && (
                  <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 select-none">
                        ゲーム内座標
                      </p>
                      <p className="text-slate-700 text-xs font-mono font-semibold select-all">
                        X: {selectedStation.gameCoords.x} &nbsp; Z:{' '}
                        {selectedStation.gameCoords.z}
                      </p>
                    </div>
                    <a
                      href={`https://map.1necat.net/?worldname=world&mapname=undefined&zoom=4&x=${selectedStation.gameCoords.x}&y=64&z=${selectedStation.gameCoords.z}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded px-2.5 py-1.5 transition-all select-none"
                    >
                      <span>地図で確認</span>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
