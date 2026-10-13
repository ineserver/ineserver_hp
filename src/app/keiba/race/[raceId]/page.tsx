import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import RaceDetailClient from '@/components/keiba/RaceDetailClient';
import { KeibaPageHeader } from '@/components/keiba/KeibaParts';
import {
  courseApiPath,
  fetchKeiba,
  formatCourse,
  formatDateLong,
  raceApiPath,
  type CourseDetail,
  type CourseSummary,
  type Odds,
  type RaceDetail,
  type RaceForm,
} from '@/lib/keiba';

export const revalidate = 30;

type PageProps = { params: Promise<{ raceId: string }> };

const getRace = (raceId: string) =>
  fetchKeiba<RaceDetail>(raceApiPath(raceId), { next: { revalidate: 30 } });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { raceId } = await params;
  const res = await getRace(raceId);
  if (!res.ok) return { title: 'レース' };
  const race = res.data;
  const when = `${formatDateLong(race.date)}${race.number ? ` ${race.number}R` : ''}`;
  return {
    title: `${race.name}（${when}）`,
    description: `${when} 白椿競馬場「${race.name}」（${formatCourse(race.course)}）の出馬表・オッズ・馬柱・結果です。`,
  };
}

export default async function RacePage({ params }: PageProps) {
  const { raceId } = await params;
  const raceRes = await getRace(raceId);

  if (!raceRes.ok) {
    if (raceRes.notFound) notFound();
    return (
      <>
        <Header />
        <div className="flex-grow min-h-screen bg-[#f4f6f4]">
          <KeibaPageHeader breadcrumb={[{ label: 'i-keiba', href: '/keiba' }, { label: 'レース' }]}>
            <h1 className="text-2xl font-bold">レース情報</h1>
          </KeibaPageHeader>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              レース情報を読み込めませんでした。時間をおいて再度お試しください。
              <Link href="/keiba" className="ml-2 underline">i-keiba トップへ</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const race = raceRes.data;
  const hasOdds = race.status !== 'ENTRY' && race.status !== 'CANCELLED';
  const [oddsRes, formRes, coursesRes] = await Promise.all([
    hasOdds ? fetchKeiba<Odds>(`${raceApiPath(raceId)}/odds`, { next: { revalidate: 10 } }) : null,
    fetchKeiba<RaceForm>(`${raceApiPath(raceId)}/form`, { next: { revalidate: 60 } }),
    fetchKeiba<{ courses: CourseSummary[] }>('/api/keiba/courses', { next: { revalidate: 3600 } }),
  ]);

  // コース図は、このレースで使わないコースも含めた競馬場の全景の上に描く
  const courseNames = new Set(coursesRes.ok ? coursesRes.data.courses.map(c => c.name) : []);
  courseNames.add(race.course.name);
  const venue = (
    await Promise.all(
      [...courseNames].map(name => fetchKeiba<CourseDetail>(courseApiPath(name), { next: { revalidate: 3600 } })),
    )
  ).flatMap(res => (res.ok ? [res.data] : []));
  const course = venue.find(c => c.name === race.course.name) ?? null;

  return (
    <>
      <Header />
      <div className="flex-grow">
        <RaceDetailClient
          initialRace={race}
          initialOdds={oddsRes?.ok ? oddsRes.data : null}
          initialForm={formRes.ok ? formRes.data : null}
          course={course}
          venue={venue}
        />
      </div>
    </>
  );
}
