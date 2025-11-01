import ContentArticlePage from '@/components/ContentArticlePage';
import { getAnnouncementData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

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
    title: (contentData as any).title || '',
    description: (contentData as any).description || '',
    date: (contentData as any).date || '',
    content: contentData.content,
    category: (contentData as any).category,
  };
  
  return <ContentArticlePage config={config} content={content} />;
}
