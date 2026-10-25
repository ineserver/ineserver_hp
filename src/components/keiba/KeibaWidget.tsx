'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  fetchKeiba,
  formatClock,
  formatCourse,
  formatDateShort,
  formatIne,
  formatOdds,
  formatTime,
  frameOf,
  gateCountOf,
  raceApiPath,
  racePath,
  sortResults,
  type Odds,
  type RaceClass,
  type RaceDetail,
  type RaceStatus,
  type RaceSummary,
} from '@/lib/keiba';
import { ClassBadge, GateBox, StatusBadge, rankClass } from './KeibaParts';
import PostCountdown from './PostCountdown';
import { oddsClass } from './EntryTable';

// トップページの右側に置く競馬の案内。
//   発売中（ゲートイン・競走中も）のレースがあれば最新オッズ、無ければ前回の開催の結果を出す
const CLASS_RANK: Record<RaceClass, number> = { G1: 5, G2: 4, OP: 3, ONE_WIN: 2, SHINBA: 1 };
const rankOf = (race: RaceSummary) => (race.class ? CLASS_RANK[race.class] : 0);
const REFRESH_MS = 30_000;
const LIVE: RaceStatus[] = ['BETTING', 'GATE', 'RUNNING'];
const byDate = (a: RaceSummary, b: RaceSummary) => a.date.localeCompare(b.date) || (a.number ?? 0) - (b.number ?? 0);

type WidgetState =
  | { kind: 'loading' }
  | { kind: 'live'; race: RaceDetail; odds: Odds | null }
  | { kind: 'result'; race: RaceDetail }
  | { kind: 'none' }
  | { kind: 'error' };

async function loadWidget(): Promise<WidgetState> {
  const live = await fetchKeiba<{ races: RaceSummary[] }>(
    '/api/keiba/races?status=BETTING,GATE,RUNNING&order=asc&limit=5',
    { cache: 'no-store' },
  );
  if (!live.ok) return { kind: 'error' };
  // 発売中・ゲートイン・競走中のうち、いちばん早いレース
  const next = live.data.races.filter(r => r.status && LIVE.includes(r.status)).sort(byDate)[0];
  if (next) {
    const [detail, odds] = await Promise.all([
      fetchKeiba<RaceDetail>(raceApiPath(next.raceId), { cache: 'no-store' }),
      fetchKeiba<Odds>(`${raceApiPath(next.raceId)}/odds`, { cache: 'no-store' }),
    ]);
    if (detail.ok) return { kind: 'live', race: detail.data, odds: odds.ok ? odds.data : null };
  }

  // 前回の開催日のうち、いちばん格が上のレース（同じ格なら後のレース）
  const finished = await fetchKeiba<{ races: RaceSummary[] }>(
    '/api/keiba/races?status=FINISHED&order=desc&limit=20',
    { cache: 'no-store' },
  );
  if (!finished.ok) return { kind: 'error' };
  const done = finished.data.races.filter(r => r.status === 'FINISHED');
  const latestDate = done.map(r => r.date).sort().at(-1);
  if (!latestDate) return { kind: 'none' };
  const main = done
    .filter(r => r.date === latestDate)
    .sort((a, b) => rankOf(b) - rankOf(a) || (b.number ?? 0) - (a.number ?? 0))[0];
  const detail = await fetchKeiba<RaceDetail>(raceApiPath(main.raceId), { cache: 'no-store' });
  return detail.ok ? { kind: 'result', race: detail.data } : { kind: 'error' };
}

function RaceHeading({ race }: { race: RaceDetail }) {
  const { md, weekday } = formatDateShort(race.date);
  return (
    <Link href={racePath(race.raceId)} className="block group">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{md}（{weekday}）</span>
        <StatusBadge status={race.status} size="sm" />
      </div>
      <div className="flex items-center gap-2 mt-1">
        {race.number != null && <span className="text-sm font-bold text-gray-500 tabular-nums">{race.number}R</span>}
        <span className="text-base font-bold text-gray-900 group-hover:underline underline-offset-2">{race.name}</span>
        <ClassBadge raceClass={race.class} size="sm" />
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {race.postTime && `${race.postTime}発走 / `}
        {formatCourse(race.course)}
        {race.fieldSize ? ` / ${race.fieldSize}頭` : ''}
      </div>
    </Link>
  );
}

