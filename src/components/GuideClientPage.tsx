'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { ContentData } from '../../lib/content';
import { trackGuideCardClick, trackGuideCtaClick, trackExternalLink } from '@/lib/analytics';

type CategoryKey = 'life' | 'economy' | 'adventure' | 'transport';

// 記事の added（追加した日）・updated（内容を更新した日）がこの日数以内なら NEW・更新の印を付ける
const RECENT_DAYS = 30;

interface Freshness {
    kind: 'new' | 'updated';
    date: string;
}

// date・today はどちらも YYYY-MM-DD
const isRecent = (date: unknown, today: string): date is string => {
    if (typeof date !== 'string') return false;
    const days = (Date.parse(today) - Date.parse(date)) / 86_400_000;
    return days >= 0 && days <= RECENT_DAYS;
};

function getFreshness(item: ContentData, today: string): Freshness | null {
    // 追加した後に更新しても、追加から日が浅いうちは NEW のまま
    if (isRecent(item.added, today)) return { kind: 'new', date: item.added };
    if (isRecent(item.updated, today)) return { kind: 'updated', date: item.updated };
    return null;
}

interface LastChange {
    label: '追加' | '更新';
    date: string;
}

// added・updated のうち新しいほう
function getLastChange(item: ContentData): LastChange | null {
    const added = typeof item.added === 'string' ? item.added : null;
    const updated = typeof item.updated === 'string' ? item.updated : null;
    if (updated && (!added || updated >= added)) return { label: '更新', date: updated };
    return added ? { label: '追加', date: added } : null;
}

const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return `${year}年${month}月${day}日`;
};

const formatShortDate = (date: string) => {
    const [, month, day] = date.split('-').map(Number);
    return `${month}/${day}`;
};

// withDate を付けると「10/6更新」「11/2追加」のように日付入りで出す
const FreshBadge = ({ freshness: { kind, date }, withDate = false }: { freshness: Freshness; withDate?: boolean }) => (
    <span className={`inline-block flex-shrink-0 min-w-[2.5rem] text-center text-[10px] font-bold leading-none whitespace-nowrap rounded px-1.5 py-1 ${kind === 'new' ? 'bg-[#5b8064] text-white' : 'bg-amber-100 text-amber-700'}`}>
        {withDate
            ? `${formatShortDate(date)}${kind === 'new' ? '追加' : '更新'}`
            : kind === 'new' ? 'NEW' : '更新'}
    </span>
);

interface GuideSectionProps {
    title: string;
    icon: React.ReactElement;
    items: ContentData[];
    basePath: string;
    today: string;
}

// 個別のカードコンポーネント
function GuideCard({ item, basePath, today }: { item: ContentData; basePath: string; today: string }) {
    const imageUrl = typeof item.image === 'string' ? item.image : null;
    const category = basePath.replace('/', '');
    const freshness = getFreshness(item, today);
    const lastChange = getLastChange(item);

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
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5b8064] transition-colors">
                            {item.title}
                        </h3>
                        {freshness && <span className="mt-1"><FreshBadge freshness={freshness} /></span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow line-clamp-3">
                        {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-400">
                            {lastChange && `${formatDate(lastChange.date)} ${lastChange.label}`}
                        </span>
                        <span className="flex items-center text-[#5b8064] font-medium opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            読む
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

const GuideSection = ({ title, icon, items, basePath, today }: GuideSectionProps) => items.length === 0 ? null : (
    <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-[#5b8064]/10 text-[#5b8064]">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <GuideCard key={item.id} item={item} basePath={basePath} today={today} />
            ))}
        </div>
    </div>
);

interface ResolvedArticle {
    item: ContentData;
    href: string;
    freshness: Freshness | null;
}

const outlineIcon = (...paths: string[]) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {paths.map(d => <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />)}
    </svg>
);

