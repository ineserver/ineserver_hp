import { notFound } from 'next/navigation';
import { getTransportationData } from '../../../../lib/content';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default async function TransportationPage({ params }: PageProps) {
  const { id } = await params;
  const transportation = await getTransportationData(id);

  if (!transportation) {
    notFound();
  }

  // カテゴリの色を取得する関数
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'trains':
        return 'bg-blue-100 text-blue-800';
      case 'roads':
        return 'bg-gray-100 text-gray-800';
      case 'boats':
        return 'bg-cyan-100 text-cyan-800';
      case 'teleport':
        return 'bg-purple-100 text-purple-800';
      case 'maps':
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle((transportation as any).category)}`}>
                交通
              </span>
              {(transportation as any).category && (
                <span className="text-gray-500 text-sm">
                  {(transportation as any).category}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {(transportation as any).title}
            </h1>
            
            {(transportation as any).description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {(transportation as any).description}
              </p>
            )}
          </header>

          {/* 路線図・地図 */}
          {(transportation as any).map_image && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">路線図・地図</h3>
              <img 
                src={(transportation as any).map_image} 
                alt="路線図・地図"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}

          {/* 本文 */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: transportation.contentHtml }}
          />
        </article>
      </div>
    </div>
  );
}
