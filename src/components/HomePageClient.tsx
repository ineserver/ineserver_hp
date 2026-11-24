"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import ServerStatus from "@/components/ServerStatus";
import EventSpotlight from "@/components/events/EventSpotlight";
import { ShowcaseEvent } from "@/components/events/eventUtils";


export interface Announcement {
    id: string;
    title: string;
    date: string;
    type: 'important' | 'normal' | 'pickup';
    description: string;
    eventStartDate?: string;
    eventEndDate?: string;
    image?: string;
}

export type Event = ShowcaseEvent;

export interface PatchNote {
    id: string;
    slug?: string;
    version: string;
    date: string;
    description: string;
    isLatest?: boolean;
    sections: {
        type: 'fixes' | 'features' | 'other';
        title: string;
        items: string[];
        itemsHtml?: string[];
    }[];
}

interface HomePageClientProps {
    announcements: Announcement[];
    currentEvents: Event[];
    latestPatchNote: PatchNote | null;
    renderedAt: number;
}

export default function HomePageClient({
    announcements,
    currentEvents,
    latestPatchNote,
    renderedAt
}: HomePageClientProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(false);

    // タブのref
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const containerRef = useRef<HTMLDivElement>(null); // モバイルプルダウン用
    const tabContainerRef = useRef<HTMLDivElement>(null); // PC版タブ用

    // タブのアニメーション用
    const tabs = [
        { id: 'all', label: 'すべて' },
        { id: 'important', label: '重要なお知らせ' },
        { id: 'normal', label: 'お知らせ' },
        { id: 'pickup', label: 'ピックアップ' }
    ];

    // インジケーターの位置を更新
    const updateIndicator = useCallback((tabId: string) => {
        const activeButton = tabRefs.current[tabId];
        const container = tabContainerRef.current; // PC版タブ用のrefを使用

        if (activeButton && container) {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            setIndicatorStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width
            });
        }
    }, []);

    // タブ切り替え関数
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        updateIndicator(tab);
        setIsDropdownOpen(false); // プルダウンを閉じる
        setIsAnnouncementsExpanded(false); // タブ切り替え時に折りたたむ
    };

    // プルダウンの開閉
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // プルダウンの外側クリック検出
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // タブが変更されたときにインジケーターを更新
    useEffect(() => {
        updateIndicator(activeTab);
    }, [activeTab, updateIndicator]);

    // 初期ロード時にインジケーターをセット
    useEffect(() => {
        const timer = setTimeout(() => {
            updateIndicator(activeTab);
        }, 200); // 少し時間を延ばして確実にレンダリング後に実行
        return () => clearTimeout(timer);
    }, [activeTab, updateIndicator]);

    // フィルタリング機能
    const filteredAnnouncements = announcements.filter(announcement => {
        if (activeTab === 'all') return true;
        if (activeTab === 'important') return announcement.type === 'important';
        if (activeTab === 'normal') return announcement.type === 'normal';
        if (activeTab === 'pickup') return announcement.type === 'pickup';
        return true;
    });

    // パッチノートセクションのスタイル取得
    const getSectionIcon = (type: string) => {
        switch (type) {
            case 'fixes':
                return '🔧';
            case 'features':
                return '✨';
            case 'other':
                return '⚙️';
            default:
                return '📝';
        }
    };

    const getSectionColor = (type: string) => {
        switch (type) {
            case 'fixes':
                return 'text-blue-600';
            case 'features':
                return 'text-green-600';
            case 'other':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    // タグの色を取得する関数
    const getTagStyle = (type: string) => {
        switch (type) {
            case 'important':
                return 'bg-red-100 text-red-800';
            case 'pickup':
                return 'bg-blue-100 text-blue-800';
            case 'normal':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // タグの表示名を取得する関数
    const getTagName = (type: string) => {
        switch (type) {
            case 'important':
                return '重要なお知らせ';
            case 'pickup':
                return 'ピックアップ';
            case 'normal':
                return 'お知らせ';
            default:
                return 'お知らせ';
        }
    };

    // お知らせカードをレンダリングする関数
    const renderAnnouncement = (announcement: Announcement) => (
        <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
            {/* モバイル表示 */}
            <div className="sm:hidden space-y-3">
                {/* タグと日付 */}
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTagStyle(announcement.type)}`}>
                        {getTagName(announcement.type)}
                    </span>
                    <span className="text-sm text-gray-500">{announcement.date}</span>
                </div>

                {/* タイトル */}
                <div>
                    <Link href={`/announcements/${announcement.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-[#5b8064] cursor-pointer transition-colors duration-200">
                            {announcement.title}
                        </h3>
                    </Link>
                </div>

                {/* 内容 */}
                <div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {announcement.description}
                    </p>
                </div>
            </div>

            {/* PC表示（従来通りの横並び形式） */}
            <div className="hidden sm:block">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                        {/* タグ */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTagStyle(announcement.type)} flex-shrink-0`}>
                            {getTagName(announcement.type)}
                        </span>

                        {/* タイトルと内容 */}
                        <div className="flex-1 min-w-0">
                            <Link href={`/announcements/${announcement.id}`}>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-[#5b8064] cursor-pointer transition-colors duration-200 mb-1">
                                    {announcement.title}
                                </h3>
                            </Link>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {announcement.description}
                            </p>
                        </div>
                    </div>

                    {/* 日付 */}
                    <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                        {announcement.date}
                    </span>
                </div>
            </div>
        </div>
    );
    return (
        <>
            {/* 開催中・開催予定のイベント */}
            <EventSpotlight events={currentEvents} renderedAt={renderedAt} />

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mb-7 mt-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* 左側: お知らせとパッチノート */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* お知らせセクション */}
                        <section>
                            <div className="bg-white rounded-lg border border-gray-200">
                                {/* ヘッダー */}
                                <div className="border-b border-gray-200 p-6">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900">お知らせ</h2>
                                    </div>

                                    {/* タブナビゲーション */}
                                    <div className="flex items-center justify-between">
                                        {/* デスクトップ版タブ */}
                                        <div ref={tabContainerRef} className="relative hidden sm:flex bg-gray-100 rounded-lg p-1 w-fit">
                                            {/* 移動するインジケーター */}
                                            <div
                                                className="absolute top-1 bottom-1 bg-[#5b8064] rounded-md transition-all duration-300 ease-out"
                                                style={{
                                                    left: `${indicatorStyle.left}px`,
                                                    width: `${indicatorStyle.width}px`,
                                                }}
                                            />

                                            {/* タブボタン */}
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    ref={(el) => { tabRefs.current[tab.id] = el; }}
                                                    onClick={() => handleTabChange(tab.id)}
                                                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                                        ? 'text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* モバイル版カスタムプルダウン */}
                                        <div className="sm:hidden w-full relative" ref={containerRef}>
                                            <button
                                                onClick={toggleDropdown}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5b8064] focus:border-[#5b8064] transition-all duration-200 flex items-center justify-between cursor-pointer"
                                            >
                                                <span>{tabs.find(tab => tab.id === activeTab)?.label || '選択してください'}</span>
                                                <svg
                                                    className={`w-5 h-5 text-[#5b8064] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* プルダウンメニュー */}
                                            <div className={`absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 ${isDropdownOpen
                                                ? 'opacity-100 translate-y-0 visible'
                                                : 'opacity-0 -translate-y-2 invisible'
                                                }`}>
                                                {tabs.map((tab, index) => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => handleTabChange(tab.id)}
                                                        className={`w-full px-4 py-3 text-left text-base font-medium transition-colors duration-200 cursor-pointer ${activeTab === tab.id
                                                            ? 'bg-[#5b8064] text-white'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#5b8064]'
                                                            } ${index === 0 ? 'rounded-t-lg' : ''
                                                            } ${index === tabs.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
                                                            }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <span className="text-sm text-gray-500 hidden sm:block">
                                            {filteredAnnouncements.length}件のお知らせ
                                        </span>
                                    </div>
                                </div>

                                {/* お知らせリスト */}
                                <div className="divide-y divide-gray-200">
                                    {filteredAnnouncements.slice(0, 5).length > 0 ? (
                                        filteredAnnouncements.slice(0, 5).map(renderAnnouncement)
                                    ) : (
                                        // お知らせが見つからない場合
                                        <div className="p-6 text-center text-gray-500">
                                            お知らせがありません
                                        </div>
                                    )}
                                </div>

                                {/* 折りたたみ部分（アニメーション） */}
                                {filteredAnnouncements.length > 5 && (
                                    <div className={`grid transition-all duration-500 ease-in-out ${isAnnouncementsExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="divide-y divide-gray-200 border-t border-gray-200">
                                                {filteredAnnouncements.slice(5, 10).map(renderAnnouncement)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* もっと見るボタン */}
                                <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                                    {filteredAnnouncements.length > 5 && (
                                        <button 
                                            onClick={() => setIsAnnouncementsExpanded(!isAnnouncementsExpanded)}
                                            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        >
                                            {isAnnouncementsExpanded ? '折りたたむ' : `さらに表示する (${Math.min(filteredAnnouncements.length, 10) - 5}件)`}
                                            <svg className={`ml-2 w-4 h-4 transition-transform duration-200 ${isAnnouncementsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                    <Link href={`/announcements?filter=${activeTab}`}>
                                        <button className="inline-flex items-center px-6 py-3 bg-[#5b8064] rounded-md text-sm font-medium text-white hover:bg-[#4a6b55] transition-colors duration-200 cursor-pointer">
                                            お知らせ一覧へ
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* パッチノートセクション */}
                        <section>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {/* ヘッダー */}
                                <div className="bg-white p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900">パッチノート</h2>
                                        <Link href="/patch-notes">
                                            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-300 cursor-pointer">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                                                </svg>
                                                アーカイブ
                                            </button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-600">最新のアップデート情報</p>
                                    </div>
                                </div>

                                {/* パッチノート内容 */}
                                <div className="divide-y divide-gray-200">
                                    {latestPatchNote ? (
                                        <div className="p-6">
                                            {/* ヘッダー */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center">
                                                    <h3 className="text-xl font-bold text-gray-900">{latestPatchNote.date}</h3>
                                                </div>
                                                <Link href={`/patch-notes/${latestPatchNote.slug || latestPatchNote.id}`}>
                                                    <button className="text-[#5b8064] hover:text-[#4a6b55] text-sm font-medium transition-colors duration-200 cursor-pointer">
                                                        詳細を見る →
                                                    </button>
                                                </Link>
                                            </div>

                                            {/* 説明 */}
                                            <p className="text-gray-600 mb-6">{latestPatchNote.description}</p>

                                            {/* セクション一覧 */}
                                            <div className="space-y-4">
                                                {latestPatchNote.sections.map((section, index) => (
                                                    <div key={index}>
                                                        <h4 className={`flex items-center text-sm font-semibold mb-2 ${getSectionColor(section.type)}`}>
                                                            <span className="mr-2">{getSectionIcon(section.type)}</span>
                                                            {section.title}
                                                        </h4>
                                                        <ul className="space-y-1 ml-6">
                                                            {section.items.map((item, itemIndex) => (
                                                                <li key={itemIndex} className="text-sm text-gray-600 flex items-start">
                                                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                    <div
                                                                        className="prose prose-sm max-w-none text-gray-600"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: section.itemsHtml && section.itemsHtml[itemIndex]
                                                                                ? section.itemsHtml[itemIndex]
                                                                                : item
                                                                        }}
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            パッチノートがありません
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 右側: サーバーステータス */}
                    <div className="xl:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* サーバーステータス */}
                            <ServerStatus />
                        </div>
                    </div>
                </div>
            </main >
        </>
    );
}
