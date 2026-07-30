import ContentListPage from '@/components/ContentListPage';
import { getTransportFiles, ContentData } from '../../../lib/content';
import Link from 'next/link';

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
    backgroundImage: 'https://img.1necat.net/2025-11-28_02.41.46.png',
    enableGrouping: true,
    groupLabels: {
        sightseeing: '観光',
        guideline: 'ガイドライン',
        other: 'その他'
    }
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
        image: typeof item.image === 'string' ? item.image : undefined,
        externalLink: typeof item.externalLink === 'string' ? item.externalLink : undefined,
    }));

    return (
        <ContentListPage config={config} content={content}>
            <div className="py-2 pl-0 mb-4">
                <Link href="/transport/route_map" className="content-link">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-lg font-medium">鉄道路線図</span>
                </Link>
            </div>
        </ContentListPage>
    );
}

