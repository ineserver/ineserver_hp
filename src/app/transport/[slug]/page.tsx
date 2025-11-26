import ContentArticlePage from '@/components/ContentArticlePage';
import { getTransportData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
    title: 'ワールド・交通',
    description: '「場所」に関する情報はすべてここです',
    apiEndpoint: '/api/transport',
    basePath: '/transport',
    icon: 'map' as const,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    loadingColor: 'border-orange-600',
    emptyIcon: '🗺️',
    emptyMessage: 'ワールド・交通に関する記事がありません',
    pageTitle: 'ワールド・交通',
    backButtonText: 'ワールド・交通一覧に戻る'
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function TransportArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const contentData = await getTransportData(slug);

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
