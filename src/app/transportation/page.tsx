import ContentListPage from '@/components/ContentListPage';
import { faSubway } from '@fortawesome/free-solid-svg-icons';

const config = {
  title: "交通案内",
  description: "鉄道路線やバス、その他の交通手段に関する情報をご覧いただけます。",
  apiEndpoint: "/api/transportation",
  basePath: "/transportation",
  icon: faSubway,
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  loadingColor: 'border-blue-600',
  emptyIcon: '🚇',
  backButtonText: '交通案内一覧に戻る'
};

export default function TransportationPage() {
  return <ContentListPage config={config} />;
}
