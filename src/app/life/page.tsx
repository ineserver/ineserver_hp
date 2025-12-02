import ContentListPage from '@/components/ContentListPage';
import { getLifeFiles, ContentData } from '../../../lib/content';

const config = {
    title: 'くらし',
    apiEndpoint: '/api/life',
    basePath: '/life',
    icon: 'home' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyIcon: '🏠',
    emptyMessage: 'くらしに関する記事がありません',
    pageTitle: 'くらし | Ineサーバー',
    backButtonText: 'くらし一覧に戻る',
    enableGrouping: true,
    groupLabels: {
        protection: '保護',
        utility: '便利機能',
        guideline: 'ガイドライン',
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
