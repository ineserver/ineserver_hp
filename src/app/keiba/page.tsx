import type { Metadata } from 'next';
import Header from '@/components/Header';
import KeibaTopClient from '@/components/keiba/KeibaTopClient';
import { fetchKeiba, type CourseSummary, type Direction, type RaceSummary } from '@/lib/keiba';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'i-keiba',
  description: 'いねさばの白椿競馬場で行われるレースの出馬表・オッズ・馬柱・結果を確認できます。',
};

export default async function KeibaPage() {
  const [racesRes, coursesRes] = await Promise.all([
    fetchKeiba<{ races: RaceSummary[] }>('/api/keiba/races?order=desc&limit=500', { next: { revalidate: 60 } }),
    fetchKeiba<{ courses: CourseSummary[] }>('/api/keiba/courses', { next: { revalidate: 3600 } }),
  ]);

  // レース一覧には回りが無いので、コース一覧から引く
  const directions: Record<string, Direction> = {};
  if (coursesRes.ok) {
    for (const course of coursesRes.data.courses) directions[course.name] = course.direction;
  }

  return (
    <>
      <Header />
      <div className="flex-grow">
        <KeibaTopClient
          races={racesRes.ok ? racesRes.data.races : []}
          directions={directions}
          loadError={!racesRes.ok}
        />
      </div>
    </>
  );
}
