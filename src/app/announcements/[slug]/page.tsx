import ContentArticlePage from '@/components/ContentArticlePage';
import { getAnnouncementData, getAnnouncementFilesLight } from '../../../../lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const config = {
  title: 'お知らせ',
  description: 'サーバーの重要な情報やアップデート情報をお知らせします',
  apiEndpoint: '/api/announcements',
  basePath: '/announcements',
  icon: 'bullhorn' as const,
  color: 'text-red-600',
  bgColor: 'bg-red-50',
  borderColor: 'border-red-200',
  loadingColor: 'border-red-600',
  emptyIcon: '📢',
  emptyMessage: 'お知らせがまだありません。',
  pageTitle: 'お知らせ | Ineサーバー',
  backButtonText: 'お知らせ一覧に戻る'
};

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
  const files = getAnnouncementFilesLight();
  return files.map((file) => ({
    slug: file.id,
  }));
}

// OGP情報の生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contentData = await getAnnouncementData(slug);

  if (!contentData) {
    return {
      title: 'ページが見つかりません | いねさば',
      description: 'お探しのページは見つかりませんでした。',
    };
  }

  // 本文から数行抜粋（descriptionがない場合）
  const getTextExcerpt = (htmlContent: string): string => {
    // HTMLタグを除去
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    // 改行で分割して最初の数行を取得
    const lines = textContent.split('\n').filter(line => line.trim().length > 0);
    const excerpt = lines.slice(0, 3).join(' ').substring(0, 150);
    return excerpt + (excerpt.length >= 150 ? '...' : '');
  };

  const title = `${contentData.title || 'お知らせ'} | いねさば`;
  const description = contentData.description || getTextExcerpt(contentData.contentHtml || contentData.content || '');
  const image = contentData.image as string | undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ineserver.net/announcements/${slug}`,
      siteName: 'いねさば',
      ...(image && {
        images: [
          {
            url: image,
            alt: contentData.title || 'お知らせ画像',
          },
        ],
      }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && {
        images: [image],
      }),
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnnouncementArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentData = await getAnnouncementData(slug);

  if (!contentData) {
    notFound();
  }

  const content = {
    id: contentData.id,
    title: contentData.title || '',
    description: contentData.description || '',
    date: contentData.date || '',
    content: contentData.content || '',
    category: contentData.category,
  };

  return <ContentArticlePage config={config} content={content} showDate={true} />;
}

