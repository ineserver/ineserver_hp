'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useEffect } from 'react';

interface GuideItem {
  title: string;
  description: string;
  href: string;
}

interface GuideCategory {
  title: string;
  path: string;
  icon: React.ReactElement;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  items: GuideItem[];
}

export default function GuidePage() {
  // ページタイトルを設定
  useEffect(() => {
    document.title = 'ガイド | Ineサーバー';
  }, []);

  const guideCategories: GuideCategory[] = [
    {
      title: 'くらし・生活',
      path: '/lifestyle',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'from-green-400 to-green-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      description: 'サーバー内での日々の生活や基本的な遊び方について',
      items: [
        { title: '土地の保護', description: '自分の作った建物などが壊されないように保護をすることができます', href: '#land-protection' },
        { title: 'ブロック保護', description: 'チェストやドアなどを特定の人だけが開けるようにできます', href: '#block-protection' },
        { title: 'サーバールール', description: 'サーバーで楽しく過ごすためのルールを確認しよう', href: '/lifestyle/server-rules' }
      ]
    },
    {
      title: '経済',
      path: '/economy',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-yellow-400 to-orange-400',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      description: 'サーバー内での経済活動や取引について',
      items: [
        { title: 'アイテム市場取引', description: '鉱石・食物の市場取引が可能です', href: '#market-trading' },
        { title: '土地の購入', description: '土地や賃貸の購入方法や家賃収益を得る方法', href: '#land-purchase' },
        { title: 'コマンドの購入', description: 'ineを使って便利なコマンドを購入することができます', href: '#command-purchase' },
        { title: 'お店を作る・お店で買う', description: 'お店でものを買ったり、自分のお店を作ったりできます', href: '#shop-management' }
      ]
    },
    {
      title: '娯楽',
      path: '/entertainment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'from-purple-400 to-indigo-400',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
      description: 'サーバー内での楽しい娯楽コンテンツについて',
      items: [
        { title: 'アリーナ', description: '様々なクラスを使ってMobと戦うことができます。最大4人と一緒に遊べます', href: '#arena' },
        { title: '追加アイテム一覧', description: 'いねさばでの追加アイテムとそのレシピを一覧で紹介します！', href: '#additional-items' },
        { title: '隠しアイテム', description: 'いねさばには各地に隠しアイテムが眠っています。そのヒントが書いてあるかも・・・？', href: '#hidden-items' }
      ]
    },
    {
      title: '観光',
      path: '/tourism',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-blue-400 to-cyan-400',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      description: 'サーバー内の見どころや観光スポットについて',
      items: [
        { title: '観光スポット', description: 'サーバー内の美しい建造物や見どころを紹介', href: '#tourist-spots' },
        { title: 'マップガイド', description: 'サーバー内の地図や各エリアの特徴について', href: '#map-guide' }
      ]
    },
    {
      title: '交通',
      path: '/transportation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'from-red-400 to-pink-400',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      description: 'サーバー内での移動手段や交通システムについて',
      items: [
        { title: '鉄道システム', description: 'サーバー内の鉄道網や利用方法について', href: '#railway-system' },
        { title: 'ワープシステム', description: '各地への瞬間移動システムの使い方', href: '#warp-system' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダーセクション */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">ガイド</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              各ブロックを押すことで詳細の説明に飛ぶことができます。
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-xl mx-auto">
              <p className="text-blue-700 font-medium">
                初心者の方は、
                <Link href="/tutorial" className="text-blue-600 hover:text-blue-800 underline font-semibold">
                  「チュートリアル」
                </Link>
                を見ることをおすすめします。
              </p>
            </div>
          </div>

          {/* ガイドカテゴリー */}
          <div className="space-y-6">
            {guideCategories.map((category, index) => (
              <div key={index}>
                <div className={`
                  relative overflow-hidden rounded-xl border ${category.borderColor}
                  bg-white
                `}>
                  {/* カテゴリーヘッダー */}
                  <Link href={category.path}>
                    <div className={`bg-gradient-to-r ${category.color} p-4 text-white cursor-pointer hover:opacity-90`}>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">{category.icon}</div>
                        <div>
                          <h2 className="text-lg font-semibold">{category.title}</h2>
                          <p className="text-sm opacity-90 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* コンテンツリスト */}
                  <div className={`${category.bgColor}`}>
                    <div>
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <Link href={item.href} className="block">
                            <div className={`flex items-center justify-between py-6 px-4 ${category.bgColor} cursor-pointer group`}>
                              <div className="flex items-start flex-1 ml-4">
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">
                                    {item.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-4">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                          {itemIndex < category.items.length - 1 && (
                            <div className="mx-4">
                              <hr className="border-gray-200" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* フッターセクション */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">困ったときは</h3>
              <p className="text-gray-600 mb-6">
                分からないことがあれば、まずはチュートリアルを確認するか、Discordサーバーやゲーム内でスタッフにお気軽にお声がけください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/tutorial"
                  className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
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
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
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
