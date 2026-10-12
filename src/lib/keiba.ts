// ============================================================
// 競馬 API（HorseRacingPlugin）の型と表示用の関数
//   サーバー・ブラウザのどちらからも使う
// ============================================================

// 手元で仮データの API を使うときは NEXT_PUBLIC_KEIBA_API_BASE で切り替える
export const KEIBA_API_BASE = process.env.NEXT_PUBLIC_KEIBA_API_BASE ?? 'https://api.1necat.net';

// ------------------------------------------------------------
// 型
// ------------------------------------------------------------

export type RaceClass = 'SHINBA' | 'ONE_WIN' | 'OP' | 'G2' | 'G1';
export type Surface = 'TURF' | 'DIRT';
export type RaceStatus = 'ENTRY' | 'BETTING' | 'GATE' | 'RUNNING' | 'FINISHED' | 'CANCELLED';
export type Gender = 'STALLION' | 'MARE';
export type Direction = 'LEFT' | 'RIGHT' | 'STRAIGHT';
export type Point = [number, number, number];

export interface Owner {
  uuid: string | null;
  name: string | null;
}

export interface RaceCourse {
  name: string;
  display: string | null;
  surface: Surface | null;
  distance: number | null;
  distanceOfficial: number | null;
}

export interface Race {
  raceId: string;
  date: string;
  number: number | null;
  name: string;
  class: RaceClass | null;
  status: RaceStatus | null;
  postTime: string | null;
  course: RaceCourse;
  fieldSize: number | null;
  totalSales: number | null;
  bonusTotal: number | null;
  racedAt: string | null;
  lapTimes: number[] | null;
}

export interface RaceWinner {
  gate: number;
  horseUuid: string;
  horseName: string;
  time: number | null;
}

export interface RaceSummary extends Race {
  winners: RaceWinner[];
}

export interface Entry {
  gate: number;
  horseUuid: string;
  horseName: string;
  gender: Gender | null;
  sire: string | null;
  dam: string | null;
  owner: Owner;
  horseClass: RaceClass | null;
  weight: number | null;
  weightChange: number | null;
  excluded: boolean;
}

export interface Result {
  position: number | null;
  gate: number;
  finished: boolean;
  horseUuid: string;
  horseName: string;
  owner: Owner;
  time: number | null;
  timeBehind: number | null;
  last300: number | null;
  passing: (number | null)[];
  lateStart: boolean;
  popularity: number | null;
  winOdds: number | null;
  weight: number | null;
  weightChange: number | null;
  // 追加賞金を含んだ賞金と、そのうちの追加賞金
  prize: number | null;
  bonusPrize: number | null;
}

export interface Payout {
  betType: 'WIN' | 'QUINELLA';
  selection: number[];
  odds: number | null;
  payout: number | null;
  popularity: number | null;
}

export interface RaceDetail extends Race {
  entries: Entry[];
  results: Result[];
  payouts: Payout[];
}

export interface WinOdds {
  gate: number;
  odds: number | null;
  popularity: number;
  share: number | null;
}

export interface QuinellaOdds {
  selection: number[];
  odds: number | null;
  popularity: number;
}

export interface Odds {
  raceId: string;
  status: RaceStatus | null;
  updatedAt: string;
  sales: { win: number; quinella: number; total: number };
  win: WinOdds[];
  quinella: QuinellaOdds[];
}

export interface RaceRecord {
  starts: number;
  first: number;
  second: number;
  third: number;
}

// 馬の過去の1走
export interface Run {
  raceId: string;
  date: string;
  number: number | null;
  name: string;
  class: RaceClass | null;
  course: RaceCourse;
  fieldSize: number | null;
  gate: number;
  position: number | null;
  finished: boolean;
  time: number | null;
  timeBehind: number | null;
  last300: number | null;
  passing: (number | null)[];
  lateStart: boolean;
  popularity: number | null;
  winOdds: number | null;
  weight: number | null;
  weightChange: number | null;
  // 追加賞金を含んだ賞金
  prize: number | null;
  // 追加賞金（API が返すようになったら内訳に出す）
  bonusPrize?: number | null;
}

// コースレコードなどの1走
export interface RunRef {
  raceId: string;
  date: string;
  name: string;
  class: RaceClass | null;
  horseUuid: string;
  horseName: string;
  time: number | null;
  last300: number | null;
}

export interface ClassTime {
  class: RaceClass;
  races: number;
  winTimeAverage: number | null;
  winTimeBest: number | null;
  winnerLast300Average: number | null;
}

