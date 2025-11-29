"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import ServerStatus from "@/components/ServerStatus";
import { CashIcon, MapIcon, HomeIcon, ShieldIcon } from "@/components/Icons";

export interface Announcement {
    id: string;
    title: string;
    date: string;
    type: 'important' | 'normal' | 'pickup';
    description: string;
    eventStartDate?: string;
    eventEndDate?: string;
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

    const slides = [
        {
            id: 1,
            title: "経済システム",
            subtitle: "いねさばといえば、経済！",
            description: "17種類の職業・リアルタイムレートの物価と市場取引・地価システムでリアルな経済を体験",
            bgColor: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
            icon: "💰",
            features: ["17種類の職業", "リアルタイム市場取引", "地価システム"]
        },
        {
            id: 2,
            title: "都市開発",
            subtitle: "特徴を持った複数の市町村",
            description: "計画的な都市計画・各地の名産品・鉄道網と列車の自動運転で都市開発に参加しよう",
            bgColor: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600",
            icon: "🏙️",
            features: ["計画的な都市計画", "各地の名産品", "鉄道網・自動運転"]
        },
        {
            id: 3,
            title: "豊富な生活要素",
            subtitle: "様々な追加要素・やりこみ要素",
            description: "340種類を超える追加アイテム・McMMOシステム・最大4人のPvEアリーナで充実した生活を",
            bgColor: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600",
            icon: "🎮",
            features: ["340種類超の追加アイテム", "McMMOシステム", "PvEアリーナ"]
        },
        {
            id: 4,
            title: "安心・安全",
            subtitle: "充実したサポート体制",
            description: "地形・ブロック保護機能・透明性のある運営・即日サポート対応で安心してプレイできます",
            bgColor: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600",
            icon: "🛡️",
            features: ["保護機能完備", "透明性のある運営", "即日サポート対応"]
        }
    ];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
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
            } else if (event.key >= '1' && event.key <= '4') {
                const slideIndex = parseInt(event.key) - 1;
                if (slideIndex < slides.length) {
                    setCurrentSlide(slideIndex);
                }
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

    // イベント状態に応じた開始までの時間を計算する関数
    const getTimeToStart = (startDate: string) => {
        const start = new Date(startDate);
        const now = new Date();

        const diffTime = start.getTime() - now.getTime();
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        // 日付のみを比較するため、時刻を00:00:00に設定
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const dayDiffTime = startDateOnly.getTime() - nowDateOnly.getTime();
        const diffDays = Math.floor(dayDiffTime / (1000 * 60 * 60 * 24));

        return { diffDays, diffHours };
    };

    // 表示用のテキストを生成する関数
    const getStartTimeText = (startDate: string) => {
        const { diffDays, diffHours } = getTimeToStart(startDate);

        // 24時間以内の場合は時間表示
        if (diffHours >= 0 && diffHours < 24) {
            return `${diffHours}時間後開始`;
        }
        // 1日前（24時間以上48時間未満）の場合は「明日」
        else if (diffDays === 1) {
            return '明日開始';
        }
        // 2日以上先の場合は日数表示
        else if (diffDays >= 2) {
            return `${diffDays}日後開始`;
        }
        // 既に開始している場合
        else {
            return '開始済み';
        }
    };

    // イベント期間の残り日数を計算する関数
    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();

        // 日付のみを比較するため、時刻を00:00:00に設定
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const diffTime = endDateOnly.getTime() - nowDateOnly.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
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
            <div className="relative w-full h-[90vh] lg:h-[85vh] overflow-hidden -mt-14 lg:-mt-28">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                            }`}
                    >
                        <div
                            className="h-full flex relative overflow-hidden"
                            style={{
                                backgroundImage: slide.id === 1 ? `url('https://img.1necat.net/9f879fc11c65db9e9cfe536244c72546.jpg')` :
                                    slide.id === 2 ? `url('https://img.1necat.net/c1af2bfcb3a0004bb4c4b9c94b1a6dce.jpg')` :
                                        slide.id === 3 ? `url('https://img.1necat.net/839b6d5d9584120e81c4fb874ad780d8.jpg')` :
                                            slide.id === 4 ? `url('https://img.1necat.net/d23b15bc802aef4b645617eed52c2b51.jpg')` : '',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            {/* 背景画像のオーバーレイ（グラデーション） */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/50"></div>

                            {/* 左上: タイトルエリア */}
                            <div className="absolute top-20 left-4 right-4 lg:top-40 lg:left-16 lg:right-auto z-20 max-w-md lg:max-w-lg">
                                {/* モバイル版レイアウト */}
                                <div className="lg:hidden">
                                    {/* アイコンとタイトルを横並び */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-white drop-shadow-2xl flex-shrink-0">
                                            {slide.id === 1 && (
                                                <CashIcon className="w-14 h-14" />
                                            )}
                                            {slide.id === 2 && (
                                                <MapIcon className="w-14 h-14" />
                                            )}
                                            {slide.id === 3 && (
                                                <HomeIcon className="w-14 h-14" />
                                            )}
                                            {slide.id === 4 && (
                                                <ShieldIcon className="w-14 h-14" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-black text-white drop-shadow-2xl leading-tight">{slide.title}</h2>
                                        </div>
                                    </div>

                                    {/* 説明文 */}
                                    <p className="text-lg font-medium mb-4 text-white/95 drop-shadow-lg leading-relaxed">{slide.subtitle}</p>

                                    {/* 特徴リスト（タグ） */}
                                    <div className="flex flex-wrap gap-2">
                                        {slide.features.map((feature, idx) => (
                                            <div key={idx} className="bg-white/25 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/30 shadow-lg">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PC版レイアウト */}
                                <div className="hidden lg:block">
                                    {/* アイコンとタイトルを横並び */}
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="text-white drop-shadow-2xl flex-shrink-0">
                                            {slide.id === 1 && (
                                                <CashIcon className="w-20 h-20" />
                                            )}
                                            {slide.id === 2 && (
                                                <MapIcon className="w-20 h-20" />
                                            )}
                                            {slide.id === 3 && (
                                                <HomeIcon className="w-20 h-20" />
                                            )}
                                            {slide.id === 4 && (
                                                <ShieldIcon className="w-20 h-20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-4xl xl:text-5xl font-black mb-3 text-white drop-shadow-2xl leading-tight">{slide.title}</h2>
                                            <p className="text-xl font-semibold text-white/95 drop-shadow-lg">{slide.subtitle}</p>
                                        </div>
                                    </div>

                                    {/* 特徴リスト */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {slide.features.map((feature, idx) => (
                                            <div key={idx} className="bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium text-white border border-white/30 shadow-lg">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 右下: 情報エリア */}
                            <div className="absolute bottom-23 left-4 right-4 lg:bottom-24 lg:left-auto lg:right-20 z-20 text-center lg:text-right">
                                {/* モバイル版レイアウト */}
                                <div className="lg:hidden">
                                    {/* ボタン */}
                                    <div className="flex flex-col gap-3">
                                        <Link href="/tutorial">
                                            <button className="w-full bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold text-sm hover:from-green-600/90 hover:to-emerald-700/90 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-white/30 cursor-pointer">
                                                チュートリアルを見る
                                            </button>
                                        </Link>
                                        <Link href="/lp">
                                            <button
                                                className="w-full bg-transparent border-2 border-white/80 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-white/20 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                                            >
                                                詳しく見る
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                {/* PC版レイアウト（従来通り） */}
                                <div className="hidden lg:block lg:min-w-[450px]">
                                    {/* ボタン */}
                                    <div className="flex flex-col gap-3">
                                        <Link href="/tutorial">
                                            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-white/30 cursor-pointer">
                                                チュートリアルを見る
                                            </button>
                                        </Link>
                                        <Link href="/lp">
                                            <button
                                                className="w-full bg-transparent border-2 border-white/80 text-white px-6 py-3 rounded-lg font-bold text-base hover:bg-white/20 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                                            >
                                                詳しく見る
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}


                {/* モバイル版：従来通り中央部分に左右のボタンを配置 */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 slider-nav-btn lg:hidden cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 slider-nav-btn lg:hidden cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                </button>


                {/* PC版：インディケーターと左右のボタンを右側に配置 */}
                <div className="absolute bottom-8 right-20 hidden lg:flex items-center space-x-3">
                    {/* 前へボタン */}
                    <button
                        onClick={prevSlide}
                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 slider-nav-btn cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                        </svg>
                    </button>

                    {/* インディケーター */}
                    <div className="flex space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 border cursor-pointer ${index === currentSlide
                                    ? 'bg-white border-white scale-125'
                                    : 'bg-transparent border-white/60 hover:border-white hover:scale-110'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* 次へボタン */}
                    <button
                        onClick={nextSlide}
                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 slider-nav-btn cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                    </button>
                </div>

                {/* スクロール誘導アニメーション */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 lg:bottom-4">
                    <div className="flex flex-col items-center animate-bounce">
                        <div className="text-white/70 text-xs font-medium mb-1">SCROLL</div>
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* メインコンテンツ */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
                {/* イベント */}
                {currentEvents.length > 0 && (
                    <section className="mb-8">
                        <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-xl p-6 text-white overflow-hidden relative">
                            {/* 幾何学的な背景装飾 */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {/* 円形パターン1 */}
                                <div className="absolute top-6 left-10 w-24 h-24 opacity-10">
                                    <div className="w-full h-full border-2 border-white rounded-full"></div>
                                    <div className="absolute top-2 left-2 w-20 h-20 border border-white/50 rounded-full"></div>
                                    <div className="absolute top-4 left-4 w-16 h-16 border border-white/30 rounded-full"></div>
                                </div>

                                {/* 六角形パターン */}
                                <div className="absolute top-16 right-16 w-20 h-20 opacity-15">
                                    <div className="w-full h-full border-2 border-yellow-200 transform rotate-12"
                                        style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}>
                                    </div>
                                </div>

                                {/* 円形パターン2 */}
                                <div className="absolute bottom-12 left-20 w-28 h-28 opacity-12">
                                    <div className="w-full h-full border-2 border-pink-200 rounded-full transform rotate-45"></div>
                                    <div className="absolute top-3 left-3 w-22 h-22 border border-pink-200/60 rounded-full"></div>
                                </div>

                                {/* ダイヤモンドパターン */}
                                <div className="absolute bottom-20 right-12 w-16 h-16 opacity-15">
                                    <div className="w-full h-full border-2 border-blue-200 transform rotate-45 rounded-sm"></div>
                                    <div className="absolute top-2 left-2 w-12 h-12 border border-blue-200/50 transform rotate-45 rounded-sm"></div>
                                </div>

                                {/* 星形パターン */}
                                <div className="absolute top-32 left-6 w-12 h-12 opacity-20">
                                    <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                </div>

                                {/* 三角形パターン */}
                                <div className="absolute top-8 right-32 w-14 h-14 opacity-12">
                                    <div className="w-0 h-0 border-l-7 border-r-7 border-b-12 border-transparent border-b-yellow-200"></div>
                                </div>

                                {/* 小さな装飾要素 */}
                                <div className="absolute top-12 right-6 w-2 h-2 bg-white rounded-full opacity-25"></div>
                                <div className="absolute top-24 left-36 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-30"></div>
                                <div className="absolute bottom-16 left-8 w-2 h-2 bg-pink-200 rounded-full opacity-25"></div>
                                <div className="absolute bottom-8 right-28 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-30"></div>
                                <div className="absolute top-28 left-16 w-1 h-1 bg-white rounded-full opacity-35"></div>

                                {/* グラデーション装飾 */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
                                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-radial from-pink-200/8 to-transparent rounded-full"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        {/* PC版: 1行表示 */}
                                        <div className="hidden sm:block">
                                            <h2 className="text-2xl font-bold">イベント情報 <span className="text-lg font-normal text-white/80">　開催中・開催予定のイベント</span></h2>
                                        </div>

                                        {/* モバイル版: 2行表示 */}
                                        <div className="sm:hidden">
                                            <h2 className="text-2xl font-bold">イベント情報</h2>
                                            <p className="text-white/80 text-sm">開催中・開催予定のイベント</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                                        {currentEvents.length}件のイベント
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {currentEvents.map((event) => {
                                        const status = getEventStatus(event.startDate, event.endDate);
                                        const daysRemaining = getDaysRemaining(event.endDate);

                                        return (
                                            <div key={event.id} className="bg-white/15 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all duration-200 border border-white/20">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-bold text-white leading-tight flex-1">
                                                        {event.title}
                                                    </h3>
                                                    <div className="ml-3 flex-shrink-0">
                                                        {status === 'upcoming' ? (
                                                            <span className="bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                {getStartTimeText(event.startDate)}
                                                            </span>
                                                        ) : status === 'ongoing' ? (
                                                            daysRemaining > 0 ? (
                                                                <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                    残り{daysRemaining}日
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-400 text-red-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                    本日終了
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="bg-gray-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                終了
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                                                    {event.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-white/70 flex items-center space-x-2">
                                                        <span className="flex items-center">
                                                            {formatEventPeriod(event.startDate, event.endDate)}
                                                        </span>
                                                        {status === 'upcoming' && (
                                                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                                                                開催予定
                                                            </span>
                                                        )}
                                                        {status === 'ongoing' && (
                                                            <span className="bg-green-500/30 px-2 py-1 rounded-full text-xs">
                                                                開催中
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link href={`/announcements/${event.id}`}>
                                                        <button className="text-white hover:text-white/80 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 cursor-pointer">
                                                            <span>詳細を見る</span>
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                                            </svg>
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

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
                                    <Link href="/announcements">
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
            </main>
        </>
    );
}
