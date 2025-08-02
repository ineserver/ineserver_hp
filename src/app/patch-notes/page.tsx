'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface PatchNote {
  id: string;
  slug?: string;
  version: string;
  date: string;
  description: string;
  isLatest?: boolean;
  sections: {
    type: 'fixes' | 'features' | 'other';
    title: string;
    items: string[];
    itemsHtml?: string[];
  }[];
}

export default function PatchNotesArchive() {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 初期状態を false に変更
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPatchNotes = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        const response = await fetch('/api/patch-notes', { next: { revalidate: 60 } });
        if (response.ok) {
          const result = await response.json();
          // APIが {data: PatchNote[], pagination: {...}} の形式で返すので、dataプロパティを取得
          const patchNotes = result.data || result;
          setPatchNotes(Array.isArray(patchNotes) ? patchNotes : []);
        } else {
          // データの取得に失敗した場合はエラー状態を設定
          console.warn('Failed to fetch patch notes from server');
          setError(true);
          setPatchNotes([]);
        }
      } catch (error) {
        console.error('Error fetching patch notes:', error);
        setError(true);
        setPatchNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatchNotes();
  }, []);

  // 再試行機能
  const retryFetch = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/patch-notes', { next: { revalidate: 60 } });
      if (response.ok) {
        const result = await response.json();
        const patchNotes = result.data || result;
        setPatchNotes(Array.isArray(patchNotes) ? patchNotes : []);
      } else {
        setError(true);
        setPatchNotes([]);
      }
    } catch (error) {
      console.error('Error fetching patch notes:', error);
      setError(true);
      setPatchNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // セクションのスタイル取得
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'fixes':
        return '🔧';
      case 'features':
        return '✨';
      case 'other':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'fixes':
        return 'text-blue-600';
      case 'features':
        return 'text-green-600';
      case 'other':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'パッチノート' }
  ];

  // ページネーション
  const totalPages = Math.ceil((patchNotes?.length || 0) / itemsPerPage);
  const currentPatchNotes = (patchNotes || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">パッチノート</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            サーバーアップデートの詳細情報とリリースノートをご覧いただけます。
            最新の機能追加、バグ修正、パフォーマンス改善について確認できます。
          </p>
        </header>

        {/* パッチノート一覧 - タイムライン形式 */}
        <section>
          {isLoading ? (
            // スケルトンローディング状態
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative pl-10 animate-pulse">
                    <div className="absolute left-2.5 w-3 h-3 bg-gray-200 rounded-full -translate-x-1/2"></div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="h-4 bg-gray-200 rounded-full w-4 mr-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="ml-6 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            // エラー状態
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-lg mb-2">読み込みができませんでした</p>
              <p className="text-gray-500 mb-6">しばらく時間をおいてから再度お試しください</p>
              <button
                onClick={retryFetch}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再試行
              </button>
            </div>
          ) : currentPatchNotes.length > 0 ? (
            <div className="relative">
              {currentPatchNotes.map((patchNote, index) => (
                <div key={patchNote.id} className="relative flex pb-8">
                  {/* タイムライン */}
                  <div className="flex flex-col items-center mr-6">
                    {/* ドット */}
                    <div className="w-4 h-4 bg-[#5b8064] rounded-full border-4 border-white shadow-lg z-10"></div>
                    {/* 線 */}
                    {index !== currentPatchNotes.length - 1 && (
                      <div className="w-0.5 bg-gray-300 flex-1 mt-2"></div>
                    )}
                  </div>
                  
                  {/* コンテンツ */}
                  <div className="flex-1">
                    <div className="group">
                      {/* ヘッダー */}
                      <div className="mb-3">
                        <Link href={`/patch-notes/${patchNote.slug || patchNote.id}`}>
                          <div className="flex items-center">
                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#5b8064] transition-colors duration-200">
                              {patchNote.date}
                            </h2>
                            {patchNote.isLatest && (
                              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                最新のアップデート
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                      
                      {/* 説明 */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {patchNote.description}
                      </p>
                      
                      {/* セクション概要 */}
                      <div className="flex flex-wrap gap-2">
                        {patchNote.sections.slice(0, 3).map((section, sectionIndex) => (
                          <span
                            key={sectionIndex}
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getSectionColor(section.type)}`}
                          >
                            <span className="mr-1">{getSectionIcon(section.type)}</span>
                            {section.title}
                          </span>
                        ))}
                        {patchNote.sections.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                            +{patchNote.sections.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              パッチノートがありません
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-[#5b8064] text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </nav>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