export interface FormHorse {
  gate: number;
  horseUuid: string;
  horseName: string;
  excluded: boolean;
  record: RaceRecord;
  sameCondition: { record: RaceRecord; best: Run | null };
  similarCondition: { convertedTime: number | null; run: Run } | null;
  bestLast300: Run | null;
  recent: Run[];
}

export interface RaceForm {
  raceId: string;
  conditions: { course: RaceCourse; sameCourseToleranceM: number; similarDistanceM: number };
  course: {
    races: number;
    record: RunRef | null;
    fastestLast300: RunRef | null;
    byClass: ClassTime[];
  };
  horses: FormHorse[];
}

export interface CourseSummary {
  name: string;
  display: string | null;
  surface: Surface | null;
  distance: number | null;
  distanceOfficial: number | null;
  direction: Direction;
  updatedAt: string | null;
}

export interface CourseDetail extends CourseSummary {
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  marks: {
    start: Point | null;
    quarter: Point | null;
    half: Point | null;
    threeQuarters: Point | null;
    last300: Point | null;
    finish: Point | null;
  };
  remaining: { remaining: number; point: Point | null }[];
  path: Point[];
}

export interface HorseSummary {
  horseUuid: string;
  horseName: string;
  gender: Gender | null;
  sire: string | null;
  dam: string | null;
  owner: Owner;
  horseClass: RaceClass | null;
  // 通算獲得賞金（売上からの賞金＋追加賞金）と、そのうちの追加賞金
  totalPrize: number | null;
  totalBonus: number | null;
  retiredAt: string | null;
  record: RaceRecord;
}

// 血統表の父・母（名前で馬の表をたどるので、登録されていない馬は horseUuid が null）
export interface PedigreeParent {
  name: string;
  horseUuid: string | null;
  sire: string | null;
  dam: string | null;
}

export interface Offspring {
  horseUuid: string;
  horseName: string;
  gender: Gender | null;
  horseClass: RaceClass | null;
  retiredAt: string | null;
}

export interface UpcomingRace extends Race {
  gate: number;
  weight: number | null;
  weightChange: number | null;
  excluded: boolean;
}

export interface HorseDetail {
  horseUuid: string;
  horseName: string;
  gender: Gender | null;
  owner: Owner;
  horseClass: RaceClass | null;
  totalPrize: number | null;
  totalBonus: number | null;
  retiredAt: string | null;
  record: RaceRecord;
  pedigree: { sire: PedigreeParent | null; dam: PedigreeParent | null };
  offspring: Offspring[];
  upcoming: UpcomingRace[];
  runs: Run[];
}

// ------------------------------------------------------------
// 取得
// ------------------------------------------------------------

export type KeibaResponse<T> =
  | { ok: true; data: T }
  | { ok: false; notFound: boolean };

export async function fetchKeiba<T>(path: string, init?: RequestInit): Promise<KeibaResponse<T>> {
  try {
    const res = await fetch(`${KEIBA_API_BASE}${path}`, init);
    if (!res.ok) return { ok: false, notFound: res.status === 404 || res.status === 400 };
    const json = await res.json();
    if (json?.status !== 'success') return { ok: false, notFound: false };
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, notFound: false };
  }
}

export const raceApiPath = (raceId: string) => `/api/keiba/races/${encodeURIComponent(raceId)}`;
export const courseApiPath = (name: string) => `/api/keiba/courses/${encodeURIComponent(name)}`;
export const horseApiPath = (uuid: string) => `/api/keiba/horses/${encodeURIComponent(uuid)}`;

export const racePath = (raceId: string) => `/keiba/race/${raceId}`;
export const horsePath = (uuid: string) => `/keiba/horse/${uuid}`;

// ------------------------------------------------------------
// 表記
// ------------------------------------------------------------

export const CLASS_LABEL: Record<RaceClass, string> = {
  SHINBA: '新馬',
  ONE_WIN: '1勝クラス',
  OP: 'オープン',
  G2: 'G2',
  G1: 'G1',
};

export const STATUS_LABEL: Record<RaceStatus, string> = {
  ENTRY: '出走馬募集中',
  BETTING: '発売中',
  GATE: '締切',
  RUNNING: '競走中',
  FINISHED: '確定',
  CANCELLED: '中止',
};

// 発走前・競走中のレース（自動で取り直す）
export const LIVE_STATUSES: RaceStatus[] = ['ENTRY', 'BETTING', 'GATE', 'RUNNING'];

