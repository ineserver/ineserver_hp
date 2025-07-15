"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ServerStatus from "@/components/ServerStatus";

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
  isLatest?: boolean;
  sections: {
    type: 'fixes' | 'features' | 'other';
    title: string;
    items: string[];
    itemsHtml?: string[];
  }[];
}


export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [latestPatchNote, setLatestPatchNote] = useState<PatchNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatchNoteLoading, setIsPatchNoteLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState(false);
  const [patchNoteError, setPatchNoteError] = useState(false);
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
        setAnnouncementError(false);
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
          // CMSからの取得に失敗した場合はエラー状態を設定
          console.warn('Failed to fetch announcements from CMS');
          setAnnouncementError(true);
          setAnnouncements([]);
        }
      } catch (error) {
        // エラーが発生した場合はエラー状態を設定
        console.warn('Error fetching announcements from CMS:', error);
        setAnnouncementError(true);
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    // パッチノートデータを取得
    const fetchPatchNotes = async () => {
      try {
        setIsPatchNoteLoading(true);
        setPatchNoteError(false);
        const response = await fetch('/api/patch-notes');
        if (response.ok) {
          const result = await response.json();
          const cmsPatchNotes = result.data || result;
          if (Array.isArray(cmsPatchNotes) && cmsPatchNotes.length > 0) {
            setLatestPatchNote(cmsPatchNotes[0]); // 最新の1件のみ
          } else {
            setLatestPatchNote(null);
          }
        } else {
          // CMSからの取得に失敗した場合はエラー状態を設定
          console.warn('Failed to fetch patch notes from CMS');
          setPatchNoteError(true);
          setLatestPatchNote(null);
        }
      } catch (error) {
        console.error('Error fetching patch notes:', error);
        setPatchNoteError(true);
        setLatestPatchNote(null);
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

  // 手動更新機能
  const refreshAnnouncements = async () => {
    setIsLoading(true);
    setAnnouncementError(false);
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
      } else {
        setAnnouncementError(true);
        setAnnouncements([]);
      }
    } catch (error) {
      console.warn('Error refreshing announcements:', error);
      setAnnouncementError(true);
      setAnnouncements([]);
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
                  className="mx-auto mb-8 rounded-lg"
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
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        </button>
        
        {/* 次へボタン */}
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
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
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-white border-opacity-60 hover:border-opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
        {/* 初心者向けバナー */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-lg p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              {/* アイコン部分 */}
              <div className="bg-emerald-500 p-3 rounded-full shadow-md">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" width="32" height="32" color="#ffffff" className="text-white">
                  <defs>
                    <style>{`.cls-637a2287b95f902aafde8ff1-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}`}</style>
                  </defs>
                  <path className="cls-637a2287b95f902aafde8ff1-1" d="M16.64,19.09h0a5.43,5.43,0,0,1-4.16,2.08h-1a7.41,7.41,0,0,1-5.07-2.08h0C1,12,12,2,12,2l5,7.45A8.29,8.29,0,0,1,16.64,19.09Z"></path>
                  <line className="cls-637a2287b95f902aafde8ff1-1" x1="11.97" y1="9.3" x2="11.97" y2="23"></line>
                  <line className="cls-637a2287b95f902aafde8ff1-1" x1="8.32" y1="14.78" x2="11.97" y2="18.43"></line>
                  <line className="cls-637a2287b95f902aafde8ff1-1" x1="14.71" y1="12.04" x2="11.97" y2="14.78"></line>
                </svg>
              </div>
        
              {/* テキスト部分 */}
              <div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">初めての方へ</h2>
                <p className="text-sm text-gray-700 font-medium">サーバーの基本的な情報やルールを確認しましょう</p>
              </div>
            </div>
              {/* ボタン部分 */}
              <Link href="/lifestyle/server-rules">
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-base hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 border-t border-green-400">
                 チュートリアルを見る
                </button>
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 左側: お知らせとパッチノート */}
          <div className="xl:col-span-2 space-y-8">
            {/* お知らせセクション */}
            <section>
              <div className="bg-white rounded-lg border border-gray-200">
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
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
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
              ) : announcementError ? (
                // エラー状態
                <div className="p-6 text-center">
                  <div className="text-red-500 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">読み込みができませんでした</p>
                  <p className="text-sm text-gray-500 mt-1">しばらく時間をおいてから再度お試しください</p>
                  <button
                    onClick={refreshAnnouncements}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                    </svg>
                    再試行
                  </button>
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
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
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
            <div className="bg-gradient-to-r from-[#5b8064] to-[#4a6b55] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">パッチノート</h2>
                <Link href="/patch-notes">
                  <button className="inline-flex items-center px-3 py-2 bg-white rounded-md text-sm font-medium text-[#5b8064] hover:bg-gray-50 transition-all duration-200">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                    アーカイブ
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-green-100">最新のアップデート情報</p>
              </div>
            </div>
            
            {/* パッチノート内容 */}
            <div className="divide-y divide-gray-200">
              {isPatchNoteLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b8064] mx-auto"></div>
                  <p className="mt-2 text-gray-500">パッチノートを読み込み中...</p>
                </div>
              ) : patchNoteError ? (
                // エラー状態
                <div className="p-6 text-center">
                  <div className="text-red-500 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">読み込みができませんでした</p>
                  <p className="text-sm text-gray-500 mt-1">しばらく時間をおいてから再度お試しください</p>
                </div>
              ) : latestPatchNote ? (
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-gray-900">{latestPatchNote.date}</h3>
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
          {/* 【本番環境での変更点2】 */}
          {/* 環境変数を使用することで、デプロイ時の設定変更を不要にします */}
          {/* ローカル環境: NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=localhost:25565 */}
          {/* 本番環境: NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=play.ineserver.com */}
          <ServerStatus serverAddress={process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS} />
        </div>
      </div>
    </div>
  </main>
</div>
  );
}
