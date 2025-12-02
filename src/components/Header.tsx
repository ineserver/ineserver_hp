'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from './Icons';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // 現在のパスがどのカテゴリに属しているかを判定
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // スクロール位置を監視してGo Topボタンの表示を制御
  useEffect(() => {
    const handleScroll = () => {
      setShowGoTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // メニューが開いているときに外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as Element;
        const menuButton = document.querySelector('[aria-label="メニューを開く"]');
        const menuContent = document.querySelector('.lg\\:hidden .px-4');

        if (menuButton && menuContent &&
          !menuButton.contains(target) &&
          !menuContent.contains(target)) {
          closeMenu();
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // トップへスクロールする関数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // サブメニューの開閉を制御する関数
  const toggleSubMenu = (menuName: string) => {
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  // メニューを閉じる関数
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenSubMenu(null);
  };

  return (
    <>
      <header className={`bg-white shadow-lg sticky top-0 z-50 lg:overflow-visible lg:rounded-none ${isMenuOpen ? '' : 'overflow-hidden rounded-b-xl'}`}>
        {/* メインヘッダー */}
        <div className="bg-white">
          {/* モバイル用ヘッダー下部の余白追加 */}
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 pb-1 lg:pb-0">
            <div className="flex items-center h-14">
              {/* ロゴ - 左側 */}
              <div className="flex items-center pl-2 lg:pl-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center">
                    <Link href="/">
                      <Image
                        src="/server-icon.png"
                        alt="いねさばアイコン"
                        width={32}
                        height={32}
                        className="rounded-sm"
                      />
                    </Link>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <Link href="/">
                      <h1 className="text-2xl font-black text-gray-900 hover:text-gray-700 transition-colors duration-200 cursor-pointer">いねさば</h1>
                    </Link>
                    <p className="text-base text-gray-600 hidden sm:block">Ine Server</p>
                  </div>
                </div>
              </div>

              {/* スペーサー */}
              <div className="flex-1"></div>

              {/* トップバーナビゲーション - デスクトップのみ表示 */}
              <nav className="hidden lg:flex items-center space-x-2">
                <div className="flex space-x-2">
                  <a
                    href="https://minecraft.jp/servers/67de4f4ce22bc84120000007"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    minecraft.jp
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a href="https://stats.uptimerobot.com/Rw0L1innjO" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    死活情報
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a href="https://market.1necat.net" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    アイテム市場状況
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://map.1necat.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    平面/俯瞰マップ
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* セパレーター */}
                <div className="h-8 w-px bg-[#5b8064] mx-3"></div>

                {/* ガイドボタン - 特別なスタイル */}
                <a href="/guide" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 transform hover:scale-105">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  いねさばの歩き方
                </a>
              </nav>

              {/* モバイル用ガイドボタン＋ハンバーガーメニュー */}
              <div className="flex items-center lg:hidden gap-1">
                {/* サーバーガイドボタン */}
                <Link
                  href="/server-guide"
                  className="relative p-1 rounded-md flex flex-col items-center justify-center"
                  aria-label="サーバーガイド"
                  style={{ minWidth: '48px', minHeight: '48px' }}
                >
                  <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512" className="w-5 h-5 mb-0.5" xmlSpace="preserve">
                    <g>
                      <path className="st0" d="M256,120.07L145.016,12.742C131.953,0.102,112.594-3.492,95.844,3.586
                        c-16.734,7.109-27.609,23.531-27.609,41.719v274c0,18.406,7.469,36.031,20.703,48.844L224.5,499.258
                        c17.563,16.984,45.438,16.984,62.984,0l135.578-131.109c13.234-12.813,20.703-30.438,20.703-48.844v-274
                        c0-18.188-10.875-34.609-27.609-41.719c-16.75-7.078-36.109-3.484-49.172,9.156L256,120.07z M379.844,311.414
                        c0,6.141-2.484,12.016-6.906,16.281L256,440.805V209.008l22.219-21.5l82.438-79.719c3.25-3.156,8.109-4.063,12.281-2.281
                        c4.188,1.766,6.906,5.875,6.906,10.422V311.414z" style={{ fill: '#5b8064' }}></path>
                    </g>
                  </svg>
                  <span className="text-[9px] font-bold text-[#5b8064] leading-none">初めての方へ</span>
                </Link>
                {/* ガイドボタン（アイコンのみ） */}
                <a
                  href="/guide"
                  className="relative p-2 rounded-md flex items-center justify-center"
                  aria-label="いねさばの歩き方"
                  style={{ minWidth: '48px', minHeight: '48px' }}
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="mobileGuideGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#a21caf" />
                      </linearGradient>
                    </defs>
                    <path stroke="url(#mobileGuideGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </a>
                {/* ハンバーガーメニュー */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-700 hover:text-[#5b8064] hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                  aria-label="メニューを開く"
                  style={{ minWidth: '48px', minHeight: '48px' }}
                >
                  <div className={`relative w-7 h-7 flex flex-col justify-center items-center transition-all duration-300 group`}>
                    {/* 上の線 */}
                    <span
                      className={`block absolute h-0.5 w-6 bg-current rounded transition-all duration-300
                      ${isMenuOpen ? 'rotate-45 top-3.5' : 'top-2'}
                    `}
                    ></span>
                    {/* 真ん中の線（徐々に消えるアニメーション） */}
                    <span
                      className={`block absolute h-0.5 w-6 bg-current rounded transition-all duration-300
                      top-3.5
                      ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}
                    `}
                      style={{ transitionProperty: 'opacity, transform', transitionDuration: '300ms' }}
                    ></span>
                    {/* 下の線 */}
                    <span
                      className={`block absolute h-0.5 w-6 bg-current rounded transition-all duration-300
                      ${isMenuOpen ? '-rotate-45 top-3.5' : 'top-5'}
                    `}
                    ></span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ナビゲーション - デスクトップのみ表示 */}
        <div className="bg-[#5b8064] hidden lg:block">
          <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
            <nav className="flex relative">
              {/* 1. サーバーガイド */}
              <div className="flex-1 relative group">
                <Link href="/server-guide" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/server-guide') ? 'active-menu-item' : ''}`}>
                  <span className="flex items-center justify-center gap-2">
                    <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512" className="w-5 h-5" xmlSpace="preserve">
                      <g>
                        <path className="st0" d="M256,120.07L145.016,12.742C131.953,0.102,112.594-3.492,95.844,3.586
                          c-16.734,7.109-27.609,23.531-27.609,41.719v274c0,18.406,7.469,36.031,20.703,48.844L224.5,499.258
                          c17.563,16.984,45.438,16.984,62.984,0l135.578-131.109c13.234-12.813,20.703-30.438,20.703-48.844v-274
                          c0-18.188-10.875-34.609-27.609-41.719c-16.75-7.078-36.109-3.484-49.172,9.156L256,120.07z M379.844,311.414
                          c0,6.141-2.484,12.016-6.906,16.281L256,440.805V209.008l22.219-21.5l82.438-79.719c3.25-3.156,8.109-4.063,12.281-2.281
                          c4.188,1.766,6.906,5.875,6.906,10.422V311.414z" fill="currentColor"></path>
                      </g>
                    </svg>
                    はじめての方へ
                  </span>
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
                </Link>

                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    {/* 上側: 画像背景付きブロック */}
                    <Link 
                      href="/server-guide" 
                      className="w-full h-32 rounded-lg overflow-hidden relative group/card flex-shrink-0 bg-cover bg-center block mb-4"
                      style={{ backgroundImage: 'url("https://img.1necat.net/d23b15bc802aef4b645617eed52c2b51.jpg")' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-0.5">はじめての方へ</p>
                          <p className="text-sm font-bold">このカテゴリを見る</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#5b8064]/0 group-hover/card:bg-[#5b8064]/20 transition-colors duration-200"></div>
                    </Link>
                    
                    {/* 下側: リンクリスト */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <ul className="space-y-1">
                        <li><Link href="/tutorial" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />チュートリアル</Link></li>
                        <li><Link href="/lp" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />サーバー紹介</Link></li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ルール・規約</h3>
                      <ul className="space-y-1">
                        <li><Link href="/server-guide/rule" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />サーバールール</Link></li>
                        <li><Link href="/server-guide/terms_of_service" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />利用規約</Link></li>
                        <li><Link href="/server-guide/allowed_mods" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />許可MOD一覧</Link></li>
                        <li><Link href="/server-guide/prohibited_items" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />流通禁止アイテム一覧</Link></li>
                        <li><Link href="/server-guide/building_restrictions" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />中心地の土地利用について</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 建築・居住 */}
              <div className="flex-1 relative group">
                <Link href="/life" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/life') ? 'active-menu-item' : ''}`}>
                  くらし
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
                </Link>

                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    {/* 上側: 画像背景付きブロック */}
                    <Link 
                      href="/life" 
                      className="w-full h-32 rounded-lg overflow-hidden relative group/card flex-shrink-0 bg-cover bg-center block mb-4"
                      style={{ backgroundImage: 'url("https://img.1necat.net/2025-11-29_15.48.01.png")' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-0.5">くらし</p>
                          <p className="text-sm font-bold">このカテゴリを見る</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#5b8064]/0 group-hover/card:bg-[#5b8064]/20 transition-colors duration-200"></div>
                    </Link>
                    
                    {/* 下側: リンクリスト */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">保護</h3>
                      <ul className="space-y-1">
                        <li><Link href="/life/land-protection" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の保護のやり方</Link></li>
                        <li><Link href="/life/block-protection" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />ブロック保護のやり方</Link></li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">便利機能</h3>
                      <ul className="space-y-1">
                        <li><Link href="/life/mcmmo" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />スキルシステム (mcMMO)</Link></li>
                        <li><Link href="/life/imageflame" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />画像地図の作成と使い方</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ガイドライン</h3>
                      <ul className="space-y-1">
                        <li><Link href="/life/address" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />市町村・字（あざ）・敷地についてのガイドライン</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 経済・職業 */}
              <div className="flex-1 relative group">
                <Link href="/economy" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/economy') ? 'active-menu-item' : ''}`}>
                  経済
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
                </Link>

                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    {/* 上側: 画像背景付きブロック */}
                    <Link 
                      href="/economy" 
                      className="w-full h-32 rounded-lg overflow-hidden relative group/card flex-shrink-0 bg-cover bg-center block mb-4"
                      style={{ backgroundImage: 'url("https://img.1necat.net/9f879fc11c65db9e9cfe536244c72546.jpg")' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-0.5">経済</p>
                          <p className="text-sm font-bold">このカテゴリを見る</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#5b8064]/0 group-hover/card:bg-[#5b8064]/20 transition-colors duration-200"></div>
                    </Link>
                    
                    {/* 下側: リンクリスト */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">アイテム</h3>
                      <ul className="space-y-1">
                        <li><Link href="/economy/market" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引のやり方</Link></li>
                        <li><Link href="/economy/shop" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">許可・ライセンス</h3>
                      <ul className="space-y-1">
                        <li><Link href="/economy/buycommand" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />コマンドの購入</Link></li>
                        <li><Link href="/economy/land-purchase" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の購入・管理</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. 冒険・娯楽 */}
              <div className="flex-1 relative group">
                <Link href="/adventure" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/adventure') ? 'active-menu-item' : ''}`}>
                  娯楽
                  <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
                </Link>

                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    {/* 上側: 画像背景付きブロック */}
                    <Link 
                      href="/adventure" 
                      className="w-full h-32 rounded-lg overflow-hidden relative group/card flex-shrink-0 bg-cover bg-center block mb-4"
                      style={{ backgroundImage: 'url("https://img.1necat.net/839b6d5d9584120e81c4fb874ad780d8.jpg")' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-0.5">娯楽</p>
                          <p className="text-sm font-bold">このカテゴリを見る</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#5b8064]/0 group-hover/card:bg-[#5b8064]/20 transition-colors duration-200"></div>
                    </Link>
                    
                    {/* 下側: リンクリスト */}
                    <ul className="space-y-1">
                      <li><Link href="/adventure/arena" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アリーナ</Link></li>
                      <li><Link href="/adventure/hide-item" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />隠しアイテムのヒント</Link></li>
                      <li><Link href="/adventure/events" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />過去のイベント一覧（アーカイブ）</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5. ワールド・交通 */}
              <div className="flex-1 relative group">
                <Link href="/transport" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center transition-colors duration-200 ${isActive('/transport') ? 'active-menu-item' : ''}`}>
                  交通
                </Link>

                <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-4">
                    {/* 上側: 画像背景付きブロック */}
                    <Link 
                      href="/transport" 
                      className="w-full h-32 rounded-lg overflow-hidden relative group/card flex-shrink-0 bg-cover bg-center block mb-4"
                      style={{ backgroundImage: 'url("https://img.1necat.net/2025-11-28_02.41.46.png")' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 flex items-end p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-0.5">交通</p>
                          <p className="text-sm font-bold">このカテゴリを見る</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-[#5b8064]/0 group-hover/card:bg-[#5b8064]/20 transition-colors duration-200"></div>
                    </Link>
                    
                    {/* 下側: リンクリスト */}
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ガイドライン</h3>
                      <ul className="space-y-1">
                        <li><Link href="/transport/rail" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />鉄道に関してのガイドライン</Link></li>
                        <li><Link href="/transport/road" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />道路に関してのガイドライン</Link></li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li><Link href="/transport/railway" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />鉄道・路線図（準備中）</Link></li>
                        <li><Link href="/transport/spots" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />観光スポット・主要施設案内（準備中）</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-lg rounded-b-xl lg:rounded-none fixed left-0 right-0 top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto z-50">
            <div className="px-4 py-2">
              {/* 主要ナビゲーション */}
              <div className="space-y-1 mb-4">
                {/* 1. サーバーガイド */}
                <div className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/server-guide"
                      className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                      onClick={closeMenu}
                    >
                      <span className="flex items-center gap-2">
                        <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512" className="w-5 h-5" xmlSpace="preserve">
                          <g>
                            <path className="st0" d="M256,120.07L145.016,12.742C131.953,0.102,112.594-3.492,95.844,3.586
                              c-16.734,7.109-27.609,23.531-27.609,41.719v274c0,18.406,7.469,36.031,20.703,48.844L224.5,499.258
                              c17.563,16.984,45.438,16.984,62.984,0l135.578-131.109c13.234-12.813,20.703-30.438,20.703-48.844v-274
                              c0-18.188-10.875-34.609-27.609-41.719c-16.75-7.078-36.109-3.484-49.172,9.156L256,120.07z M379.844,311.414
                              c0,6.141-2.484,12.016-6.906,16.281L256,440.805V209.008l22.219-21.5l82.438-79.719c3.25-3.156,8.109-4.063,12.281-2.281
                              c4.188,1.766,6.906,5.875,6.906,10.422V311.414z" fill="currentColor"></path>
                          </g>
                        </svg>
                        はじめての方へ
                      </span>
                    </Link>
                    <button
                      onClick={() => toggleSubMenu('server-guide')}
                      className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="サーバーガイドのサブメニューを開く"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'server-guide' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {openSubMenu === 'server-guide' && (
                    <div className="ml-3 mt-1 mb-3 rounded-lg p-3 space-y-2">
                      {/* 画像背景付きブロック */}
                      <Link 
                        href="/server-guide" 
                        className="w-full h-28 rounded-lg overflow-hidden relative bg-cover bg-center block mb-3"
                        style={{ backgroundImage: 'url("https://img.1necat.net/d23b15bc802aef4b645617eed52c2b51.jpg")' }}
                        onClick={closeMenu}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-end p-3">
                          <div className="text-white">
                            <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                              初めての方へ
                            </p>
                            <p className="text-sm font-bold">このカテゴリを見る</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-[#5b8064]/0 active:bg-[#5b8064]/20 transition-colors duration-200"></div>
                      </Link>
                      
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="pl-4 space-y-1">
                          <Link href="/tutorial" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            チュートリアル
                          </Link>
                          <Link href="/lp" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            サーバー紹介
                          </Link>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">ルール・規約</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/server-guide/rule" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            サーバールール
                          </Link>
                          <Link href="/server-guide/terms_of_service" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            利用規約
                          </Link>
                          <Link href="/server-guide/allowed_mods" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            許可MOD一覧
                          </Link>
                          <Link href="/server-guide/prohibited_items" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            流通禁止アイテム一覧
                          </Link>
                          <Link href="/server-guide/building_restrictions" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            中心地の土地利用について
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. 建築・居住 */}
                <div className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/life"
                      className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                      onClick={closeMenu}
                    >
                      くらし
                    </Link>
                    <button
                      onClick={() => toggleSubMenu('life')}
                      className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="くらしのサブメニューを開く"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'life' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {openSubMenu === 'life' && (
                    <div className="ml-3 mt-1 mb-3 rounded-lg p-3 space-y-2">
                      {/* 画像背景付きブロック */}
                      <Link 
                        href="/life" 
                        className="w-full h-28 rounded-lg overflow-hidden relative bg-cover bg-center block mb-3"
                        style={{ backgroundImage: 'url("https://img.1necat.net/2025-11-29_15.48.01.png")' }}
                        onClick={closeMenu}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-end p-3">
                          <div className="text-white">
                            <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                              くらし
                            </p>
                            <p className="text-sm font-bold">このカテゴリを見る</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-[#5b8064]/0 active:bg-[#5b8064]/20 transition-colors duration-200"></div>
                      </Link>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">保護</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/life/land-protection" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            土地の保護のやり方
                          </Link>
                          <Link href="/life/block-protection" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            ブロック保護のやり方
                          </Link>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">便利機能</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/life/mcmmo" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            スキルシステム (mcMMO)
                          </Link>
                          <Link href="/life/imageflame" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            画像地図の作成と使い方
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">ガイドライン</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/life/address" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            市町村・字（あざ）・敷地についてのガイドライン
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. 経済・職業 */}
                <div className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/economy"
                      className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                      onClick={closeMenu}
                    >
                      経済
                    </Link>
                    <button
                      onClick={() => toggleSubMenu('economy')}
                      className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="経済のサブメニューを開く"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'economy' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {openSubMenu === 'economy' && (
                    <div className="ml-3 mt-1 mb-3 rounded-lg p-3 space-y-2">
                      {/* 画像背景付きブロック */}
                      <Link 
                        href="/economy" 
                        className="w-full h-28 rounded-lg overflow-hidden relative bg-cover bg-center block mb-3"
                        style={{ backgroundImage: 'url("https://img.1necat.net/9f879fc11c65db9e9cfe536244c72546.jpg")' }}
                        onClick={closeMenu}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-end p-3">
                          <div className="text-white">
                            <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                              経済
                            </p>
                            <p className="text-sm font-bold">このカテゴリを見る</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-[#5b8064]/0 active:bg-[#5b8064]/20 transition-colors duration-200"></div>
                      </Link>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">アイテム</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/economy/market" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            アイテム市場取引のやり方
                          </Link>
                          <Link href="/economy/shop" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            お店を作る・お店で買う
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">許可・ライセンス</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/economy/buycommand" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            コマンドの購入
                          </Link>
                          <Link href="/economy/land-purchase" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            土地の購入・管理
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. 冒険・娯楽 */}
                <div className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/adventure"
                      className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                      onClick={closeMenu}
                    >
                      娯楽
                    </Link>
                    <button
                      onClick={() => toggleSubMenu('adventure')}
                      className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="冒険・娯楽のサブメニューを開く"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'adventure' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {openSubMenu === 'adventure' && (
                    <div className="ml-3 mt-1 mb-3 rounded-lg p-3 space-y-2">
                      {/* 画像背景付きブロック */}
                      <Link 
                        href="/adventure" 
                        className="w-full h-28 rounded-lg overflow-hidden relative bg-cover bg-center block mb-3"
                        style={{ backgroundImage: 'url("https://img.1necat.net/839b6d5d9584120e81c4fb874ad780d8.jpg")' }}
                        onClick={closeMenu}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-end p-3">
                          <div className="text-white">
                            <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                              娯楽
                            </p>
                            <p className="text-sm font-bold">このカテゴリを見る</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-[#5b8064]/0 active:bg-[#5b8064]/20 transition-colors duration-200"></div>
                      </Link>
                      
                      <div className="pl-4 space-y-1">
                        <Link href="/adventure/arena" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                          アリーナ
                        </Link>
                        <Link href="/adventure/hide-item" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                          隠しアイテムのヒント
                        </Link>
                        <Link href="/adventure/events" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                          過去のイベント一覧（アーカイブ）
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. ワールド・交通 */}
                <div className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/transport"
                      className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                      onClick={closeMenu}
                    >
                      交通
                    </Link>
                    <button
                      onClick={() => toggleSubMenu('transport')}
                      className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                      aria-label="交通のサブメニューを開く"
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'transport' ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  {openSubMenu === 'transport' && (
                    <div className="ml-3 mt-1 mb-3 rounded-lg p-3 space-y-2">
                      {/* 画像背景付きブロック */}
                      <Link 
                        href="/transport" 
                        className="w-full h-28 rounded-lg overflow-hidden relative bg-cover bg-center block mb-3"
                        style={{ backgroundImage: 'url("https://img.1necat.net/2025-11-28_02.41.46.png")' }}
                        onClick={closeMenu}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-end p-3">
                          <div className="text-white">
                            <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                              交通
                            </p>
                            <p className="text-sm font-bold">このカテゴリを見る</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-[#5b8064]/0 active:bg-[#5b8064]/20 transition-colors duration-200"></div>
                      </Link>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">ガイドライン</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/transport/rail" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            鉄道に関してのガイドライン
                          </Link>
                          <Link href="/transport/road" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            道路に関してのガイドライン
                          </Link>
                        </div>
                      </div>
                      <div>
                        <div className="pl-4 space-y-1">
                          <Link href="/transport/railway" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            鉄道・路線図（準備中）
                          </Link>
                          <Link href="/transport/spots" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            観光スポット・主要施設案内（準備中）
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* セパレーター */}
              <div className="border-t border-gray-200 pt-4 mb-4 mt-2">
                {/* 外部リンク */}
                <div className="space-y-2">
                  <a
                    href="https://minecraft.jp/servers/67de4f4ce22bc84120000007"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">minecraft.jp</span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://stats.uptimerobot.com/Rw0L1innjO"
                    className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="flex-1">死活情報</span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://market.1necat.net"
                    className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="flex-1">アイテム市場状況</span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://map.1necat.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="flex-1">平面/俯瞰マップ</span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* ガイドボタン */}
              <div className="pb-4">
                <a
                  href="#"
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm text-white font-bold shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  いねさばの歩き方
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
      {/* トップへ戻るボタン */}
      {showGoTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[100] bg-[#5b8064] hover:bg-[#3b5c47] text-white rounded-full shadow-lg p-3 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b8064] cursor-pointer"
          aria-label="トップへ戻る"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Header;
