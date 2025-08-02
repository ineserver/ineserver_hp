'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { iconMap } from '@/components/Icons';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentListPageProps {
  config: ContentPageConfig;
}

export default function ContentListPage({ config }: ContentListPageProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 初期状態を false に変更
  const [error, setError] = useState(false); // エラー状態を追加
  
  const IconComponent = iconMap[config.icon];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        const response = await fetch(config.apiEndpoint, { next: { revalidate: 60 } });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error(`Error fetching ${config.title} content:`, error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [config.apiEndpoint, config.title]);

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: config.title }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <IconComponent className={`${config.color} mr-6`} size={40} />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{config.title}</h1>
              <p className="text-gray-600 text-lg">
                {config.description}
              </p>
            </div>
          </div>
        </header>

        {/* コンテンツ一覧 */}
        <section>
          {isLoading ? (
            // スケルトンローディング状態
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded mr-6"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // エラー状態
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">読み込みができませんでした</h3>
              <p className="text-gray-600">しばらく時間をおいてから再度お試しください。</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">{config.emptyIcon}</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">{config.emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`${config.basePath}/${item.id}`}
                  className="block w-full"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-colors duration-200 hover:shadow-md">
                    <div className="flex items-center">
                      <IconComponent className={`${config.color} mr-6`} size={40} />
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
