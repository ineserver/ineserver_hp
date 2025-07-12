'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category?: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case '鉄道':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '道路':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case '港':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case '航空':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function TransportationPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const categories = ['all', ...Array.from(new Set(content.map(item => item.category).filter((cat): cat is string => Boolean(cat))))];
  
  const filteredContent = selectedCategory === 'all' 
    ? content 
    : content.filter(item => item.category === selectedCategory);

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
            <div className="w-1 h-12 bg-indigo-600 mr-6"></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">交通</h1>
              <p className="text-gray-600 text-lg">
                サーバー内の交通手段や移動方法について説明します
              </p>
            </div>
          </div>
        </header>

        {/* カテゴリーセクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">カテゴリー</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </section>

        {/* コンテンツ一覧 */}
        <section>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚄</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">まだコンテンツが追加されていません。</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {item.category && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <Link
                      href={`/transportation/${item.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                    >
                      詳細を見る
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
