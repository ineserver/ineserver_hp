'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, FileTextIcon, ShieldIcon, TrendingUpIcon, TrendingDownIcon, ChevronDownIcon } from './Icons';

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
              <div className="flex items-center">
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
                    <p className="text-base text-gray-600">Ine Server</p>
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
                ガイド
              </a>
            </nav>

            {/* モバイル用ガイドボタン＋ハンバーガーメニュー */}
            <div className="flex items-center lg:hidden gap-1">
              {/* ガイドボタン（アイコンのみ） */}
              <a
                href="/guide"
                className="relative p-2 rounded-md flex items-center justify-center"
                aria-label="ガイド"
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
                className="p-2 rounded-md text-gray-700 hover:text-[#5b8064] hover:bg-gray-100 cursor-pointer"
                aria-label="メニューを開く"
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
            <div className="flex-1 relative group">
              <Link href="/lifestyle" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/lifestyle') ? 'active-menu-item' : ''}`}>
                生活・くらし
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <FileTextIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      サーバールール
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/lifestyle/housing-guide" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />中心地の土地利用について</Link></li>
                      <li><Link href="/lifestyle/allowed-mods" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />許可MOD一覧</Link></li>
                      <li><Link href="/lifestyle/prohibited-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />流通禁止アイテム</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <ShieldIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      保護
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/lifestyle/land-protection" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の保護</Link></li>
                      <li><Link href="/lifestyle/block-protection" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />ブロック保護</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/economy" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/economy') ? 'active-menu-item' : ''}`}>
                経済
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <TrendingUpIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを貯める
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/economy/jobs" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />就職</Link></li>
                      <li><Link href="/economy/item-market" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引</Link></li>
                      <li><Link href="/economy/shops" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <TrendingDownIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを使う
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/economy/item-market-usage" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引</Link></li>
                      <li><Link href="/economy/land-purchase" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の購入</Link></li>
                      <li><Link href="/economy/command-purchase" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />コマンドの購入</Link></li>
                      <li><Link href="/economy/shop-usage" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/entertainment" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/entertainment') ? 'active-menu-item' : ''}`}>
                娯楽
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <ul className="space-y-2">
                    <li><Link href="/entertainment/arena" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アリーナ</Link></li>
                    <li><Link href="/entertainment/additional-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />追加アイテム一覧</Link></li>
                    <li><Link href="/entertainment/hidden-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />隠しアイテム</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/tourism" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200 ${isActive('/tourism') ? 'active-menu-item' : ''}`}>
                観光
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
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
              <Link href="/transportation" className={`block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center transition-colors duration-200 ${isActive('/transportation') ? 'active-menu-item' : ''}`}>
                交通
              </Link>
              
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

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="bg-white border-t border-gray-200 shadow-lg rounded-b-xl lg:rounded-none fixed left-0 right-0 top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto z-50">
          <div className="px-4 py-2">
            {/* 主要ナビゲーション */}
            <div className="space-y-1 mb-4">
              {/* 生活・くらし */}
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/lifestyle" 
                    className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    生活・くらし
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('lifestyle')}
                    className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                    aria-label="生活・くらしのサブメニューを開く"
                  >
                    <ChevronDownIcon 
                      className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'lifestyle' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'lifestyle' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="text-gray-700 text-base font-bold mb-3 flex items-center">
                      <FileTextIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      サーバールール
                    </div>
                    <div className="pl-2 space-y-1">
                      <Link href="/lifestyle/building_restrictions" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        中心地の土地利用について
                      </Link>
                      <Link href="https://github.com/ineserver/ineserver-Public/wiki/%E8%A8%B1%E5%8F%AFMOD%E4%B8%80%E8%A6%A7" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        許可MOD一覧
                      </Link>
                      <Link href="/lifestyle/prohibited-items" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        流通禁止アイテム
                      </Link>
                    </div>
                    
                    <div className="text-gray-700 text-base font-bold mb-3 mt-4 flex items-center">
                      <ShieldIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      保護
                    </div>
                    <div className="pl-2 space-y-1">
                      <Link href="/lifestyle/land-protection" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        土地の保護
                      </Link>
                      <Link href="/lifestyle/block-protection" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        ブロック保護
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 経済 */}
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
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="text-gray-700 text-base font-bold mb-3 flex items-center">
                      <TrendingUpIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを貯める
                    </div>
                    <div className="pl-2 space-y-1">
                      <Link href="/economy/jobs" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        就職
                      </Link>
                      <Link href="/economy/item-market" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        アイテム市場取引
                      </Link>
                      <Link href="/economy/shops" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        お店を作る・お店で買う
                      </Link>
                    </div>
                    
                    <div className="text-gray-700 text-base font-bold mb-3 mt-4 flex items-center">
                      <TrendingDownIcon className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを使う
                    </div>
                    <div className="pl-2 space-y-1">
                      <Link href="/economy/item-market-usage" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        アイテム市場取引
                      </Link>
                      <Link href="/economy/land-purchase" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        土地の購入
                      </Link>
                      <Link href="/economy/command-purchase" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        コマンドの購入
                      </Link>
                      <Link href="/economy/shop-usage" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        お店を作る・お店で買う
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 娯楽 */}
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/entertainment" 
                    className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    娯楽
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('entertainment')}
                    className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                    aria-label="娯楽のサブメニューを開く"
                  >
                    <ChevronDownIcon 
                      className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'entertainment' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'entertainment' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3">
                    <div className="pl-2 space-y-1">
                      <Link href="/entertainment/arena" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        アリーナ
                      </Link>
                      <Link href="/entertainment/additional-items" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        追加アイテム一覧
                      </Link>
                      <Link href="/entertainment/hidden-items" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        隠しアイテム
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 観光 */}
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/tourism" 
                    className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    観光
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('tourism')}
                    className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                    aria-label="観光のサブメニューを開く"
                  >
                    <ChevronDownIcon 
                      className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'tourism' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'tourism' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm text-center py-4">
                      メニューは準備中です
                    </div>
                  </div>
                )}
              </div>

              {/* 交通 */}
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/transportation" 
                    className="flex-1 py-4 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    交通
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('transportation')}
                    className="p-4 text-gray-500 hover:text-[#5b8064] hover:bg-gray-50 min-w-[56px] min-h-[56px] flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer"
                    aria-label="交通のサブメニューを開く"
                  >
                    <ChevronDownIcon 
                      className={`w-5 h-5 transition-transform duration-200 ${openSubMenu === 'transportation' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'transportation' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm text-center py-4">
                      メニューは準備中です
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
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
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
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
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
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
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
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
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
                ガイド
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
