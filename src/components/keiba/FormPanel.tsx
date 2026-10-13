import Link from 'next/link';
import {
  CLASS_LABEL,
  courseName,
  formatCourse,
  formatPassing,
  formatRecord,
  formatSeconds,
  formatTime,
  formatTimeBehind,
  formatWeight,
  frameOf,
  type FormHorse,
  type RaceForm,
  type Run,
  type RunRef,
} from '@/lib/keiba';
import { ClassBadge, EmptyState, FrameBox, HorseLink, PositionMark, SectionTitle, rankClass } from './KeibaParts';
import { ExcludedMark, MarkPicker, type Mark, type MarkMap } from './Marks';

const RECENT_COUNT = 5;
const RECENT_LABELS = ['前走', '2走前', '3走前', '4走前', '5走前'];
const GRID = 'grid grid-cols-[3rem_10rem_10rem_repeat(5,minmax(8.75rem,1fr))]';

const formatRunDate = (date: string) => date.replaceAll('-', '.');

function RunCell({ run }: { run: Run | undefined }) {
  if (!run) {
    return <div className="border-l border-gray-200 bg-gray-50" />;
  }
  return (
    <div className="border-l border-gray-200 bg-white px-2 py-1.5 text-[11px] leading-snug text-gray-600">
      <div className="flex items-center justify-between gap-1">
        <span className="tabular-nums">{formatRunDate(run.date)}</span>
        <ClassBadge raceClass={run.class} size="sm" />
      </div>
      <Link href={`/keiba/race/${run.raceId}`} className="block font-bold text-gray-900 text-xs truncate hover:underline">
        {run.name}
      </Link>
      <div className="truncate">{courseName(run.course)} {formatCourse(run.course)}</div>
      <div className="flex items-center gap-2 my-1">
        <PositionMark position={run.position} finished={run.finished} size="md" />
        <div className="tabular-nums">
          {run.fieldSize ? `${run.fieldSize}頭 ` : ''}{run.gate}番
          {run.popularity ? <span className={`ml-1 px-0.5 ${rankClass(run.popularity)}`}>{run.popularity}人</span> : null}
        </div>
      </div>
      <div className="tabular-nums">
        <span className="font-bold text-gray-900 text-xs">{formatTime(run.time)}</span>
        {run.timeBehind != null && <span className="ml-1">({formatTimeBehind(run.timeBehind)})</span>}
      </div>
      <div className="tabular-nums">
        {run.last300 != null && <>上{formatSeconds(run.last300)} </>}
        {formatPassing(run.passing) && <span className="ml-1">{formatPassing(run.passing)}</span>}
      </div>
      <div className="tabular-nums">
        {formatWeight(run.weight, run.weightChange)}
        {run.lateStart && <span className="ml-1 text-[10px] px-1 rounded bg-gray-200">出遅れ</span>}
      </div>
    </div>
  );
}

function TimeLine({ label, time, sub }: { label: string; time: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] text-gray-500">{label}</div>
      {time ? (
        <div className="leading-tight">
          <span className="font-bold text-gray-900 tabular-nums">{time}</span>
          {sub && <span className="block text-[10px] text-gray-500 truncate">{sub}</span>}
        </div>
      ) : (
        <div className="text-gray-300">-</div>
      )}
    </div>
  );
}

function HorseRow({
  horse,
  gateCount,
  mark,
  onMark,
}: {
  horse: FormHorse;
  gateCount: number;
  mark: Mark | undefined;
  onMark: (mark: Mark | null) => void;
}) {
  const same = horse.sameCondition.best;
  const similar = horse.similarCondition;
  const fastest = horse.bestLast300;
  return (
    <div className={`${GRID} border-t border-gray-200 text-sm ${horse.excluded ? 'opacity-50' : ''}`}>
      <div className="sticky left-0 z-10 bg-white flex flex-col items-center justify-center gap-1 py-2">
        <FrameBox frame={frameOf(horse.gate, gateCount)} />
        <span className="font-bold tabular-nums">{horse.gate}</span>
        {horse.excluded ? <ExcludedMark /> : <MarkPicker mark={mark} onChange={onMark} horseName={horse.horseName} />}
      </div>
      <div className="sticky left-12 z-10 bg-white border-l border-r border-gray-200 px-3 py-2">
        <div className={`font-bold text-base text-gray-900 ${horse.excluded ? 'line-through' : ''}`}>
          <HorseLink uuid={horse.horseUuid} name={horse.horseName} />
        </div>
        <div className="text-xs text-gray-600 mt-1">
          通算 {horse.record.starts}戦
          <span className="ml-1 tabular-nums">[{formatRecord(horse.record)}]</span>
        </div>
        <div className="text-xs text-gray-600">
          同条件 <span className="tabular-nums">[{formatRecord(horse.sameCondition.record)}]</span>
        </div>
      </div>
      <div className="border-l border-gray-200 px-3 py-2 space-y-1 text-xs">
        <TimeLine label="持ち時計（同条件）" time={formatTime(same?.time)} sub={same ? `${formatRunDate(same.date)} ${same.name}` : undefined} />
        <TimeLine
          label="換算（似た条件）"
          time={formatTime(similar?.convertedTime)}
          sub={similar ? `${formatCourse(similar.run.course)}で${formatTime(similar.run.time)}` : undefined}
        />
        <TimeLine label="上り最速" time={formatSeconds(fastest?.last300)} sub={fastest ? `${formatRunDate(fastest.date)} ${fastest.name}` : undefined} />
      </div>
      {Array.from({ length: RECENT_COUNT }, (_, i) => (
        <RunCell key={i} run={horse.recent[i]} />
      ))}
    </div>
  );
}

