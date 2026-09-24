import type { Metadata } from 'next';
import Header from '@/components/Header';
import RouteMapClient from '@/components/RouteMapClient';

export const metadata: Metadata = {
  title: '鉄道路線図 | いねさば',
  description: 'いねさばの鉄道路線図。各駅の情報や乗り換え路線の確認、駅間の経路検索ができます。',
  openGraph: {
    title: '鉄道路線図 | いねさば',
    description: 'いねさばの鉄道路線図。各駅の情報や乗り換え路線の確認、駅間の経路検索ができます。',
    url: 'https://www.1necat.net/transport/route_map',
    siteName: 'いねさば',
    type: 'website',
  },
};

export default function RouteMapPage() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-white flex flex-col touch-none overscroll-none select-none">
      <Header />
      <main className="flex-1 relative w-full h-full overflow-hidden touch-none">
        <RouteMapClient />
      </main>
    </div>
  );
}

