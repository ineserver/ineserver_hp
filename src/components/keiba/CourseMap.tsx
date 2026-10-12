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

function projectionOf(course: CourseDetail) {
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

  const rotated = flat.map(rotate);
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

export default function CourseMap({ course }: { course: CourseDetail | null }) {
  if (!course || course.path.length < 2) {
    return <EmptyState title="コース図はありません">このコースの経路が登録されていません。</EmptyState>;
  }

  const { project, height, northDeg } = projectionOf(course);
  const points = course.path.map(project);
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
  const tangentAt = (i: number): XY => {
    const a = points[Math.max(0, i - 2)];
    const b = points[Math.min(points.length - 1, i + 2)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  };

  // コースの外側へ向く法線（直線コースは上側）
  const outwardAt = (i: number): XY => {
    const p = points[i];
    const [tx, ty] = tangentAt(i);
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

  const toPoints = (list: XY[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const polyline = toPoints(points);
  const last300Index = indexAt(total - 300);
  const last300 = course.marks.last300 ? project(course.marks.last300) : points[last300Index];
  const last300Line = toPoints(points.slice(last300Index));

  // 進行方向の矢印
  const arrows = [0.12, 0.37, 0.62, 0.87].map(f => {
    const i = Math.floor((points.length - 1) * f);
    const [tx, ty] = tangentAt(i);
    return { at: points[i], angle: (Math.atan2(ty, tx) * 180) / Math.PI };
  });

  // ゴールの線（進む向きに直角）
  const finish = points[points.length - 1];
  const [fx, fy] = tangentAt(points.length - 1);
  const finishLine = { x1: finish[0] - fy * 16, y1: finish[1] + fx * 16, x2: finish[0] + fy * 16, y2: finish[1] - fx * 16 };

  const passMarks = [
    { key: 'quarter', label: '1/4', point: course.marks.quarter, index: indexAt(total * 0.25) },
    { key: 'half', label: '1/2', point: course.marks.half, index: indexAt(total * 0.5) },
    { key: 'threeQuarters', label: '3/4', point: course.marks.threeQuarters, index: indexAt(total * 0.75) },
  ].filter(m => m.point);
  const passLabels = passMarks.map(m => labelAt(m.index, 30));

  // 方位記号は、四隅のうちコースからいちばん離れたところに置く
  const corners: XY[] = [[WIDTH - 34, 38], [34, 38], [WIDTH - 34, height - 38], [34, height - 38]];
  const clearance = ([cx, cy]: XY) => Math.min(...points.map(([x, y]) => Math.hypot(x - cx, y - cy)));
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

          {/* コース */}
          <polyline points={polyline} fill="none" stroke={colors.rail} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={polyline} fill="none" stroke={colors.track} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={last300Line} fill="none" stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />

          {/* 進行方向 */}
          {arrows.map((a, i) => (
            <polygon
              key={i}
              points="-5,-5 5,0 -5,5"
              fill="#ffffff"
              opacity={0.9}
              transform={`translate(${a.at[0].toFixed(1)} ${a.at[1].toFixed(1)}) rotate(${a.angle.toFixed(1)})`}
            />
          ))}

          {/* ゴールまでの残り距離（ハロン棒の代わりに100mごと） */}
          {course.remaining.map(r => {
            if (!r.point) return null;
            const p = project(r.point);
            const [lx, ly] = labelAt(indexAt(total - r.remaining), 26);
            // 通過順の地点の名前と重なる数字は出さない
            const showLabel = r.remaining % 200 === 0 && passLabels.every(([px, py]) => Math.hypot(px - lx, py - ly) > 32);
            return (
              <g key={r.remaining}>
                <circle cx={p[0]} cy={p[1]} r={3.5} fill="#ffffff" stroke="#1f3d2a" strokeWidth={1.5} />
                {showLabel && (
                  <text x={lx} y={ly} fontSize={15} fill="#4b5563" textAnchor="middle" dominantBaseline="central" style={halo}>
                    {r.remaining}
                  </text>
                )}
              </g>
            );
          })}

          {/* 通過順の計測地点 */}
          {passMarks.map((m, i) => {
            const p = project(m.point!);
            const [lx, ly] = passLabels[i];
            return (
              <g key={m.key}>
                <rect x={p[0] - 6} y={p[1] - 6} width={12} height={12} fill="#1f6fc5" stroke="#ffffff" strokeWidth={2} transform={`rotate(45 ${p[0]} ${p[1]})`} />
                <text x={lx} y={ly} fontSize={16} fontWeight={700} fill="#1f6fc5" textAnchor="middle" dominantBaseline="central" style={halo}>
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* 上り（ゴールまでの300m）。名前は区間のなかほどの内側に置く */}
          {(() => {
            const [lx, ly] = labelAt(indexAt(total - 150), -30);
            return (
              <g>
                <circle cx={last300[0]} cy={last300[1]} r={7} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                <text x={lx} y={ly} fontSize={15} fontWeight={700} fill="#b45309" textAnchor="middle" dominantBaseline="central" style={halo}>
                  上り300m
                </text>
              </g>
            );
          })()}

          {/* ゴール */}
          <line {...finishLine} stroke="#111827" strokeWidth={6} strokeLinecap="round" />
          <line {...finishLine} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeDasharray="4 4" />
          {(() => {
            const [lx, ly] = labelAt(points.length - 1, 36);
            return (
              <g>
                <circle cx={lx} cy={ly} r={13} fill="#e0262d" />
                <text x={lx} y={ly} fontSize={15} fontWeight={700} fill="#ffffff" textAnchor="middle" dominantBaseline="central">G</text>
              </g>
            );
          })()}

          {/* スタート */}
          {(() => {
            const start = points[0];
            const [lx, ly] = labelAt(0, 36);
            return (
              <g>
                <line x1={start[0]} y1={start[1]} x2={lx} y2={ly} stroke="#1d9a4b" strokeWidth={2} />
                <circle cx={start[0]} cy={start[1]} r={5} fill="#1d9a4b" stroke="#ffffff" strokeWidth={2} />
                <circle cx={lx} cy={ly} r={13} fill="#1d9a4b" />
                <text x={lx} y={ly} fontSize={15} fontWeight={700} fill="#ffffff" textAnchor="middle" dominantBaseline="central">S</text>
              </g>
            );
          })()}

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
          <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#1d9a4b] text-white text-[10px] font-bold flex items-center justify-center">S</span>スタート</li>
          <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#e0262d] text-white text-[10px] font-bold flex items-center justify-center">G</span>ゴール</li>
          <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 mx-[3px] rotate-45 bg-[#1f6fc5]" />通過順を記録する地点（1/4・1/2・3/4）</li>
          <li className="flex items-center gap-2"><span className="w-4 h-1.5 rounded-full bg-[#f59e0b]" />上り（ゴールまでの300m。丸が始まり）</li>
          <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 mx-[3px] rounded-full bg-white border-[1.5px] border-[#1f3d2a]" />ゴールまでの残り距離（100mごと）</li>
        </ul>
      </div>
    </div>
  );
}
