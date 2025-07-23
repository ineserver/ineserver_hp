import ContentArticlePage from '@/components/ContentArticlePage';

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
  backButtonText: 'エンタメ一覧に戻る'
};

export default function EntertainmentArticlePage() {
  return <ContentArticlePage config={config} />;
}
