import ContentArticlePage from '@/components/ContentArticlePage';
import { getServerGuideData, getServerGuideFiles } from '../../../../lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
    const files = await getServerGuideFiles();
    return files.map((file) => ({
        slug: file.id,
    }));
}

// OGP情報の生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const contentData = await getServerGuideData(slug);

    if (!contentData) {
        return {
            title: 'ページが見つかりません | いねさば',
            description: 'お探しのページは見つかりませんでした。',
        };
    }

    // 本文から数行抜粋（descriptionがない場合）
    const getTextExcerpt = (htmlContent: string): string => {
        const textContent = htmlContent
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        
        const lines = textContent.split('\n').filter(line => line.trim().length > 0);
        const excerpt = lines.slice(0, 3).join(' ').substring(0, 150);
        return excerpt + (excerpt.length >= 150 ? '...' : '');
    };

    const title = `${contentData.title || 'サーバーガイド'} | いねさば`;
    const description = contentData.description || getTextExcerpt(contentData.contentHtml || contentData.content || '');
    const image = contentData.image as string | undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://ineserver.net/server-guide/${slug}`,
            siteName: 'いねさば',
            ...(image && {
                images: [
                    {
                        url: image,
                        alt: contentData.title || 'サーバーガイド記事画像',
                    },
                ],
            }),
        },
        twitter: {
            card: image ? 'summary_large_image' : 'summary',
            title,
            description,
            ...(image && {
                images: [image],
            }),
        },
    };
}

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

