'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

import Breadcrumb from '@/components/Breadcrumb';
import { ContentData } from '../../lib/content';

interface AnnouncementsClientPageProps {
    announcements: ContentData[];
}

type FilterType = 'all' | 'important' | 'pickup' | 'normal';
type SortType = 'date-desc' | 'date-asc';
type EventStatusFilterType = 'all' | 'ongoing' | 'upcoming' | 'ended';

export default function AnnouncementsClientPage({ announcements }: AnnouncementsClientPageProps) {
    const searchParams = useSearchParams();
    const initialFilter = (searchParams.get('filter') as FilterType) || 'all';

    const [filter, setFilter] = useState<FilterType>(initialFilter);
    const [sort, setSort] = useState<SortType>('date-desc');
    const [eventStatusFilter, setEventStatusFilter] = useState<EventStatusFilterType>('all');

    // URLのクエリパラメータが変更された場合にフィルタを更新
    useEffect(() => {
        const paramFilter = searchParams.get('filter') as FilterType;
        if (paramFilter && ['all', 'important', 'pickup', 'normal'].includes(paramFilter)) {
            setFilter(paramFilter);
        }
    }, [searchParams]);

    const breadcrumbItems = [
        { label: 'いねさば', href: '/' },
        { label: 'お知らせ' }
    ];

    // イベントの状態を取得する関数
    const getEventStatus = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return null;
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

    const filteredAndSortedAnnouncements = useMemo(() => {
        let result = [...announcements];

        // Filter
        if (filter !== 'all') {
            result = result.filter(item => {
                const type = (item.type as string) || 'normal';

                // Pickupの場合はサブフィルターも適用
                if (filter === 'pickup' && type === 'pickup' && eventStatusFilter !== 'all') {
                    const status = getEventStatus(item.eventStartDate as string, item.eventEndDate as string);
                    if (status !== eventStatusFilter) return false;
                }

                return type === filter;
            });
        }

        // Sort
        result.sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return sort === 'date-desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [announcements, filter, sort, eventStatusFilter]);

    const getTag = (type: string) => {
        switch (type) {
            case 'important':
                return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded mr-2 whitespace-nowrap">重要なお知らせ</span>;
            case 'pickup':
                return <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded mr-2 whitespace-nowrap">ピックアップ</span>;
            default:
                return <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded mr-2 whitespace-nowrap">お知らせ</span>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    };

    // イベント期間を表示用にフォーマットする関数
    const formatEventPeriod = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startStr = start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const endStr = end.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `${startStr} - ${endStr}`;
    };

    return (
        <div className="bg-white flex flex-col h-full">
            <Header />
            <Breadcrumb items={breadcrumbItems} />

            <article className="flex-grow w-full max-w-4xl mx-auto px-5 py-8">
                <header className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="text-red-600 mr-6">
                            {/* Using SVG directly or iconMap if available, assuming bullhorn for announcements */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z"></path>
                                <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.4v3.3M8 22h8"></path>
                            </svg>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">お知らせ</div>
                            <p className="text-gray-600">サーバーの最新情報やアップデート情報をお届けします</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    すべて
                                </button>
                                <button
                                    onClick={() => setFilter('important')}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'important' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
                                        }`}
                                >
                                    重要なお知らせ
                                </button>
                                <button
                                    onClick={() => setFilter('normal')}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'normal' ? 'bg-gray-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    お知らせ
                                </button>
                                <button
                                    onClick={() => setFilter('pickup')}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'pickup' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    ピックアップ
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">並び替え:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as SortType)}
                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-1"
                                >
                                    <option value="date-desc">新しい順</option>
                                    <option value="date-asc">古い順</option>
                                </select>
                            </div>
                        </div>

                        {/* Sub-filter for Pickup */}
                        {filter === 'pickup' && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-500 flex items-center mr-2">ステータス:</span>
                                <button
                                    onClick={() => setEventStatusFilter('all')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${eventStatusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    すべて
                                </button>
                                <button
                                    onClick={() => setEventStatusFilter('ongoing')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${eventStatusFilter === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    開催中
                                </button>
                                <button
                                    onClick={() => setEventStatusFilter('upcoming')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${eventStatusFilter === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    開催予定
                                </button>
                                <button
                                    onClick={() => setEventStatusFilter('ended')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${eventStatusFilter === 'ended' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    終了
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <section className="space-y-2">
                    {filteredAndSortedAnnouncements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            お知らせが見つかりませんでした。
                        </div>
                    ) : (
                        filteredAndSortedAnnouncements.map((item) => (
                            <div key={item.id} className="group">
                                <Link href={`/announcements/${item.id}`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <div className="flex items-center flex-shrink-0">
                                            {getTag(item.type as string || 'normal')}
                                            <span className="text-sm text-gray-500 font-mono mr-3">{formatDate(item.date)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-medium text-gray-900 group-hover:text-[#5b8064] transition-colors">
                                                {item.title}
                                            </span>
                                            {item.type === 'pickup' && typeof item.eventStartDate === 'string' && typeof item.eventEndDate === 'string' && (
                                                <span className="text-sm text-gray-500 mt-1">
                                                    開催期間: {formatEventPeriod(item.eventStartDate, item.eventEndDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <div className="border-b border-gray-100 mt-2 mx-2"></div>
                            </div>
                        ))
                    )}
                </section>
            </article>
        </div>
    );
}
