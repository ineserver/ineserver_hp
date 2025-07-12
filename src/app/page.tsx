"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // お知らせデータ
  const announcements = [
    {
      id: 1,
      type: 'important',
      title: 'サーバーメンテナンスのお知らせ',
      content: '7月15日（火）午前2時～午前6時の間、サーバーメンテナンスを実施いたします。',
      date: '2025年7月13日'
    },
    {
      id: 2,
      type: 'pickup',
      title: '夏季イベント開催中！',
      content: '夏祭りイベントを開催しています。期間限定アイテムをゲットしよう！',
      date: '2025年7月10日'
    },
    {
      id: 3,
      type: 'normal',
      title: '新しいエリアがオープンしました',
      content: '新しい建築エリアが追加されました。ぜひ遊びに来てください！',
      date: '2025年7月8日'
    },
    {
      id: 4,
      type: 'normal',
      title: 'ルール更新のお知らせ',
      content: 'サーバールールの一部を更新いたしました。詳細をご確認ください。',
      date: '2025年7月5日'
    },
    {
      id: 5,
      type: 'important',
      title: 'アップデート実施のお知らせ',
      content: '新機能の追加に伴うアップデートを実施いたします。',
      date: '2025年7月3日'
    },
    {
      id: 6,
      type: 'pickup',
      title: 'コミュニティイベント参加者募集',
      content: '建築コンテストの参加者を募集中です。豪華賞品をご用意！',
      date: '2025年7月1日'
    }
  ];

  // フィルタリング機能
  const filteredAnnouncements = announcements.filter(announcement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'important') return announcement.type === 'important';
    if (activeTab === 'normal') return announcement.type === 'normal';
    if (activeTab === 'pickup') return announcement.type === 'pickup';
    return true;
  });

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
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        {/* メインヘッダー */}
        <div className="bg-white">
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
            <div className="flex items-center h-16">
              {/* ロゴ - 左側 */}
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center">
                    <Image
                      src="/server-icon.png"
                      alt="いねさばアイコン"
                      width={32}
                      height={32}
                      className="rounded-sm"
                    />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <h1 className="text-2xl font-black text-gray-900">いねさば</h1>
                    <p className="text-lg text-gray-600">IneServer</p>
                  </div>
                </div>
              </div>

              {/* スペーサー */}
              <div className="flex-1"></div>

              {/* トップバーナビゲーション - 右側 */}
              <nav className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <a 
                    href="https://minecraft.jp/servers/67de4f4ce22bc84120000007" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    minecraft.jp
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a href="#" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    メンテナンス情報
                  </a>
                  <a href="#" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    アイテム市場状況
                  </a>
                  <a 
                    href="https://map.1necat.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    平面/俯瞰マップ
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                
                {/* セパレーター */}
                <div className="h-8 w-px bg-gray-300 mx-3"></div>
                
                {/* ガイドボタン - 特別なスタイル */}
                <a href="#" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  ガイド
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="bg-green-700">
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
            <nav className="flex relative">
              <div className="flex-1 relative group">
                <a href="#" className="block text-white hover:text-green-200 px-6 py-4 text-lg font-medium text-center relative">
                  生活・くらし
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
                </a>
                
                {/* ドロップダウンメニュー */}
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        サーバールール
                      </h4>
                      <ul className="ml-4 space-y-1">
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 中心地の土地利用について</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 許可MOD一覧</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 流通禁止アイテム</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        保護
                      </h4>
                      <ul className="ml-4 space-y-1">
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 土地の保護</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- ブロック保護</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative group">
                <a href="#" className="block text-white hover:text-green-200 px-6 py-4 text-lg font-medium text-center relative">
                  経済
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
                </a>
                
                {/* ドロップダウンメニュー */}
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        ineを貯める
                      </h4>
                      <ul className="ml-4 space-y-1">
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 就職</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- アイテム市場取引</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- お店を作る・お店で買う</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        ineを使う
                      </h4>
                      <ul className="ml-4 space-y-1">
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- アイテム市場取引</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- 土地の購入</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- コマンドの購入</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1">- お店を作る・お店で買う</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative group">
                <a href="#" className="block text-white hover:text-green-200 px-6 py-4 text-lg font-medium text-center relative">
                  娯楽
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
                </a>
                
                {/* ドロップダウンメニュー */}
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <ul className="space-y-2">
                      <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>アリーナ</a></li>
                      <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>追加アイテム一覧</a></li>
                      <li><a href="#" className="text-gray-600 hover:text-green-600 text-sm block py-1 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>隠しアイテム</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative group">
                <a href="#" className="block text-white hover:text-green-200 px-6 py-4 text-lg font-medium text-center relative">
                  観光
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
                </a>
                
                {/* ドロップダウンメニュー */}
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <div className="text-gray-500 text-sm text-center py-4">
                      メニューは準備中です
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative group">
                <a href="#" className="block text-white hover:text-green-200 px-6 py-4 text-lg font-medium text-center">
                  交通
                </a>
                
                {/* ドロップダウンメニュー */}
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    <div className="text-gray-500 text-sm text-center py-4">
                      メニューは準備中です
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">お知らせ</h2>
              
              {/* タブナビゲーション */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'all' 
                      ? 'text-white bg-green-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  すべて
                </button>
                <button 
                  onClick={() => setActiveTab('important')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'important' 
                      ? 'text-white bg-green-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  重要なお知らせ
                </button>
                <button 
                  onClick={() => setActiveTab('normal')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'normal' 
                      ? 'text-white bg-green-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  お知らせ
                </button>
                <button 
                  onClick={() => setActiveTab('pickup')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'pickup' 
                      ? 'text-white bg-green-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  ピックアップ
                </button>
              </div>
            </div>
            
            {/* お知らせリスト */}
            <div className="divide-y divide-gray-200">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-32">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium w-full ${getTagStyle(announcement.type)}`}>
                        {getTagName(announcement.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                          {announcement.title}
                        </h3>
                        <span className="text-sm text-gray-500">{announcement.date}</span>
                      </div>
                      <p className="mt-2 text-gray-600 text-sm">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* もっと見るボタン */}
            <div className="p-6 border-t border-gray-200 text-center">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                もっと見る
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
