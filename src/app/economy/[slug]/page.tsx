import ContentArticlePage from '@/components/ContentArticlePage';

const config = {
  title: '経済',
  description: 'サーバー内の経済システムや通貨について説明します',
  apiEndpoint: '/api/economy',
  basePath: '/economy',
  icon: 'cash' as const,
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  loadingColor: 'border-blue-600',
  emptyIcon: '💰',
  emptyMessage: '経済に関する記事がありません',
  pageTitle: '経済',
  backButtonText: '経済一覧に戻る'
};

export default function EconomyArticlePage() {
  return <ContentArticlePage config={config} />;
}
