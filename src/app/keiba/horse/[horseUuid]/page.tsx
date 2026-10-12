import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import HorseDetailView from '@/components/keiba/HorseDetailView';
import { KeibaPageHeader } from '@/components/keiba/KeibaParts';
import {
  CLASS_LABEL,
  GENDER_LABEL,
  fetchKeiba,
  formatRecord,
  formatStarts,
  horseApiPath,
  type HorseDetail,
} from '@/lib/keiba';

export const revalidate = 60;

type PageProps = { params: Promise<{ horseUuid: string }> };

const getHorse = (uuid: string) => fetchKeiba<HorseDetail>(horseApiPath(uuid), { next: { revalidate: 60 } });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { horseUuid } = await params;
  const res = await getHorse(horseUuid);
  if (!res.ok) return { title: '競走馬 | i-keiba' };
  const horse = res.data;
  const profile = [
    horse.gender ? GENDER_LABEL[horse.gender] : null,
    horse.horseClass ? CLASS_LABEL[horse.horseClass] : null,
  ].filter(Boolean).join('・');
  return {
    title: `${horse.horseName} | i-keiba`,
    description: `${horse.horseName}${profile ? `（${profile}）` : ''}の血統と成績です。通算${formatStarts(horse.record)} [${formatRecord(horse.record)}]。`,
  };
}

export default async function HorsePage({ params }: PageProps) {
  const { horseUuid } = await params;
  const res = await getHorse(horseUuid);

  if (!res.ok) {
    if (res.notFound) notFound();
    return (
      <>
        <Header />
        <div className="flex-grow min-h-screen bg-[#f4f6f4]">
          <KeibaPageHeader breadcrumb={[{ label: 'i-keiba', href: '/keiba' }, { label: '競走馬', href: '/keiba/horses' }]}>
            <h1 className="text-2xl font-bold">競走馬</h1>
          </KeibaPageHeader>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              競走馬の情報を読み込めませんでした。時間をおいて再度お試しください。
              <Link href="/keiba/horses" className="ml-2 underline">競走馬一覧へ</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex-grow">
        <HorseDetailView horse={res.data} />
      </div>
    </>
  );
}
