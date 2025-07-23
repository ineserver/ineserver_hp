import ContentArticlePage from '@/components/ContentArticlePage';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

const config = {
  title: '経済',
  description: 'サーバー内の経済システムや通貨について説明します',
  apiEndpoint: '/api/economy',
  basePath: '/economy',
  icon: faCoins,
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  loadingColor: 'border-blue-600',
  emptyIcon: '💰',
  backButtonText: '経済一覧に戻る'
};

export default function EconomyArticlePage() {
  return <ContentArticlePage config={config} />;
}
