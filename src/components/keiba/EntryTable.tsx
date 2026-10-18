import {
  CLASS_LABEL,
  GENDER_LABEL,
  formatOdds,
  formatWeight,
  frameOf,
  type Odds,
  type RaceDetail,
} from '@/lib/keiba';
import EntryOpenPanel from './EntryOpenPanel';
import { EmptyState, FrameBox, HorseLink, OwnerLabel, rankClass } from './KeibaParts';
import { ExcludedMark, MarkPicker, type Mark, type MarkMap } from './Marks';
import SelectedOdds, { pairKey } from './SelectedOdds';

export const oddsClass = (odds: number | null | undefined) =>
  odds != null && odds < 10 ? 'text-[#e0262d] font-bold' : 'text-gray-900';

export function WeightCell({ weight, change }: { weight: number | null; change: number | null }) {
  const text = formatWeight(weight, change);
  const open = text.indexOf('(');
  if (open < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, open)}
      <span className="text-xs">{text.slice(open)}</span>
    </>
  );
}

export default function EntryTable({
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
  // 受付中は出走条件と申請中の馬（申請馬を返さない古い API なら、下の案内のまま）
  if (race.status === 'ENTRY' && (race.applicants || race.entryRules)) {
    return <EntryOpenPanel race={race} />;
  }
  if (race.entries.length === 0) {
    // 以前のレースは結果だけが記録されていて、出馬表が無い
    if (race.status === 'FINISHED') {
      return (
        <EmptyState title="このレースの出馬表は記録されていません">
          着順は「結果・払戻」でご覧いただけます。
        </EmptyState>
      );
    }
    return (
      <EmptyState title="出馬表はまだ公開されていません">
        馬券の発売が始まると公開されます。
      </EmptyState>
    );
  }

  const winOdds = new Map((odds?.win ?? []).map(w => [w.gate, w]));
  const quinellaOdds = new Map((odds?.quinella ?? []).map(q => [pairKey(q.selection[0], q.selection[1]), q]));
  const showOdds = race.status !== 'ENTRY' && race.status !== 'CANCELLED';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full sm:min-w-[760px] text-sm">
          <thead>
            <tr className="bg-[#e6eee8] text-gray-700 text-xs whitespace-nowrap">
              <th className="py-2 px-1 w-8 sm:w-9 font-bold">枠</th>
              <th className="py-2 px-1 w-9 sm:w-10 font-bold">馬番</th>
              <th className="py-2 px-1 w-9 font-bold">印</th>
              <th className="py-2 px-2 sm:px-3 text-left font-bold">馬名</th>
              <th className="hidden sm:table-cell py-2 px-2 w-10 font-bold">性</th>
              <th className="hidden md:table-cell py-2 px-2 font-bold">クラス</th>
              <th className="hidden sm:table-cell py-2 px-3 text-left font-bold">馬主</th>
              <th className="hidden sm:table-cell py-2 px-2 font-bold">
                馬体重<span className="font-normal">(増減)</span>
              </th>
              {showOdds && <th className="py-2 px-2 w-14 sm:w-16 font-bold">単勝</th>}
              {showOdds && <th className="py-2 px-1 sm:px-2 w-10 sm:w-12 font-bold">人気</th>}
            </tr>
          </thead>
          <tbody>
            {race.entries.map(entry => {
              const frame = frameOf(entry.gate, gateCount);
              const win = winOdds.get(entry.gate);
              return (
                <tr
                  key={entry.gate}
                  className={`border-t border-gray-200 ${entry.excluded ? 'bg-gray-100 text-gray-400' : 'hover:bg-[#f7faf7]'}`}
                >
                  <td className="py-2 px-1 text-center">
                    <FrameBox frame={frame} />
                  </td>
                  <td className="py-2 px-1 text-center font-bold tabular-nums">{entry.gate}</td>
                  <td className="py-2 px-1 text-center">
                    {entry.excluded ? (
                      <ExcludedMark />
                    ) : (
                      <MarkPicker mark={marks[entry.gate]} onChange={mark => onMark(entry.gate, mark)} horseName={entry.horseName} />
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3">
                    {(entry.sire || entry.dam) && (
                      <div className="hidden sm:block text-[11px] text-gray-500 leading-tight">
                        {entry.sire && <>父 {entry.sire}</>}
                        {entry.sire && entry.dam && <span className="mx-1 text-gray-300">|</span>}
                        {entry.dam && <>母 {entry.dam}</>}
                      </div>
                    )}
                    <div className={`font-bold text-sm sm:text-base whitespace-nowrap ${entry.excluded ? 'line-through' : 'text-gray-900'}`}>
                      <HorseLink uuid={entry.horseUuid} name={entry.horseName} />
                    </div>
                    {/* スマホでは性・馬体重・馬主を馬名の下にまとめる */}
                    <div className="sm:hidden text-[11px] text-gray-500 whitespace-nowrap tabular-nums">
                      {entry.gender && <span className="mr-1.5">{GENDER_LABEL[entry.gender]}</span>}
                      {entry.excluded ? '--' : <WeightCell weight={entry.weight} change={entry.weightChange} />}
                      {entry.owner.name && <span className="ml-1.5">{entry.owner.name}</span>}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-2 px-2 text-center">
                    {entry.gender ? GENDER_LABEL[entry.gender] : ''}
                  </td>
                  <td className="hidden md:table-cell py-2 px-2 text-center text-xs whitespace-nowrap">
                    {entry.horseClass ? CLASS_LABEL[entry.horseClass] : ''}
                  </td>
                  <td className="hidden sm:table-cell py-2 px-3 max-w-[10rem]">
                    <OwnerLabel owner={entry.owner} />
                  </td>
                  <td className="hidden sm:table-cell py-2 px-2 text-center tabular-nums whitespace-nowrap">
                    {entry.excluded ? '--' : <WeightCell weight={entry.weight} change={entry.weightChange} />}
                  </td>
                  {showOdds && (
                    <td className={`py-2 px-2 text-right tabular-nums ${entry.excluded ? '' : oddsClass(win?.odds)}`}>
                      {entry.excluded ? '--' : win ? formatOdds(win.odds) : '---.-'}
                    </td>
                  )}
                  {showOdds && (
                    <td className={`py-2 px-1 sm:px-2 text-center tabular-nums ${!entry.excluded && win ? rankClass(win.popularity) : ''}`}>
                      {entry.excluded ? '--' : win ? win.popularity : ''}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        印はこのブラウザにだけ保存されます。◎○▲は1頭ずつ付けられます。
      </p>

      {showOdds && odds && (
        <div className="mt-8">
          <SelectedOdds
            horses={race.entries.map(e => ({ gate: e.gate, name: e.horseName, uuid: e.horseUuid, excluded: e.excluded }))}
            winByGate={winOdds}
            quinellaByKey={quinellaOdds}
            marks={marks}
            gateCount={gateCount}
          />
        </div>
      )}
    </>
  );
}
