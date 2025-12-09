'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { ContentData } from '../../lib/content';
import { trackGuideCardClick, trackGuideCtaClick, trackExternalLink } from '@/lib/analytics';

interface GuideSectionProps {
    title: string;
    icon: React.ReactElement;
    items: ContentData[];
    basePath: string;
}

// 個別のカードコンポーネント
function GuideCard({ item, basePath }: { item: ContentData; basePath: string }) {
    const imageUrl = typeof item.image === 'string' ? item.image : null;
    const category = basePath.replace('/', '');

    return (
        <Link
            href={`${basePath}/${item.id}`}
            className="group h-full"
            onClick={() => trackGuideCardClick(item.title || '', category, `${basePath}/${item.id}`)}
        >
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-[#5b8064]/50 hover:-translate-y-1 flex flex-col overflow-hidden active:scale-[0.98]">
                {imageUrl && (
                    <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                        <Image
                            src={imageUrl}
                            alt={item.title || ''}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#5b8064] transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow line-clamp-3">
                        {item.description}
                    </p>
                    <div className="mt-4 flex items-center text-[#5b8064] text-xs font-medium opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        読む
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

const GuideSection = ({ title, icon, items, basePath }: GuideSectionProps) => (
    <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-[#5b8064]/10 text-[#5b8064]">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <GuideCard key={item.id} item={item} basePath={basePath} />
            ))}
        </div>
    </div>
);

interface GuideClientPageProps {
    lifeFiles: ContentData[];
    economyFiles: ContentData[];
    adventureFiles: ContentData[];
    transportFiles: ContentData[];
}

export default function GuideClientPage({ lifeFiles, economyFiles, adventureFiles, transportFiles }: GuideClientPageProps) {
    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-6xl mx-auto">
                    {/* ヘッダーセクション */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">ガイド</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            いねさばでの生活をより楽しむためのガイドブックです。
                        </p>
                    </div>

                    <GuideSection
                        title="くらし"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                        items={lifeFiles}
                        basePath="/life"
                    />

                    <GuideSection
                        title="経済"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        }
                        items={economyFiles}
                        basePath="/economy"
                    />

                    <GuideSection
                        title="娯楽"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        items={adventureFiles}
                        basePath="/adventure"
                    />

                    <GuideSection
                        title="交通"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        }
                        items={transportFiles}
                        basePath="/transport"
                    />

                    {/* フッターセクション */}
                    <div className="mt-20 text-center">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">お困りですか？</h3>
                            <p className="text-gray-600 mb-8">
                                ガイドを見ても解決しない場合は、Q&Aやチュートリアルを確認するか、<br className="hidden sm:block" />
                                Discordサーバーやゲーム内でスタッフにお気軽にお声がけください。
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/qa"
                                    onClick={() => trackGuideCtaClick('qa')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-[#5b8064] text-white rounded-xl hover:bg-[#4a6b51] font-medium transition-colors shadow-lg shadow-[#5b8064]/20 active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Q&Aを見る
                                </Link>
                                <Link
                                    href="/tutorial"
                                    onClick={() => trackGuideCtaClick('tutorial')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors shadow-lg shadow-gray-900/20 active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    チュートリアルを見る
                                </Link>
                                <a
                                    href="https://discord.gg/tdefsEKYhp"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { trackGuideCtaClick('discord'); trackExternalLink('discord', 'https://discord.gg/tdefsEKYhp'); }}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] font-medium transition-colors shadow-lg shadow-[#5865F2]/20 active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                    </svg>
                                    Discordに参加する
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
