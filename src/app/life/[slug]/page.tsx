import ContentArticlePage from '@/components/ContentArticlePage';
import { getLifeData, getLifeFiles } from '../../../../lib/content';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

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

// 静的生成: ビルド時に全ページを事前生成
export async function generateStaticParams() {
    const files = await getLifeFiles();
    return files.map((file) => ({
        slug: file.id,
    }));
}

// OGP情報の生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const contentData = await getLifeData(slug);

    if (!contentData) {
        return {
            title: 'ページが見つかりません',
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

    const pageTitle = contentData.title || 'くらし';
    const title = `${pageTitle} | いねさば`;
    const description = contentData.description || getTextExcerpt(contentData.contentHtml || contentData.content || '');
    const image = contentData.image as string | undefined;

    return {
        title: pageTitle,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://ineserver.net/life/${slug}`,
            siteName: 'いねさば',
            ...(image && {
                images: [
                    {
                        url: image,
                        alt: contentData.title || 'くらし記事画像',
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

