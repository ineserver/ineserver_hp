import ContentArticlePage from '@/components/ContentArticlePage';
import { getServerGuideData } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
    title: 'サーバーガイド',
    description: '「まずはここから」という必読情報をまとめます',
    apiEndpoint: '/api/server-guide',
    basePath: '/server-guide',
    icon: 'bullhorn' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    loadingColor: 'border-blue-600',
    emptyIcon: '📢',
    emptyMessage: 'サーバーガイドの記事がありません',
    pageTitle: 'サーバーガイド',
    backButtonText: 'サーバーガイド一覧に戻る'
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function ServerGuideArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const contentData = await getServerGuideData(slug);

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
