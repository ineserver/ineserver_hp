'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

// お知らせ用アイコン
const SpeakerWaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.205c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282M6.34 8.595a20.68 20.68 0 0 1 .393-4.595" />
  </svg>
);

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category?: string;
}

export default function AnnouncementsPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching announcements content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'お知らせ' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <SpeakerWaveIcon className="w-12 h-12 text-[#5b8064] mr-6" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">お知らせ</h1>
              <p className="text-gray-600 text-lg">
                サーバーからの重要なお知らせや更新情報をご確認ください
              </p>
            </div>
          </div>
        </header>

        {/* コンテンツ一覧 */}
        <section>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b8064] mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">お知らせがありません</h3>
              <p className="text-gray-600">まだお知らせが投稿されていません。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/announcements/${item.id}`}
                  className="block w-full"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-colors duration-200 hover:shadow-md">
                    <div className="flex items-center">
                      <SpeakerWaveIcon className="w-12 h-12 text-[#5b8064] mr-6" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
