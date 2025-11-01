import ContentListPage from '@/components/ContentListPage';
import { getTourismFiles } from '../../../lib/content';

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
  emptyMessage: '観光に関するコンテンツがまだありません。',
  pageTitle: '観光 | Ineサーバー',
  backButtonText: '観光一覧に戻る'
};

export default async function TourismPage() {
  const filesData = await getTourismFiles();
  
  const content = filesData.map((item: any) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    date: item.date || '',
    content: item.contentHtml,
    category: item.category,
  }));
  
  return <ContentListPage config={config} content={content} />;
}
