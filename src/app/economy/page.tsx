import ContentListPage from '@/components/ContentListPage';
import { getEconomyFiles, ContentData } from '../../../lib/content';

const config = {
  title: '経済・職業',
  description: 'サーバー内の経済システムや職業について説明します',
  apiEndpoint: '/api/economy',
  basePath: '/economy',
  icon: 'cash' as const,
  color: 'text-[#5b8064]',
  bgColor: 'bg-[#5b8064]/10',
  borderColor: 'border-[#5b8064]/20',
  loadingColor: 'border-[#5b8064]',
  emptyIcon: '💰',
  emptyMessage: '経済・職業に関するコンテンツがまだありません。',
  pageTitle: '経済・職業 | Ineサーバー',
  backButtonText: '経済・職業一覧に戻る',
  enableGrouping: true,
  groupLabels: {
    job: '職業',
    item: 'アイテム取引',
    license: '土地・ライセンス',
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
    externalLink: typeof item.externalLink === 'string' ? item.externalLink : undefined,
  }));

  return <ContentListPage config={config} content={content} />;
}
