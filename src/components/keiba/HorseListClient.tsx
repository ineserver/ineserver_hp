'use client';

import { useMemo, useState } from 'react';
import {
  CLASS_LABEL,
  GENDER_LABEL,
  formatRecord,
  formatStarts,
  type HorseSummary,
  type RaceClass,
} from '@/lib/keiba';
import { EmptyState, HorseLink, KeibaPageHeader, OwnerLabel, PrizeTotal } from './KeibaParts';

const CLASS_ORDER: RaceClass[] = ['SHINBA', 'ONE_WIN', 'OP', 'G2', 'G1'];

type StatusFilter = 'all' | 'active' | 'retired';
type SortKey = 'prize' | 'wins' | 'starts' | 'name';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'prize', label: '獲得賞金順' },
  { value: 'wins', label: '勝利数順' },
  { value: 'starts', label: '出走数順' },
  { value: 'name', label: '馬名順' },
];

// totalPrize は追加賞金を含んだ通算獲得賞金
const totalPrizeOf = (h: HorseSummary) => h.totalPrize ?? 0;

const selectClass =
  'px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064]';

export default function HorseListClient({ horses, loadError }: { horses: HorseSummary[]; loadError: boolean }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [raceClass, setRaceClass] = useState<'all' | RaceClass>('all');
  const [owner, setOwner] = useState('all');
  const [sort, setSort] = useState<SortKey>('prize');

  const classes = useMemo(
    () => CLASS_ORDER.filter(c => horses.some(h => h.horseClass === c)),
    [horses],
  );
  const owners = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of horses) if (h.owner.uuid && h.owner.name) map.set(h.owner.uuid, h.owner.name);
    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [horses]);

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = horses.filter(h =>
      (!q || h.horseName.includes(q))
      && (status === 'all' || (status === 'active' ? !h.retiredAt : !!h.retiredAt))
      && (raceClass === 'all' || h.horseClass === raceClass)
      && (owner === 'all' || h.owner.uuid === owner),
    );
    const byName = (a: HorseSummary, b: HorseSummary) => a.horseName.localeCompare(b.horseName, 'ja');
    return list.sort((a, b) => {
      switch (sort) {
        case 'wins': return b.record.first - a.record.first || b.record.second - a.record.second || byName(a, b);
        case 'starts': return b.record.starts - a.record.starts || byName(a, b);
        case 'name': return byName(a, b);
        default: return totalPrizeOf(b) - totalPrizeOf(a) || byName(a, b);
      }
    });
  }, [horses, query, status, raceClass, owner, sort]);

  return (
    <div className="min-h-screen bg-[#f4f6f4]">
      <KeibaPageHeader breadcrumb={[{ label: 'i-keiba', href: '/keiba' }, { label: '競走馬' }]}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">競走馬</h1>
        <p className="text-sm text-white/75">登録されている競走馬の一覧です。馬名を選ぶと血統や成績を確認できます。</p>
      </KeibaPageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            競走馬の情報を読み込めませんでした。時間をおいて再度お試しください。
          </div>
        )}

        {/* 絞り込み */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="馬名で検索"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-sm">
              {([['all', 'すべて'], ['active', '現役'], ['retired', '引退']] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`px-3 py-2 font-medium cursor-pointer transition-colors ${status === value ? 'bg-[#2f5a3c] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select value={raceClass} onChange={e => setRaceClass(e.target.value as 'all' | RaceClass)} className={selectClass} aria-label="クラス">
              <option value="all">すべてのクラス</option>
              {classes.map(c => <option key={c} value={c}>{CLASS_LABEL[c]}</option>)}
            </select>
            <select value={owner} onChange={e => setOwner(e.target.value)} className={selectClass} aria-label="馬主">
              <option value="all">すべての馬主</option>
              {owners.map(([uuid, name]) => <option key={uuid} value={uuid}>{name}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className={selectClass} aria-label="並び順">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-2">{filtered.length}頭</p>

        {filtered.length === 0 ? (
          <EmptyState title="該当する競走馬はいません" />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#e6eee8] text-gray-700 text-xs whitespace-nowrap">
                  <th className="py-2 px-3 text-left font-bold">馬名</th>
                  <th className="hidden sm:table-cell py-2 px-2 w-10 font-bold">性</th>
                  <th className="hidden md:table-cell py-2 px-2 font-bold">クラス</th>
                  <th className="hidden sm:table-cell py-2 px-3 text-left font-bold">馬主</th>
                  <th className="py-2 px-2 sm:px-3 font-bold">成績</th>
                  <th className="py-2 px-3 text-right font-bold">
                    獲得賞金<span className="font-normal">(合計)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.horseUuid} className={`border-t border-gray-200 ${h.retiredAt ? 'bg-gray-50' : 'hover:bg-[#f7faf7]'}`}>
                    <td className="py-2.5 px-3">
                      {(h.sire || h.dam) && (
                        <div className="hidden sm:block text-[11px] text-gray-500 leading-tight">
                          {h.sire && <>父 {h.sire}</>}
                          {h.sire && h.dam && <span className="mx-1 text-gray-300">|</span>}
                          {h.dam && <>母 {h.dam}</>}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <HorseLink uuid={h.horseUuid} name={h.horseName} className="font-bold text-base text-gray-900 whitespace-nowrap" />
                        {h.retiredAt && <span className="text-[10px] px-1.5 py-px rounded bg-gray-200 text-gray-600 whitespace-nowrap">引退</span>}
                      </div>
                      {/* スマホでは性・クラス・馬主を馬名の下にまとめる */}
                      <div className="sm:hidden text-[11px] text-gray-500 whitespace-nowrap">
                        {h.gender && <span className="mr-1.5">{GENDER_LABEL[h.gender]}</span>}
                        {h.horseClass && <span className="mr-1.5">{CLASS_LABEL[h.horseClass]}</span>}
                        {h.owner.name}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-2.5 px-2 text-center">
                      {h.gender ? GENDER_LABEL[h.gender] : ''}
                    </td>
                    <td className="hidden md:table-cell py-2.5 px-2 text-center text-xs whitespace-nowrap">
                      {h.horseClass ? CLASS_LABEL[h.horseClass] : ''}
                    </td>
                    <td className="hidden sm:table-cell py-2.5 px-3 max-w-[10rem]">
                      <OwnerLabel owner={h.owner} />
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-center tabular-nums whitespace-nowrap">
                      <div>{formatStarts(h.record)}</div>
                      <div className="text-[11px] text-gray-500">[{formatRecord(h.record)}]</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                      {totalPrizeOf(h) > 0
                        ? <PrizeTotal prize={h.totalPrize} bonus={h.totalBonus} />
                        : <span className="text-gray-400">0 ine</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
