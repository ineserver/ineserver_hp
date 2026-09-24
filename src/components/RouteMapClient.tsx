'use client';

import * as yaml from 'js-yaml';
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
  symbol?: string;
  symbolType?: 'square' | 'circle';
  strokeWidth?: number;
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
const PADDING = 90;
const LINE_GAP = 10; // parallel line gap (screen px)

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

/** SVGの一様スケール比率 (preserveAspectRatio xMidYMid meet) を考慮した画面px→SVG座標変換倍率 */
function getSVGUniformScaleFactor(rect: DOMRect): number {
  if (!rect.width || !rect.height) return 1;
  const svgAspect = SVG_W / SVG_H;
  const rectAspect = rect.width / rect.height;

  // 縦長(スマホ)時は幅基準、横長時は高さ基準で一様スケーリングされる
  return rectAspect > svgAspect
    ? SVG_H / rect.height
    : SVG_W / rect.width;
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
 * 路線グループIDを取得
 */
function getGroupId(lineId: string): string {
  return LINE_GROUP_MAPPING[lineId] || lineId;
}

/**
 * 駅IDまたはウェイポイントIDからStationオブジェクトを生成・取得
 */
function resolveStationObj(id: string, stations: Station[], lineId: string): Station | null {
  if (!id) return null;
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
      lines: [lineId],
      description: '',
      gameCoords: null,
    } as Station;
  }
  return null;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * 2点間の直線パスを1単位（グリッドステップ）ごとのサブセグメントキー配列に分解する
 */
function getUnitSubsegments(x1: number, y1: number, x2: number, y2: number): string[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const g = gcd(Math.abs(dx), Math.abs(dy));
  if (g === 0) return [];
  const stepX = dx / g;
  const stepY = dy / g;
  const subsegments: string[] = [];

  for (let i = 0; i < g; i++) {
    const px1 = x1 + i * stepX;
    const py1 = y1 + i * stepY;
    const px2 = x1 + (i + 1) * stepX;
    const py2 = y1 + (i + 1) * stepY;

    const p1Key = `${px1},${py1}`;
    const p2Key = `${px2},${py2}`;
    const key =
      px1 < px2 || (px1 === px2 && py1 <= py2)
        ? `${p1Key}--${p2Key}`
        : `${p2Key}--${p1Key}`;
    subsegments.push(key);
  }
  return subsegments;
}

type SubsegmentMap = Record<string, Set<string>>;

/**
 * 全路線の定義からサブセグメントごとの路線グループ集合マップを構築
 */
function buildSubsegmentMap(lines: Line[], stations: Station[]): SubsegmentMap {
  const map: SubsegmentMap = {};

  for (const line of lines) {
    const groupId = getGroupId(line.id);
    const resolvedStations = line.stations
      .map((id) => resolveStationObj(id, stations, line.id))
      .filter(Boolean) as Station[];

    for (let i = 0; i < resolvedStations.length - 1; i++) {
      const s1 = resolvedStations[i];
      const s2 = resolvedStations[i + 1];
      const subsegments = getUnitSubsegments(s1.x, s1.y, s2.x, s2.y);

      for (const segKey of subsegments) {
        if (!map[segKey]) {
          map[segKey] = new Set<string>();
        }
        map[segKey].add(groupId);
      }
    }
  }

  return map;
}

/**
 * 指定セグメント上の並行路線状況に応じたオフセット値 (px) を算出
 */
