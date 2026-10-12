import type { Metadata } from 'next';
import Header from '@/components/Header';
import HorseListClient from '@/components/keiba/HorseListClient';
import { fetchKeiba, type HorseSummary } from '@/lib/keiba';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '競走馬一覧 | i-keiba',
  description: 'いねさばの競馬に登録されている競走馬の一覧です。獲得賞金・成績・馬主・血統を確認できます。',
};

export default async function HorsesPage() {
  const res = await fetchKeiba<{ horses: HorseSummary[] }>('/api/keiba/horses', { next: { revalidate: 60 } });

  return (
    <>
      <Header />
      <div className="flex-grow">
        <HorseListClient horses={res.ok ? res.data.horses : []} loadError={!res.ok} />
      </div>
    </>
  );
}