function LiveOdds({ race, odds }: { race: RaceDetail; odds: Odds | null }) {
  const gateCount = gateCountOf(race);
  const nameOf = new Map(race.entries.map(e => [e.gate, e.horseName]));
  const top = [...(odds?.win ?? [])].sort((a, b) => a.popularity - b.popularity || a.gate - b.gate).slice(0, 5);
  return (
    <>
      <RaceHeading race={race} />
      <PostCountdown race={race} className="block mt-1 text-xs font-bold text-[#e0262d]" />
      {top.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">まだ馬券が売れていません。</p>
      ) : (
        <>
          <table className="w-full mt-3 text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500">
                <th className="pb-1 w-8 font-normal">人気</th>
                <th className="pb-1 text-left font-normal" colSpan={2}>馬名</th>
                <th className="pb-1 text-right font-normal">単勝</th>
              </tr>
            </thead>
            <tbody>
              {top.map(w => (
                <tr key={w.gate} className="border-t border-gray-100">
                  <td className={`py-1.5 w-8 min-w-[2rem] text-center text-xs tabular-nums ${rankClass(w.popularity)}`}>{w.popularity}</td>
                  <td className="py-1.5 pl-2 w-7 min-w-[1.75rem]"><GateBox gate={w.gate} frame={frameOf(w.gate, gateCount)} size="sm" /></td>
                  <td className="py-1.5 pl-1.5 font-bold text-gray-900 truncate max-w-0 w-full">{nameOf.get(w.gate) ?? `${w.gate}番`}</td>
                  <td className={`py-1.5 text-right tabular-nums whitespace-nowrap ${oddsClass(w.odds)}`}>{formatOdds(w.odds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {odds && <p className="text-[10px] text-gray-400 mt-1 text-right">{formatClock(odds.updatedAt)} 時点</p>}
        </>
      )}
    </>
  );
}

function LastResult({ race }: { race: RaceDetail }) {
  const gateCount = gateCountOf(race);
  const top = sortResults(race.results).filter(r => r.position != null).slice(0, 3);
  const win = race.payouts.filter(p => p.betType === 'WIN');
  const quinella = race.payouts.filter(p => p.betType === 'QUINELLA');
  return (
    <>
      <RaceHeading race={race} />
      <table className="w-full mt-3 text-sm">
        <thead>
          <tr className="text-[10px] text-gray-500">
            <th className="pb-1 w-8 font-normal">着順</th>
            <th className="pb-1 text-left font-normal" colSpan={2}>馬名</th>
            <th className="pb-1 text-right font-normal">タイム</th>
          </tr>
        </thead>
        <tbody>
          {top.map(r => (
            <tr key={r.gate} className="border-t border-gray-100">
              <td className={`py-1.5 w-8 min-w-[2rem] text-center font-bold tabular-nums ${rankClass(r.position)}`}>{r.position}</td>
              <td className="py-1.5 pl-2 w-7 min-w-[1.75rem]"><GateBox gate={r.gate} frame={frameOf(r.gate, gateCount)} size="sm" /></td>
              <td className="py-1.5 pl-1.5 font-bold text-gray-900 truncate max-w-0 w-full">{r.horseName}</td>
              <td className="py-1.5 text-right text-xs text-gray-600 tabular-nums whitespace-nowrap">{formatTime(r.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(win.length > 0 || quinella.length > 0) && (
        <table className="w-full mt-3 text-xs">
          <thead>
            <tr className="text-[10px] text-gray-500">
              <th className="pb-1 w-9 text-left font-normal">払戻</th>
              <th className="pb-1 pl-2 text-left font-normal">馬番</th>
              <th className="pb-1 text-right font-normal">払戻金</th>
              <th className="pb-1 pl-2 text-right font-normal">オッズ</th>
              <th className="pb-1 pl-2 text-right font-normal">人気</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...win.map(p => ({ p, label: '単勝', color: 'bg-[#565eb0]' })),
              ...quinella.map(p => ({ p, label: '馬連', color: 'bg-[#87599a]' })),
            ].map(({ p, label, color }) => (
              <tr key={`${label}-${p.selection.join('-')}`} className="border-t border-gray-100 tabular-nums">
                <td className="py-1.5">
                  <span className={`block w-9 text-center text-white font-bold rounded ${color}`}>{label}</span>
                </td>
                <td className="py-1.5 pl-2">
                  <span className="inline-flex items-center gap-0.5">
                    {p.selection.map((g, i) => (
                      <span key={g} className="inline-flex items-center gap-0.5">
                        {i > 0 && <span className="text-gray-400">-</span>}
                        <GateBox gate={g} frame={frameOf(g, gateCount)} size="sm" />
                      </span>
                    ))}
                  </span>
                </td>
                <td className="py-1.5 text-right font-bold text-gray-900 whitespace-nowrap">{formatIne(p.payout)}</td>
                <td className="py-1.5 pl-2 text-right text-gray-600 whitespace-nowrap">{formatOdds(p.odds)}倍</td>
                <td className="py-1.5 pl-2 text-right whitespace-nowrap">
                  {p.popularity != null && (
                    <span className={`px-1.5 rounded ${rankClass(p.popularity)}`}>{p.popularity}人気</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default function KeibaWidget() {
  const [state, setState] = useState<WidgetState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await loadWidget();
      if (!cancelled) setState(next);
    };
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const label = state.kind === 'live' ? '最新オッズ' : state.kind === 'result' ? '前回の結果' : '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#5b8064] p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* 馬の頭 */}
            <svg className="w-5 h-5 mr-2.5 text-white" fill="currentColor" fillRule="evenodd" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.2 2.2 L15.6 5.3 C18.4 6.6 20.3 9.4 20.6 12.9 L21 22 H11.2 L11.6 17.2 L7.6 15.8 C6.7 16.3 5.6 16.3 4.8 15.7 C3.8 15 3.5 13.7 4 12.6 L8.8 6.4 L11.4 4.8 Z M12.3 8.2 a1.1 1.1 0 1 0 0.01 0 Z" />
            </svg>
            <h2 className="text-lg font-bold text-white">競馬情報</h2>
          </div>
          {label && <span className="text-white/70 text-xs">{label}</span>}
        </div>
      </div>

      <div className="p-4">
        {state.kind === 'loading' && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5b8064]" />
          </div>
        )}
        {state.kind === 'error' && <p className="text-sm text-gray-600">競馬の情報を読み込めませんでした。</p>}
        {state.kind === 'none' && <p className="text-sm text-gray-600">まだレースの記録がありません。</p>}
        {state.kind === 'live' && <LiveOdds race={state.race} odds={state.odds} />}
        {state.kind === 'result' && <LastResult race={state.race} />}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href="/keiba"
            className="flex items-center justify-center w-full px-4 py-2 bg-[#5b8064]/8 hover:bg-[#5b8064]/15 text-[#5b8064] text-sm font-medium rounded-lg transition-colors duration-200 group"
          >
            i-keiba を見る
            <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
