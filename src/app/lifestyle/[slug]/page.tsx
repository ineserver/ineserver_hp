import ContentArticlePage from '@/components/ContentArticlePage';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const config = {
  title: 'くらし・生活',
  description: 'サーバーでの生活に関する情報やルールについて説明します',
  apiEndpoint: '/api/lifestyle',
  basePath: '/lifestyle',
  icon: faHome,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  loadingColor: 'border-green-600',
  emptyIcon: '🏠',
  backButtonText: 'くらし・生活一覧に戻る'
};

export default function LifestyleArticlePage() {
  return <ContentArticlePage config={config} />;
}

