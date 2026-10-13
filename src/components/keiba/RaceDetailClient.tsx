'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  courseName,
  fetchKeiba,
  formatCourse,
  formatDateLong,
  formatIne,
  gateCountOf,
  isLive,
  raceApiPath,
  type CourseDetail,
  type Odds,
  type RaceDetail,
  type RaceForm,
  type RaceStatus,
} from '@/lib/keiba';
import { ClassBadge, KeibaPageHeader, RaceNumberBox, StatusBadge } from './KeibaParts';
import PostCountdown from './PostCountdown';
import EntryTable from './EntryTable';
import OddsPanel from './OddsPanel';
import FormPanel from './FormPanel';
import ResultPanel from './ResultPanel';
import CourseMap from './CourseMap';
import { useMarks } from './Marks';

type Tab = 'entries' | 'odds' | 'form' | 'result' | 'course';

const TABS: { key: Tab; label: string }[] = [
  { key: 'entries', label: '出馬表' },
  { key: 'odds', label: 'オッズ' },
  { key: 'form', label: '馬柱' },
  { key: 'result', label: '結果・払戻' },
  { key: 'course', label: 'コース' },
];

const RACE_REFRESH_MS = 20_000;
const ODDS_REFRESH_MS = 10_000;

const defaultTab = (status: RaceStatus | null): Tab => (status === 'FINISHED' ? 'result' : 'entries');

export default function RaceDetailClient({
  initialRace,
  initialOdds,
  initialForm,
  course,
  venue,
}: {
  initialRace: RaceDetail;
  initialOdds: Odds | null;
  initialForm: RaceForm | null;
  course: CourseDetail | null;
  venue: CourseDetail[];
}) {
  const [race, setRace] = useState(initialRace);
  const [odds, setOdds] = useState(initialOdds);
  const [form, setForm] = useState(initialForm);
  const [tab, setTab] = useState<Tab>(defaultTab(initialRace.status));
  const [justFinished, setJustFinished] = useState(false);

  const raceId = race.raceId;
  const status = race.status;
  const gateCount = gateCountOf(race);
  const { marks, setMark } = useMarks(raceId);

  // ?tab= で開くタブを選べるようにする
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some(t => t.key === requested)) setTab(requested as Tab);
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url);
  };

  const refreshOdds = useCallback(async () => {
    const res = await fetchKeiba<Odds>(`${raceApiPath(raceId)}/odds`, { cache: 'no-store' });
    if (res.ok) setOdds(res.data);
  }, [raceId]);

  // 発走前・競走中は、状態と出馬表を取り直す
  useEffect(() => {
    if (!isLive(status)) return;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      const res = await fetchKeiba<RaceDetail>(raceApiPath(raceId), { cache: 'no-store' });
      if (res.ok) setRace(res.data);
    }, RACE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [status, raceId]);

  // 発売中はオッズを取り直す
  useEffect(() => {
    if (status !== 'BETTING') return;
    const timer = setInterval(() => {
      if (!document.hidden) refreshOdds();
    }, ODDS_REFRESH_MS);
    return () => clearInterval(timer);
  }, [status, refreshOdds]);

  // 状態が変わったら、オッズ（締切後は最終の値）と馬柱を取り直す
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === status) return;
    const prev = prevStatus.current;
    prevStatus.current = status;
    if (status !== 'ENTRY') refreshOdds();
    if (prev === 'ENTRY') {
      fetchKeiba<RaceForm>(`${raceApiPath(raceId)}/form`, { cache: 'no-store' }).then(res => {
        if (res.ok) setForm(res.data);
      });
    }
    if (status === 'FINISHED') setJustFinished(true);
  }, [status, raceId, refreshOdds]);

  const direction = course?.direction ?? null;

  return (
    <div className="min-h-screen bg-[#f4f6f4]">
      <KeibaPageHeader breadcrumb={[{ label: 'i-keiba', href: '/keiba' }, { label: race.name }]}>
        <div className="flex items-center gap-3 flex-wrap text-sm text-white/80 mb-3">
          <span>{formatDateLong(race.date)}</span>
          <span>白椿競馬場</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <div className="flex items-start gap-4">
          <RaceNumberBox number={race.number} size="lg" light />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{race.name}</h1>
              <ClassBadge raceClass={race.class} size="lg" />
            </div>
            <p className="text-sm sm:text-base text-white/90 mt-1.5">
              {race.postTime && <span className="font-bold">{race.postTime}発走 / </span>}
              {formatCourse(race.course, direction)}
              {' / '}{courseName(race.course)}
              {race.fieldSize ? ` / ${race.fieldSize}頭` : ''}
            </p>
            <p className="text-xs text-white/65 mt-1 flex gap-x-3 flex-wrap">
              {race.totalSales != null && race.totalSales > 0 && <span>売上 {formatIne(race.totalSales)}</span>}
              {race.bonusTotal != null && race.bonusTotal > 0 && <span>追加賞金 {formatIne(race.bonusTotal)}</span>}
            </p>
            <PostCountdown race={race} className="inline-block mt-2 px-2.5 py-1 rounded bg-white/10 text-sm" />
          </div>
        </div>
      </KeibaPageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {status === 'CANCELLED' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-800">
            <span className="font-bold">このレースは中止になりました。</span>発売した馬券は全額返還されます。
          </div>
        )}

        {justFinished && tab !== 'result' && (
          <button
            onClick={() => selectTab('result')}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-[#fffbea] border border-[#f5d300] text-sm font-bold text-gray-900 text-left cursor-pointer hover:bg-[#fff6d0]"
          >
            レースが確定しました。結果・払戻を見る →
          </button>
        )}

        {/* タブ */}
        <div className="flex overflow-x-auto scrollbar-hide border-b-2 border-[#2f5a3c] mb-5" role="tablist">
          {TABS.map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => selectTab(t.key)}
              className={`shrink-0 px-3 sm:px-6 py-2.5 text-sm font-bold rounded-t-md cursor-pointer transition-colors ${tab === t.key
                ? 'bg-[#2f5a3c] text-white'
                : 'text-gray-600 hover:text-[#2f5a3c] hover:bg-white'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === 'entries' && <EntryTable race={race} odds={odds} gateCount={gateCount} marks={marks} onMark={setMark} />}
          {tab === 'odds' && <OddsPanel race={race} odds={odds} gateCount={gateCount} marks={marks} onMark={setMark} />}
          {tab === 'form' && (
            <FormPanel form={form} gateCount={gateCount} finished={status === 'FINISHED'} marks={marks} onMark={setMark} />
          )}
          {tab === 'result' && (
            <ResultPanel
              race={race}
              gateCount={gateCount}
              recordBefore={form ? (form.course.record?.time ?? null) : undefined}
              marks={marks}
            />
          )}
          {tab === 'course' && <CourseMap course={course} venue={venue} />}
        </div>
      </div>
    </div>
  );
}
