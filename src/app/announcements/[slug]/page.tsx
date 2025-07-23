import ContentArticlePage from '@/components/ContentArticlePage';

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
  backButtonText: 'お知らせ一覧に戻る'
};

export default function AnnouncementArticlePage() {
  return <ContentArticlePage config={config} />;
}
