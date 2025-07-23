import ContentArticlePage from '@/components/ContentArticlePage';

const config = {
  title: '観光',
  description: 'サーバー内の見どころや観光スポットについて紹介します',
  apiEndpoint: '/api/tourism',
  basePath: '/tourism',
  icon: 'map' as const,
  color: 'text-orange-600',
  bgColor: 'bg-orange-50',
  borderColor: 'border-orange-200',
  loadingColor: 'border-orange-600',
  emptyIcon: '🗺️',
  backButtonText: '観光一覧に戻る'
};

export default function TourismArticlePage() {
  return <ContentArticlePage config={config} />;
}
