import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  CLASS_LABEL,
  GENDER_LABEL,
  courseName,
  formatCourse,
  formatDateShort,
  formatIsoDate,
  formatOdds,
  formatPassing,
  formatRecord,
  formatSeconds,
  formatStarts,
  formatTime,
  formatTimeBehind,
  racePath,
  rates,
  type HorseDetail,
  type PedigreeParent,
} from '@/lib/keiba';
import {
  ClassBadge,
  EmptyState,
  HorseLink,
  KeibaPageHeader,
  OwnerLabel,
  PrizeTotal,
  RaceNumberBox,
  SectionTitle,
  StatusBadge,
  rankClass,
} from './KeibaParts';
import { WeightCell } from './EntryTable';

const formatRunDate = (date: string) => date.replaceAll('-', '.');

function GenderText({ gender }: { gender: HorseDetail['gender'] }) {
  if (!gender) return null;
  return <span>{GENDER_LABEL[gender]}</span>;
}

function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 px-4 py-2.5">
      <dt className="w-24 shrink-0 text-gray-500">{label}</dt>
      <dd className="flex-1 min-w-0 text-gray-900">{children}</dd>
    </div>
  );
}

// 血統表（父母と祖父母の2代）。父の側は青、母の側は赤
function PedigreeTable({ sire, dam }: { sire: PedigreeParent | null; dam: PedigreeParent | null }) {
  const parentCell = (parent: PedigreeParent | null, label: string, color: string) => (
    <th rowSpan={2} className={`w-1/2 px-3 py-3 text-left align-middle border-b border-r border-gray-200 ${color}`}>
      <div className="text-[11px] font-normal text-gray-500">{label}</div>
      {parent ? (
        <HorseLink uuid={parent.horseUuid} name={parent.name} className="font-bold text-gray-900" />
      ) : (
        <span className="text-gray-400">不明</span>
      )}
    </th>
  );
  const grandCell = (name: string | null | undefined, label: string, color: string) => (
    <td className={`px-3 py-2 border-b border-gray-200 ${color}`}>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className={name ? 'text-gray-900' : 'text-gray-400'}>{name || '不明'}</div>
    </td>
  );
  return (
    <table className="w-full text-sm border-collapse">
      <tbody>
        <tr>
          {parentCell(sire, '父', 'bg-[#e8f0fb]')}
          {grandCell(sire?.sire, '父の父', 'bg-[#f2f7fd]')}
        </tr>
        <tr>{grandCell(sire?.dam, '父の母', 'bg-[#fdf3f5]')}</tr>
        <tr>
          {parentCell(dam, '母', 'bg-[#fbe9ee]')}
          {grandCell(dam?.sire, '母の父', 'bg-[#f2f7fd]')}
        </tr>
        <tr>{grandCell(dam?.dam, '母の母', 'bg-[#fdf3f5]')}</tr>
      </tbody>
    </table>
  );
}

