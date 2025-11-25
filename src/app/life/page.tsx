import ContentListPage from '@/components/ContentListPage';
import { getLifeFiles, ContentData } from '../../../lib/content';

const config = {
    title: '建築・居住',
    description: '「自分の場所を持つ」ことに特化した情報です',
    apiEndpoint: '/api/life',
    basePath: '/life',
    icon: 'home' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyIcon: '🏠',
    emptyMessage: '建築・居住に関する記事がありません',
    pageTitle: '建築・居住 | Ineサーバー',
    backButtonText: '建築・居住一覧に戻る',
    enableGrouping: true,
    groupLabels: {
        protection: '保護',
        land: '土地',
        other: 'その他'
    }
};

export default async function HousingLifePage() {
    const filesData = await getLifeFiles();

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
