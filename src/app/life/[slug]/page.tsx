import ContentArticlePage from '@/components/ContentArticlePage';
import { getLifeData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
    title: 'くらし',
    description: '「自分の場所を持つ」ことに特化した情報です',
    apiEndpoint: '/api/life',
    basePath: '/life',
    icon: 'home' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyIcon: '🏠',
    emptyMessage: 'くらしに関する記事がありません',
    pageTitle: 'くらし',
    backButtonText: 'くらし一覧に戻る'
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function HousingLifeArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const contentData = await getLifeData(slug);

    if (!contentData) {
        notFound();
    }

    const content = {
        id: contentData.id,
        title: contentData.title || '',
        description: contentData.description || '',
        date: contentData.date || '',
        content: contentData.content || '',
        category: contentData.category,
        image: contentData.image as string | undefined,
    };

    return <ContentArticlePage config={config} content={content} showToc={true} />;
}