export default function HorseDetailView({ horse, recordRaceIds }: { horse: HorseDetail; recordRaceIds: string[] }) {
  const rate = rates(horse.record);
  const records = new Set(recordRaceIds);
  const noPedigree = !horse.pedigree.sire && !horse.pedigree.dam;

  return (
    <div className="min-h-screen bg-[#f4f6f4]">
      <KeibaPageHeader
        breadcrumb={[
          { label: 'i-keiba', href: '/keiba' },
          { label: '競走馬', href: '/keiba/horses' },
          { label: horse.horseName },
        ]}
      >
        <div className="flex items-center gap-2 text-sm text-white/85 mb-1">
          {horse.gender && <span>{GENDER_LABEL[horse.gender]}</span>}
          {horse.horseClass && <span>{CLASS_LABEL[horse.horseClass]}</span>}
          {horse.retiredAt && <span className="text-[11px] px-2 py-0.5 rounded bg-white/15 font-bold">引退</span>}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{horse.horseName}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/85">
          <span>{formatStarts(horse.record)} <span className="tabular-nums">[{formatRecord(horse.record)}]</span></span>
          {horse.owner.name && <span>馬主 {horse.owner.name}</span>}
        </div>
      </KeibaPageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* プロフィールと血統 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <SectionTitle>プロフィール</SectionTitle>
            <dl className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm">
              <ProfileRow label="性別"><GenderText gender={horse.gender} /></ProfileRow>
              <ProfileRow label="クラス">{horse.horseClass ? CLASS_LABEL[horse.horseClass] : '-'}</ProfileRow>
              <ProfileRow label="馬主"><OwnerLabel owner={horse.owner} /></ProfileRow>
              <ProfileRow label="通算成績">
                {formatStarts(horse.record)}
                <span className="ml-2 tabular-nums text-gray-600">[{formatRecord(horse.record)}]</span>
                {rate && (
                  <div className="text-xs text-gray-500 tabular-nums mt-0.5">
                    <span className="whitespace-nowrap">勝率 {rate.win}%</span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className="whitespace-nowrap">連対率 {rate.quinella}%</span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className="whitespace-nowrap">複勝率 {rate.place}%</span>
                  </div>
                )}
              </ProfileRow>
              <ProfileRow label="獲得賞金">
                {(horse.totalPrize ?? 0) > 0 ? (
                  <PrizeTotal prize={horse.totalPrize} bonus={horse.totalBonus} align="start" />
                ) : (
                  <span className="text-gray-500">0 ine</span>
                )}
              </ProfileRow>
              {horse.retiredAt && <ProfileRow label="引退">{formatIsoDate(horse.retiredAt)}</ProfileRow>}
            </dl>
          </section>

          <section>
            <SectionTitle>血統</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <PedigreeTable sire={horse.pedigree.sire} dam={horse.pedigree.dam} />
            </div>
            {noPedigree && (
              <p className="text-xs text-gray-500 mt-2">交配で生まれた馬ではないので父母の記録はありません。</p>
            )}
          </section>
        </div>

        {/* 出走予定 */}
        {horse.upcoming.length > 0 && (
          <section>
            <SectionTitle>出走予定</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {horse.upcoming.map(race => {
                const { md, weekday } = formatDateShort(race.date);
                return (
                  <Link
                    key={race.raceId}
                    href={racePath(race.raceId)}
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-[#f3f7f4] transition-colors"
                  >
                    <div className="text-xs text-gray-500 w-16 shrink-0">{md}（{weekday}）</div>
                    <RaceNumberBox number={race.number} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{race.name}</span>
                        <ClassBadge raceClass={race.class} size="sm" />
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {race.postTime ? `${race.postTime}発走 / ` : ''}{formatCourse(race.course)}
                        {' / '}{race.excluded ? '除外' : `${race.gate}番`}
                        {race.weight != null && <> / <WeightCell weight={race.weight} change={race.weightChange} /></>}
                      </div>
                    </div>
                    <StatusBadge status={race.status} size="sm" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 競走成績 */}
        <section>
          <SectionTitle aside={horse.runs.length > 0 ? `${horse.runs.length}戦` : undefined}>競走成績</SectionTitle>
          {horse.runs.length === 0 ? (
            <EmptyState title="まだ出走していません" />
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="bg-[#e6eee8] text-gray-700 text-xs whitespace-nowrap">
                      <th className="py-2 px-3 text-left font-bold">日付</th>
                      <th className="py-2 px-3 text-left font-bold">レース名</th>
                      <th className="py-2 px-2 text-left font-bold">コース</th>
                      <th className="py-2 px-2 font-bold">頭数</th>
                      <th className="py-2 px-2 font-bold">馬番</th>
                      <th className="py-2 px-2 font-bold">単勝</th>
                      <th className="py-2 px-2 font-bold">人気</th>
                      <th className="py-2 px-2 font-bold">着順</th>
                      <th className="py-2 px-2 font-bold">タイム</th>
                      <th className="py-2 px-2 font-bold">着差</th>
                      <th className="py-2 px-2 font-bold">通過</th>
                      <th className="py-2 px-2 font-bold">上り</th>
                      <th className="py-2 px-2 font-bold">馬体重</th>
                      <th className="py-2 px-3 text-right font-bold">賞金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horse.runs.map(run => {
                      return (
                        <tr key={run.raceId} className="border-t border-gray-200 whitespace-nowrap">
                          <td className="py-2 px-3 tabular-nums text-gray-600">{formatRunDate(run.date)}</td>
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center gap-2">
                              <Link href={racePath(run.raceId)} className="font-bold text-gray-900 hover:underline underline-offset-2">
                                {run.name}
                              </Link>
                              <ClassBadge raceClass={run.class} size="sm" />
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            {courseName(run.course)} {formatCourse(run.course)}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">{run.fieldSize ?? ''}</td>
                          <td className="py-2 px-2 text-center tabular-nums">{run.gate}</td>
                          <td className="py-2 px-2 text-right tabular-nums">{formatOdds(run.winOdds)}</td>
                          <td className={`py-2 px-2 text-center tabular-nums ${rankClass(run.popularity)}`}>
                            {run.popularity ?? ''}
                          </td>
                          <td className={`py-2 px-2 text-center font-bold tabular-nums ${run.finished ? rankClass(run.position) : ''}`}>
                            {run.finished && run.position != null ? run.position : <span className="text-xs text-gray-500">中止</span>}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums font-medium">
                            {run.finished && run.position === 1 && records.has(run.raceId) ? (
                              <span className="bg-black text-white px-1.5 rounded" title="コースレコード">{formatTime(run.time)}</span>
                            ) : (
                              formatTime(run.time)
                            )}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums text-xs">{formatTimeBehind(run.timeBehind)}</td>
                          <td className="py-2 px-2 text-center tabular-nums text-xs">
                            {formatPassing(run.passing)}
                            {run.lateStart && <span className="ml-1 text-[10px] px-1 rounded bg-gray-200 text-gray-600">出遅れ</span>}
                          </td>
                          <td className="py-2 px-2 text-center tabular-nums">{formatSeconds(run.last300)}</td>
                          <td className="py-2 px-2 text-center tabular-nums">
                            <WeightCell weight={run.weight} change={run.weightChange} />
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs">
                            <PrizeTotal prize={run.prize} bonus={run.bonusPrize} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                着差は勝ち馬との秒差です。勝ったレースは2着との差をマイナスで表示しています。黒地のタイムはその時点のコースレコードです。
              </p>
            </>
          )}
        </section>

        {/* 産駒 */}
        {horse.offspring.length > 0 && (
          <section>
            <SectionTitle aside={`${horse.offspring.length}頭`}>産駒</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {horse.offspring.map(child => (
                <div key={child.horseUuid} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <HorseLink uuid={child.horseUuid} name={child.horseName} className="font-bold text-gray-900" />
                    <div className="text-xs text-gray-500 mt-0.5">
                      <GenderText gender={child.gender} />
                      {child.horseClass && <span className="ml-2">{CLASS_LABEL[child.horseClass]}</span>}
                    </div>
                  </div>
                  {child.retiredAt && <span className="text-[10px] px-1.5 py-px rounded bg-gray-200 text-gray-600">引退</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