function RecordCard({ label, run, value }: { label: string; run: RunRef | null; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {run ? (
        <>
          <div className="text-2xl font-bold text-gray-900 tabular-nums">{value}</div>
          <div className="text-xs text-gray-600 mt-0.5">
            <HorseLink uuid={run.horseUuid} name={run.horseName} />
            <span className="mx-1 text-gray-300">|</span>
            <Link href={`/keiba/race/${run.raceId}`} className="hover:underline">
              {formatRunDate(run.date)} {run.name}
            </Link>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-400 py-1.5">記録なし</div>
      )}
    </div>
  );
}

export default function FormPanel({
  form,
  gateCount,
  finished,
  marks,
  onMark,
}: {
  form: RaceForm | null;
  gateCount: number;
  finished: boolean;
  marks: MarkMap;
  onMark: (gate: number, mark: Mark | null) => void;
}) {
  if (!form) {
    return <EmptyState title="馬柱を読み込めませんでした">時間をおいて再度お試しください。</EmptyState>;
  }
  const condition = form.conditions.course;

  return (
    <div className="space-y-8">
      {/* コースの時計 */}
      <section>
        <SectionTitle aside={`${courseName(condition)} ${formatCourse(condition)}`}>コースの時計</SectionTitle>
        <p className="text-xs text-gray-500 mb-3">このレースより前の同条件のレース：{form.course.races}回</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <RecordCard label="コースレコード" run={form.course.record} value={formatTime(form.course.record?.time)} />
          <RecordCard label="上り最速（300m）" run={form.course.fastestLast300} value={formatSeconds(form.course.fastestLast300?.last300)} />
        </div>
        {form.course.byClass.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#e6eee8] text-gray-700 text-xs">
                  <th className="py-2 px-3 text-left font-bold">クラス</th>
                  <th className="py-2 px-3 font-bold">レース数</th>
                  <th className="py-2 px-3 font-bold">平均勝ちタイム</th>
                  <th className="py-2 px-3 font-bold">最速勝ちタイム</th>
                  <th className="py-2 px-3 font-bold">勝ち馬の平均上り</th>
                </tr>
              </thead>
              <tbody>
                {form.course.byClass.map(c => (
                  <tr key={c.class} className="border-t border-gray-200 text-center tabular-nums">
                    <td className="py-2 px-3 text-left">{CLASS_LABEL[c.class]}</td>
                    <td className="py-2 px-3">{c.races}</td>
                    <td className="py-2 px-3">{formatTime(c.winTimeAverage)}</td>
                    <td className="py-2 px-3 font-bold">{formatTime(c.winTimeBest)}</td>
                    <td className="py-2 px-3">{formatSeconds(c.winnerLast300Average)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 馬柱 */}
      <section>
        <SectionTitle aside={`近${RECENT_COUNT}走（左が新しい）`}>馬柱</SectionTitle>
        {form.horses.length === 0 ? (
          finished ? (
            <EmptyState title="このレースの出馬表は記録されていません">出走馬の記録がないので馬柱は表示できません。</EmptyState>
          ) : (
            <EmptyState title="出走馬はまだ決まっていません">出馬表が公開されると表示されます。</EmptyState>
          )
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <div className="min-w-[1060px]">
              <div className={`${GRID} bg-[#e6eee8] text-xs font-bold text-gray-700`}>
                <div className="sticky left-0 z-10 bg-[#e6eee8] py-2 text-center">馬番</div>
                <div className="sticky left-12 z-10 bg-[#e6eee8] py-2 px-3 border-l border-r border-gray-200">馬名・成績</div>
                <div className="py-2 px-3 border-l border-gray-200">持ち時計</div>
                {RECENT_LABELS.map(label => (
                  <div key={label} className="py-2 px-2 border-l border-gray-200 text-center">{label}</div>
                ))}
              </div>
              {form.horses.map(horse => (
                <HorseRow
                  key={horse.gate}
                  horse={horse}
                  gateCount={gateCount}
                  mark={marks[horse.gate]}
                  onMark={mark => onMark(horse.gate, mark)}
                />
              ))}
            </div>
          </div>
        )}
        <ul className="text-xs text-gray-500 mt-2 space-y-0.5 list-disc pl-4">
          <li>同条件：同じコースで距離の差が{form.conditions.sameCourseToleranceM}m以内のレース</li>
          <li>換算：同じ馬場で距離の差が{form.conditions.similarDistanceM}m以内のレースのタイムをこのレースの距離に直したもの</li>
          <li>タイムの後ろの数字は勝ち馬との秒差。勝ったレースは2着との差をマイナスで表示</li>
          <li>このレースより前の成績だけを使っています</li>
        </ul>
      </section>
    </div>
  );
}
