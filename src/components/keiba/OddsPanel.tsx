'use client';

import { useMemo, useState } from 'react';
import {
  formatClock,
  formatIne,
  formatOdds,
  frameOf,
  type Odds,
  type RaceDetail,
  type WinOdds,
} from '@/lib/keiba';
import { EmptyState, FrameBox, GateBox, HorseLink, SectionTitle, rankClass } from './KeibaParts';
import { oddsClass } from './EntryTable';
import { ExcludedMark, MarkPicker, type Mark, type MarkMap } from './Marks';
import { pairKey, type OddsHorse } from './SelectedOdds';

function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-xs">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 font-medium cursor-pointer transition-colors ${value === o.value ? 'bg-[#2f5a3c] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function OddsPanel({
  race,
  odds,
  gateCount,
  marks,
  onMark,
}: {
  race: RaceDetail;
  odds: Odds | null;
  gateCount: number;
  marks: MarkMap;
  onMark: (gate: number, mark: Mark | null) => void;
}) {
  const [winSort, setWinSort] = useState<'gate' | 'popularity'>('gate');
  const [quinellaView, setQuinellaView] = useState<'popularity' | 'matrix'>('popularity');

  // 出馬表があればその馬番、無ければオッズに出てくる馬番
  const horses = useMemo<OddsHorse[]>(() => {
    if (race.entries.length > 0) {
      return race.entries.map(e => ({ gate: e.gate, name: e.horseName, uuid: e.horseUuid, excluded: e.excluded }));
    }
    const gates = new Set<number>();
    odds?.win.forEach(w => gates.add(w.gate));
    odds?.quinella.forEach(q => q.selection.forEach(g => gates.add(g)));
    return [...gates].sort((a, b) => a - b).map(gate => ({ gate, name: '', uuid: null, excluded: false }));
  }, [race.entries, odds]);

  const nameOf = useMemo(() => new Map(horses.map(h => [h.gate, h.name])), [horses]);
  const winByGate = useMemo(() => new Map<number, WinOdds>((odds?.win ?? []).map(w => [w.gate, w])), [odds]);
  const quinellaByKey = useMemo(
    () => new Map((odds?.quinella ?? []).map(q => [pairKey(q.selection[0], q.selection[1]), q])),
    [odds],
  );

  if (race.status === 'ENTRY') {
    return (
      <EmptyState title="オッズはまだありません">
        馬券の発売が始まると表示されます。
      </EmptyState>
    );
  }
  if (race.status === 'CANCELLED') {
    return (
      <EmptyState title="このレースは中止になりました">
        発売した馬券は全額返還されます。
      </EmptyState>
    );
  }
  if (!odds) {
    return <EmptyState title="オッズを読み込めませんでした">時間をおいて再度お試しください。</EmptyState>;
  }

  const selling = race.status === 'BETTING';
  if (!selling && odds.sales.total === 0) {
    return (
      <EmptyState title="オッズの記録はありません">
        このレースは馬券の売上が記録されていません。払戻金は「結果・払戻」でご覧いただけます。
      </EmptyState>
    );
  }
  const winRows = [...horses].sort((a, b) => {
    if (winSort === 'gate') return a.gate - b.gate;
    const pa = winByGate.get(a.gate)?.popularity ?? Infinity;
    const pb = winByGate.get(b.gate)?.popularity ?? Infinity;
    return pa - pb || a.gate - b.gate;
  });
  const activeGates = horses.filter(h => !h.excluded).map(h => h.gate);

  return (
    <div className="space-y-6">
      {/* 売上と更新時刻 */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm">
          {selling ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-[#e0262d]">
              発売中のオッズ
              <span className="font-normal text-gray-500 text-xs">10秒ごとに更新</span>
            </span>
          ) : (
            <span className="font-bold text-gray-800">最終オッズ</span>
          )}
          <span className="ml-3 text-xs text-gray-500">{formatClock(odds.updatedAt)} 時点</span>
        </div>
        <dl className="flex gap-4 text-sm">
          <div className="flex gap-1.5"><dt className="text-gray-500">単勝</dt><dd className="font-bold tabular-nums">{formatIne(odds.sales.win)}</dd></div>
          <div className="flex gap-1.5"><dt className="text-gray-500">馬連</dt><dd className="font-bold tabular-nums">{formatIne(odds.sales.quinella)}</dd></div>
          <div className="flex gap-1.5"><dt className="text-gray-500">合計</dt><dd className="font-bold tabular-nums">{formatIne(odds.sales.total)}</dd></div>
        </dl>
      </div>

      {/* 単勝 */}
      <section>
        <SectionTitle
          aside={
            <Toggle
              value={winSort}
              onChange={setWinSort}
              options={[{ value: 'gate', label: '馬番順' }, { value: 'popularity', label: '人気順' }]}
            />
          }
        >
          単勝
        </SectionTitle>
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#e6eee8] text-gray-700 text-xs">
                <th className="py-2 px-1 w-9 font-bold">枠</th>
                <th className="py-2 px-1 w-10 font-bold">馬番</th>
                <th className="py-2 px-1 w-9 font-bold">印</th>
                <th className="py-2 px-3 text-left font-bold">馬名</th>
                <th className="py-2 px-2 w-20 font-bold">オッズ</th>
                <th className="py-2 px-2 w-12 font-bold">人気</th>
                <th className="py-2 px-2 sm:px-3 sm:w-[30%] text-left font-bold">支持率</th>
              </tr>
            </thead>
            <tbody>
              {winRows.map(h => {
                const win = winByGate.get(h.gate);
                return (
                  <tr key={h.gate} className={`border-t border-gray-200 ${h.excluded ? 'bg-gray-100 text-gray-400' : ''}`}>
                    <td className="py-2 px-1 text-center"><FrameBox frame={frameOf(h.gate, gateCount)} /></td>
                    <td className="py-2 px-1 text-center font-bold tabular-nums">{h.gate}</td>
                    <td className="py-2 px-1 text-center">
                      {h.excluded ? (
                        <ExcludedMark />
                      ) : (
                        <MarkPicker mark={marks[h.gate]} onChange={mark => onMark(h.gate, mark)} horseName={h.name || `${h.gate}番`} />
                      )}
                    </td>
                    <td className="py-2 px-2 sm:px-3 font-bold whitespace-nowrap"><HorseLink uuid={h.uuid} name={h.name} /></td>
                    <td className={`py-2 px-2 text-right text-base tabular-nums ${h.excluded ? '' : oddsClass(win?.odds)}`}>
                      {h.excluded ? '--' : win ? formatOdds(win.odds) : '---.-'}
                    </td>
                    <td className={`py-2 px-2 text-center tabular-nums ${!h.excluded && win ? rankClass(win.popularity) : ''}`}>
                      {h.excluded ? '--' : win ? win.popularity : ''}
                    </td>
                    <td className="py-2 px-3">
                      {h.excluded && <span className="text-xs">--</span>}
                      {!h.excluded && win?.share != null && (
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:block flex-1 h-2.5 bg-gray-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-[#5b8064]" style={{ width: `${Math.min(100, win.share)}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 tabular-nums w-12 text-right">{win.share.toFixed(1)}%</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 馬連 */}
      <section>
        <SectionTitle
          aside={
            <Toggle
              value={quinellaView}
              onChange={setQuinellaView}
              options={[{ value: 'popularity', label: '人気順' }, { value: 'matrix', label: '組み合わせ表' }]}
            />
          }
        >
          馬連
        </SectionTitle>

        {quinellaView === 'popularity' ? (
          odds.quinella.length === 0 ? (
            <EmptyState title="馬連はまだ売れていません" />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
              {odds.quinella.map(q => {
                const [a, b] = [...q.selection].sort((x, y) => x - y);
                return (
                  <div key={`${a}-${b}`} className="flex items-center gap-3 px-2 py-1.5 border-b border-gray-100">
                    <span className={`w-6 py-0.5 text-center text-xs tabular-nums ${rankClass(q.popularity) || 'text-gray-500'}`}>
                      {q.popularity}
                    </span>
                    <span className="flex items-center gap-1">
                      <GateBox gate={a} frame={frameOf(a, gateCount)} />
                      <span className="text-gray-400 text-xs">-</span>
                      <GateBox gate={b} frame={frameOf(b, gateCount)} />
                    </span>
                    <span className="flex-1 min-w-0 truncate text-xs text-gray-500">
                      {[nameOf.get(a), nameOf.get(b)].filter(Boolean).join(' - ')}
                    </span>
                    <span className={`tabular-nums ${oddsClass(q.odds)}`}>{formatOdds(q.odds)}</span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#e6eee8] py-2 px-2 text-xs text-gray-600 font-bold border-b border-r border-gray-200">
                    馬番
                  </th>
                  {activeGates.slice(1).map(g => (
                    <th key={g} className="bg-[#e6eee8] py-1.5 px-1 border-b border-gray-200 min-w-[3.25rem]">
                      <GateBox gate={g} frame={frameOf(g, gateCount)} size="sm" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeGates.slice(0, -1).map(a => (
                  <tr key={a}>
                    <th className="sticky left-0 z-10 bg-[#f4f7f5] py-1.5 px-2 border-b border-r border-gray-200">
                      <GateBox gate={a} frame={frameOf(a, gateCount)} size="sm" />
                    </th>
                    {activeGates.slice(1).map(b => {
                      if (b <= a) return <td key={b} className="border-b border-gray-100 bg-gray-50" />;
                      const q = quinellaByKey.get(pairKey(a, b));
                      return (
                        <td
                          key={b}
                          title={`${a}-${b}`}
                          className={`py-1.5 px-1.5 text-right tabular-nums border-b border-l border-gray-100 ${q ? `${rankClass(q.popularity)} ${oddsClass(q.odds)}` : 'text-gray-300'}`}
                        >
                          {q ? formatOdds(q.odds) : '---'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          オッズは「売上 × 0.9 ÷ その組み合わせの票」で計算しています。1.0倍を下回るときは1.0倍です。最終オッズは発走時点の値です。
        </p>
      </section>
    </div>
  );
}
