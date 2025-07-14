"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: 'important' | 'normal' | 'pickup';
  description: string;
}

interface PatchNote {
  id: string;
  slug?: string;
  version: string;
  title: string;
  date: string;
  description: string;
  sections: {
    type: 'fixes' | 'features' | 'breaking' | 'performance' | 'security';
    title: string;
    items: string[];
  }[];
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [latestPatchNote, setLatestPatchNote] = useState<PatchNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatchNoteLoading, setIsPatchNoteLoading] = useState(true);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  
  // タブのref
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // タブのアニメーション用
  const tabs = [
    { id: 'all', label: 'すべて' },
    { id: 'important', label: '重要なお知らせ' },
    { id: 'normal', label: 'お知らせ' },
    { id: 'pickup', label: 'ピックアップ' }
  ];
  
  // インジケーターの位置を更新
  const updateIndicator = (tabId: string) => {
    const activeButton = tabRefs.current[tabId];
    const container = containerRef.current;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      });
    }
  };
  
  // タブが変更されたときにインジケーターを更新
  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab]);
  
  // 初期ロード時にインジケーターをセット
  useEffect(() => {
    const timer = setTimeout(() => {
      updateIndicator(activeTab);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  const slides = [
    {
      id: 1,
      title: "いねさばへようこそ",
      description: "Minecraftサーバーで楽しい時間を過ごしましょう",
      image: "/server-icon.png",
      bgColor: "bg-gradient-to-r from-green-400 to-blue-500"
    },
    {
      id: 2,
      title: "みんなで建築しよう",
      description: "クリエイティブな建築を楽しもう",
      image: "/server-icon.png",
      bgColor: "bg-gradient-to-r from-purple-400 to-pink-500"
    },
    {
      id: 3,
      title: "コミュニティ",
      description: "仲間と一緒に冒険しよう",
      image: "/server-icon.png",
      bgColor: "bg-gradient-to-r from-orange-400 to-red-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 初期データの設定（CMSから取得する前のフォールバック）
  useEffect(() => {
    // CMSからお知らせデータを取得
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/announcements');
        if (response.ok) {
          const cmsAnnouncements = await response.json();
          // CMSデータをフロントエンド用の形式に変換
          const formattedAnnouncements = cmsAnnouncements.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            date: new Date(item.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            type: item.type || 'normal'
          }));
          setAnnouncements(formattedAnnouncements);
        } else {
          // CMSからの取得に失敗した場合は静的データを使用
          console.warn('Failed to fetch announcements from CMS, using static data');
          setAnnouncements(staticAnnouncements);
        }
      } catch (error) {
        // エラーが発生した場合は静的データを使用
        console.warn('Error fetching announcements from CMS:', error);
        setAnnouncements(staticAnnouncements);
      } finally {
        setIsLoading(false);
      }
    };

    const staticAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'サーバーメンテナンスのお知らせ',
        description: '7月15日（火）午前2時～午前6時の間、サーバーメンテナンスを実施いたします。',
        date: '2025年7月13日',
        type: 'important'
      },
      {
        id: '2',
        title: '夏季イベント開催中！',
        description: '夏祭りイベントを開催しています。期間限定アイテムをゲットしよう！',
        date: '2025年7月10日',
        type: 'pickup'
      },
      {
        id: '3',
        title: '新しいエリアがオープンしました',
        description: '新しい建築エリアが追加されました。ぜひ遊びに来てください！',
        date: '2025年7月8日',
        type: 'normal'
      },
      {
        id: '4',
        title: 'ルール更新のお知らせ',
        description: 'サーバールールの一部を更新いたしました。詳細をご確認ください。',
        date: '2025年7月5日',
        type: 'normal'
      },
      {
        id: '5',
        title: 'アップデート実施のお知らせ',
        description: '新機能の追加に伴うアップデートを実施いたします。',
        date: '2025年7月3日',
        type: 'important'
      },
      {
        id: '6',
        title: 'コミュニティイベント参加者募集',
        description: '建築コンテストの参加者を募集中です。豪華賞品をご用意！',
        date: '2025年7月1日',
        type: 'pickup'
      }
    ];

    // パッチノートデータを取得
    const fetchPatchNotes = async () => {
      try {
        setIsPatchNoteLoading(true);
        const response = await fetch('/api/patch-notes');
        if (response.ok) {
          const result = await response.json();
          const cmsPatchNotes = result.data || result;
          if (Array.isArray(cmsPatchNotes) && cmsPatchNotes.length > 0) {
            setLatestPatchNote(cmsPatchNotes[0]); // 最新の1件のみ
          }
        } else {
          // CMSからの取得に失敗した場合のサンプルデータ
          const samplePatchNote: PatchNote = {
            id: '1',
            slug: '4-19-0-1',
            version: '4.19.0.1',
            title: 'WolfyScript 4.19.0.1 アップデート',
            date: '2025年4月25日',
            description: 'サーバーの安定性向上とバグ修正を含むアップデートを実施しました。',
            sections: [
              {
                type: 'fixes',
                title: 'バグ修正',
                items: [
                  'CCPlayerDataが利用不可時のデフォルト値設定を修正',
                  'プロトコルライブラリ機能の無効化処理を修正'
                ]
              },
              {
                type: 'performance',
                title: 'パフォーマンス改善',
                items: [
                  'CI/CDパイプラインのコミット詳細リンク修正'
                ]
              }
            ]
          };
          setLatestPatchNote(samplePatchNote);
        }
      } catch (error) {
        console.error('Error fetching patch notes:', error);
        // エラー時のフォールバック
        const fallbackPatchNote: PatchNote = {
          id: '1',
          version: '4.19.0.1',
          title: 'WolfyScript 4.19.0.1 アップデート',
          date: '2025年4月25日',
          description: 'サーバーの安定性向上とバグ修正を含むアップデートを実施しました。',
          sections: [
            {
              type: 'fixes',
              title: 'バグ修正',
              items: [
                'CCPlayerDataが利用不可時のデフォルト値設定を修正',
                'プロトコルライブラリ機能の無効化処理を修正'
              ]
            }
          ]
        };
        setLatestPatchNote(fallbackPatchNote);
      } finally {
        setIsPatchNoteLoading(false);
      }
    };

    fetchAnnouncements();
    fetchPatchNotes();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
      case 'breaking':
        return '⚠️';
      case 'performance':
        return '⚡';
      case 'security':
        return '🔒';
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
      case 'breaking':
        return 'text-red-600';
      case 'performance':
        return 'text-yellow-600';
      case 'security':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  // 手動更新機能
  const refreshAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const cmsAnnouncements = await response.json();
        const formattedAnnouncements = cmsAnnouncements.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: new Date(item.date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          type: item.type || 'normal'
        }));
        setAnnouncements(formattedAnnouncements);
      }
    } catch (error) {
      console.warn('Error refreshing announcements:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* カルーセルスライダー */}
      <div className="relative w-full h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`${slide.bgColor} h-full flex items-center justify-center`}>
              <div className="text-center text-white px-4 max-w-4xl">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={120}
                  height={120}
                  className="mx-auto mb-8 rounded-lg shadow-lg"
                />
                <h2 className="text-6xl font-black mb-6">{slide.title}</h2>
                <p className="text-2xl font-medium">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* 前へボタン */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full transition-all duration-200 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* 次へボタン */}
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full transition-all duration-200 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* インディケーター */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                index === currentSlide 
                  ? 'bg-white border-white shadow-lg' 
                  : 'bg-transparent border-white border-opacity-60 hover:border-opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* お知らせセクション */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            {/* ヘッダー */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">お知らせ</h2>
                <button
                  onClick={refreshAnnouncements}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b8064] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg 
                    className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  更新
                </button>
              </div>
              
              {/* タブナビゲーション */}
              <div className="flex items-center justify-between">
                <div ref={containerRef} className="relative flex bg-gray-100 rounded-lg p-1">
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
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                        activeTab === tab.id 
                          ? 'text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {!isLoading && (
                  <span className="text-sm text-gray-500">
                    {filteredAnnouncements.length}件のお知らせ
                  </span>
                )}
              </div>
            </div>
            
            {/* お知らせリスト */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                // ローディング状態
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">お知らせを読み込み中...</p>
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-32">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-full ${getTagStyle(announcement.type)}`}>
                          {getTagName(announcement.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Link href={`/announcements/${announcement.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-[#5b8064] cursor-pointer transition-colors duration-200">
                              {announcement.title}
                            </h3>
                          </Link>
                          <span className="text-sm text-gray-500">{announcement.date}</span>
                        </div>
                        <p className="mt-2 text-gray-600 text-sm">
                          {announcement.description}
                        </p>
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
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                  もっと見る
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* パッチノートセクション */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* ヘッダー */}
              <div className="bg-gradient-to-r from-[#5b8064] to-[#4a6b55] px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">パッチノート</h2>
                    <p className="text-green-100 mt-1">最新のアップデート情報</p>
                  </div>
                  <Link href="/patch-notes">
                    <button className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      アーカイブ
                    </button>
                  </Link>
                </div>
              </div>

              {/* パッチノート内容 */}
              <div className="p-8">
                {isPatchNoteLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b8064] mx-auto"></div>
                    <p className="mt-2 text-gray-500">パッチノートを読み込み中...</p>
                  </div>
                ) : latestPatchNote ? (
                  <div>
                    {/* バージョンヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <h3 className="text-xl font-bold text-gray-900">{latestPatchNote.version}</h3>
                        <span className="ml-3 text-sm text-gray-500">by WolfyScript on {latestPatchNote.date}</span>
                      </div>
                      <Link href={`/patch-notes/${latestPatchNote.slug || latestPatchNote.id}`}>
                        <button className="text-[#5b8064] hover:text-[#4a6b55] text-sm font-medium transition-colors duration-200">
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
                                <span className="mr-2 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    パッチノートがありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