export const isLive = (status: RaceStatus | null) => status != null && LIVE_STATUSES.includes(status);

export const GENDER_LABEL: Record<Gender, string> = { STALLION: '牡', MARE: '牝' };

export const DIRECTION_LABEL: Record<Direction, string> = { LEFT: '左', RIGHT: '右', STRAIGHT: '直線' };

export const SURFACE_LABEL: Record<Surface, string> = { TURF: '芝', DIRT: 'ダート' };

const SURFACE_SHORT: Record<Surface, string> = { TURF: '芝', DIRT: 'ダ' };

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function parseDate(date: string): { y: number; m: number; d: number; w: string } {
  const [y, m, d] = date.split('-').map(Number);
  const w = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { y, m, d, w };
}

// 2026年10月25日（日）
export function formatDateLong(date: string): string {
  const { y, m, d, w } = parseDate(date);
  return `${y}年${m}月${d}日（${w}）`;
}

// 10/25（日）
export function formatDateShort(date: string): { md: string; weekday: string } {
  const { m, d, w } = parseDate(date);
  return { md: `${m}/${d}`, weekday: w };
}

export function isWeekend(date: string): 'sat' | 'sun' | null {
  const { w } = parseDate(date);
  if (w === '土') return 'sat';
  if (w === '日') return 'sun';
  return null;
}

// 表に出す距離は公称、無ければ実測
export function displayDistance(course: Pick<RaceCourse, 'distance' | 'distanceOfficial'>): number | null {
  return course.distanceOfficial ?? course.distance;
}

// 芝1600m（左）
export function formatCourse(
  course: Pick<RaceCourse, 'surface' | 'distance' | 'distanceOfficial'>,
  direction?: Direction | null,
): string {
  const distance = displayDistance(course);
  const surface = course.surface ? SURFACE_SHORT[course.surface] : '';
  const dir = direction ? `（${DIRECTION_LABEL[direction]}）` : '';
  return `${surface}${distance != null ? `${distance}m` : ''}${dir}`;
}

export const courseName = (course: Pick<RaceCourse, 'name' | 'display'>) => course.display || course.name;

// 1:35.8（1分未満は 57.9）
export function formatTime(sec: number | null | undefined): string {
  if (sec == null) return '';
  const t = Math.round(sec * 10) / 10;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return m > 0 ? `${m}:${s.toFixed(1).padStart(4, '0')}` : s.toFixed(1);
}

export function formatSeconds(sec: number | null | undefined): string {
  return sec == null ? '' : (Math.round(sec * 10) / 10).toFixed(1);
}

// 勝ち馬とのタイム差（勝ち馬は2着との差がマイナス）
export function formatTimeBehind(sec: number | null | undefined): string {
  if (sec == null) return '';
  const t = Math.round(sec * 10) / 10;
  return t === 0 ? '0.0' : t.toFixed(1);
}

// 482(+4)。初出走は 482(初)
export function formatWeight(weight: number | null, change: number | null): string {
  if (weight == null) return '計不';
  if (change == null) return `${weight}(初)`;
  return `${weight}(${change > 0 ? '+' : ''}${change})`;
}

export function formatOdds(odds: number | null | undefined): string {
  return odds == null ? '' : odds.toFixed(1);
}

export function formatIne(value: number | null | undefined): string {
  return value == null ? '' : `${Math.round(value).toLocaleString('ja-JP')} ine`;
}

// 通過順 3-3-2
export function formatPassing(passing: (number | null)[]): string {
  return passing.filter(p => p != null).join('-');
}

// 5戦2勝
export function formatStarts(r: RaceRecord): string {
  return `${r.starts}戦${r.first}勝`;
}

// 勝率・連対率・複勝率（%）
export function rates(r: RaceRecord): { win: number; quinella: number; place: number } | null {
  if (r.starts === 0) return null;
  const pct = (n: number) => Math.round((n / r.starts) * 1000) / 10;
  return { win: pct(r.first), quinella: pct(r.first + r.second), place: pct(r.first + r.second + r.third) };
}

// 日時（ISO 8601）の日付だけを 2026年10月25日（日） で
export const formatIsoDate = (iso: string | null) => (iso ? formatDateLong(iso.slice(0, 10)) : '');

// 通算成績 [1-0-2-3]（1着-2着-3着-着外）
export function formatRecord(r: RaceRecord): string {
  return `${r.first}-${r.second}-${r.third}-${Math.max(0, r.starts - r.first - r.second - r.third)}`;
}

