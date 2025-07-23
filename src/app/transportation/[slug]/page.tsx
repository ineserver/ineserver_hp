import ContentArticlePage from '@/components/ContentArticlePage';
import { faSubway } from '@fortawesome/free-solid-svg-icons';

const config = {
  title: '交通',
  description: 'サーバー内の交通システムや移動手段について説明します',
  apiEndpoint: '/api/transportation',
  basePath: '/transportation',
  icon: faSubway,
  color: 'text-indigo-600',
  bgColor: 'bg-indigo-50',
  borderColor: 'border-indigo-200',
  loadingColor: 'border-indigo-600',
  emptyIcon: '🚄',
  backButtonText: '交通一覧に戻る'
};

export default function TransportationArticlePage() {
  return <ContentArticlePage config={config} />;
}
