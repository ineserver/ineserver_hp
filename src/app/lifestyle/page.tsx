'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

// 生活・くらし用アイコン
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.25-8.25a1.125 1.125 0 0 1 1.59 0L20.25 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
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

export default function LifestylePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <HomeIcon className="w-12 h-12 text-[#5b8064] mr-6" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">生活・くらし</h1>
              <p className="text-gray-600 text-lg">
                サーバーでの生活に関する情報やルールについて説明します
              </p>
            </div>
          </div>
        </header>

        {/* コンテンツ一覧 */}
        <section>
          <div className="space-y-8 mb-12">
            {/* サーバールール セクション */}
            <div>
              {/* サーバールール タイトル */}
              <div className="bg-gray-100 border-l-4 border-[#5b8064] p-4 mb-4 rounded-r-lg">
                <h2 className="text-xl font-semibold text-gray-900">サーバールール</h2>
              </div>
              
              {/* サーバールール内の各ページ */}
              <div className="space-y-3 ml-4">
                <Link href="/lifestyle/housing-guide" className="block w-full">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">中心地の土地利用について</h3>
                    <p className="text-gray-600 text-sm">
                      中心地での土地利用に関する詳細なガイドライン
                    </p>
                  </div>
                </Link>

                <Link href="/lifestyle/allowed-mods" className="block w-full">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">許可MOD一覧</h3>
                    <p className="text-gray-600 text-sm">
                      サーバーで使用が許可されているMODの一覧
                    </p>
                  </div>
                </Link>

                <Link href="/lifestyle/prohibited-items" className="block w-full">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">流通禁止アイテム</h3>
                    <p className="text-gray-600 text-sm">
                      サーバー内で流通が禁止されているアイテムについて
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* 保護 セクション */}
            <div>
              {/* 保護 タイトル */}
              <div className="bg-gray-100 border-l-4 border-[#5b8064] p-4 mb-4 rounded-r-lg">
                <h2 className="text-xl font-semibold text-gray-900">保護</h2>
              </div>
              
              {/* 保護内の各ページ */}
              <div className="space-y-3 ml-4">
                <Link href="/lifestyle/land-protection" className="block w-full">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">土地の保護</h3>
                    <p className="text-gray-600 text-sm">
                      土地を保護する方法と設定について
                    </p>
                  </div>
                </Link>

                <Link href="/lifestyle/block-protection" className="block w-full">
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">ブロック保護</h3>
                    <p className="text-gray-600 text-sm">
                      個別のブロック保護システムについて
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* CMSから取得した追加コンテンツ */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b8064] mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : content.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gray-100 border-l-4 border-[#5b8064] p-4 mb-4 rounded-r-lg">
                <h2 className="text-xl font-semibold text-gray-900">追加記事</h2>
              </div>
              <div className="space-y-3 ml-4">
                {content.map((item) => (
                  <Link
                    key={item.id}
                    href={`/lifestyle/${item.id}`}
                    className="block w-full"
                  >
                    <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:shadow-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
