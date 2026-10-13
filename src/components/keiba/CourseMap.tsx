import {
  DIRECTION_LABEL,
  SURFACE_LABEL,
  courseName,
  type CourseDetail,
  type Point,
} from '@/lib/keiba';
import { EmptyState } from './KeibaParts';

// コース図は上から見た形（x が東、z が南）を、ゴール前の直線が下で横向きになるように回して描く
const WIDTH = 800;
const MAX_HEIGHT = 560;
const MIN_HEIGHT = 220;
const PAD = 48;

const TRACK_COLORS = {
  TURF: { rail: '#2b5a33', track: '#7bbf62', ground: '#eef6ea' },
  DIRT: { rail: '#6b4a2a', track: '#c99a63', ground: '#f6f0e8' },
  NONE: { rail: '#55635a', track: '#a9b8a0', ground: '#f1f4f0' },
};

type XY = [number, number];

// 馬が通る線。スタートは薄い青で、ゴールに近づくほど濃くする
const ROUTE_FROM = [147, 197, 253];
const ROUTE_TO = [30, 58, 138];
const routeColor = (t: number) =>
  `rgb(${ROUTE_FROM.map((from, k) => Math.round(from + (ROUTE_TO[k] - from) * Math.min(1, Math.max(0, t)))).join(',')})`;
// 矢印はゴールに必ず置き、そこからスタート側へ200mごとに置く
const ARROW_EVERY_M = 200;

// 同じ場所を2回以上通るところは、通るたびに線を横にずらす（1回目が内側）
const LANE_GAP = 7;
const SAMPLE_M = 5;
const SAME_PLACE_BLOCKS = 6;
const NEW_PASS_M = 40;

// スタートから d m の地点を「何回目に通るか」から決めた車線（1回しか通らない所は 0）
function lanesOf(path: Point[], cumulative: number[], indexAt: (d: number) => number) {
  const total = cumulative[cumulative.length - 1];
  const ds: number[] = [];
  for (let d = 0; d < total; d += SAMPLE_M) ds.push(d);
  ds.push(total);
  const at = ds.map(d => path[indexAt(d)]);

  const raw = ds.map((d, a) => {
    let before = 0;
    let after = 0;
    let lastBefore = -Infinity;
    let lastAfter = -Infinity;
    for (let b = 0; b < ds.length; b++) {
      if (Math.abs(ds[b] - d) <= NEW_PASS_M) continue;
      if (Math.hypot(at[a][0] - at[b][0], at[a][2] - at[b][2]) >= SAME_PLACE_BLOCKS) continue;
      // 続けて近くにいる間は、同じ1回の通過として数える
      if (ds[b] < d) {
        if (ds[b] - lastBefore > SAMPLE_M * 3) before++;
        lastBefore = ds[b];
      } else {
        if (ds[b] - lastAfter > SAMPLE_M * 3) after++;
        lastAfter = ds[b];
      }
    }
    return before - (before + after) / 2;
  });

  // 車線の切り替わりがなめらかになるように前後をならす
  const lanes = raw.map((_, a) => {
    let sum = 0;
    let n = 0;
    for (let b = Math.max(0, a - 4); b <= Math.min(raw.length - 1, a + 4); b++) {
      sum += raw[b];
      n++;
    }
    return sum / n;
  });

  const laneAt = (d: number) => {
    const f = Math.min(d / SAMPLE_M, lanes.length - 1);
    const i = Math.floor(f);
    const next = lanes[Math.min(i + 1, lanes.length - 1)];
    return lanes[i] + (next - lanes[i]) * (f - i);
  };
  return laneAt;
}

// 向きはこのレースのコース（ゴール前の直線）で決め、大きさは競馬場の全景が収まるように決める
function projectionOf(course: CourseDetail, venuePaths: Point[][]) {
  const flat: XY[] = course.path.map(p => [p[0], p[2]]);
  const { minX, maxX, minZ, maxZ } = course.bounds;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // ゴールの手前およそ80mからゴールへの向き
  const goal = flat[flat.length - 1];
  let k = flat.length - 1;
  for (let acc = 0; k > 0 && acc < 80; k--) {
    acc += Math.hypot(flat[k][0] - flat[k - 1][0], flat[k][1] - flat[k - 1][1]);
  }
  const phi = Math.atan2(goal[1] - flat[k][1], goal[0] - flat[k][0]);

  const rotateBy = (theta: number) => ([x, z]: XY): XY => {
    const dx = x - cx;
    const dz = z - cz;
    return [dx * Math.cos(theta) - dz * Math.sin(theta), dx * Math.sin(theta) + dz * Math.cos(theta)];
  };
  // 直線を右向きにするか左向きにするかのうち、ゴールが中心より下に来るほう（直線コースは右向き）
  const toRight = -phi;
  const toLeft = Math.PI - phi;
  const theta = rotateBy(toLeft)(goal)[1] > rotateBy(toRight)(goal)[1] + 1e-6 ? toLeft : toRight;
  const rotate = rotateBy(theta);

  const rotated = venuePaths.flat().map(p => rotate([p[0], p[2]]));
  const xs = rotated.map(p => p[0]);
  const ys = rotated.map(p => p[1]);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - left, 1);
  const h = Math.max(Math.max(...ys) - top, 1);
  let scale = (WIDTH - PAD * 2) / w;
  let height = h * scale + PAD * 2;
  if (height > MAX_HEIGHT) {
    scale = (MAX_HEIGHT - PAD * 2) / h;
    height = MAX_HEIGHT;
  }
  height = Math.max(height, MIN_HEIGHT);
  const offsetX = (WIDTH - w * scale) / 2;
  const offsetY = (height - h * scale) / 2;
  const project = (p: Point): XY => {
    const [x, y] = rotate([p[0], p[2]]);
    return [offsetX + (x - left) * scale, offsetY + (y - top) * scale];
  };
  // 北の向き（方位記号を回す角度）
  return { project, height, northDeg: (theta * 180) / Math.PI };
}

