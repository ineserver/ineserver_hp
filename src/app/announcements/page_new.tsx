import ContentListPage from '@/components/ContentListPage';

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

export default function AnnouncementsPage() {
  return <ContentListPage config={config} />;
}
