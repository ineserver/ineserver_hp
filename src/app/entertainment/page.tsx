'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

// 娯楽用アイコン
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
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

export default function EntertainmentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/entertainment');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching entertainment content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'エンタメ' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <SparklesIcon className="w-12 h-12 text-[#5b8064] mr-6" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">エンタメ</h1>
              <p className="text-gray-600 text-lg">
                サーバーでのイベントや遊び、エンターテイメントについて説明します
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
              <div className="text-gray-400 text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">まだコンテンツが追加されていません。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/entertainment/${item.id}`}
                  className="block w-full"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-colors duration-200 hover:shadow-md">
                    <div className="flex items-center">
                      <SparklesIcon className="w-12 h-12 text-[#5b8064] mr-6" />
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
