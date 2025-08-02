import ContentListPage from '@/components/ContentListPage';

const config = {
  title: "交通案内",
  description: "鉄道路線やバス、その他の交通手段に関する情報をご覧いただけます。",
  apiEndpoint: "/api/transportation",
  basePath: "/transportation",
  icon: 'subway' as const,
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  loadingColor: 'border-blue-600',
  emptyIcon: '🚇',
  emptyMessage: '交通案内に関するコンテンツがまだありません。',
  pageTitle: '交通案内 | Ineサーバー',
  backButtonText: '交通案内一覧に戻る'
};

export default function TransportationPage() {
  return <ContentListPage config={config} />;
}
