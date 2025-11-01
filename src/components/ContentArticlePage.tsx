import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentArticlePageProps {
  config: ContentPageConfig;
  content: ContentItem | null;
}

export default function ContentArticlePage({ config, content }: ContentArticlePageProps) {
  if (!content) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">記事が見つかりません</h3>
            <p className="text-gray-600">指定された記事は存在しません</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: config.title, href: config.basePath },
    { label: content.title }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-900">{content.title}</h1>
            {content.category && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {content.category}
              </span>
            )}
          </div>
          {content.description && (
            <p className="text-xl text-gray-600 leading-relaxed">{content.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500 mt-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {content.date}
          </div>
        </header>

        {/* コンテンツ */}
        <article className="max-w-none">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </article>

        {/* フッター */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              href={config.basePath}
              className={`inline-flex items-center ${config.color} font-medium transition-colors duration-200`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {config.backButtonText}
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
