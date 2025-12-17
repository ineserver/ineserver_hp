import ContentArticlePage from '@/components/ContentArticlePage';
import { getEconomyData, getEconomyFiles } from '../../../../lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const config = {
  title: '経済',
  description: 'サーバー内の経済システムや職業について説明します',
  apiEndpoint: '/api/economy',
  basePath: '/economy',
  icon: 'cash' as const,
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  loadingColor: 'border-blue-600',
  emptyIcon: '💰',
  emptyMessage: '経済に関する記事がありません',
  pageTitle: '経済',
  backButtonText: '経済一覧に戻る'
};

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
  const files = await getEconomyFiles();
  return files.map((file) => ({
    slug: file.id,
  }));
}

// OGP情報の生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const contentData = await getEconomyData(slug);

  if (!contentData) {
    return {
      title: 'ページが見つかりません | いねさば',
      description: 'お探しのページは見つかりませんでした。',
    };
  }

  // 本文から数行抜粋（descriptionがない場合）
  const getTextExcerpt = (htmlContent: string): string => {
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    const lines = textContent.split('\n').filter(line => line.trim().length > 0);
    const excerpt = lines.slice(0, 3).join(' ').substring(0, 150);
    return excerpt + (excerpt.length >= 150 ? '...' : '');
  };

  const title = `${contentData.title || '経済'} | いねさば`;
  const description = contentData.description || getTextExcerpt(contentData.contentHtml || contentData.content || '');
  const image = contentData.image as string | undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ineserver.net/economy/${slug}`,
      siteName: 'いねさば',
      ...(image && {
        images: [
          {
            url: image,
            alt: contentData.title || '経済記事画像',
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

export default async function EconomyArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentData = await getEconomyData(slug);

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
    image: contentData.image as string | undefined,
  };

  return <ContentArticlePage config={config} content={content} showToc={true} />;
}

