'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentArticlePageProps {
  config: ContentPageConfig;
}

export default function ContentArticlePage({ config }: ContentArticlePageProps) {
  const params = useParams();
  const slug = params.slug as string;
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 初期状態を false に変更
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${config.apiEndpoint}/${slug}`, { next: { revalidate: 60 } });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          setError('記事が見つかりませんでした');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('記事の読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    }
  }, [slug, config.apiEndpoint]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* スケルトンローディング */}
          <div className="animate-pulse">
            {/* ブレッドクラム */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-1"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            
            {/* ヘッダー */}
            <header className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="flex items-center">
                <div className="h-4 bg-gray-200 rounded w-4 mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </header>
            
            {/* コンテンツ */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">記事が見つかりません</h3>
            <p className="text-gray-600">{error}</p>
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
