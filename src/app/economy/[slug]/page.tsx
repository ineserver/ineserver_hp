import ContentArticlePage from '@/components/ContentArticlePage';
import { getEconomyData, getEconomyFiles } from '../../../../lib/content';
import { notFound } from 'next/navigation';

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

