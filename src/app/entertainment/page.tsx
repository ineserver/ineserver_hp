import ContentListPage from '@/components/ContentListPage';
import { getEntertainmentFiles } from '../../../lib/content';

const config = {
  title: 'エンタメ',
  description: 'サーバー内のエンターテイメントやイベントについて紹介します',
  apiEndpoint: '/api/entertainment',
  basePath: '/entertainment',
  icon: 'gamepad' as const,
  color: 'text-purple-600',
  bgColor: 'bg-purple-50',
  borderColor: 'border-purple-200',
  loadingColor: 'border-purple-600',
  emptyIcon: '🎮',
  emptyMessage: 'エンターテイメントに関するコンテンツがまだありません。',
  pageTitle: 'エンターテイメント | Ineサーバー',
  backButtonText: 'エンタメ一覧に戻る'
};

export default async function EntertainmentPage() {
  const filesData = await getEntertainmentFiles();
  
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
