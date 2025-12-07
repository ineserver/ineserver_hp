import ContentArticlePage from '@/components/ContentArticlePage';
import { getAdventureData, getAdventureFiles } from '../../../../lib/content';
import { notFound } from 'next/navigation';

const config = {
    title: '娯楽',
    description: '「遊ぶ・楽しむ」要素をまとめます',
    apiEndpoint: '/api/adventure',
    basePath: '/adventure',
    icon: 'gamepad' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    loadingColor: 'border-purple-600',
    emptyIcon: '🎮',
    emptyMessage: '娯楽に関する記事がありません',
    pageTitle: '娯楽',
    backButtonText: '娯楽一覧に戻る'
};

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
    const files = await getAdventureFiles();
    return files.map((file) => ({
        slug: file.id,
    }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function AdventureArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const contentData = await getAdventureData(slug);

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

