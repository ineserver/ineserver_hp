import ContentListPage from '@/components/ContentListPage';
import { getAnnouncementFiles, ContentData } from '../../../lib/content';

const config = {
  title: 'お知らせ',
  description: 'サーバーの最新情報やアップデート情報をお届けします',
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

export default async function AnnouncementsPage() {
  const filesData = await getAnnouncementFiles();
  
  const content = filesData.map((item: ContentData) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    date: item.date || '',
    content: item.contentHtml || '',
    category: item.category,
  }));
  
  return <ContentListPage config={config} content={content} />;
}
