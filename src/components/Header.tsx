'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ChevronDownIcon } from './Icons';
import { trackExternalLink, trackMobileMenuToggle } from '@/lib/analytics';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGoTop, setShowGoTop] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [isVoteDropdownOpen, setIsVoteDropdownOpen] = useState(false);

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

  // 投票サイトドロップダウンが開いているときに外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVoteDropdownOpen) {
        const target = event.target as Element;
        const voteButton = document.querySelector('[aria-label="投票サイトメニューを開く"]');
        const voteDropdown = document.querySelector('.vote-dropdown');

        if (voteButton && voteDropdown &&
          !voteButton.contains(target) &&
          !voteDropdown.contains(target)) {
          setIsVoteDropdownOpen(false);
        }
      }
    };

    if (isVoteDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVoteDropdownOpen]);

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

  // 外部リンククリック時の追跡
  const handleExternalClick = (linkName: string, url: string) => {
    trackExternalLink(linkName, url);
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
                  {/* 投票サイトドロップダウン */}
                  <div className="relative">
                    <button
                      onClick={() => setIsVoteDropdownOpen(!isVoteDropdownOpen)}
                      aria-label="投票サイトメニューを開く"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      投票サイト
                      <svg className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isVoteDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`vote-dropdown absolute top-full left-0 mt-1 w-56 bg-white shadow-lg border border-gray-200 rounded-lg z-50 transition-all duration-200 ${isVoteDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                      <div className="py-1">
                        <a
                          href="https://minecraft.jp/servers/67de4f4ce22bc84120000007"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleExternalClick('minecraft_jp', 'https://minecraft.jp/servers/67de4f4ce22bc84120000007')}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5b8064] transition-colors"
                        >
                          <Image
                            src="https://www.google.com/s2/favicons?domain=minecraft.jp&sz=32"
                            alt="minecraft.jp"
                            width={16}
                            height={16}
                            className="w-4 h-4 mr-3"
                            unoptimized
                          />
                          <span className="flex-1">minecraft.jp</span>
                          <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <a
                          href="https://mineportal.jp/servers/cmjfvb3u000004j6pgfvpfcet"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleExternalClick('mine_portal', 'https://mineportal.jp/servers/cmjfvb3u000004j6pgfvpfcet')}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5b8064] transition-colors"
                        >
                          <Image
                            src="https://www.google.com/s2/favicons?domain=mineportal.jp&sz=32"
                            alt="MinePortal"
                            width={16}
                            height={16}
                            className="w-4 h-4 mr-3"
                            unoptimized
                          />
                          <span className="flex-1">MinePortal</span>
                          <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                  <a href="https://stats.uptimerobot.com/Rw0L1innjO" onClick={() => handleExternalClick('uptime_status', 'https://stats.uptimerobot.com/Rw0L1innjO')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    死活情報
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a href="https://market.1necat.net" onClick={() => handleExternalClick('market', 'https://market.1necat.net')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5">
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
                    onClick={() => handleExternalClick('map', 'https://map.1necat.net')}
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
                  onClick={() => {
                    const newState = !isMenuOpen;
                    setIsMenuOpen(newState);
                    trackMobileMenuToggle(newState ? 'open' : 'close');
                  }}
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
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V10.5L16,10.5V16.5L8,16.5V10.5L9.2,10.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.5L13.5,10.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" />
                        </svg>
                        保護
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/life/land-protection" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の保護のやり方</Link></li>
                        <li><Link href="/life/block-protection" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />ブロック保護のやり方</Link></li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.7,4.647c-0.082-0.412-0.197-0.622-0.197-0.622c-0.035-0.111-0.131-0.193-0.245-0.212c-0.116-0.018-0.232,0.03-0.3,0.125l-0.306,0.429l-1.73,2.429c-0.334,0.467-1.016,0.552-1.524,0.19l-2.913-2.084c-0.507-0.363-0.648-1.036-0.313-1.503l1.772-2.488l0.291-0.406c0.067-0.095,0.076-0.22,0.023-0.322c-0.054-0.103-0.161-0.167-0.278-0.166c0,0-0.275-0.047-0.714,0.009c-1.106,0.141-2.183,0.602-3.083,1.391c-1.271,1.113-1.939,2.66-1.976,4.225c-0.012,0.472,0.415,2.523-0.7,3.639S0.938,19.821,0.938,19.821c-0.956,0.957-0.956,2.507,0,3.463c0.957,0.956,2.507,0.956,3.463,0c0,0,9.655-9.655,10.54-10.54s3.337-1.147,3.825-1.213c1.09-0.147,2.149-0.606,3.038-1.385C23.419,8.735,24.066,6.613,23.7,4.647z M1.876,22.347c-0.458-0.458-0.458-1.201,0-1.659c0.458-0.458,1.201-0.458,1.659,0c0.458,0.458,0.458,1.201,0,1.659C3.077,22.805,2.334,22.805,1.876,22.347z" />
                        </svg>
                        便利機能
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/life/mcmmo" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />スキルシステム (mcMMO)</Link></li>
                        <li><Link href="/life/imageflame" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />画像地図の作成と使い方</Link></li>
                        <li><Link href="/life/status" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />意思疎通ステータス機能</Link></li>
                        <li><Link href="/life/sort" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />自動整理機能の使い方</Link></li>
                        <li><Link href="/life/exp" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />経験値ボトルのアイテム化</Link></li>
                        <li><Link href="/life/mail" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />メールシステムの使い方</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        ガイドライン
                      </h3>
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
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" />
                        </svg>
                        アイテム取引
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/economy/market" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アイテム市場取引のやり方</Link></li>
                        <li><Link href="/economy/shop" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />お店を作る・お店で買う</Link></li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2L2,7V9H22V7M3,10V19H2V21H22V19H21V10M18,10H15V19H18M10,10H7V19H10M13,10V19H14V10" />
                        </svg>
                        土地・ライセンス
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/economy/buycommand" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />コマンドの購入</Link></li>
                        <li><Link href="/economy/land-purchase" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />土地の購入・管理</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">その他</h3>
                      <ul className="space-y-1">
                        <li><Link href="/economy/marker" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />マーカー登録・広告機能</Link></li>
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
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75A1.75,1.75 0 0,1 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M7,8C5.89,8 5,8.89 5,10V11H9V10C9,8.89 8.11,8 7,8M17,8C15.89,8 15,8.89 15,10V11H19V10C19,8.89 18.11,8 17,8M10,13A1,1 0 0,0 9,14A1,1 0 0,0 10,15A1,1 0 0,0 11,14A1,1 0 0,0 10,13M14,13A1,1 0 0,0 13,14A1,1 0 0,0 14,15A1,1 0 0,0 15,14A1,1 0 0,0 14,13Z" />
                        </svg>
                        ゲーム
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/adventure/arena" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />アリーナの遊び方</Link></li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" />
                        </svg>
                        アイテム
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/adventure/additems" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />レシピのないアイテムの入手方法</Link></li>
                        <li><Link href="/adventure/hide-item" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />隠しアイテム・隠し部屋の一覧とヒント</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                        </svg>
                        システム
                      </h3>
                      <ul className="space-y-1">
                        <li><Link href="/adventure/achivements" className="hover:text-[#5b8064] text-sm block py-1 flex items-center"><ChevronRightIcon className="w-3 h-3 mr-2 text-[#5b8064]" />実績・称号システム</Link></li>
                      </ul>
                    </div>
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
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        ガイドライン
                      </h3>
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
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          ルール・規約
                        </h4>
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
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V10.5L16,10.5V16.5L8,16.5V10.5L9.2,10.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.5L13.5,10.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" />
                          </svg>
                          保護
                        </h4>
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
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.7,4.647c-0.082-0.412-0.197-0.622-0.197-0.622c-0.035-0.111-0.131-0.193-0.245-0.212c-0.116-0.018-0.232,0.03-0.3,0.125l-0.306,0.429l-1.73,2.429c-0.334,0.467-1.016,0.552-1.524,0.19l-2.913-2.084c-0.507-0.363-0.648-1.036-0.313-1.503l1.772-2.488l0.291-0.406c0.067-0.095,0.076-0.22,0.023-0.322c-0.054-0.103-0.161-0.167-0.278-0.166c0,0-0.275-0.047-0.714,0.009c-1.106,0.141-2.183,0.602-3.083,1.391c-1.271,1.113-1.939,2.66-1.976,4.225c-0.012,0.472,0.415,2.523-0.7,3.639S0.938,19.821,0.938,19.821c-0.956,0.957-0.956,2.507,0,3.463c0.957,0.956,2.507,0.956,3.463,0c0,0,9.655-9.655,10.54-10.54s3.337-1.147,3.825-1.213c1.09-0.147,2.149-0.606,3.038-1.385C23.419,8.735,24.066,6.613,23.7,4.647z M1.876,22.347c-0.458-0.458-0.458-1.201,0-1.659c0.458-0.458,1.201-0.458,1.659,0c0.458,0.458,0.458,1.201,0,1.659C3.077,22.805,2.334,22.805,1.876,22.347z" />
                          </svg>
                          便利機能
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/life/mcmmo" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            スキルシステム (mcMMO)
                          </Link>
                          <Link href="/life/imageflame" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            画像地図の作成と使い方
                          </Link>
                          <Link href="/life/status" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            意思疎通ステータス機能
                          </Link>
                          <Link href="/life/sort" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            自動整理機能の使い方
                          </Link>
                          <Link href="/life/exp" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            経験値ボトルのアイテム化
                          </Link>
                          <Link href="/life/mail" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            メールシステムの使い方
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          ガイドライン
                        </h4>
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
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" />
                          </svg>
                          アイテム取引
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/economy/market" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            アイテム市場取引のやり方
                          </Link>
                          <Link href="/economy/shop" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            お店を作る・お店で買う
                          </Link>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2L2,7V9H22V7M3,10V19H2V21H22V19H21V10M18,10H15V19H18M10,10H7V19H10M13,10V19H14V10" />
                          </svg>
                          土地・ライセンス
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/economy/buycommand" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            コマンドの購入
                          </Link>
                          <Link href="/economy/land-purchase" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            土地の購入・管理
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">その他</h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/economy/marker" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            マーカー登録・広告機能
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

                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75A1.75,1.75 0 0,1 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M7,8C5.89,8 5,8.89 5,10V11H9V10C9,8.89 8.11,8 7,8M17,8C15.89,8 15,8.89 15,10V11H19V10C19,8.89 18.11,8 17,8M10,13A1,1 0 0,0 9,14A1,1 0 0,0 10,15A1,1 0 0,0 11,14A1,1 0 0,0 10,13M14,13A1,1 0 0,0 13,14A1,1 0 0,0 14,15A1,1 0 0,0 15,14A1,1 0 0,0 14,13Z" />
                          </svg>
                          ゲーム
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/adventure/arena" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            アリーナの遊び方
                          </Link>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" />
                          </svg>
                          アイテム
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/adventure/additems" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            レシピのないアイテムの入手方法
                          </Link>
                          <Link href="/adventure/hide-item" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            隠しアイテム・隠し部屋の一覧とヒント
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                          </svg>
                          システム
                        </h4>
                        <div className="pl-4 space-y-1">
                          <Link href="/adventure/achivements" className="block py-2 px-3 text-sm hover:text-[#5b8064] hover:bg-white rounded-md transition-colors" onClick={closeMenu}>
                            実績・称号システム
                          </Link>
                        </div>
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
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#5b8064]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          ガイドライン
                        </h4>
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
                  {/* 投票サイトセクション */}
                  <div className="mb-3 border border-[#5b8064]/30 rounded-lg p-3 bg-[#5b8064]/5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      投票サイト
                    </h4>
                    <div className="space-y-1">
                      <a
                        href="https://minecraft.jp/servers/67de4f4ce22bc84120000007"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Image
                          src="https://www.google.com/s2/favicons?domain=minecraft.jp&sz=32"
                          alt="minecraft.jp"
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-3 flex-shrink-0"
                          unoptimized
                        />
                        <span className="flex-1">minecraft.jp</span>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a
                        href="https://mineportal.jp/servers/cmjfvb3u000004j6pgfvpfcet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-3 text-sm hover:text-[#5b8064] hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Image
                          src="https://www.google.com/s2/favicons?domain=mineportal.jp&sz=32"
                          alt="MinePortal"
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-3 flex-shrink-0"
                          unoptimized
                        />
                        <span className="flex-1">MinePortal</span>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

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
