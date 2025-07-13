'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

// 交通用アイコン
const ArrowsRightLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
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

export default function TransportationPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/transportation');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching transportation content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: '交通' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <ArrowsRightLeftIcon className="w-12 h-12 text-[#5b8064] mr-6" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">交通</h1>
              <p className="text-gray-600 text-lg">
                サーバー内の交通手段や移動方法について説明します
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
              <div className="text-gray-400 text-6xl mb-4">🚄</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">まだコンテンツが追加されていません。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/transportation/${item.id}`}
                  className="block w-full"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-colors duration-200 hover:shadow-md">
                    <div className="flex items-center">
                      <ArrowsRightLeftIcon className="w-12 h-12 text-[#5b8064] mr-6" />
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
