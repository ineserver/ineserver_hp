'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  courseName,
  formatCourse,
  formatDateLong,
  formatDateShort,
  formatTime,
  isLive,
  isWeekend,
  type Direction,
  type RaceSummary,
} from '@/lib/keiba';
import {
  ClassBadge,
  EmptyState,
  KeibaPageHeader,
  RaceNumberBox,
  SectionTitle,
  StatusBadge,
} from './KeibaParts';
import PostCountdown from './PostCountdown';

const byRaceOrder = (a: RaceSummary, b: RaceSummary) =>
  a.date.localeCompare(b.date) || (a.number ?? 0) - (b.number ?? 0);

function NextRaceCard({ race, direction }: { race: RaceSummary; direction: Direction | null }) {
  const href = `/keiba/race/${race.raceId}`;
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2 bg-[#1f3d2a] text-white text-sm">
        <span className="font-medium">{formatDateLong(race.date)}</span>
        <StatusBadge status={race.status} size="sm" />
      </div>
      <div className="px-4 sm:px-5 py-5">
        <div className="flex items-start gap-4">
          <RaceNumberBox number={race.number} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{race.name}</h3>
              <ClassBadge raceClass={race.class} size="lg" />
            </div>
            <p className="text-sm text-gray-600">
              {race.postTime && <span className="font-bold text-gray-900">{race.postTime}発走</span>}
              {race.postTime && ' / '}
              {formatCourse(race.course, direction)}
              {' / '}{courseName(race.course)}
              {race.fieldSize ? ` / ${race.fieldSize}頭` : ''}
            </p>
            <PostCountdown race={race} className="block mt-2 text-[#e0262d] text-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-5 sm:max-w-sm">
          <Link
            href={href}
            className="text-center px-4 py-2.5 rounded-md bg-[#2f5a3c] text-white text-sm font-bold hover:bg-[#244a30] transition-colors"
          >
            出馬表
          </Link>
          <Link
            href={`${href}?tab=odds`}
            className="text-center px-4 py-2.5 rounded-md border border-[#2f5a3c] text-[#2f5a3c] text-sm font-bold hover:bg-[#f0f5f1] transition-colors"
          >
            オッズ
          </Link>
        </div>
        {race.status === 'ENTRY' && (
          <p className="text-xs text-gray-500 mt-3">出馬表とオッズは、出走馬の募集が締め切られて馬券の発売が始まると公開されます。</p>
        )}
      </div>
    </div>
  );
}

