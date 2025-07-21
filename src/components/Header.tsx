'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronRight,
  faFileText,
  faShield,
  faPlus,
  faMinus,
  faBars,
  faTimes,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

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
    <header className="bg-white shadow-lg sticky top-0 z-50 overflow-hidden lg:overflow-visible rounded-b-xl lg:rounded-none">
      {/* メインヘッダー */}
      <div className="bg-white">
        <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
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
                  <p className="text-base text-gray-600">IneServer</p>
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
                <a href="#" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  メンテナンス情報
                </a>
                <a href="#" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  アイテム市場状況
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
              <a href="#" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-sm text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 transform hover:scale-105">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                ガイド
              </a>
            </nav>

            {/* モバイル用ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-[#5b8064] hover:bg-gray-100"
              aria-label="メニューを開く"
            >
              <FontAwesomeIcon 
                icon={isMenuOpen ? faTimes : faBars} 
                className="w-6 h-6" 
              />
            </button>
          </div>
        </div>
      </div>

      {/* ナビゲーション - デスクトップのみ表示 */}
      <div className="bg-[#5b8064] hidden lg:block">
        <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
          <nav className="flex relative">
            <div className="flex-1 relative group">
              <Link href="/lifestyle" className="block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200">
                生活・くらし
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faFileText} className="w-4 h-4 mr-2 text-[#5b8064]" />
                      サーバールール
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/lifestyle/housing-guide" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />中心地の土地利用について</Link></li>
                      <li><Link href="/lifestyle/allowed-mods" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />許可MOD一覧</Link></li>
                      <li><Link href="/lifestyle/prohibited-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />流通禁止アイテム</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2 text-[#5b8064]" />
                      保護
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/lifestyle/land-protection" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />土地の保護</Link></li>
                      <li><Link href="/lifestyle/block-protection" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />ブロック保護</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/economy" className="block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200">
                経済
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを貯める
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/economy/jobs" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />就職</Link></li>
                      <li><Link href="/economy/item-market" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引</Link></li>
                      <li><Link href="/economy/shops" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-semibold mb-2 flex items-center">
                      <FontAwesomeIcon icon={faMinus} className="w-4 h-4 mr-2 text-[#5b8064]" />
                      ineを使う
                    </h4>
                    <ul className="ml-4 space-y-1">
                      <li><Link href="/economy/item-market-usage" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引</Link></li>
                      <li><Link href="/economy/land-purchase" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />土地の購入</Link></li>
                      <li><Link href="/economy/command-purchase" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />コマンドの購入</Link></li>
                      <li><Link href="/economy/shop-usage" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/entertainment" className="block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200">
                娯楽
                <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-[#4a6b55]"></div>
              </Link>
              
              {/* ドロップダウンメニュー */}
              <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <ul className="space-y-2">
                    <li><Link href="/entertainment/arena" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />アリーナ</Link></li>
                    <li><Link href="/entertainment/additional-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />追加アイテム一覧</Link></li>
                    <li><Link href="/entertainment/hidden-items" className="text-gray-600 hover:text-[#5b8064] text-sm block py-1 flex items-center"><FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 mr-2 text-[#5b8064]" />隠しアイテム</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative group">
              <Link href="/tourism" className="block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center relative transition-colors duration-200">
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
              <Link href="/transportation" className="block text-white hover:text-[#d1fae5] px-6 py-3 text-lg font-medium text-center transition-colors duration-200">
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
                <div className="flex items-center justify-between py-1">
                  <Link 
                    href="/lifestyle" 
                    className="flex-1 py-3 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    生活・くらし
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('lifestyle')}
                    className="p-3 text-gray-500 hover:text-[#5b8064] min-w-[48px] flex items-center justify-center"
                    aria-label="生活・くらしのサブメニューを開く"
                  >
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === 'lifestyle' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'lifestyle' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="text-gray-700 text-base font-bold mb-3 flex items-center">
                      <FontAwesomeIcon icon={faFileText} className="w-4 h-4 mr-2 text-[#5b8064]" />
                      サーバールール
                    </div>
                    <div className="pl-2 space-y-1">
                      <Link href="/lifestyle/housing-guide" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        中心地の土地利用について
                      </Link>
                      <Link href="/lifestyle/allowed-mods" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        許可MOD一覧
                      </Link>
                      <Link href="/lifestyle/prohibited-items" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                        流通禁止アイテム
                      </Link>
                    </div>
                    
                    <div className="text-gray-700 text-base font-bold mb-3 mt-4 flex items-center">
                      <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2 text-[#5b8064]" />
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
                <div className="flex items-center justify-between py-1">
                  <Link 
                    href="/economy" 
                    className="flex-1 py-3 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    経済
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('economy')}
                    className="p-3 text-gray-500 hover:text-[#5b8064] min-w-[48px] flex items-center justify-center"
                    aria-label="経済のサブメニューを開く"
                  >
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === 'economy' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
                {openSubMenu === 'economy' && (
                  <div className="ml-3 mt-1 mb-3 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="text-gray-700 text-base font-bold mb-3 flex items-center">
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2 text-[#5b8064]" />
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
                      <FontAwesomeIcon icon={faMinus} className="w-4 h-4 mr-2 text-[#5b8064]" />
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
                <div className="flex items-center justify-between py-1">
                  <Link 
                    href="/entertainment" 
                    className="flex-1 py-3 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    娯楽
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('entertainment')}
                    className="p-3 text-gray-500 hover:text-[#5b8064] min-w-[48px] flex items-center justify-center"
                    aria-label="娯楽のサブメニューを開く"
                  >
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === 'entertainment' ? 'rotate-180' : ''}`} 
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
                <div className="flex items-center justify-between py-1">
                  <Link 
                    href="/tourism" 
                    className="flex-1 py-3 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    観光
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('tourism')}
                    className="p-3 text-gray-500 hover:text-[#5b8064] min-w-[48px] flex items-center justify-center"
                    aria-label="観光のサブメニューを開く"
                  >
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === 'tourism' ? 'rotate-180' : ''}`} 
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
                <div className="flex items-center justify-between py-1">
                  <Link 
                    href="/transportation" 
                    className="flex-1 py-3 text-gray-700 hover:text-[#5b8064] hover:bg-gray-50 px-3 rounded-md font-medium"
                    onClick={closeMenu}
                  >
                    交通
                  </Link>
                  <button
                    onClick={() => toggleSubMenu('transportation')}
                    className="p-3 text-gray-500 hover:text-[#5b8064] min-w-[48px] flex items-center justify-center"
                    aria-label="交通のサブメニューを開く"
                  >
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`w-4 h-4 transition-transform duration-200 ${openSubMenu === 'transportation' ? 'rotate-180' : ''}`} 
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
                  href="#" 
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="flex-1">メンテナンス情報</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="flex-1">アイテム市場状況</span>
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
  );
};

export default Header;