export default function CourseMap({ course, venue = [] }: { course: CourseDetail | null; venue?: CourseDetail[] }) {
  if (!course || course.path.length < 2) {
    return <EmptyState title="コース図はありません">このコースの経路が登録されていません。</EmptyState>;
  }

  // 同じ競馬場のほかのコース（離れた場所にあるコースは入れない）
  const NEAR_BLOCKS = 300;
  const b = course.bounds;
  const venuePaths = [
    course.path,
    ...venue
      .filter(c => c.name !== course.name && c.path.length > 1)
      .filter(c =>
        c.bounds.maxX >= b.minX - NEAR_BLOCKS && c.bounds.minX <= b.maxX + NEAR_BLOCKS
        && c.bounds.maxZ >= b.minZ - NEAR_BLOCKS && c.bounds.minZ <= b.maxZ + NEAR_BLOCKS)
      .map(c => c.path),
  ];

  const { project, height, northDeg } = projectionOf(course, venuePaths);
  const points = course.path.map(project);
  const venueLines = venuePaths.map(path => path.map(project));
  const colors = TRACK_COLORS[course.surface ?? 'NONE'];
  const center: XY = [WIDTH / 2, height / 2];

  // スタートからの距離（プラグインと同じく3次元で測る）。
  // 周回するコースは同じ場所を2回通るので、地点は位置ではなく距離で探す
  const cumulative = [0];
  for (let i = 1; i < course.path.length; i++) {
    const [x1, y1, z1] = course.path[i - 1];
    const [x2, y2, z2] = course.path[i];
    cumulative.push(cumulative[i - 1] + Math.hypot(x2 - x1, y2 - y1, z2 - z1));
  }
  const total = cumulative[cumulative.length - 1];
  const indexAt = (d: number) => {
    const i = cumulative.findIndex(c => c >= d);
    return i < 0 ? points.length - 1 : i;
  };

  // 進む向き（単位ベクトル）
  const tangentOf = (list: XY[], i: number): XY => {
    const a = list[Math.max(0, i - 2)];
    const b = list[Math.min(list.length - 1, i + 2)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  };

  // コースの外側へ向く法線（直線コースは上側）
  const outwardAt = (i: number): XY => {
    const p = points[i];
    const [tx, ty] = tangentOf(points, i);
    let n: XY = [-ty, tx];
    const dot = n[0] * (p[0] - center[0]) + n[1] * (p[1] - center[1]);
    if (Math.abs(dot) < 1e-6 ? n[1] > 0 : dot < 0) n = [-n[0], -n[1]];
    return n;
  };

  // 経路の i 番目の点から外側へ distance 離れた位置（マイナスなら内側）
  const labelAt = (i: number, distance: number): XY => {
    const n = outwardAt(i);
    return [points[i][0] + n[0] * distance, points[i][1] + n[1] * distance];
  };

  // 馬が通る線（同じ場所を何度も通るところは車線をずらす）
  const laneAt = lanesOf(course.path, cumulative, indexAt);
  const route: XY[] = points.map((p, i) => {
    const n = outwardAt(i);
    const offset = laneAt(cumulative[i]) * LANE_GAP;
    return [p[0] + n[0] * offset, p[1] + n[1] * offset];
  });

  const toPoints = (list: XY[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const venueTrackLines = venueLines.map(toPoints);
  const routeLine = toPoints(route);
  // 色を少しずつ変えるため、20m ずつに分けて描く
  const routeChunks: { points: string; color: string }[] = [];
  for (let d = 0; d < total; d += 20) {
    const from = indexAt(d);
    const to = indexAt(Math.min(total, d + 20));
    routeChunks.push({ points: toPoints(route.slice(from, to + 1)), color: routeColor((d + 10) / total) });
  }
  const arrows: { at: XY; angle: number; color: string }[] = [];
  for (let back = 0; total - back > 30; back += ARROW_EVERY_M) {
    const d = total - back;
    const i = indexAt(d);
    const [tx, ty] = tangentOf(route, i);
    // ゴールの矢印は、先がゴールの線に届くように少し手前に置く
    const at: XY = back === 0 ? [route[i][0] - tx * 6, route[i][1] - ty * 6] : route[i];
    arrows.push({ at, angle: (Math.atan2(ty, tx) * 180) / Math.PI, color: routeColor(d / total) });
  }

  const last300Index = indexAt(total - 300);

  // ゴールの線（進む向きに直角）
  const finish = points[points.length - 1];
  const [fx, fy] = tangentOf(points, points.length - 1);
  const finishLine = { x1: finish[0] - fy * 16, y1: finish[1] + fx * 16, x2: finish[0] + fy * 16, y2: finish[1] - fx * 16 };

  // 文字の置き場所。ほかの文字やコースと重ならない位置を、候補の順に探す
  const placed: XY[] = [];
  const trackSamples = venueLines.flat();
  const isFree = ([x, y]: XY, gap: number) =>
    x > 12 && x < WIDTH - 12 && y > 12 && y < height - 12
    && placed.every(([px, py]) => Math.hypot(px - x, py - y) > gap)
    && trackSamples.every(([tx, ty]) => Math.hypot(tx - x, ty - y) > 14);
  const place = (i: number, distances: number[], gap: number): XY | null => {
    for (const distance of distances) {
      const p = labelAt(i, distance);
      if (isFree(p, gap)) {
        placed.push(p);
        return p;
      }
    }
    return null;
  };
  // どうしても空きが無いときは最初の候補に置く
  const placeOrForce = (i: number, distances: number[], gap: number): XY => {
    const p = place(i, distances, gap);
    if (p) return p;
    const forced = labelAt(i, distances[0]);
    placed.push(forced);
    return forced;
  };

  const goalLabel = placeOrForce(points.length - 1, [36, -36, 52], 30);
  const startLabel = placeOrForce(0, [36, -36, 52], 30);
  const passMarks = [
    { key: 'quarter', label: '1/4', point: course.marks.quarter, index: indexAt(total * 0.25) },
    { key: 'half', label: '1/2', point: course.marks.half, index: indexAt(total * 0.5) },
    { key: 'threeQuarters', label: '3/4', point: course.marks.threeQuarters, index: indexAt(total * 0.75) },
  ]
    .filter(m => m.point)
    .map(m => ({ ...m, labelAt: placeOrForce(m.index, [30, -30, 44, -44], 30) }));
  // ゴールまでの残り距離（200mごとに数字。重なって置けないところは出さない）
  const remainingMarks = course.remaining
    .filter(r => r.point && r.remaining % 200 === 0)
    .flatMap(r => {
      const labelAt = place(indexAt(total - r.remaining), [26, -26], 28);
      return labelAt ? [{ remaining: r.remaining, labelAt }] : [];
    });

  // 方位記号は、四隅のうちコースからいちばん離れたところに置く
  const corners: XY[] = [[WIDTH - 34, 38], [34, 38], [WIDTH - 34, height - 38], [34, height - 38]];
  const clearance = ([cx, cy]: XY) => Math.min(...trackSamples.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const compassAt = corners.reduce((best, c) => (clearance(c) > clearance(best) ? c : best));

  const heightDiff = course.bounds.maxY - course.bounds.minY;
  const halo = { paintOrder: 'stroke' as const, stroke: '#ffffff', strokeWidth: 4, strokeLinejoin: 'round' as const };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-4">
      <div className="self-start bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="w-full min-w-[480px] h-auto block"
          role="img"
          aria-label={`${courseName(course)}のコース図`}
        >
          <rect x={0} y={0} width={WIDTH} height={height} fill={colors.ground} />

          {/* 競馬場の全景（このレースで使わないコースも含む） */}
          {venueTrackLines.map((line, i) => (
            <polyline key={`rail-${i}`} points={line} fill="none" stroke={colors.rail} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {venueTrackLines.map((line, i) => (
            <polyline key={`track-${i}`} points={line} fill="none" stroke={colors.track} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
          ))}

          {/* 馬が通る線と進む向き */}
          <polyline points={routeLine} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          {routeChunks.map((c, i) => (
            <polyline key={i} points={c.points} fill="none" stroke={c.color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {arrows.map((a, i) => (
            <polygon
              key={i}
              points="-5,-5 6,0 -5,5"
              fill={a.color}
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeLinejoin="round"
              transform={`translate(${a.at[0].toFixed(1)} ${a.at[1].toFixed(1)}) rotate(${a.angle.toFixed(1)})`}
            />
          ))}

          {/* ゴールまでの残り距離 */}
          {remainingMarks.map(r => (
            <text key={r.remaining} x={r.labelAt[0]} y={r.labelAt[1]} fontSize={15} fill="#4b5563" textAnchor="middle" dominantBaseline="central" style={halo}>
              {r.remaining}
            </text>
          ))}

          {/* 通過順の計測地点 */}
          {passMarks.map(m => {
            const p = route[m.index];
            return (
              <g key={m.key}>
                <rect x={p[0] - 6} y={p[1] - 6} width={12} height={12} fill="#1f6fc5" stroke="#ffffff" strokeWidth={2} transform={`rotate(45 ${p[0]} ${p[1]})`} />
                <text x={m.labelAt[0]} y={m.labelAt[1]} fontSize={16} fontWeight={700} fill="#1f6fc5" textAnchor="middle" dominantBaseline="central" style={halo}>
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* 上りの始まり（ゴールまで300m） */}
          <circle cx={route[last300Index][0]} cy={route[last300Index][1]} r={7} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />

          {/* ゴール */}
          <line {...finishLine} stroke="#111827" strokeWidth={6} strokeLinecap="round" />
          <line {...finishLine} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeDasharray="4 4" />
          <circle cx={goalLabel[0]} cy={goalLabel[1]} r={13} fill="#e0262d" />
          <text x={goalLabel[0]} y={goalLabel[1]} fontSize={15} fontWeight={700} fill="#ffffff" textAnchor="middle" dominantBaseline="central">G</text>

          {/* スタート */}
          <line x1={route[0][0]} y1={route[0][1]} x2={startLabel[0]} y2={startLabel[1]} stroke="#1d9a4b" strokeWidth={2} />
          <circle cx={route[0][0]} cy={route[0][1]} r={5} fill="#1d9a4b" stroke="#ffffff" strokeWidth={2} />
          <circle cx={startLabel[0]} cy={startLabel[1]} r={13} fill="#1d9a4b" />
          <text x={startLabel[0]} y={startLabel[1]} fontSize={15} fontWeight={700} fill="#ffffff" textAnchor="middle" dominantBaseline="central">S</text>

          {/* 方位（北） */}
          <g transform={`translate(${compassAt[0]} ${compassAt[1]})`}>
            <circle r={20} fill="#ffffff" opacity={0.8} />
            <g transform={`rotate(${northDeg.toFixed(1)})`}>
              <polygon points="0,-15 6,4 0,0 -6,4" fill="#374151" />
            </g>
            <text
              x={Math.sin((northDeg * Math.PI) / 180) * -11}
              y={Math.cos((northDeg * Math.PI) / 180) * 11}
              fontSize={11}
              fontWeight={700}
              fill="#374151"
              textAnchor="middle"
              dominantBaseline="central"
            >
              N
            </text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <dl className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm">
          {[
            ['コース', courseName(course)],
            ['馬場', course.surface ? SURFACE_LABEL[course.surface] : '未設定'],
            ['距離', course.distanceOfficial != null ? `${course.distanceOfficial}m` : '-'],
            ['実測', course.distance != null ? `${course.distance}m` : '-'],
            ['回り', DIRECTION_LABEL[course.direction]],
            ['高低差', heightDiff > 0 ? `${heightDiff.toFixed(1)}m` : '平坦'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 px-4 py-2">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-bold text-gray-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <ul className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-600 space-y-2">
          <li className="flex items-center gap-2"><span className="w-4 h-4 shrink-0 rounded-full bg-[#1d9a4b] text-white text-[10px] font-bold flex items-center justify-center">S</span>スタート</li>
          <li className="flex items-center gap-2"><span className="w-4 h-4 shrink-0 rounded-full bg-[#e0262d] text-white text-[10px] font-bold flex items-center justify-center">G</span>ゴール</li>
          <li className="flex items-center gap-2">
            <span
              className="w-4 h-1.5 shrink-0 rounded-full"
              style={{ background: `linear-gradient(90deg, ${routeColor(0)}, ${routeColor(1)})` }}
            />
            このレースで馬が通る道筋
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-2 shrink-0 rounded-sm" style={{ background: colors.track, boxShadow: `inset 0 0 0 1px ${colors.rail}` }} />
            白椿競馬場のコース
          </li>
          <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 mx-[3px] rotate-45 bg-[#1f6fc5]" />通過順を記録する地点</li>
          <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 shrink-0 mx-[3px] rounded-full bg-[#f59e0b]" />上りの始まり</li>
          <li className="flex items-center gap-2"><span className="w-4 shrink-0 text-center text-[10px] font-bold text-gray-600">400</span>ゴールまでの残り距離</li>
        </ul>
      </div>
    </div>
  );
}
