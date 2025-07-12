"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
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
              <nav className="flex space-x-2">
                <a 
                  href="https://minecraft.jp/servers/67de4f4ce22bc84120000007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1"
                >
                  minecraft.jp
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a href="#" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium">メンテナンス情報</a>
                <a href="#" className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium">アイテム市場状況</a>
                <a 
                  href="https://map.1necat.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1"
                >
                  平面/俯瞰マップ
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a href="#" className="px-3 py-2 border-2 border-blue-500 bg-blue-50 rounded text-sm text-blue-700 hover:bg-blue-100 font-semibold flex items-center gap-1">
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
            <nav className="flex">
              <a href="#" className="flex-1 text-white hover:text-green-200 px-6 py-4 text-sm font-medium text-center relative">
                生活・くらし
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
              </a>
              <a href="#" className="flex-1 text-white hover:text-green-200 px-6 py-4 text-sm font-medium text-center relative">
                経済
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
              </a>
              <a href="#" className="flex-1 text-white hover:text-green-200 px-6 py-4 text-sm font-medium text-center relative">
                娯楽
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
              </a>
              <a href="#" className="flex-1 text-white hover:text-green-200 px-6 py-4 text-sm font-medium text-center relative">
                観光
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-green-600"></div>
              </a>
              <a href="#" className="flex-1 text-white hover:text-green-200 px-6 py-4 text-sm font-medium text-center">
                交通
              </a>
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
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-8">
        {/* ここにコンテンツを追加 */}
      </main>
    </div>
  );
}
