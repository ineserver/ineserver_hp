import ContentListPage from '@/components/ContentListPage';
import { getLifestyleFiles } from '../../../lib/content';

const config = {
  title: '生活・くらし',
  description: 'サーバー内での日々の生活や遊び方について紹介します',
  apiEndpoint: '/api/lifestyle',
  basePath: '/lifestyle',
  icon: 'home' as const,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  loadingColor: 'border-green-600',
  emptyIcon: '🏠',
  emptyMessage: '生活・くらし情報がまだありません。',
  pageTitle: '生活・くらし | Ineサーバー',
  backButtonText: '生活・くらし一覧に戻る',
  enableGrouping: true,
  groupLabels: {
    rule: 'サーバールール',
    protection: '保護',
    other: 'その他'
  }
};

export default async function LifestylePage() {
  const filesData = await getLifestyleFiles();
  
  // contentHtml を content に変換
  const content = filesData.map((item: any) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    date: item.date || '',
    content: item.contentHtml,
    category: item.category,
    type: item.type,
  }));
  
  return <ContentListPage config={config} content={content} />;
}
