import { notFound } from 'next/navigation';
import { getEntertainmentData } from '../../../../lib/content';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default async function EntertainmentPage({ params }: PageProps) {
  const { id } = await params;
  const entertainment = await getEntertainmentData(id);

  if (!entertainment) {
    notFound();
  }

  // カテゴリの色を取得する関数
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'games':
        return 'bg-purple-100 text-purple-800';
      case 'events':
        return 'bg-yellow-100 text-yellow-800';
      case 'contests':
        return 'bg-red-100 text-red-800';
      case 'sports':
        return 'bg-blue-100 text-blue-800';
      case 'activities':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* メインコンテンツ */}
        <article className="bg-white rounded-lg shadow-lg p-8">
          {/* ヘッダー */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle((entertainment as any).category)}`}>
                娯楽
              </span>
              {(entertainment as any).category && (
                <span className="text-gray-500 text-sm">
                  {(entertainment as any).category}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {(entertainment as any).title}
            </h1>
            
            {(entertainment as any).description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {(entertainment as any).description}
              </p>
            )}
          </header>

          {/* 本文 */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: entertainment.contentHtml }}
          />
        </article>
      </div>
    </div>
  );
}
