import { notFound } from 'next/navigation';
import { getAnnouncementData } from '../../../../lib/content';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default async function AnnouncementPage({ params }: PageProps) {
  const { id } = await params;
  const announcement = await getAnnouncementData(id);

  if (!announcement) {
    notFound();
  }

  // タグの色を取得する関数
  const getTagStyle = (type: string) => {
    switch (type) {
      case 'important':
        return 'bg-red-100 text-red-800';
      case 'pickup':
        return 'bg-blue-100 text-blue-800';
      case 'normal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // タグの表示名を取得する関数
  const getTagName = (type: string) => {
    switch (type) {
      case 'important':
        return '重要なお知らせ';
      case 'pickup':
        return 'ピックアップ';
      case 'normal':
        return 'お知らせ';
      default:
        return 'お知らせ';
    }
  };

  const formattedDate = new Date((announcement as any).date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTagStyle((announcement as any).type)}`}>
              {getTagName((announcement as any).type)}
            </span>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {(announcement as any).title}
          </h1>
          
          {(announcement as any).description && (
            <p className="mt-4 text-lg text-gray-600">
              {(announcement as any).description}
            </p>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: (announcement as any).contentHtml }}
          />
        </div>
      </main>
    </div>
  );
}
