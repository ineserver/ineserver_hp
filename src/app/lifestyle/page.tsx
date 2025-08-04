import ContentListPage from '@/components/ContentListPage';

const config = {
  title: '生活・くらし',
  description: 'サーバー内での日々の生活や遊び方について紹介します',
  apiEndpoint: '/api/lifestyle',
  basePath: '/lifestyle',
  icon: 'home' as const,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  loadingColor: 'border-green-600',
  emptyIcon: '🏠',
  emptyMessage: '生活・くらし情報がまだありません。',
  pageTitle: '生活・くらし | Ineサーバー',
  backButtonText: '生活・くらし一覧に戻る'
};

export default function LifestylePage() {
  return <ContentListPage config={config} />;
}