// 「やりたいことから探す」の項目（カテゴリ/記事ID）。image は見出しの背景
const PURPOSES: { icon: React.ReactElement; image: string; title: string; refs: string[] }[] = [
    {
        icon: outlineIcon('M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'),
        image: 'https://img.1necat.net/839b6d5d9584120e81c4fb874ad780d8.jpg',
        title: 'お金を稼ぎたい', refs: ['life/jobs', 'economy/market', 'economy/shop', 'economy/marker'],
    },
    {
        icon: outlineIcon('M13 10V3L4 14h7v7l9-11h-7z'),
        image: 'https://img.1necat.net/2025-12-07_15.49.58.png',
        title: '強くなりたい', refs: ['life/mcmmo', 'adventure/tessera', 'adventure/absolute'],
    },
    {
        icon: outlineIcon('M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'),
        image: 'https://img.1necat.net/2026-07-31_20.33.47.png',
        title: '遊びたい', refs: ['adventure/horse-racing', 'adventure/arena'],
    },
    {
        icon: outlineIcon('M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'),
        image: 'https://img.1necat.net/2025-11-29_01.41.15.png',
        title: '集めたい', refs: ['adventure/additems', 'adventure/hide-item', 'adventure/achivements'],
    },
    {
        icon: outlineIcon('M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'),
        image: 'https://img.1necat.net/2025-11-25_03.28.38.png',
        title: '家を建てたい', refs: ['economy/land-purchase', 'life/land-protection', 'life/block-protection', 'life/trilogy', 'life/imageflame'],
    },
    {
        icon: outlineIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'),
        image: 'https://img.1necat.net/2025-11-29_15.24.15.png',
        title: '街づくりをしたい', refs: ['life/address', 'transport/road', 'transport/rail', 'life/trilogy'],
    },
    {
        icon: outlineIcon('M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'),
        image: 'https://img.1necat.net/2025-11-29_15.50.03.png',
        title: '人と交流したい', refs: ['life/chat', 'life/mail', 'life/status'],
    },
    {
        icon: outlineIcon(
            'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        ),
        image: 'https://img.1necat.net/2025-12-07_16.25.56.png',
        title: 'もっと便利にしたい', refs: ['life/sort', 'life/exp', 'economy/buycommand'],
    },
];

function PurposeTile({ icon, image, title, articles }: { icon: React.ReactElement; image: string; title: string; articles: ResolvedArticle[] }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="relative h-28 bg-gray-100">
                <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-4 bottom-3 flex items-center gap-2 text-white">
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                    </div>
                    <h3 className="text-lg font-bold">{title}</h3>
                </div>
            </div>
            <ul className="p-5 pt-3 space-y-1">
                {articles.map(({ item, href, freshness }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            onClick={() => trackGuideCardClick(item.title || '', 'purpose', href)}
                            className="group flex items-center justify-between gap-2 px-2 py-2 -mx-2 rounded-lg text-sm text-gray-700 hover:bg-[#5b8064]/10 hover:text-[#5b8064] transition-colors"
                        >
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>{item.title}</span>
                                {freshness && <FreshBadge freshness={freshness} withDate />}
                            </span>
                            <svg className="w-4 h-4 flex-shrink-0 text-gray-300 group-hover:text-[#5b8064] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const DividerLabel = ({ label }: { label: string }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gray-200" />
        <h2 className="text-sm font-bold text-gray-500 tracking-wider">{label}</h2>
        <div className="h-px flex-1 bg-gray-200" />
    </div>
);

interface GuideClientPageProps {
    lifeFiles: ContentData[];
    economyFiles: ContentData[];
    adventureFiles: ContentData[];
    transportFiles: ContentData[];
    // 日本時間の今日（YYYY-MM-DD）
    today: string;
}

export default function GuideClientPage({ lifeFiles, economyFiles, adventureFiles, transportFiles, today }: GuideClientPageProps) {
    const filesByCategory: Record<CategoryKey, ContentData[]> = {
        life: lifeFiles,
        economy: economyFiles,
        adventure: adventureFiles,
        transport: transportFiles,
    };

    // 記事が削除・非公開になっていたら表示しない
    const resolve = (ref: string): ResolvedArticle | null => {
        const [category, id] = ref.split('/') as [CategoryKey, string];
        const item = filesByCategory[category]?.find(file => file.id === id);
        return item ? { item, href: `/${ref}`, freshness: getFreshness(item, today) } : null;
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-6xl mx-auto">
                    {/* ヘッダーセクション */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">いねさばの歩き方</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            いねさばの独自機能や遊び方をまとめたガイドです
                        </p>
                    </div>

                    {/* やりたいことから探す */}
                    <section className="mb-16">
                        <DividerLabel label="やりたいことから探す" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {PURPOSES.map(({ icon, image, title, refs }) => (
                                <PurposeTile
                                    key={title}
                                    icon={icon}
                                    image={image}
                                    title={title}
                                    articles={refs.flatMap(ref => resolve(ref) ?? [])}
                                />
                            ))}
                        </div>
                    </section>

                    <DividerLabel label="カテゴリから探す" />

                    <GuideSection
                        title="くらし"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                        items={lifeFiles}
                        basePath="/life"
                        today={today}
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
                        today={today}
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
                        today={today}
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
                        today={today}
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
