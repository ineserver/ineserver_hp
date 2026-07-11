import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import RouteMapClient from '@/components/RouteMapClient';
import { SubwayIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: '鉄道路線図 | いねさば',
  description: 'いねさばの鉄道路線図。各駅の情報や乗り換え路線を確認できます。',
  openGraph: {
    title: '鉄道路線図 | いねさば',
    description: 'いねさばの鉄道路線図。各駅の情報や乗り換え路線を確認できます。',
    url: 'https://www.1necat.net/transport/route_map',
    siteName: 'いねさば',
    type: 'website',
  },
};

const breadcrumbItems = [
  { label: 'いねさば', href: '/' },
  { label: '交通', href: '/transport' },
  { label: '鉄道路線図' },
];

export default function RouteMapPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* ページヘッダー（ヒーローエリア） */}
      <div
        className="text-white relative bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://img.1necat.net/2025-11-28_02.41.46.png')"
        }}
      >
        <div className="max-w-7xl mx-auto px-5 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <SubwayIcon className="w-10 h-10 text-white/80" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              鉄道路線図
            </h1>
          </div>
          <p className="text-white/80 text-sm sm:text-base ml-0 sm:ml-13 max-w-2xl leading-relaxed">
            駅をクリックすると詳細情報が表示されます。ドラッグで移動、スクロール（またはピンチ）で拡大縮小できます。
          </p>
        </div>
      </div>

      {/* マップ本体 */}
      <div className="flex-grow bg-slate-50 px-4 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <RouteMapClient />
        </div>
      </div>

      {/* データ編集案内 */}
      <div className="bg-white border-t border-gray-100 px-5 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-gray-500 text-xs leading-relaxed">
            路線・駅情報は{' '}
            <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono">
              public/data/route_map.json
            </code>{' '}
            を編集することで更新できます。
          </p>
          <Link
            href="/transport"
            className="text-[#5b8064] hover:text-[#4a6b55] text-xs font-semibold transition-colors flex items-center gap-1 group"
          >
            <span className="transform group-hover:-translate-x-0.5 transition-transform duration-200">←</span> 交通一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

