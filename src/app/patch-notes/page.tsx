'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface PatchNote {
  id: string;
  slug?: string;
  version: string;
  title: string;
  date: string;
  description: string;
  sections: {
    type: 'fixes' | 'features' | 'breaking' | 'performance' | 'security';
    title: string;
    items: string[];
  }[];
}

export default function PatchNotesArchive() {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPatchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/patch-notes');
        if (response.ok) {
          const result = await response.json();
          // APIが {data: PatchNote[], pagination: {...}} の形式で返すので、dataプロパティを取得
          const cmsPatchNotes = result.data || result;
          setPatchNotes(Array.isArray(cmsPatchNotes) ? cmsPatchNotes : []);
        } else {
          // サンプルデータ
          const samplePatchNotes: PatchNote[] = [
            {
              id: '1',
              slug: '4-19-0-1',
              version: '4.19.0.1',
              title: 'WolfyScript 4.19.0.1 アップデート',
              date: '2025年4月25日',
              description: 'サーバーの安定性向上とバグ修正を含むアップデートを実施しました。このアップデートでは、プレイヤーデータの処理に関する重要な修正と、システム全体のパフォーマンス向上が含まれています。',
              sections: [
                {
                  type: 'fixes',
                  title: 'バグ修正',
                  items: [
                    'CCPlayerDataが利用不可時のデフォルト値設定を修正',
                    'プロトコルライブラリの無効化機能がエラーで停止する問題を修正',
                    'プレイヤーデータの同期処理における競合状態を解決'
                  ]
                },
                {
                  type: 'performance',
                  title: 'CI/CD',
                  items: [
                    'コミット詳細リンクが間違ったリポジトリを指す問題を修正',
                    'ビルドプロセスの最適化により、デプロイ時間を30%短縮'
                  ]
                }
              ]
            },
            {
              id: '2',
              slug: '4-19-0',
              version: '4.19.0',
              title: 'WolfyScript 4.19.0 メジャーアップデート',
              date: '2025年4月16日',
              description: 'WU 4.19への大規模アップデートと非推奨コードの削除を実施。このメジャーアップデートでは、古いAPIの削除と新しい機能の追加が含まれています。',
              sections: [
                {
                  type: 'breaking',
                  title: '破壊的変更',
                  items: [
                    'WU 4.19への更新と非推奨コードの削除',
                    '古いプラグインAPIの廃止'
                  ]
                },
                {
                  type: 'features',
                  title: 'テスト',
                  items: [
                    'テストサーバーを1.21.5に更新',
                    '自動テストスイートの追加'
                  ]
                }
              ]
            },
            {
              id: '3',
              slug: '4-18-5',
              version: '4.18.5',
              title: 'パフォーマンス最適化アップデート',
              date: '2025年4月10日',
              description: 'サーバーパフォーマンスの大幅な改善を実施しました。',
              sections: [
                {
                  type: 'performance',
                  title: 'パフォーマンス改善',
                  items: [
                    'メモリ使用量を20%削減',
                    'レスポンス時間を30%短縮',
                    'データベースクエリの最適化'
                  ]
                },
                {
                  type: 'security',
                  title: 'セキュリティ修正',
                  items: [
                    'XSS脆弱性の修正',
                    '認証システムの強化'
                  ]
                }
              ]
            },
            {
              id: '4',
              slug: '4-18-4',
              version: '4.18.4',
              title: 'バグ修正とUI改善',
              date: '2025年4月5日',
              description: 'ユーザーインターフェースの改善と重要なバグ修正を行いました。',
              sections: [
                {
                  type: 'fixes',
                  title: 'バグ修正',
                  items: [
                    'アイテム復旧機能の不具合を修正',
                    'チャット機能の表示エラーを解決'
                  ]
                },
                {
                  type: 'features',
                  title: 'UI改善',
                  items: [
                    '管理パネルのレスポンシブデザイン対応',
                    'ダークモードの改善'
                  ]
                }
              ]
            },
            {
              id: '5',
              slug: '4-18-3',
              version: '4.18.3',
              title: 'セキュリティアップデート',
              date: '2025年3月28日',
              description: 'セキュリティの強化と安定性の向上を実施しました。',
              sections: [
                {
                  type: 'security',
                  title: 'セキュリティ',
                  items: [
                    'ログイン機能の多要素認証対応',
                    'API エンドポイントの保護強化'
                  ]
                }
              ]
            }
          ];
          setPatchNotes(samplePatchNotes);
        }
      } catch (error) {
        console.error('Error fetching patch notes:', error);
        setPatchNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatchNotes();
  }, []);

  // セクションのスタイル取得
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'fixes':
        return '🔧';
      case 'features':
        return '✨';
      case 'breaking':
        return '⚠️';
      case 'performance':
        return '⚡';
      case 'security':
        return '🔒';
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
      case 'breaking':
        return 'text-red-600';
      case 'performance':
        return 'text-yellow-600';
      case 'security':
        return 'text-purple-600';
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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b8064] mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
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
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#5b8064] transition-colors duration-200">
                            ・{patchNote.version}
                          </h2>
                        </Link>
                        <span className="text-sm text-gray-500">
                          {patchNote.date}
                        </span>
                      </div>
                      
                      {/* タイトル */}
                      <Link href={`/patch-notes/${patchNote.slug || patchNote.id}`}>
                        <h3 className="text-lg font-medium text-[#5b8064] mb-3 hover:text-[#4a6952] transition-colors duration-200">
                          {patchNote.title}
                        </h3>
                      </Link>
                      
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
