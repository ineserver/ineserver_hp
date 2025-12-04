"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import ServerStatus from "@/components/ServerStatus";


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

export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    image?: string;
}

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
}

export default function HomePageClient({
    announcements,
    currentEvents,
    latestPatchNote
}: HomePageClientProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // タブのref
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const containerRef = useRef<HTMLDivElement>(null); // モバイルプルダウン用
    const scrollContainerRef = useRef<HTMLDivElement>(null); // ナビゲーションスクロール用

    // ナビゲーションスクロール関数
    const scrollNav = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
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

    const defaultSlide = {
        id: 'default',
        title: "いねさばへようこそ",
        subtitle: "自由な生活、無限の可能性",
        description: "忙しい日常離れ、もう一つの「居場所」をあなたに。",
        image: "https://img.1necat.net/2025-11-29_15.48.01.png",
        link: "/lp"
    };

    const slides = currentEvents.length > 0
        ? currentEvents.map(event => ({
            id: event.id,
            title: event.title,
            subtitle: "開催中のイベント",
            description: event.description,
            image: event.image || defaultSlide.image,
            link: `/announcements/${event.id}`
        }))
        : [defaultSlide];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000); // 5秒から8秒に変更
        return () => clearInterval(timer);
    }, [slides.length]);

    // キーボードナビゲーション
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                prevSlide();
            } else if (event.key === 'ArrowRight') {
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [slides.length, nextSlide, prevSlide]);

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

    // イベントの状態を取得する関数
    const getEventStatus = (startDate: string, endDate: string) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return 'upcoming'; // 開催予定
        } else if (now >= start && now <= end) {
            return 'ongoing'; // 開催中
        } else {
            return 'ended'; // 終了
        }
    };



    // イベント期間を表示用にフォーマットする関数
    const formatEventPeriod = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startStr = start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        return `${startStr} - ${endStr}`;
    };
    return (
        <>
            {/* カルーセルスライダー */}
            <div className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden -mt-14 lg:-mt-28">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                            }`}
                    >
                        <Link href={slide.link} className="block w-full h-full cursor-pointer">
                            <div
                                className="h-full flex relative overflow-hidden"
                                style={{
                                    backgroundImage: `url('${slide.image}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {/* 背景画像のオーバーレイ（グラデーション） */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>



                                <div className="absolute bottom-10 left-4 right-4 lg:bottom-14 lg:right-20 lg:left-auto z-20 flex justify-center lg:justify-end pointer-events-none">
                                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 shadow-2xl w-full lg:w-[33vw] pointer-events-auto transform transition-all hover:scale-[1.02]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {slide.id !== 'default' && (
                                                    <>
                                                        {/* ステータスバッジ */}
                                                        {(() => {
                                                            // slideオブジェクトにstatusがない場合は計算する (defaultSlide以外)
                                                            const event = currentEvents.find(e => e.id === slide.id);
                                                            const status = event ? getEventStatus(event.startDate, event.endDate) : null;

                                                            if (status === 'ongoing') {
                                                                return (
                                                                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                                        開催中
                                                                    </span>
                                                                );
                                                            } else if (status === 'upcoming') {
                                                                return (
                                                                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                                        開催予定
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}

                                                        {/* 開催期間 */}
                                                        {(() => {
                                                            const event = currentEvents.find(e => e.id === slide.id);
                                                            if (event) {
                                                                return (
                                                                    <span className="text-white/80 text-xs font-mono">
                                                                        {formatEventPeriod(event.startDate, event.endDate)}
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </>
                                                )}
                                                {slide.id === 'default' && (
                                                    <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                        ご案内
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h2 className="text-lg lg:text-3xl font-black text-white mb-1 lg:mb-2 leading-tight drop-shadow-md">
                                            {slide.title}
                                        </h2>

                                        <p className="text-xs lg:text-base text-white/90 line-clamp-2 mb-2 lg:mb-4 leading-relaxed">
                                            {slide.description}
                                        </p>

                                        <div className="flex items-center justify-end">
                                            <div className="inline-flex items-center gap-2 text-white font-bold text-sm group cursor-pointer">
                                                <span className="group-hover:underline decoration-2 underline-offset-4">詳細を見る</span>
                                                <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}


            </div>

            {/* 新しいナビゲーション: 画像＋タイトル (カルーセルの外、境界部分に配置) */}
            {slides.length > 1 && (
                <div className="relative z-30 -mt-8 lg:-mt-10 flex justify-center items-center px-4 mb-8">
                    <div className="bg-[#1a1a1a] rounded-2xl p-1 border border-white/10 shadow-lg flex items-center gap-2 w-full lg:max-w-6xl mx-auto">
                        {/* 左スクロールボタン (モバイルのみ) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); scrollNav('left'); }}
                            className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-white/20 hover:text-white transition-colors lg:hidden flex-shrink-0"
                            aria-label="Previous slides"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div
                            ref={scrollContainerRef}
                            className="flex space-x-3 overflow-x-auto w-full no-scrollbar px-3 py-1 scroll-smooth"
                        >
                            {slides.map((slide, index) => {
                                const event = currentEvents.find(e => e.id === slide.id);
                                const status = event ? getEventStatus(event.startDate, event.endDate) : null;

                                return (
                                    <button
                                        key={slide.id}
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                                        className={`flex items-center space-x-2 bg-black/40 backdrop-blur-md border transition-all duration-300 rounded-lg p-1 pr-3 cursor-pointer flex-shrink-0 group flex-1 min-w-[150px] lg:min-w-[200px] ${index === currentSlide
                                            ? 'border-white/80 bg-black/70 shadow-xl'
                                            : 'border-white/20 hover:bg-black/50 hover:border-white/50'
                                            }`}
                                    >
                                        <div className="relative">
                                            <div
                                                className="w-8 h-8 lg:w-12 lg:h-8 rounded-md bg-cover bg-center shadow-sm"
                                                style={{ backgroundImage: `url('${slide.image}')` }}
                                            ></div>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-xs font-bold whitespace-nowrap ${index === currentSlide ? 'text-white' : 'text-white/70'
                                                }`}>
                                                {slide.title}
                                            </span>
                                            <span className="text-[10px] text-white/50 font-mono">
                                                {status === 'ongoing' ? '開催中' : status === 'upcoming' ? '開催予定' : ''}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 右スクロールボタン (モバイルのみ) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); scrollNav('right'); }}
                            className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-white/20 hover:text-white transition-colors lg:hidden flex-shrink-0"
                            aria-label="Next slides"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* メインコンテンツ */}
            <main className={`max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mb-7 ${slides.length <= 1 ? 'mt-8' : ''}`}>
                {/* イベントグリッド (既存のまま維持) */}


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
                                    {filteredAnnouncements.length > 0 ? (
                                        filteredAnnouncements.map((announcement) => (
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
                                        ))
                                    ) : (
                                        // お知らせが見つからない場合
                                        <div className="p-6 text-center text-gray-500">
                                            お知らせがありません
                                        </div>
                                    )}
                                </div>

                                {/* もっと見るボタン */}
                                <div className="p-6 border-t border-gray-200 text-center">
                                    <Link href={`/announcements?filter=${activeTab}`}>
                                        <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                                            もっと見る
                                            <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
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
