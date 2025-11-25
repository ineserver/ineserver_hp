import ContentListPage from '@/components/ContentListPage';
import { getAdventureFiles, ContentData } from '../../../lib/content';

const config = {
    title: '冒険・娯楽',
    description: '「遊ぶ・楽しむ」要素をまとめます',
    apiEndpoint: '/api/adventure',
    basePath: '/adventure',
    icon: 'gamepad' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyIcon: '🎮',
    emptyMessage: '冒険・娯楽に関する記事がありません',
    pageTitle: '冒険・娯楽 | Ineサーバー',
    backButtonText: '冒険・娯楽一覧に戻る',
    enableGrouping: false
};

export default async function AdventurePage() {
    const filesData = await getAdventureFiles();

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
