import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { getPatchNoteBySlug, getAllPatchNotes } from '@/lib/patch-notes';
import { notFound } from 'next/navigation';

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
  const patchNotes = await getAllPatchNotes();
  return patchNotes.map((note) => ({
    slug: note.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatchNoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const patchNote = await getPatchNoteBySlug(slug);

  if (!patchNote) {
    notFound();
  }

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
    { label: patchNote.version || 'パッチノート詳細' }
  ];

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <article className="flex-grow max-w-4xl mx-auto px-6 py-8">
        {/* パッチノートヘッダー */}
        <header className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* 一覧に戻るボタン - モバイル優先で上部に配置 */}
          <div className="mb-6 -ml-4">
            <Link href="/patch-notes">
              <button className="flex items-center px-4 py-2 text-[#5b8064] hover:text-[#4a6b55] transition-colors duration-200 cursor-pointer">
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
                      className="text-gray-700 leading-relaxed prose-sm max-w-none markdown-content [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:list-none [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square]"
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
              <button className="w-full sm:w-auto px-6 py-3 bg-[#5b8064] text-white rounded-lg hover:bg-[#4a6b55] transition-colors duration-200 cursor-pointer">
                他のパッチノートを見る
              </button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
