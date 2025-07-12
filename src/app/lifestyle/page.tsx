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
    case 'サーバールール':
      return 'bg-red-50 text-red-700 border-red-200';
    case '保護':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '土地':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'コマンド':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function LifestylePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/lifestyle');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching lifestyle content:', error);
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
    { label: 'くらし・生活' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-12 bg-green-600 mr-6"></div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">生活・くらし</h1>
              <p className="text-gray-600 text-lg">
                サーバーでの生活に関する情報やルールについて説明します
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
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </section>

        {/* コンテンツ一覧 */}
        <section>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">いねさばでの暮らしに関するページです</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* サーバールール */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-green-600 pl-4">サーバールール</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/lifestyle/housing-guide" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">{'>'}</span>
                      中心地の土地利用について
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/lifestyle/allowed-mods" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">{'>'}</span>
                      許可MOD一覧
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/lifestyle/prohibited-items" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">{'>'}</span>
                      流通禁止アイテム
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 保護 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">保護</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/lifestyle/land-protection" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">{'>'}</span>
                      土地の保護
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/lifestyle/block-protection" 
                      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">{'>'}</span>
                      ブロック保護
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-orange-600 pl-4">地域・地区</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/lifestyle/town-villages" 
                    className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">{'>'}</span>
                    いねさばの市町村
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/lifestyle/recommended-areas" 
                    className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">{'>'}</span>
                    建築におすすめの土地一覧
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">追加コンテンツがありません</h3>
              <p className="text-gray-600">CMSで追加された記事がここに表示されます。</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">追加記事</h3>
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
                        href={`/lifestyle/${item.id}`}
                        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
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
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