// 発走予定の日時（開催日と発走時刻は日本時間）
export function postDateTime(race: Pick<Race, 'date' | 'postTime'>): Date | null {
  if (!race.postTime) return null;
  const d = new Date(`${race.date}T${race.postTime}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatClock(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ------------------------------------------------------------
// 枠番
//   API は馬番だけなので、JRA と同じ決め方で枠番を出す。
//   8頭以下は馬番と同じ。9頭以上は外の枠から順に1頭ずつ増やす
// ------------------------------------------------------------

export function frameOf(gate: number, gateCount: number): number {
  if (gateCount <= 8) return gate;
  const base = Math.floor(gateCount / 8);
  const extra = gateCount % 8;
  let first = 1;
  for (let frame = 1; frame <= 8; frame++) {
    const size = base + (frame > 8 - extra ? 1 : 0);
    if (gate < first + size) return frame;
    first += size;
  }
  return 8;
}

// 枠の色（1白・2黒・3赤・4青・5黄・6緑・7橙・8桃）
export const FRAME_CLASS: Record<number, string> = {
  1: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-400',
  2: 'bg-[#222222] text-white',
  3: 'bg-[#e0262d] text-white',
  4: 'bg-[#1f6fc5] text-white',
  5: 'bg-[#f5d300] text-gray-900',
  6: 'bg-[#1d9a4b] text-white',
  7: 'bg-[#f08c00] text-gray-900',
  8: 'bg-[#f4a0c0] text-gray-900',
};

// ------------------------------------------------------------
// 着差
//   API の着差は秒なので、ゴールでの速さ（距離 ÷ 勝ちタイム）で何m離れていたかにして、
//   1馬身＝2.4m（実際の馬の体長）で馬身にする。表記は JRA と同じ刻み
// ------------------------------------------------------------

const HORSE_LENGTH_M = 2.4;

export function marginLabel(lengths: number): string {
  if (lengths < 0.1) return 'ハナ';
  if (lengths < 0.2) return 'アタマ';
  if (lengths < 0.375) return 'クビ';
  if (lengths < 1.875) {
    const quarters = Math.max(2, Math.round(lengths * 4));
    return ['', '', '1/2', '3/4', '1', '1.1/4', '1.1/2', '1.3/4'][quarters] ?? '2';
  }
  if (lengths < 3.75) {
    const halves = Math.round(lengths * 2);
    return ['', '', '', '', '2', '2.1/2', '3', '3.1/2'][halves] ?? '4';
  }
  if (lengths <= 10) return String(Math.round(lengths));
  return '大差';
}

// 確定した着順の行に、1つ前の馬との着差（馬身）を付ける
export function marginsOf(results: Result[], distance: number | null): Map<number, string> {
  const margins = new Map<number, string>();
  const ranked = results
    .filter(r => r.finished && r.position != null && r.time != null)
    .sort((a, b) => a.position! - b.position! || a.gate - b.gate);
  const winnerTime = ranked[0]?.time;
  if (!winnerTime || !distance) return margins;
  const speed = distance / winnerTime;
  for (let i = 1; i < ranked.length; i++) {
    const prev = ranked[i - 1];
    const cur = ranked[i];
    if (cur.position === prev.position) {
      margins.set(cur.gate, '同着');
      continue;
    }
    const meters = Math.max(0, cur.time! - prev.time!) * speed;
    margins.set(cur.gate, marginLabel(meters / HORSE_LENGTH_M));
  }
  return margins;
}

// 着順の並び（確定した馬が先、競走中止は馬番順で後ろ）
export function sortResults(results: Result[]): Result[] {
  return [...results].sort((a, b) => {
    const pa = a.finished && a.position != null ? a.position : Infinity;
    const pb = b.finished && b.position != null ? b.position : Infinity;
    return pa - pb || a.gate - b.gate;
  });
}

// 枠番を決めるための頭数（除外した馬も枠は残るので、いちばん大きい馬番を使う）
export function gateCountOf(race: Pick<RaceDetail, 'fieldSize' | 'entries' | 'results'>): number {
  return Math.max(
    race.fieldSize ?? 0,
    ...race.entries.map(e => e.gate),
    ...race.results.map(r => r.gate),
  );
}

export const avatarUrl = (name: string, size = 24) => `https://minotar.net/helm/${encodeURIComponent(name)}/${size}`;
