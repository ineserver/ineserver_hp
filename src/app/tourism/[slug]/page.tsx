import ContentArticlePage from '@/components/ContentArticlePage';
import { getTourismData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
  title: '観光',
  description: 'サーバー内の見どころや観光スポットについて紹介します',
  apiEndpoint: '/api/tourism',
  basePath: '/tourism',
  icon: 'map' as const,
  color: 'text-orange-600',
  bgColor: 'bg-orange-50',
  borderColor: 'border-orange-200',
  loadingColor: 'border-orange-600',
  emptyIcon: '🗺️',
  emptyMessage: '観光に関する記事がありません',
  pageTitle: '観光・都市開発',
  backButtonText: '観光一覧に戻る'
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TourismArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const contentData = await getTourismData(slug);
  
  if (!contentData) {
    notFound();
  }
  
  const content = {
    id: contentData.id,
    title: (contentData as any).title || '',
    description: (contentData as any).description || '',
    date: (contentData as any).date || '',
    content: contentData.content,
    category: (contentData as any).category,
  };
  
  return <ContentArticlePage config={config} content={content} showToc={true} />;
}
