import ContentListPage from '@/components/ContentListPage';

const config = {
  title: 'ライフスタイル',
  description: 'サーバー内での日々の生活や遊び方について紹介します',
  apiEndpoint: '/api/lifestyle',
  basePath: '/lifestyle',
  icon: 'home' as const,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  loadingColor: 'border-green-600',
  emptyIcon: '🏠',
  emptyMessage: 'ライフスタイル情報がまだありません。',
  pageTitle: 'ライフスタイル | Ineサーバー',
  backButtonText: 'ライフスタイル一覧に戻る'
};

export default function LifestylePage() {
  return <ContentListPage config={config} />;
}