function RaceRow({ race, direction }: { race: RaceSummary; direction: Direction | null }) {
  const finished = race.status === 'FINISHED';
  return (
    <Link
      href={`/keiba/race/${race.raceId}`}
      className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-[#f3f7f4] transition-colors"
    >
      <RaceNumberBox number={race.number} />
      <div className="hidden sm:block w-12 text-sm font-bold text-gray-700 tabular-nums shrink-0">
        {race.postTime ?? ''}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900">{race.name}</span>
          <ClassBadge raceClass={race.class} size="sm" />
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          <span className="sm:hidden">{race.postTime ? `${race.postTime}発走 / ` : ''}</span>
          {formatCourse(race.course, direction)}
          {race.fieldSize ? ` / ${race.fieldSize}頭` : ''}
        </div>
      </div>
      <div className="text-right shrink-0">
        {finished && race.winners.length > 0 ? (
          <div className="text-sm">
            <div className="text-[11px] text-gray-500">1着</div>
            {race.winners.map(w => (
              <div key={w.gate} className="font-bold text-gray-900">
                {w.horseName}
                {w.time != null && <span className="ml-1.5 text-xs font-normal text-gray-500 tabular-nums">{formatTime(w.time)}</span>}
              </div>
            ))}
          </div>
        ) : (
          <StatusBadge status={race.status} size="sm" />
        )}
      </div>
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function KeibaTopClient({
  races,
  directions,
  loadError,
}: {
  races: RaceSummary[];
  directions: Record<string, Direction>;
  loadError: boolean;
}) {
  const upcoming = useMemo(() => races.filter(r => isLive(r.status)).sort(byRaceOrder), [races]);
  const dates = useMemo(() => [...new Set(races.map(r => r.date))].sort(), [races]);

  // 最初に開く開催日: 次のレースの日、無ければいちばん新しい日
  const [selectedDate, setSelectedDate] = useState<string | null>(
    upcoming[0]?.date ?? dates[dates.length - 1] ?? null,
  );
  const racesOfDate = useMemo(
    () => races.filter(r => r.date === selectedDate).sort(byRaceOrder),
    [races, selectedDate],
  );

  // 選んでいる開催日のタブが見えるように横スクロールする
  const stripRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    const tab = selectedTabRef.current;
    if (!strip || !tab) return;
    strip.scrollLeft = tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2;
  }, [selectedDate]);

  const directionOf = (race: RaceSummary) => directions[race.course.name] ?? null;

  return (
    <div className="min-h-screen bg-[#f4f6f4]">
      <KeibaPageHeader breadcrumb={[{ label: 'i-keiba' }]}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">i-keiba</h1>
            <p className="text-sm text-white/75">レースの出馬表・オッズ・馬柱・結果を確認できます。</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/keiba/horses"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-[#2f5a3c] border border-white text-sm font-bold hover:bg-white/90 transition-colors"
            >
              競走馬一覧
            </Link>
            <Link
              href="/adventure/horse-racing"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/10 border border-white/25 text-sm hover:bg-white/20 transition-colors"
            >
              遊び方・馬券の買い方
            </Link>
            <Link
              href="/announcements/keiba"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/10 border border-white/25 text-sm hover:bg-white/20 transition-colors"
            >
              開催日程
            </Link>
          </div>
        </div>
      </KeibaPageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            レース情報を読み込めませんでした。時間をおいて再度お試しください。
          </div>
        )}

        {/* 次のレース */}
        <section>
          <SectionTitle>次のレース</SectionTitle>
          {upcoming.length === 0 ? (
            <EmptyState title="発売予定のレースはありません">
              今後の開催日は<Link href="/announcements/keiba" className="text-[#2f5a3c] underline">開催日程</Link>をご確認ください。
            </EmptyState>
          ) : (
            <div className="space-y-3">
              <NextRaceCard race={upcoming[0]} direction={directionOf(upcoming[0])} />
              {upcoming.length > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {upcoming.slice(1).map(race => (
                    <div key={race.raceId} className="flex items-center">
                      <div className="pl-3 sm:pl-4 text-xs text-gray-500 w-20 shrink-0">
                        {formatDateShort(race.date).md}（{formatDateShort(race.date).weekday}）
                      </div>
                      <div className="flex-1 min-w-0">
                        <RaceRow race={race} direction={directionOf(race)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 開催日ごとのレース */}
        <section>
          <SectionTitle aside={selectedDate ? formatDateLong(selectedDate) : undefined}>レース一覧</SectionTitle>
          {dates.length === 0 ? (
            <EmptyState title="レースの記録はまだありません">
              これまでの優勝馬は<Link href="/announcements/keiba" className="text-[#2f5a3c] underline">開催日程</Link>をご覧ください。
            </EmptyState>
          ) : (
            <>
              <div
                ref={stripRef}
                className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-3 scroll-smooth"
                role="tablist"
                aria-label="開催日"
              >
                {dates.map(date => {
                  const { md, weekday } = formatDateShort(date);
                  const weekend = isWeekend(date);
                  const selected = date === selectedDate;
                  return (
                    <button
                      key={date}
                      ref={selected ? selectedTabRef : undefined}
                      role="tab"
                      aria-selected={selected}
                      title={formatDateLong(date)}
                      onClick={() => setSelectedDate(date)}
                      className={`shrink-0 min-w-[4.5rem] px-3 py-2 rounded-md border text-center cursor-pointer transition-colors ${selected
                        ? 'bg-[#2f5a3c] border-[#2f5a3c] text-white'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-[#5b8064]'
                        }`}
                    >
                      <span className="block text-sm font-bold tabular-nums">{md}</span>
                      <span
                        className={`block text-xs ${selected
                          ? 'text-white/80'
                          : weekend === 'sun' ? 'text-red-600' : weekend === 'sat' ? 'text-blue-600' : 'text-gray-500'
                          }`}
                      >
                        （{weekday}）
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {racesOfDate.map(race => (
                  <RaceRow key={race.raceId} race={race} direction={directionOf(race)} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
