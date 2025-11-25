import ContentListPage from '@/components/ContentListPage';
import { getServerGuideFiles, ContentData } from '../../../lib/content';

const config = {
    title: 'サーバーガイド',
    description: '「まずはここから」という必読情報をまとめます',
    apiEndpoint: '/api/server-guide',
    basePath: '/server-guide',
    icon: 'bullhorn' as const,
    color: 'text-[#5b8064]',
    bgColor: 'bg-[#5b8064]/10',
    borderColor: 'border-[#5b8064]/20',
    loadingColor: 'border-[#5b8064]',
    emptyIcon: '📢',
    emptyMessage: 'サーバーガイドの記事がありません',
    pageTitle: 'サーバーガイド | Ineサーバー',
    backButtonText: 'サーバーガイド一覧に戻る',
    enableGrouping: true,
    groupLabels: {
        rule: 'ルール・規約',
        protection: '保護',
        other: 'その他'
    }
};

export default async function ServerGuidePage() {
    const filesData = await getServerGuideFiles();

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

    return (
        <ContentListPage config={config} content={content}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="text-center text-[#5b8064] font-bold text-sm">＼まずはここから／</div>
                    <a href="/tutorial" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#5b8064] transition-all duration-200 group h-full">
                        <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">🔰</span>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#5b8064] transition-colors">チュートリアル</h3>
                        </div>
                        <p className="text-gray-600 text-sm">サーバーへの参加方法や最初のステップを解説します。</p>
                    </a>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm invisible hidden md:block">Spacer</div>
                    <a href="/lp" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#5b8064] transition-all duration-200 group h-full">
                        <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">✨</span>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#5b8064] transition-colors">サーバー紹介 (LP)</h3>
                        </div>
                        <p className="text-gray-600 text-sm">いねさばの魅力や特徴をまとめた紹介ページです。</p>
                    </a>
                </div>
                <a href="/guide" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#5b8064] transition-all duration-200 group md:col-span-2">
                    <div className="flex items-center mb-2">
                        <span className="mr-3">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="guidePageIconGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#3b82f6" />
                                        <stop offset="1" stopColor="#a21caf" />
                                    </linearGradient>
                                </defs>
                                <path stroke="url(#guidePageIconGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#5b8064] transition-colors">いねさばの歩き方</h3>
                    </div>
                    <p className="text-gray-600 text-sm">いねさば独自のよく使われる機能まとめ一覧的なページ</p>
                </a>
            </div>
        </ContentListPage>
    );
}
