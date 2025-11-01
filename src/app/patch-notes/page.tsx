import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllPatchNotes } from '@/lib/patch-notes';

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

export default async function PatchNotesArchive() {
  const allPatchNotes = await getAllPatchNotes();
  const patchNotes = allPatchNotes || [];
  
  const currentPage = 1;
  const itemsPerPage = 10;

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
          {currentPatchNotes.length > 0 ? (
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

        </section>
      </main>
    </div>
  );
}
