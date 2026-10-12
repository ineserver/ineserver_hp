import {
  GENDER_LABEL,
  displayDistance,
  formatIne,
  formatOdds,
  formatPassing,
  formatSeconds,
  formatTime,
  frameOf,
  marginsOf,
  sortResults,
  type Payout,
  type RaceDetail,
} from '@/lib/keiba';
import { EmptyState, FrameBox, GateBox, HorseLink, OwnerLabel, PrizeTotal, SectionTitle, rankClass } from './KeibaParts';
import { WeightCell } from './EntryTable';

const BET_TYPE_LABEL: Record<Payout['betType'], string> = { WIN: '単勝', QUINELLA: '馬連' };
const BET_TYPE_COLOR: Record<Payout['betType'], string> = { WIN: 'bg-[#565eb0]', QUINELLA: 'bg-[#87599a]' };

function PayoutTable({ payouts, gateCount }: { payouts: Payout[]; gateCount: number }) {
  const groups = (['WIN', 'QUINELLA'] as const)
    .map(type => ({ type, rows: payouts.filter(p => p.betType === type) }))
    .filter(g => g.rows.length > 0);

  if (groups.length === 0) {
    return <p className="text-sm text-gray-500">払戻しはありません（的中した馬券がありませんでした）。</p>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-xl">
      <table className="w-full text-sm">
        <tbody>
          {groups.map(group =>
            group.rows.map((p, i) => (
              <tr key={`${group.type}-${p.selection.join('-')}`} className="border-t border-gray-200 first:border-t-0">
                {i === 0 && (
                  <th
                    rowSpan={group.rows.length}
                    className={`w-16 py-2.5 px-3 text-white font-bold text-center ${BET_TYPE_COLOR[group.type]}`}
                  >
                    {BET_TYPE_LABEL[group.type]}
                  </th>
                )}
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1">
                    {p.selection.map((g, j) => (
                      <span key={g} className="inline-flex items-center gap-1">
                        {j > 0 && <span className="text-gray-400 text-xs">-</span>}
                        <GateBox gate={g} frame={frameOf(g, gateCount)} />
                      </span>
                    ))}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-base tabular-nums whitespace-nowrap">
                  {formatIne(p.payout)}
                </td>
                <td className="py-2.5 px-3 text-right text-xs text-gray-500 tabular-nums whitespace-nowrap">
                  {formatOdds(p.odds)}倍
                </td>
                <td className={`py-2.5 px-3 text-right text-xs text-gray-700 tabular-nums whitespace-nowrap ${rankClass(p.popularity)}`}>
                  {p.popularity ? `${p.popularity}番人気` : ''}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

function LapTable({ laps, distance }: { laps: number[]; distance: number | null }) {
  let total = 0;
  const cumulative = laps.map(l => (total += l));
  // 最後の区間が100mに足りないときは、最速の比較から外す
  const fullLaps = distance != null ? laps.filter((_, i) => (i + 1) * 100 <= distance) : laps;
  const fastest = fullLaps.length ? Math.min(...fullLaps) : null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr className="bg-[#e6eee8] text-xs text-gray-700">
            <th className="sticky left-0 bg-[#e6eee8] py-1.5 px-3 text-left font-bold whitespace-nowrap border-r border-gray-200">距離</th>
            {laps.map((_, i) => {
              const at = distance != null ? Math.min((i + 1) * 100, distance) : (i + 1) * 100;
              return (
                <th key={i} className="py-1.5 px-2 font-bold tabular-nums min-w-[3.25rem]">
                  {at}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-200">
            <th className="sticky left-0 bg-white py-1.5 px-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap border-r border-gray-200">ラップ</th>
            {laps.map((lap, i) => (
              <td key={i} className={`py-1.5 px-2 text-center tabular-nums ${lap === fastest && (distance == null || (i + 1) * 100 <= distance) ? rankClass(1) : ''}`}>
                {lap.toFixed(1)}
              </td>
            ))}
          </tr>
          <tr className="border-t border-gray-200 text-gray-500">
            <th className="sticky left-0 bg-white py-1.5 px-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap border-r border-gray-200">通過</th>
            {cumulative.map((t, i) => (
              <td key={i} className="py-1.5 px-2 text-center tabular-nums text-xs">
                {formatTime(t)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ResultPanel({ race, gateCount }: { race: RaceDetail; gateCount: number }) {
  if (race.status === 'CANCELLED') {
    return (
      <EmptyState title="このレースは中止になりました">
        発売した馬券は全額返還されます。
      </EmptyState>
    );
  }
  if (race.results.length === 0) {
    return <EmptyState title="結果はまだありません">レースが確定すると表示されます。</EmptyState>;
  }

  const results = sortResults(race.results);
  const margins = marginsOf(results, race.course.distance);
  const genderOf = new Map(race.entries.map(e => [e.gate, e.gender]));
  // 上りの順位（同じタイムは同じ順位）
  const last300s = results.filter(r => r.finished && r.last300 != null).map(r => r.last300!);
  const last300Rank = (t: number | null) => (t == null ? null : 1 + last300s.filter(x => x < t).length);

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>着順</SectionTitle>
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-[#e6eee8] text-gray-700 text-xs">
                <th className="py-2 px-2 w-12 font-bold">着順</th>
                <th className="py-2 px-1 w-9 font-bold">枠</th>
                <th className="py-2 px-1 w-10 font-bold">馬番</th>
                <th className="py-2 px-3 text-left font-bold">馬名</th>
                <th className="py-2 px-1 w-8 font-bold">性</th>
                <th className="py-2 px-3 text-left font-bold">馬主</th>
                <th className="py-2 px-2 font-bold">タイム</th>
                <th className="py-2 px-2 font-bold">着差</th>
                <th className="py-2 px-2 font-bold">通過</th>
                <th className="py-2 px-2 font-bold">上り</th>
                <th className="py-2 px-2 font-bold">単勝</th>
                <th className="py-2 px-2 font-bold">人気</th>
                <th className="py-2 px-2 font-bold">馬体重</th>
                <th className="py-2 px-2 font-bold">
                  賞金<span className="font-normal">(合計)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const gender = genderOf.get(r.gate);
                return (
                  <tr key={r.gate} className={`border-t border-gray-200 ${!r.finished ? 'text-gray-500' : ''}`}>
                    <td className={`py-2 px-2 text-center font-bold tabular-nums ${r.finished ? rankClass(r.position) : ''}`}>
                      {r.finished && r.position != null ? r.position : <span className="text-xs">中止</span>}
                    </td>
                    <td className="py-2 px-1 text-center"><FrameBox frame={frameOf(r.gate, gateCount)} /></td>
                    <td className="py-2 px-1 text-center font-bold tabular-nums">{r.gate}</td>
                    <td className="py-2 px-3">
                      <HorseLink uuid={r.horseUuid} name={r.horseName} className="font-bold text-gray-900" />
                      {r.lateStart && (
                        <span className="ml-1.5 text-[10px] px-1 py-px rounded bg-gray-200 text-gray-600 align-middle">出遅れ</span>
                      )}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {gender ? GENDER_LABEL[gender] : ''}
                    </td>
                    <td className="py-2 px-3 max-w-[9rem]"><OwnerLabel owner={r.owner} /></td>
                    <td className="py-2 px-2 text-center tabular-nums font-medium" title={r.time != null ? `${r.time}秒` : undefined}>
                      {formatTime(r.time)}
                    </td>
                    <td className="py-2 px-2 text-center text-xs whitespace-nowrap">{margins.get(r.gate) ?? ''}</td>
                    <td className="py-2 px-2 text-center text-xs tabular-nums">{formatPassing(r.passing)}</td>
                    <td className={`py-2 px-2 text-center tabular-nums ${r.finished ? rankClass(last300Rank(r.last300)) : ''}`}>
                      {formatSeconds(r.last300)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatOdds(r.winOdds)}</td>
                    <td className={`py-2 px-2 text-center tabular-nums ${rankClass(r.popularity)}`}>
                      {r.popularity ?? ''}
                    </td>
                    <td className="py-2 px-2 text-center tabular-nums whitespace-nowrap">
                      <WeightCell weight={r.weight} change={r.weightChange} />
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums whitespace-nowrap text-xs">
                      <PrizeTotal prize={r.prize} bonus={r.bonusPrize} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          着差は1つ前の馬とのタイム差を、ゴールでの速さと1馬身＝2.4mで換算した目安です。上りはゴールまでの300mのタイム、通過は1/4・1/2・3/4地点の順位です。着順・上り・人気は1位を黄、2位を青の背景で示しています。賞金は通常の賞金と追加賞金の合計で、（ ）は「通常＋追加」の内訳です。
        </p>
      </section>

      <section>
        <SectionTitle>払戻金</SectionTitle>
        <PayoutTable payouts={race.payouts} gateCount={gateCount} />
        <p className="text-xs text-gray-500 mt-2">払戻金は100 ineあたりの金額です。</p>
      </section>

      {race.lapTimes && race.lapTimes.length > 0 && (
        <section>
          <SectionTitle aside="先頭の馬の100mごと">ラップタイム</SectionTitle>
          <LapTable laps={race.lapTimes} distance={race.course.distance ?? displayDistance(race.course)} />
        </section>
      )}
    </div>
  );
}
