'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface PatchNote {
  id: string;
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

export default function PatchNoteDetailPage() {
  const params = useParams();
  const [patchNote, setPatchNote] = useState<PatchNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatchNote = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/patch-notes/${params.slug}`, { next: { revalidate: 60 } });
        if (response.ok) {
          const patchNote = await response.json();
          setPatchNote(patchNote);
        } else {
          // サンプルデータ（slugに応じて適切なデータを返す）
          const samplePatchNote: PatchNote = {
            id: params.slug as string,
            version: '4.19.0.1',
            date: '2025年4月25日',
            description: 'サーバーの安定性向上とバグ修正を含むアップデートを実施しました。このアップデートでは、プレイヤーデータの処理に関する重要な修正と、システム全体のパフォーマンス向上が含まれています。',
            sections: [
              {
                type: 'fixes',
                title: '不具合修正',
                items: [
                  'CCPlayerDataが利用不可時のデフォルト値設定を修正',
                  'プロトコルライブラリの無効化機能がエラーで停止する問題を修正',
                  'プレイヤーデータの同期処理における競合状態を解決',
                  'メモリリークの原因となっていたキャッシュ処理を改善'
                ]
              },
              {
                type: 'other',
                title: 'その他',
                items: [
                  'コミット詳細リンクが間違ったリポジトリを指す問題を修正',
                  'ビルドプロセスの最適化により、デプロイ時間を30%短縮',
                  'テストカバレッジレポートの生成処理を改善'
                ]
              }
            ]
          };
          setPatchNote(samplePatchNote);
        }
      } catch (error) {
        console.error('Error fetching patch note:', error);
        setPatchNote(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchPatchNote();
    }
  }, [params.slug]);

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
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'features':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'other':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'パッチノート', href: '/patch-notes' },
    { label: patchNote?.version || 'パッチノート詳細' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb items={breadcrumbItems} />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b8064] mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patchNote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Breadcrumb items={breadcrumbItems} />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">パッチノートが見つかりません</h1>
            <p className="text-gray-600 mb-8">指定されたパッチノートは存在しないか、削除された可能性があります。</p>
            <Link href="/patch-notes">
              <button className="px-6 py-3 bg-[#5b8064] text-white rounded-lg hover:bg-[#4a6b55] transition-colors duration-200">
                パッチノート一覧に戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* パッチノートヘッダー */}
        <header className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* 一覧に戻るボタン - モバイル優先で上部に配置 */}
          <div className="mb-6 -ml-4">
            <Link href="/patch-notes">
              <button className="flex items-center px-4 py-2 text-[#5b8064] hover:text-[#4a6b55] transition-colors duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                一覧に戻る
              </button>
            </Link>
          </div>
          
          {/* 最新のアップデート表示 */}
          {patchNote.isLatest && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                最新のアップデート
              </span>
            </div>
          )}
          
          {/* 日付 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{patchNote.date}</h1>
          </div>
          
          <div className="border-l-4 border-[#5b8064] pl-6">
            <p className="text-gray-600 leading-relaxed">{patchNote.description}</p>
          </div>
        </header>

        {/* パッチノート詳細セクション */}
        <section className="space-y-6">
          {patchNote.sections.map((section, index) => (
            <div key={index} className={`rounded-lg border p-6 ${getSectionColor(section.type)}`}>
              <h3 className="flex items-center text-lg font-semibold mb-4">
                <span className="text-2xl mr-3">{getSectionIcon(section.type)}</span>
                {section.title}
              </h3>
              
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-current rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div 
                      className="text-gray-700 leading-relaxed prose-sm max-w-none [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-gray-900"
                      dangerouslySetInnerHTML={{ 
                        __html: section.itemsHtml && section.itemsHtml[itemIndex] 
                          ? section.itemsHtml[itemIndex] 
                          : item 
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* フッター */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              このパッチノートは {patchNote.date} に公開されました
            </div>
            <Link href="/patch-notes" className="order-1 sm:order-2">
              <button className="w-full sm:w-auto px-6 py-3 bg-[#5b8064] text-white rounded-lg hover:bg-[#4a6b55] transition-colors duration-200">
                他のパッチノートを見る
              </button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
