import ContentListPage from '@/components/ContentListPage';
import { getEconomyFiles, ContentData } from '../../../lib/content';

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
  emptyMessage: '経済に関するコンテンツがまだありません。',
  pageTitle: '経済 | Ineサーバー',
  backButtonText: '経済一覧に戻る',
  enableGrouping: true,
  groupLabels: {
    income: 'ineを貯める',
    expenditure: 'ineを使う',
    other: 'その他'
  }
};

export default async function EconomyPage() {
  const filesData = await getEconomyFiles();
  
  const content = filesData.map((item: ContentData) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    date: item.date || '',
    content: item.contentHtml || '',
    category: item.category,
    type: item.type,
  }));
  
  return <ContentListPage config={config} content={content} />;
}