function getSegmentOffset(
  lineId: string,
  s1: Station | null,
  s2: Station | null,
  subsegmentMap: SubsegmentMap
): number {
  if (!s1 || !s2) return 0;
  const subsegments = getUnitSubsegments(s1.x, s1.y, s2.x, s2.y);
  if (subsegments.length === 0) return 0;

  const groupsSet = new Set<string>();
  for (const segKey of subsegments) {
    const groups = subsegmentMap[segKey];
    if (groups) {
      groups.forEach((g) => groupsSet.add(g));
    }
  }

  const groupId = getGroupId(lineId);
  if (!groupsSet.has(groupId)) groupsSet.add(groupId);

  const totalGroups = groupsSet.size;
  if (totalGroups <= 1) return 0;

  const groupsList = Array.from(groupsSet).sort((a, b) => {
    const idxA = UNIQUE_GROUPS.indexOf(a);
    const idxB = UNIQUE_GROUPS.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const groupIdx = groupsList.indexOf(groupId);
  if (groupIdx === -1) return 0;

  return groupIdx * LINE_GAP;
}

/**
 * 頂点（駅・ウェイポイント）におけるオフセット変位ベクトル (dispX, dispY) を計算
 */
function computeVertexDisplacement(
  lineId: string,
  station: Station,
  prev: Station | null,
  next: Station | null,
  subsegmentMap: SubsegmentMap,
  mt: { scale: number; ox: number; oy: number }
): { dispX: number; dispY: number } {
  const getSegVectorAndOffset = (a: Station, b: Station) => {
    const ap = toSVG(a.x, a.y, mt);
    const bp = toSVG(b.x, b.y, mt);
    let dx = bp.x - ap.x;
    let dy = bp.y - ap.y;

    if (dx < 0 || (dx === 0 && dy < 0)) {
      dx = -dx;
      dy = -dy;
    }

    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const offset = getSegmentOffset(lineId, a, b, subsegmentMap);
    return {
      ux,
      uy,
      dispX: nx * offset,
      dispY: ny * offset,
    };
  };

  const v1 = prev ? getSegVectorAndOffset(prev, station) : null;
  const v2 = next ? getSegVectorAndOffset(station, next) : null;

  if (v1 && v2) {
    const dot = Math.abs(v1.ux * v2.ux + v1.uy * v2.uy);
    if (dot > 0.9) {
      return {
        dispX: (v1.dispX + v2.dispX) / 2,
        dispY: (v1.dispY + v2.dispY) / 2,
      };
    } else {
      return {
        dispX: v1.dispX + v2.dispX,
        dispY: v1.dispY + v2.dispY,
      };
    }
  } else if (v1) {
    return { dispX: v1.dispX, dispY: v1.dispY };
  } else if (v2) {
    return { dispX: v2.dispX, dispY: v2.dispY };
  }

  return { dispX: 0, dispY: 0 };
}

/**
 * 平行路線の動的オフセット付きポリラインポイントを計算
 */
function computeLinePoints(
  line: Line,
  stations: Station[],
  subsegmentMap: SubsegmentMap,
  mt: { scale: number; ox: number; oy: number }
): string {
  const stationObjs = line.stations
    .map((id) => resolveStationObj(id, stations, line.id))
    .filter(Boolean) as Station[];

  if (stationObjs.length < 2) {
    return stationObjs
      .map((s) => {
        const p = toSVG(s.x, s.y, mt);
        return `${p.x},${p.y}`;
      })
      .join(' ');
  }

  return stationObjs
    .map((s, i) => {
      const p = toSVG(s.x, s.y, mt);
      const prev = i > 0 ? stationObjs[i - 1] : null;
      const next = i < stationObjs.length - 1 ? stationObjs[i + 1] : null;

      const { dispX, dispY } = computeVertexDisplacement(
        line.id,
        s,
        prev,
        next,
        subsegmentMap,
        mt
      );

      return `${p.x + dispX},${p.y + dispY}`;
    })
    .join(' ');
}

/** 路線の線幅 (px) */
function getLineStrokeWidth(line: Line): number {
  return line.strokeWidth ?? (line.id.startsWith('sb_') || line.id.startsWith('p_') ? 4 : 5.5);
}

// ============================================================
// 経路探索
// ============================================================

/** 乗り換え1回あたりのコスト（駅数換算） */
const TRANSFER_PENALTY = 3;

interface RouteEdge {
  from: string;
  to: string;
  lineId: string;
  groupId: string;
  /** computeLinePoints の点列におけるインデックス（経路描画用） */
  fromIdx: number;
  toIdx: number;
}

type RouteGraph = Record<string, RouteEdge[]>;

interface RouteLeg {
  groupId: string;
  from: string;
  to: string;
  edges: RouteEdge[];
}

interface RouteResult {
  legs: RouteLeg[];
  stationIds: string[];
  totalStops: number;
  transfers: number;
}

/**
 * 路線定義から駅間の隣接リストを構築（ウェイポイントは読み飛ばす）
 */
function buildRouteGraph(lines: Line[], stations: Station[]): RouteGraph {
  const graph: RouteGraph = {};
  const addEdge = (edge: RouteEdge) => {
    if (!graph[edge.from]) {
      graph[edge.from] = [];
    }
    graph[edge.from].push(edge);
  };

  for (const line of lines) {
    const groupId = getGroupId(line.id);
    // computeLinePoints と同じ解決済み点列でのインデックスを保持する
    const stops = (
      line.stations
        .map((id) => resolveStationObj(id, stations, line.id))
        .filter(Boolean) as Station[]
    )
      .map((s, idx) => ({ id: s.id, idx }))
      .filter((s) => !s.id.startsWith('wp:'));

    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (a.id === b.id) continue;
      addEdge({ from: a.id, to: b.id, lineId: line.id, groupId, fromIdx: a.idx, toIdx: b.idx });
      addEdge({ from: b.id, to: a.id, lineId: line.id, groupId, fromIdx: b.idx, toIdx: a.idx });
    }
  }

  return graph;
}

/**
 * 駅数 + 乗り換えペナルティが最小となる経路を探索 (ダイクストラ法)
 * 同じ路線グループ（中央線の東西など）を乗り継ぐ場合は乗り換えとして扱わない
 */
function findRoute(graph: RouteGraph, fromId: string, toId: string): RouteResult | null {
  if (!fromId || !toId || fromId === toId) return null;

  // 状態 = 駅 + 乗車中の路線グループ
  const startKey = `${fromId}|`;
  const dist: Record<string, number> = { [startKey]: 0 };
  const prev: Record<string, { key: string; edge: RouteEdge }> = {};
  const done = new Set<string>();
  const queue: { key: string; station: string; groupId: string | null; cost: number }[] = [
    { key: startKey, station: fromId, groupId: null, cost: 0 },
  ];

  while (queue.length > 0) {
    // 小規模なグラフなので線形探索で最小コストを取り出す（同コストなら先に積んだ方を優先）
    let minIdx = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].cost < queue[minIdx].cost) minIdx = i;
    }
    const cur = queue.splice(minIdx, 1)[0];
    if (done.has(cur.key)) continue;
    done.add(cur.key);

    if (cur.station === toId) {
      const edges: RouteEdge[] = [];
      let key = cur.key;
      while (prev[key]) {
        edges.unshift(prev[key].edge);
        key = prev[key].key;
      }

      const legs: RouteLeg[] = [];
      for (const edge of edges) {
        const last = legs[legs.length - 1];
        if (last && last.groupId === edge.groupId) {
          last.edges.push(edge);
          last.to = edge.to;
        } else {
          legs.push({ groupId: edge.groupId, from: edge.from, to: edge.to, edges: [edge] });
        }
      }

      return {
        legs,
        stationIds: [fromId, ...edges.map((e) => e.to)],
        totalStops: edges.length,
        transfers: legs.length - 1,
      };
    }

    for (const edge of graph[cur.station] ?? []) {
      const isTransfer = cur.groupId !== null && cur.groupId !== edge.groupId;
      const cost = cur.cost + 1 + (isTransfer ? TRANSFER_PENALTY : 0);
      const key = `${edge.to}|${edge.groupId}`;
      if (done.has(key)) continue;
      if (dist[key] === undefined || cost < dist[key]) {
        dist[key] = cost;
        prev[key] = { key: cur.key, edge };
        queue.push({ key, station: edge.to, groupId: edge.groupId, cost });
      }
    }
  }

  return null;
}

/**
 * 乗車区間の全体で利用できる種別（急行・各停など）
 */
function getLegServices(leg: RouteLeg, lines: Line[]): Service[] {
  // 路線ごとの乗車区間に分割（中央線の東西直通など）
  const runs: { line: Line; from: string; to: string }[] = [];
  for (const edge of leg.edges) {
    const last = runs[runs.length - 1];
    if (last && last.line.id === edge.lineId) {
      last.to = edge.to;
      continue;
    }
    const line = lines.find((l) => l.id === edge.lineId);
    if (!line) return [];
    runs.push({ line, from: edge.from, to: edge.to });
  }

  return (runs[0]?.line.services ?? []).filter((service) =>
    runs.every((run) =>
      run.line.services?.some(
        (s) =>
          s.name === service.name &&
          s.stations.includes(run.from) &&
          s.stations.includes(run.to)
      )
    )
  );
}

/**
 * 乗車区間の行き先方面（環状線は null）
 */
