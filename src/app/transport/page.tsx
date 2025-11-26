import ContentListPage from '@/components/ContentListPage';
import { getTransportFiles, ContentData } from '../../../lib/content';

const config = {
    title: '交通',
    apiEndpoint: '/api/transport',
    basePath: '/transport',
    icon: 'map' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyMessage: '交通に関する記事がありません',
    pageTitle: '交通 | Ineサーバー',
    backButtonText: '交通一覧に戻る',
    enableGrouping: false
};

export default async function TransportPage() {
    const filesData = await getTransportFiles();

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
