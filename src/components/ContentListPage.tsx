'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentListPageProps {
  config: ContentPageConfig;
}

export default function ContentListPage({ config }: ContentListPageProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(config.apiEndpoint, { next: { revalidate: 60 } });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error(`Error fetching ${config.title} content:`, error);
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
            <FontAwesomeIcon icon={config.icon} className={`${config.color} mr-6`} style={{ fontSize: '2.5rem' }} />
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
            <div className="text-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${config.loadingColor} mx-auto mb-4`}></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">{config.emptyIcon}</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">まだコンテンツが追加されていません。</p>
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
                      <FontAwesomeIcon icon={config.icon} className={`${config.color} mr-6`} style={{ fontSize: '2.5rem' }} />
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