function getLegDirection(leg: RouteLeg, lines: Line[], stations: Station[]): Station | null {
  const lastEdge = leg.edges[leg.edges.length - 1];
  const line = lines.find((l) => l.id === lastEdge.lineId);
  if (!line) return null;

  const actualStations = line.stations.filter((id) => !id.startsWith('wp:'));
  const first = actualStations[0];
  const last = actualStations[actualStations.length - 1];
  if (first === last) return null;

  const terminalId = lastEdge.toIdx > lastEdge.fromIdx ? last : first;
  return stations.find((s) => s.id === terminalId) ?? null;
}

/**
 * 同じ区間を同じ駅数・乗り換えなしで移動できる別の路線グループ
 */
function getLegAlternatives(leg: RouteLeg, graph: RouteGraph): string[] {
  const candidates = new Set((graph[leg.from] ?? []).map((e) => e.groupId));
  candidates.delete(leg.groupId);

  return Array.from(candidates).filter((groupId) => {
    let frontier = [leg.from];
    const visited = new Set(frontier);
    for (let d = 1; d <= leg.edges.length; d++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const edge of graph[id] ?? []) {
          if (edge.groupId !== groupId || visited.has(edge.to)) continue;
          if (edge.to === leg.to) return true;
          visited.add(edge.to);
          next.push(edge.to);
        }
      }
      frontier = next;
    }
    return false;
  });
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function RouteMapClient() {
  const [data, setData] = useState<RouteMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const isMobile = useCallback(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
  const getMinScale = useCallback(() => isMobile() ? 0.8 : 0.6, [isMobile]);

  /**
   * マップ座標(0,0)が画面中央に来るよう初期vtを計算。
   * mt.ox / mt.oy がマップ原点のSVG座標なので、
   *   vt.x = SVG_W/2 - mt.ox * scale
   *   vt.y = SVG_H/2 - mt.oy * scale
   * とすることで原点が画面中央に配置される。
   */
  const computeInitialVt = useCallback(
    (mt: { scale: number; ox: number; oy: number }) => {
      const scale = isMobile() ? 2.8 : 1;
      return {
        x: SVG_W / 2 - mt.ox * scale,
        y: SVG_H / 2 - mt.oy * scale,
        scale,
      };
    },
    [isMobile]
  );

  // ズーム・パン
  const [vt, setVt] = useState({ x: 0, y: 0, scale: 1 });
  const vtRef = useRef(vt);
  useEffect(() => {
    vtRef.current = vt;
  }, [vt]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    startX: number;
    startY: number;
    vtX: number;
    vtY: number;
    scaleFactor: number;
    currentVtX?: number;
    currentVtY?: number;
  }>({ startX: 0, startY: 0, vtX: 0, vtY: 0, scaleFactor: 1 });
  const [hasDragged, setHasDragged] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const animFrameId = useRef<number | null>(null);

  // パネルアニメーション
  const [panelVisible, setPanelVisible] = useState(false);

  // 検索機能
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 凡例開閉（スマホ用）
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // 経路検索
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');

  // データ取得
  useEffect(() => {
    fetch('/data/route_map.yaml')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
      })
      .then((text) => {
        const d = yaml.load(text) as RouteMapData;
        return d;
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

  // データロード完了後に初期vtをセット（マップ原点(0,0)が画面中央）
  const isInitialVtSet = useRef(false);
  useEffect(() => {
    if (!data || isInitialVtSet.current) return;
    isInitialVtSet.current = true;
    setVt(computeInitialVt(mt));
  }, [data, mt, computeInitialVt]);

  // サブセグメント別路線グループ分布マップ
  const subsegmentMap = useMemo(() => {
    if (!data) return {};
    return buildSubsegmentMap(data.lines, data.stations);
  }, [data]);

  // 路線ごとのオフセット付きポリラインポイント
  const linePoints = useMemo(() => {
    const map: Record<string, string> = {};
    if (!data) return map;
    for (const line of data.lines) {
      map[line.id] = computeLinePoints(line, data.stations, subsegmentMap, mt);
    }
    return map;
  }, [data, subsegmentMap, mt]);

  // 経路探索
  const routeGraph = useMemo(() => {
    if (!data) return {};
    return buildRouteGraph(data.lines, data.stations);
  }, [data]);

  const route = useMemo(
    () => findRoute(routeGraph, routeFrom, routeTo),
    [routeGraph, routeFrom, routeTo]
  );

  // 地図上でハイライトする経路（経路検索を開いている間のみ）
  const activeRoute = isRouteMode ? route : null;
  const routeStationIds = useMemo(
    () => new Set(activeRoute?.stationIds ?? []),
    [activeRoute]
  );

  // 経路が決まったら、経路パネルに隠れない範囲に経路全体が収まるよう表示を移動
  const routePanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!data || !activeRoute || !svgRect?.width || !svgRect.height) return;

    const pts = activeRoute.stationIds
      .map((id) => data.stations.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => toSVG((s as Station).x, (s as Station).y, mt));
    if (pts.length === 0) return;

    // 駅名プレートが切れないよう余白を持たせる
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs) - 120;
    const maxX = Math.max(...xs) + 120;
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 50;

    // パネルを除いた表示領域（スマホ: パネルの下 / PC: パネルの右）
    const area = {
      left: svgRect.left,
      top: svgRect.top,
      right: svgRect.right,
      bottom: svgRect.bottom,
    };
    const panelRect = routePanelRef.current?.getBoundingClientRect();
    if (panelRect) {
      if (panelRect.width > svgRect.width * 0.6) {
        if (panelRect.bottom < svgRect.bottom - 150) area.top = panelRect.bottom;
      } else {
        area.left = panelRect.right;
      }
    }

    const factor = getSVGUniformScaleFactor(svgRect);
    const fitScale = Math.min(
      ((area.right - area.left) * factor * 0.9) / (maxX - minX),
      ((area.bottom - area.top) * factor * 0.9) / (maxY - minY)
    );
    const scale = Math.min(Math.max(fitScale, getMinScale()), isMobile() ? 2.8 : 2.2);

    // 表示領域の中心 (画面座標) → SVG座標
    const targetX =
      SVG_W / 2 + ((area.left + area.right) / 2 - (svgRect.left + svgRect.width / 2)) * factor;
    const targetY =
      SVG_H / 2 + ((area.top + area.bottom) / 2 - (svgRect.top + svgRect.height / 2)) * factor;

    setVt({
      x: targetX - ((minX + maxX) / 2) * scale,
      y: targetY - ((minY + maxY) / 2) * scale,
      scale,
    });
  }, [activeRoute, data, mt, isMobile, getMinScale]);

  const openRouteWith = useCallback((kind: 'from' | 'to', stationId: string) => {
    if (kind === 'from') {
      setRouteFrom(stationId);
    } else {
      setRouteTo(stationId);
    }
    setIsRouteMode(true);
    setSelectedStation(null);
  }, []);

  const swapRoute = useCallback(() => {
    setRouteFrom(routeTo);
    setRouteTo(routeFrom);
  }, [routeFrom, routeTo]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setHasDragged(false);
      const rect = svgRef.current?.getBoundingClientRect();
      const scaleFactor = rect ? getSVGUniformScaleFactor(rect) : 1;

      setDragStart({
        startX: e.clientX,
        startY: e.clientY,
        vtX: vt.x,
        vtY: vt.y,
        scaleFactor,
      });
    },
    [vt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const rawDx = e.clientX - dragStart.startX;
      const rawDy = e.clientY - dragStart.startY;
      if (Math.hypot(rawDx, rawDy) > 3) setHasDragged(true);

      const newX = dragStart.vtX + rawDx * dragStart.scaleFactor;
      const newY = dragStart.vtY + rawDy * dragStart.scaleFactor;
      dragStart.currentVtX = newX;
      dragStart.currentVtY = newY;

      if (mapGroupRef.current) {
        if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
        animFrameId.current = requestAnimationFrame(() => {
          if (mapGroupRef.current) {
            mapGroupRef.current.setAttribute(
              'transform',
              `translate(${newX},${newY}) scale(${vtRef.current.scale})`
            );
          }
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (dragStart.currentVtX !== undefined && dragStart.currentVtY !== undefined) {
        const finalX = dragStart.currentVtX;
        const finalY = dragStart.currentVtY;
        setVt((prev) => ({ ...prev, x: finalX, y: finalY }));
      }
    }
  }, [isDragging, dragStart]);

  const focusStation = useCallback((station: Station) => {
    setSelectedStation(station);
    const pos = toSVG(station.x, station.y, mt);
    const targetScale = 1.6;
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

  const resetView = useCallback(() => {
    setVt(computeInitialVt(mt));
  }, [computeInitialVt, mt]);

  const zoomIn = useCallback(() => {
    setVt((p) => {
      const targetScale = Math.min(p.scale * 1.25, 3.5);
      if (targetScale === p.scale) return p;
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
    const minScale = getMinScale();
    setVt((p) => {
      const targetScale = Math.max(p.scale / 1.25, minScale);
      if (targetScale === p.scale) return p;
      const ratio = targetScale / p.scale;
      const mx = SVG_W / 2;
      const my = SVG_H / 2;
      return {
        x: mx - ratio * (mx - p.x),
        y: my - ratio * (my - p.y),
        scale: targetScale,
      };
    });
  }, [getMinScale]);

  const containerRef = useRef<HTMLDivElement>(null);

  // マウスホイールによる連続・カーソル中心ズーム（ページのスクロールを完全防止）
  useEffect(() => {
    if (isLoading || !data) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      // 経路検索結果などパネル内のスクロールは妨げない
      const target = e.target as HTMLElement;
      if (target && target.closest('.overflow-y-auto')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const svgX = (clientX / rect.width) * SVG_W;
      const svgY = (clientY / rect.height) * SVG_H;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;

      setVt((prev) => {
        const minScale = getMinScale();
        const targetScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), 3.5);
        if (Math.abs(targetScale - prev.scale) < 0.0001) return prev;

        const ratio = targetScale / prev.scale;
        const newX = svgX - ratio * (svgX - prev.x);
        const newY = svgY - ratio * (svgY - prev.y);

        return {
          x: newX,
          y: newY,
          scale: targetScale,
        };
      });
    };

    const handleTouchNative = (e: TouchEvent) => {
      // 駅詳細モーダルや検索結果ドロップダウン等の内部スクロールを邪魔せず、マップ操作時のSafariスクロールを完全防止
      const target = e.target as HTMLElement;
      if (target && target.closest('.overflow-y-auto')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    container.addEventListener('touchmove', handleTouchNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
      container.removeEventListener('touchmove', handleTouchNative);
    };
  }, [isLoading, data]);

  // タッチ操作（1本指パンドラッグ / 2本指ピンチズーム）
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    initialVtX: number;
    initialVtY: number;
    scaleFactor: number;
    initialDist: number;
    isPinch: boolean;
    currentVtX?: number;
    currentVtY?: number;
  } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const scaleFactor = rect ? getSVGUniformScaleFactor(rect) : 1;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      setHasDragged(false);
      touchStateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        initialVtX: vtRef.current.x,
        initialVtY: vtRef.current.y,
        scaleFactor,
        initialDist: 0,
        isPinch: false,
      };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStateRef.current = {
        startX: (t1.clientX + t2.clientX) / 2,
        startY: (t1.clientY + t2.clientY) / 2,
        initialVtX: vtRef.current.x,
        initialVtY: vtRef.current.y,
        scaleFactor,
        initialDist: dist,
        isPinch: true,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const state = touchStateRef.current;
    if (!state) return;

    if (e.touches.length === 1 && !state.isPinch) {
      const t = e.touches[0];
      const rawDx = t.clientX - state.startX;
      const rawDy = t.clientY - state.startY;

      if (Math.hypot(rawDx, rawDy) > 3) {
        setHasDragged(true);
      }

      const dx = rawDx * state.scaleFactor;
      const dy = rawDy * state.scaleFactor;

      const newX = state.initialVtX + dx;
      const newY = state.initialVtY + dy;
      state.currentVtX = newX;
      state.currentVtY = newY;

      if (mapGroupRef.current) {
        if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
        animFrameId.current = requestAnimationFrame(() => {
          if (mapGroupRef.current) {
            mapGroupRef.current.setAttribute(
              'transform',
              `translate(${newX},${newY}) scale(${vtRef.current.scale})`
            );
          }
        });
      }
    } else if (e.touches.length === 2 && svgRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const initialDist = state.initialDist;

      if (initialDist > 0) {
        setHasDragged(true);
        const factor = dist / initialDist;
        state.initialDist = dist;

        const rect = svgRef.current.getBoundingClientRect();
        const clientX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const clientY = (t1.clientY + t2.clientY) / 2 - rect.top;

        const svgX = (clientX / rect.width) * SVG_W;
        const svgY = (clientY / rect.height) * SVG_H;

        setVt((prev) => {
          const minScale = getMinScale();
          const targetScale = Math.min(Math.max(prev.scale * factor, minScale), 3.5);
          if (targetScale === prev.scale) return prev;
          const ratio = targetScale / prev.scale;
          return {
            x: svgX - ratio * (svgX - prev.x),
            y: svgY - ratio * (svgY - prev.y),
            scale: targetScale,
          };
        });
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const state = touchStateRef.current;
    if (state && state.currentVtX !== undefined && state.currentVtY !== undefined) {
      const finalX = state.currentVtX;
      const finalY = state.currentVtY;
      setVt((prev) => ({ ...prev, x: finalX, y: finalY }));
    }

    if (e.touches.length === 0) {
      touchStateRef.current = null;
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      const rect = svgRef.current?.getBoundingClientRect();
      const scaleFactor = rect ? getSVGUniformScaleFactor(rect) : 1;

      touchStateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        initialVtX: vtRef.current.x,
        initialVtY: vtRef.current.y,
        scaleFactor,
        initialDist: 0,
        isPinch: false,
      };
    }
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
    <div className="relative w-full h-full overflow-hidden">
      {/* マップエリア */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-white"
        style={{ overscrollBehavior: 'none' }}
      >
        {/* ─── 検索窓 / 経路検索 ─── */}
        <div
          ref={routePanelRef}
          className="absolute top-3 left-3 right-3 sm:right-auto sm:top-4 sm:left-4 z-20 sm:w-80"
        >
          {!isRouteMode ? (
          <div className="relative">
            <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 focus-within:border-[#5b8064] focus-within:ring-2 focus-within:ring-[#5b8064]/20 shadow-lg rounded-2xl px-3.5 py-2.5 transition-all">
              <svg
                className="w-4 h-4 text-[#5b8064] mr-2.5 flex-shrink-0"
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
                placeholder="駅名・コードで検索..."
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-0 p-0"
                style={{ fontSize: '16px', lineHeight: '1.2', transform: 'scale(0.75)', transformOrigin: 'left center', width: '133%' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 hover:bg-[#5b8064]/10 text-slate-400 hover:text-[#5b8064] text-[10px] cursor-pointer flex-shrink-0 ml-1 transition-colors"
                >
                  ✕
                </button>
              )}
              <button
                id="route-map-open-route"
                onClick={() => setIsRouteMode(true)}
                className="flex items-center gap-1 ml-2 pl-2.5 border-l border-slate-200 text-[#5b8064] hover:text-[#4a6b54] text-xs font-bold whitespace-nowrap flex-shrink-0 cursor-pointer select-none transition-colors"
                aria-label="経路検索を開く"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" />
                </svg>
                経路
              </button>
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
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#5b8064]/10 text-left transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{station.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 font-sans">{station.nameEn}</p>
                        </div>
                        <div className="flex gap-1">
                          {stationLines.map((line) => {
                            const symbol = line.symbol ?? LINE_SYMBOLS[line.id]?.symbol ?? '??';
                            const symbolType = line.symbolType ?? (line.id.startsWith('sb_') ? 'circle' : 'square');
                            const actualStations = line.stations.filter((id) => !id.startsWith('wp:'));
                            const stationIdx = actualStations.indexOf(station.id);
                            const numStr = stationIdx !== -1 ? String(stationIdx + 1).padStart(2, '0') : '00';
                            return (
                              <span
                                key={line.id}
                                className={`inline-flex flex-col items-center justify-center bg-white border border-slate-200 w-5 h-5 select-none ${symbolType === 'circle' ? 'rounded-full' : 'rounded'
                                  }`}
                                style={{ borderColor: line.color }}
                              >
                                <span className="text-[5px] font-extrabold text-slate-700 leading-none">{symbol}</span>
                                <span className="text-[8px] font-extrabold text-slate-900 leading-none">{numStr}</span>
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
          ) : (
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg rounded-2xl overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-3.5 pt-2.5 pb-2">
              <p className="text-[#5b8064] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-3 bg-[#5b8064] rounded-full inline-block" />
                経路検索
              </p>
              <button
                id="route-map-close-route"
                onClick={() => setIsRouteMode(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors cursor-pointer"
                aria-label="経路検索を閉じる"
              >
                ✕
              </button>
            </div>

            {/* 出発駅・到着駅の選択 */}
            <div className="flex items-center gap-2 px-3.5 pb-3">
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {[
                  { key: 'from', label: '発', color: '#5b8064', value: routeFrom, onChange: setRouteFrom, placeholder: '出発駅を選択' },
                  { key: 'to', label: '着', color: '#3f3f46', value: routeTo, onChange: setRouteTo, placeholder: '到着駅を選択' },
                ].map((field) => (
                  <label key={field.key} className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 select-none"
                      style={{ backgroundColor: field.color }}
                    >
                      {field.label}
                    </span>
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-200 focus:border-[#5b8064] focus:ring-2 focus:ring-[#5b8064]/20 rounded-lg px-2 py-1 text-base sm:text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">{field.placeholder}</option>
                      {data.stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <button
                id="route-map-swap-route"
                onClick={swapRoute}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white hover:bg-[#5b8064]/10 border border-slate-200/90 hover:border-[#5b8064]/50 text-slate-500 hover:text-[#5b8064] transition-colors cursor-pointer"
                aria-label="出発駅と到着駅を入れ替え"
                title="入れ替え"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" />
                </svg>
              </button>
            </div>

            {/* 検索結果 */}
            {routeFrom && routeTo && (
              <div className="border-t border-slate-100 px-3.5 py-3 max-h-[35vh] sm:max-h-[55vh] overflow-y-auto overscroll-contain">
                {routeFrom === routeTo ? (
                  <p className="text-slate-400 text-xs text-center py-1 font-semibold select-none">出発駅と到着駅が同じです</p>
                ) : !route ? (
                  <p className="text-slate-400 text-xs text-center py-1 font-semibold select-none">経路が見つかりませんでした</p>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2.5 mb-2.5 select-none">
                      <span className="text-slate-800 text-base font-extrabold">
                        {route.totalStops}
                        <span className="text-xs ml-0.5">駅</span>
                      </span>
                      <span className="text-slate-500 text-xs font-semibold">乗換 {route.transfers}回</span>
                    </div>

                    <ol className="flex flex-col select-none">
                      {route.legs.map((leg, i) => {
                        const line = data.lines.find((l) => getGroupId(l.id) === leg.groupId);
                        const fromStation = data.stations.find((s) => s.id === leg.from);
                        const services = getLegServices(leg, data.lines);
                        const direction = getLegDirection(leg, data.lines, data.stations);
                        const alternatives = getLegAlternatives(leg, routeGraph)
                          .map((groupId) => data.lines.find((l) => getGroupId(l.id) === groupId)?.name)
                          .filter(Boolean);
                        const color = line?.color ?? '#888';

                        return (
                          <li key={i}>
                            {/* 乗車駅 */}
                            <div className="flex items-center gap-2">
                              <span className="w-5 flex justify-center flex-shrink-0">
                                <span className="w-3 h-3 rounded-full bg-white border-[3px] border-[#3f3f46]" />
                              </span>
                              <span className="text-slate-800 text-xs font-bold">{fromStation?.name}</span>
                              {i > 0 && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                  乗換
                                </span>
                              )}
                            </div>

                            {/* 乗車区間 */}
                            <div className="flex gap-2">
                              <span className="w-5 flex justify-center flex-shrink-0">
                                <span className="w-1.5 rounded-full" style={{ backgroundColor: color }} />
                              </span>
                              <div className="py-2 min-w-0">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                                    style={{ backgroundColor: color + 'dd' }}
                                  >
                                    {line?.name}
                                  </span>
                                  {services.map((service) => (
                                    <span
                                      key={service.name}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white border"
                                      style={{ color: service.color, borderColor: service.borderColor }}
                                    >
                                      {service.name}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-slate-500 text-[10px] font-semibold mt-1">
                                  {direction && `${direction.name}方面・`}
                                  {leg.edges.length}駅
                                </p>
                                {alternatives.length > 0 && (
                                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                                    {alternatives.join('・')}でも行けます
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}

                      {/* 到着駅 */}
                      <li className="flex items-center gap-2">
                        <span className="w-5 flex justify-center flex-shrink-0">
                          <span className="w-3 h-3 rounded-full bg-[#3f3f46] border-[3px] border-[#3f3f46]" />
                        </span>
                        <span className="text-slate-800 text-xs font-bold">
                          {data.stations.find((s) => s.id === routeTo)?.name}
                        </span>
                      </li>
                    </ol>
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>

        {/* SVG路線図 */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', display: 'block', touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleBgClick}
        >
          {/* 背景 */}
          <rect width={SVG_W} height={SVG_H} fill="#ffffff" />

          {/* ズーム・パン変換グループ */}
          <g
            ref={mapGroupRef}
            transform={`translate(${vt.x},${vt.y}) scale(${vt.scale})`}
            style={{ willChange: 'transform' }}
          >
            {/* ─── Layer 1: 路線 (線路) ─── */}
            <g className="layer-lines">
              {data.lines.map((line) => {
                const roundedPath = pointsToRoundedPath(linePoints[line.id] ?? '', 16);
                return (
                  <path
                    key={line.id}
                    d={roundedPath}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={getLineStrokeWidth(line)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={activeRoute ? 0.2 : 0.88}
                  />
                );
              })}

              {/* 経路検索結果のハイライト */}
              {activeRoute?.legs.flatMap((leg) => leg.edges).map((edge, i) => {
                const line = data.lines.find((l) => l.id === edge.lineId);
                if (!line) return null;
                const segmentPoints = (linePoints[line.id] ?? '')
                  .split(' ')
                  .slice(Math.min(edge.fromIdx, edge.toIdx), Math.max(edge.fromIdx, edge.toIdx) + 1)
                  .join(' ');
                return (
                  <path
                    key={`route-${i}`}
                    d={pointsToRoundedPath(segmentPoints, 16)}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={getLineStrokeWidth(line) + 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>

            {/* ─── Layer 2: 全駅の停車ドット (ymlの記載順優先度: 上に書かれた路線ほど手前に描画) ─── */}
            <g className="layer-dots">
              {[...data.lines].reverse().flatMap((line) => {
                const actualStations = line.stations.filter((id) => !id.startsWith('wp:'));
                return actualStations.map((stationId, idx) => {
                  const station = data.stations.find((s) => s.id === stationId);
                  if (!station) return null;

                  const stationIdx = line.stations.indexOf(station.id);
                  const prevId = stationIdx > 0 ? line.stations[stationIdx - 1] : null;
                  const nextId = stationIdx < line.stations.length - 1 ? line.stations[stationIdx + 1] : null;

                  const prev = resolveStationObj(prevId || '', data.stations, line.id);
                  const next = resolveStationObj(nextId || '', data.stations, line.id);

                  const { dispX, dispY } = computeVertexDisplacement(
                    line.id,
                    station,
                    prev,
                    next,
                    subsegmentMap,
                    mt
                  );

                  const pos = toSVG(station.x, station.y, mt);
                  const cx = pos.x + dispX;
                  const cy = pos.y + dispY;

                  return (
                    <circle
                      key={`${line.id}-${station.id}-${idx}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={line.color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      opacity={activeRoute && !routeStationIds.has(station.id) ? 0.25 : 1}
                    />
                  );
                });
              })}
            </g>

            {/* ─── Layer 3: 最前面・駅プレート＆名札 (全ての線路・ドットより手前に必ず描画) ─── */}
            <g className="layer-plates">
              {data.stations.map((station) => {
                const pos = toSVG(station.x, station.y, mt);
                const isRouteEndpoint =
                  activeRoute !== null && (station.id === routeFrom || station.id === routeTo);
                const isSelected = selectedStation?.id === station.id || isRouteEndpoint;
                const isDimmed = activeRoute !== null && !routeStationIds.has(station.id);

                // symbolが存在する路線のみナンバリングに含める
                const numberings = station.lines.flatMap((lineId) => {
                  const line = data.lines.find((l) => l.id === lineId);
                  const rawSymbol = line?.symbol ?? LINE_SYMBOLS[lineId]?.symbol ?? null;
                  if (!rawSymbol) return []; // symbolなし路線は除外
                  const symbol = rawSymbol;
                  const symbolType = line?.symbolType ?? (lineId.startsWith('sb_') ? 'circle' : 'square');
                  const actualStations = line ? line.stations.filter((id) => !id.startsWith('wp:')) : [];
                  const stationIdx = actualStations.indexOf(station.id);
                  const numStr = stationIdx !== -1 ? String(stationIdx + 1).padStart(2, '0') : '00';
                  return [{
                    lineId,
                    color: line?.color ?? '#888',
                    symbol,
                    symbolType,
                    numStr
                  }];
                });

                // symbolが一つも存在しない駅かどうか
                const hasNoSymbol = numberings.length === 0;

                const N = numberings.length;
                const hasCode = station.code !== null;

                const iconSize = 15;
                const iconGap = 3;
                const totalWidth = N * iconSize + (N - 1) * iconGap;

                let plateW = 0;
                let plateH = 0;
                let xOffset = 0;
                let yOffset = 0;
                let startX = 0;

                const labelPos = station.labelPosition || 'top';

                let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                if (hasNoSymbol) {
                  // シンプル表示: プレートなし、駅名テキストのみ
                  plateW = station.name.length * 11.5;
                  plateH = 14;
                  if (labelPos === 'bottom') {
                    xOffset = 0;
                    yOffset = 14;
                    textAnchor = 'middle';
                  } else if (labelPos === 'left') {
                    xOffset = -10;
                    yOffset = 0;
                    textAnchor = 'end';
                  } else if (labelPos === 'right') {
                    xOffset = 10;
                    yOffset = 0;
                    textAnchor = 'start';
                  } else {
                    xOffset = 0;
                    yOffset = -14;
                    textAnchor = 'middle';
                  }
                } else if (hasCode) {
                  const requiredTopW = station.name.length * 12 + 44;
                  const requiredBottomW = N * 15 + (N - 1) * 3 + 16;
                  const baseWidth = Math.max(requiredTopW, requiredBottomW, 76);
                  plateW = baseWidth;
                  plateH = 38;
                  startX = -totalWidth / 2;

                  if (labelPos === 'bottom') {
                    xOffset = 0;
                    yOffset = 34;
                  } else if (labelPos === 'left') {
                    xOffset = -(plateW / 2 + 14);
                    yOffset = 0;
                  } else if (labelPos === 'right') {
                    xOffset = (plateW / 2 + 14);
                    yOffset = 0;
                  } else {
                    xOffset = 0;
                    yOffset = -34;
                  }
                } else {
                  const totalWidthPx = N * 15 + (N - 1) * 3;
                  const baseWidth = Math.max(totalWidthPx + station.name.length * 11.5 + 20, 52);
                  plateW = baseWidth;
                  plateH = 22;

                  if (labelPos === 'bottom') {
                    xOffset = 0;
                    yOffset = 20;
                    startX = -plateW / 2 + 8;
                  } else if (labelPos === 'left') {
                    xOffset = -(plateW / 2 + 14);
                    yOffset = 0;
                    startX = -plateW / 2 + 8;
                  } else if (labelPos === 'right') {
                    xOffset = (plateW / 2 + 14);
                    yOffset = 0;
                    startX = -plateW / 2 + 8;
                  } else {
                    xOffset = 0;
                    yOffset = -20;
                    startX = -plateW / 2 + 8;
                  }
                }

                const plateX = pos.x + xOffset;
                const plateY = pos.y + yOffset;

                return (
                  <g
                    key={station.id}
                    style={{ cursor: 'pointer' }}
                    opacity={isDimmed ? 0.35 : 1}
                    onClick={(e) => handleStationClick(station, e)}
                  >
                    {hasNoSymbol ? (
                      /* ─── C. symbolなし駅: 駅名テキストのみ ─── */
                      <text
                        x={pos.x + xOffset}
                        y={pos.y + yOffset}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        fontSize={11.5}
                        fill="#1e293b"
                        fontWeight="bold"
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        paintOrder="stroke"
                      >
                        {station.name}
                      </text>
                    ) : (
                      <>
                        {/* 選択時のハイライト */}
                        {isSelected && (
                          <rect
                            x={plateX - (plateW + 8) / 2}
                            y={plateY - (plateH + 8) / 2}
                            width={plateW + 8}
                            height={plateH + 8}
                            rx={hasCode ? 7 : 5}
                            fill="none"
                            stroke="#5b8064"
                            strokeWidth={2.5}
                            opacity={0.85}
                          />
                        )}

                        {/* 駅プレート本体 */}
                        <g transform={`translate(${plateX}, ${plateY})`}>
                          {/* 背景プレート */}
                          <rect
                            x={-plateW / 2}
                            y={-plateH / 2}
                            width={plateW}
                            height={plateH}
                            rx={hasCode ? 5 : 4}
                            fill="#3f3f46"
                            stroke="#18181b"
                            strokeWidth={1.5}
                          />

                          {hasCode ? (
                            /* ─── A. コードあり駅: 2段レイアウト ─── */
                            <>
                              {/* ─── 上段: 駅名 ＆ コード ─── */}
                              <g transform="translate(0, -8)">
                                <text
                                  x={-plateW / 2 + 8}
                                  y={0}
                                  dominantBaseline="middle"
                                  fontSize={12}
                                  fill="#ffffff"
                                  fontWeight="bold"
                                >
                                  {station.name}
                                </text>
                                <g transform={`translate(${plateW / 2 - 26}, -2)`}>
                                  <rect
                                    x={0}
                                    y={-6.5}
                                    width={20}
                                    height={13}
                                    rx={2}
                                    fill="#000000"
                                    stroke="#ffffff"
                                    strokeWidth={0.8}
                                  />
                                  <text
                                    x={10}
                                    y={0}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={7.5}
                                    fill="#ffffff"
                                    fontWeight="bold"
                                  >
                                    {station.code}
                                  </text>
                                </g>
                              </g>

                              {/* ─── 下段: ナンバリングアイコン ─── */}
                              <g transform="translate(0, 8.0)">
                                {numberings.map((num, idx) => {
                                  const iconX = startX + idx * (iconSize + iconGap);
                                  const iconRx = num.symbolType === 'circle' ? iconSize / 2 : 2;
                                  return (
                                    <g key={`${num.lineId}-${idx}`} transform={`translate(${iconX}, ${-iconSize / 2})`}>
                                      <rect
                                        x={0}
                                        y={0}
                                        width={iconSize}
                                        height={iconSize}
                                        fill="#ffffff"
                                        stroke={num.color}
                                        strokeWidth={1.5}
                                        rx={iconRx}
                                      />
                                      <text
                                        x={iconSize / 2}
                                        y={3.8}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={4.8}
                                        fontWeight="bold"
                                        fill="#0f172a"
                                      >
                                        {num.symbol}
                                      </text>
                                      <text
                                        x={iconSize / 2}
                                        y={9.8}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={7.2}
                                        fontWeight="extrabold"
                                        fill="#0f172a"
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
                              <g transform={`translate(${startX}, 0)`}>
                                {numberings.map((num, idx) => {
                                  const iconX = idx * (iconSize + iconGap);
                                  const iconRx = num.symbolType === 'circle' ? iconSize / 2 : 2;
                                  return (
                                    <g key={`${num.lineId}-${idx}`} transform={`translate(${iconX}, ${-iconSize / 2})`}>
                                      <rect
                                        x={0}
                                        y={0}
                                        width={iconSize}
                                        height={iconSize}
                                        fill="#ffffff"
                                        stroke={num.color}
                                        strokeWidth={1.5}
                                        rx={iconRx}
                                      />
                                      <text
                                        x={iconSize / 2}
                                        y={3.8}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={4.8}
                                        fontWeight="bold"
                                        fill="#0f172a"
                                      >
                                        {num.symbol}
                                      </text>
                                      <text
                                        x={iconSize / 2}
                                        y={9.8}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={7.2}
                                        fontWeight="extrabold"
                                        fill="#0f172a"
                                      >
                                        {num.numStr}
                                      </text>
                                    </g>
                                  );
                                })}
                              </g>

                              <text
                                x={startX + totalWidth + 5}
                                y={0}
                                textAnchor="start"
                                dominantBaseline="middle"
                                fontSize={11.5}
                                fill="#ffffff"
                                fontWeight="bold"
                              >
                                {station.name}
                              </text>
                            </>
                          )}
                        </g>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* ─── ズームコントロール ─── */}
        <div
          className="absolute right-3 sm:right-4 flex flex-col gap-1.5 z-20"
          style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            id="route-map-zoom-in"
            onClick={zoomIn}
            disabled={vt.scale >= 3.5}
            className="w-10 h-10 sm:w-8 sm:h-8 bg-white/95 hover:bg-[#5b8064]/10 border border-slate-200/90 hover:border-[#5b8064]/50 rounded-xl text-slate-700 hover:text-[#5b8064] flex items-center justify-center transition-all active:scale-95 text-lg sm:text-base font-bold shadow-lg cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="拡大"
          >
            +
          </button>
          <button
            id="route-map-zoom-out"
            onClick={zoomOut}
            disabled={vt.scale <= getMinScale() + 0.001}
            className="w-10 h-10 sm:w-8 sm:h-8 bg-white/95 hover:bg-[#5b8064]/10 border border-slate-200/90 hover:border-[#5b8064]/50 rounded-xl text-slate-700 hover:text-[#5b8064] flex items-center justify-center transition-all active:scale-95 text-lg sm:text-base font-bold shadow-lg cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="縮小"
          >
            −
          </button>
          <button
            id="route-map-reset"
            onClick={resetView}
            disabled={(() => {
              const iv = computeInitialVt(mt);
              return (
                Math.abs(vt.scale - iv.scale) < 0.01 &&
                Math.abs(vt.x - iv.x) < 2 &&
                Math.abs(vt.y - iv.y) < 2
              );
            })()}
            className="w-10 h-10 sm:w-8 sm:h-8 bg-white/95 hover:bg-[#5b8064]/10 border border-slate-200/90 hover:border-[#5b8064]/50 rounded-xl text-[#5b8064] flex items-center justify-center transition-all active:scale-95 text-sm sm:text-xs font-bold shadow-lg cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="リセット"
            title="表示をリセット"
          >
            ⌂
          </button>
        </div>

        {/* ─── 凡例 (スマホ対応) ─── */}
        <div
          className="absolute left-3 z-20"
          style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="sm:hidden flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#5b8064]/40 hover:bg-[#5b8064]/5 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold shadow-lg cursor-pointer select-none transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#5b8064]" />
            <span>路線一覧</span>
            <span className="text-[10px] text-slate-400">{isLegendOpen ? '▲' : '▼'}</span>
          </button>

          <div
            className={`bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-xl ${isLegendOpen ? 'mt-1.5 block' : 'hidden sm:block'
              }`}
          >
            <p className="text-[#5b8064] text-[10px] font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-3 bg-[#5b8064] rounded-full inline-block" />
              路線一覧
            </p>
            <div className="flex flex-col gap-1.5">
              {Array.from(new Set(data.lines.map((l) => LINE_GROUP_MAPPING[l.id] || l.id))).map((groupId) => {
                const line = data.lines.find((l) => (LINE_GROUP_MAPPING[l.id] || l.id) === groupId);
                if (!line) return null;
                return (
                  <div key={groupId} className="flex items-center gap-2">
                    <div
                      className="w-5 h-2 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: line.color }}
                    />
                    <span className="text-slate-700 text-xs font-semibold select-none whitespace-nowrap">{line.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── 駅情報パネル (スマホ: ボトムシート / PC: 右上サイドカード) ─── */}
        {selectedStation && (
          <>
            {/* スマホ用背景オーバーレイ */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 sm:hidden transition-opacity"
              onClick={() => setSelectedStation(null)}
            />

            <div
              className="fixed sm:absolute bottom-0 inset-x-0 sm:bottom-auto sm:top-3 sm:right-3 sm:left-auto z-40 sm:z-30 w-full sm:w-80 p-2 sm:p-0"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                opacity: panelVisible ? 1 : 0,
                transform: panelVisible
                  ? 'translateY(0)'
                  : 'translateY(100%) sm:translateY(0) sm:translateX(20px)',
                paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] sm:max-h-none overflow-y-auto">
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
                    className="absolute top-4 right-4 w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs transition-colors cursor-pointer"
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
                        <p className="text-slate-700 text-xs font-semibold select-all">
                          X: {selectedStation.gameCoords.x} &nbsp; Z:{' '}
                          {selectedStation.gameCoords.z}
                        </p>
                      </div>
                      <a
                        href={`https://map.1necat.net/?worldname=world&mapname=undefined&zoom=4&x=${selectedStation.gameCoords.x}&y=64&z=${selectedStation.gameCoords.z}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#5b8064] hover:bg-[#4a6b54] border border-[#5b8064] shadow-md shadow-[#5b8064]/20 rounded-xl px-3 py-1.5 transition-all select-none transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span>地図で確認</span>
                        <svg
                          className="w-3.5 h-3.5"
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

                  {/* 経路検索 */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      id="route-map-route-from"
                      onClick={() => openRouteWith('from', selectedStation.id)}
                      className="text-xs font-bold text-white bg-[#5b8064] hover:bg-[#4a6b54] rounded-xl px-3 py-2 transition-colors cursor-pointer select-none"
                    >
                      ここから出発
                    </button>
                    <button
                      id="route-map-route-to"
                      onClick={() => openRouteWith('to', selectedStation.id)}
                      className="text-xs font-bold text-[#5b8064] bg-white hover:bg-[#5b8064]/10 border border-[#5b8064] rounded-xl px-3 py-2 transition-colors cursor-pointer select-none"
                    >
                      ここへ到着
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
