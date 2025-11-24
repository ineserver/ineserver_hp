import ContentArticlePage from '@/components/ContentArticlePage';
import { getLifestyleData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
  title: '生活・くらし',
  description: 'サーバーでの生活に関する情報やルールについて説明します',
  apiEndpoint: '/api/lifestyle',
  basePath: '/lifestyle',
  icon: 'home' as const,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  loadingColor: 'border-green-600',
  emptyIcon: '🏠',
  emptyMessage: '生活に関する記事がありません',
  pageTitle: '生活・エンターテイメント',
  backButtonText: '生活・くらし一覧に戻る'
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LifestyleArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentData = await getLifestyleData(slug);

  if (!contentData) {
    notFound();
  }

  // contentDataをContentItem型に変換
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

