import ContentArticlePage from '@/components/ContentArticlePage';

const config = {
  title: '交通',
  description: 'サーバー内の交通システムや移動手段について説明します',
  apiEndpoint: '/api/transportation',
  basePath: '/transportation',
  icon: 'subway' as const,
  color: 'text-indigo-600',
  bgColor: 'bg-indigo-50',
  borderColor: 'border-indigo-200',
  loadingColor: 'border-indigo-600',
  emptyIcon: '🚄',
  emptyMessage: '交通に関する記事がありません',
  pageTitle: '交通・運輸',
  backButtonText: '交通一覧に戻る'
};

export default function TransportationArticlePage() {
  return <ContentArticlePage config={config} />;
}
