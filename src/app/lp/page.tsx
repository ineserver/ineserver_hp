"use client";

import Link from "next/link";
import Image from "next/image";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const notoSerifJP = Noto_Serif_JP({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
    variable: "--font-noto-serif",
});

const notoSansJP = Noto_Sans_JP({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
    variable: "--font-noto-sans",
});

// Simple hook for intersection observer
const useOnScreen = (ref: React.RefObject<HTMLElement | null>, rootMargin = "0px") => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIntersecting(true);
                    observer.disconnect(); // Only trigger once
                }
            },
            { rootMargin }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [ref, rootMargin]);
    return isIntersecting;
};

const FadeInSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const onScreen = useOnScreen(ref, "-50px");

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${onScreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children, theme = 'dark' }: { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; theme?: 'dark' | 'light' }) => {
    if (!isOpen) return null;

    const bgClass = theme === 'dark' ? 'bg-[#252525]' : 'bg-[#f5f5f5]';
    const textClass = theme === 'dark' ? 'text-white' : 'text-black';
    const borderClass = theme === 'dark' ? 'border-white' : 'border-black';
    const closeBtnClass = theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black';
    const titleBorderClass = theme === 'dark' ? 'border-white/10' : 'border-black/10';
    const contentTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`relative ${bgClass} ${textClass} p-8 md:p-12 max-w-2xl w-full shadow-2xl animate-fade-in-up border-t-4 ${borderClass}`}>
                <button onClick={onClose} className={`absolute top-4 right-4 transition-colors ${closeBtnClass}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {title && <h3 className={`text-2xl md:text-3xl font-serif mb-6 border-b ${titleBorderClass} pb-4`} style={{ fontFamily: 'var(--font-noto-serif)' }}>{title}</h3>}
                <div className={`${contentTextClass} leading-relaxed space-y-4 font-light`} style={{ fontFamily: 'var(--font-noto-sans)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [headerColor, setHeaderColor] = useState<'white' | 'black'>('white');

    // Modal States
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const openModal = (id: string) => setActiveModal(id);
    const closeModal = () => setActiveModal(null);

    useEffect(() => {
        const handleScroll = () => {
            // Change color after scrolling past the hero section (approx 80vh to be safe)
            if (window.scrollY > window.innerHeight * 0.8) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            const lightSection = document.getElementById('light-section-start');
            if (lightSection) {
                const rect = lightSection.getBoundingClientRect();
                // Switch to black when the light section is near the top (e.g., header area)
                if (rect.top <= 50) {
                    setHeaderColor('black');
                } else {
                    setHeaderColor('white');
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`min-h-screen bg-[#1c1c1c] text-gray-200 ${notoSerifJP.variable} ${notoSansJP.variable} font-sans overflow-x-hidden select-none`}>

            {/* Modals */}
            <Modal isOpen={activeModal === 'concept'} onClose={closeModal} theme="dark">
                <div className="mb-6 border-b border-white/10 pb-4">
                    <span className="block text-xs font-bold tracking-[0.2em] text-gray-500 mb-2 uppercase font-helvetica">Concept Detail</span>
                    <h3 className="text-2xl md:text-3xl font-serif text-white leading-tight" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                        あなたらしい距離感で、<br className="md:hidden" />街に溶け込む
                    </h3>
                </div>
                <p>いねさばが目指す「居場所」とは、無理に繋がることではありません。 独自の<strong className="text-white">「意思疎通ステータス」システム</strong>により、会話を楽しみたい時は「雑談歓迎」、建築や採掘に集中したい時は「作業中」、少し席を外す時は「離席中」と、その時の気分を周囲に自然に伝えることができます。</p>
                <p>「話さなくても、同じ空間に誰かがいる」。そんな緩やかな繋がりの中で、あなたの好きな街に住み、あなたらしい方法で経済に参加し、あなたらしい役割を見つける。 賑わいの中にも、一人になれる安心がある。それが私たちの考えるデジタル都市の在り方です。</p>
            </Modal>

            <Modal isOpen={activeModal === 'economy'} onClose={closeModal} title="Real Price Fluctuation" theme="light">
                <p>現実の市場のように、アイテムの価格はプレイヤーの取引量によってリアルタイムに変動します。</p>
                <p>需要が高まれば価格は上がり、供給過多になれば下がります。このダイナミックな経済システムが、単なる作業ではない、戦略的な楽しみを生み出します。</p>
                <p>17種類の職業から自分に合ったものを選び、経済の波を読みながら富を築きましょう。</p>
            </Modal>

            <Modal isOpen={activeModal === 'support'} onClose={closeModal} title="Immediate Support" theme="light">
                <p>「荒らしが怖い」「建築が壊されたらどうしよう」そんな不安を解消するために、強力な保護プラグインと、迅速な運営サポート体制を整えています。</p>
                <p>Discordを通じたチケットシステムにより、トラブル発生時には即座に運営チームに連絡が可能。ログ調査による復旧対応も万全です。</p>
                <p>安心して創作活動に没頭できる環境をお約束します。</p>
            </Modal>

            <Modal isOpen={activeModal === 'items'} onClose={closeModal} title="Custom Items" theme="light">
                <p>いねさばでは、通常のマイクラには存在しない340種類以上のカスタムアイテムを追加しています。</p>
                <p>モダンな家具、美味しそうな料理、便利な乗り物など、生活を豊かにするアイテムが盛りだくさん。</p>
                <p>これらのアイテムは、専用のテクスチャパックを導入することで利用可能になります（サーバー参加時に自動適用されます）。</p>
            </Modal>


            {/* Logo & Title - Fixed Position */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50 transition-all duration-300">
                <Link
                    href="/"
                    className={`flex items-center gap-3 group p-2 pr-4 rounded-xl border backdrop-blur-md transition-all duration-500
                        ${headerColor === 'black'
                            ? 'bg-white/80 border-black/10 shadow-sm'
                            : 'bg-black/30 border-white/10'
                        }
                    `}
                >
                    <Image
                        src="/server-icon.png"
                        alt="いねさばアイコン"
                        width={32}
                        height={32}
                        className="rounded-md shadow-sm md:w-10 md:h-10"
                    />
                    <div className="flex flex-col">
                        <span
                            className={`text-sm md:text-xl font-bold tracking-widest drop-shadow-sm transition-colors duration-500 ${headerColor === 'black' ? 'text-black' : 'text-white'}`}
                            style={{ fontFamily: 'var(--font-noto-sans)' }}
                        >
                            いねさば
                        </span>
                        <span
                            className={`text-[8px] md:text-[10px] tracking-[0.2em] uppercase font-helvetica transition-colors duration-500 ${headerColor === 'black' ? 'text-gray-600' : 'text-gray-300'}`}
                        >
                            Ine Server
                        </span>
                    </div>
                </Link>
            </div>

            {/* 1. First View (Hero) - Bold & Minimal */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url('https://img.1necat.net/9f879fc11c65db9e9cfe536244c72546.jpg')",
                            filter: "brightness(0.4) contrast(1.1)"
                        }}
                    />
                </div>

                <div className="relative z-10 text-center text-white p-6">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-thin tracking-widest mb-8 opacity-0 animate-fade-in-up" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                        想像を、<br className="md:hidden" />創造する。
                    </h1>
                    <p className="text-sm md:text-lg tracking-[0.3em] uppercase opacity-0 animate-fade-in-up delay-500 font-light border-t border-white/30 pt-6 inline-block font-helvetica text-gray-300">
                        Create the Imagination.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 opacity-0 animate-fade-in delay-1000">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white text-[10px] tracking-[0.3em] uppercase writing-vertical-rl font-helvetica">SCROLL</span>
                        <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent"></div>
                    </div>
                </div>
            </section>

            {/* 2. Vision - Ample Whitespace */}
            <section className="py-40 md:py-60 px-6 md:px-12 lg:px-24 bg-[#222] relative">
                <div className="max-w-5xl mx-auto">
                    <FadeInSection>
                        <span className="block text-xs font-bold tracking-[0.3em] text-gray-500 mb-12 uppercase font-helvetica">Vision</span>
                    </FadeInSection>

                    <FadeInSection delay={200}>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-24 text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                            自由と秩序が<br />調和する場所。
                        </h2>
                    </FadeInSection>

                    <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
                        <div className="w-full md:w-1/3 pt-4 border-t border-white/30">
                            <FadeInSection delay={400}>
                                <p className="text-sm font-bold tracking-widest uppercase font-helvetica text-gray-400">Concept</p>
                            </FadeInSection>
                        </div>
                        <div className="w-full md:w-2/3">
                            <FadeInSection delay={600}>
                                <p className="text-lg md:text-2xl leading-loose text-gray-300 font-light mb-8" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                    ここは単なるゲームサーバーではありません。<br />
                                    一人ひとりの建築が織りなす、デジタルの都市空間です。<br />
                                    忙しい日常を離れ、もう一つの「居場所」をあなたに。
                                </p>
                                <button
                                    onClick={() => openModal('concept')}
                                    className="px-8 py-3 rounded-full border border-white/30 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-white transition-all duration-300 tracking-widest flex items-center gap-2 group"
                                    style={{ fontFamily: 'var(--font-noto-sans)' }}
                                >
                                    <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">+</span>
                                    <span>詳しく</span>
                                </button>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section >

            {/* 3. Landscape (World Introduction) - Large Images */}
            < section className="py-24 bg-[#4a4a4a]" >
                <div className="container mx-auto px-6 md:px-12">
                    <FadeInSection className="mb-24 text-center md:text-left">
                        <h2 className="text-8xl md:text-[10rem] font-serif font-thin text-white leading-none select-none absolute -top-20 left-0 z-0 opacity-5 pointer-events-none font-helvetica" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                            WORLD
                        </h2>
                        <div className="relative z-10">
                            <span className="block text-xs font-bold tracking-[0.3em] text-gray-400 mb-4 uppercase font-helvetica">Landscape</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>World Introduction</h2>
                        </div>
                    </FadeInSection>

                    <div className="space-y-32">
                        {/* Area 1: Central Station */}
                        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                            <div className="w-full md:w-3/5 order-1 md:order-1">
                                <FadeInSection>
                                    <div className="relative aspect-[4/3] overflow-hidden shadow-2xl border-b-2 border-r-2 border-white/10 rounded-sm">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                                            style={{ backgroundImage: "url('https://img.1necat.net/2025-11-28_02.41.46.png')" }}
                                        />
                                    </div>
                                </FadeInSection>
                            </div>
                            <div className="w-full md:w-2/5 order-2 md:order-2">
                                <FadeInSection delay={200}>
                                    <h3 className="text-3xl md:text-4xl font-serif mb-6 text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>中央駅</h3>
                                    <div className="w-12 h-[1px] bg-white mb-8"></div>
                                    <p className="text-gray-300 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        旅の始まりとなる場所。壮大な建築と行き交う人々。<br />
                                        ここからあなたの物語が始まります。
                                    </p>
                                    <p className="text-xs text-gray-400 tracking-widest uppercase font-helvetica">Spawn Point</p>
                                </FadeInSection>
                            </div>
                        </div>

                        {/* Area 2: City Center */}
                        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                            <div className="w-full md:w-2/5 order-2 md:order-1 md:text-right">
                                <FadeInSection delay={200}>
                                    <h3 className="text-3xl md:text-4xl font-serif mb-6 text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>中心部</h3>
                                    <div className="w-12 h-[1px] bg-white mb-8 ml-auto md:ml-auto md:mr-0"></div>
                                    <p className="text-gray-300 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        経済の中心地。摩天楼が立ち並び、活気に満ちたエリア。<br />
                                        ビジネスと交流の拠点です。
                                    </p>
                                    <p className="text-xs text-gray-400 tracking-widest uppercase font-helvetica">City Center</p>
                                </FadeInSection>
                            </div>
                            <div className="w-full md:w-3/5 order-1 md:order-2">
                                <FadeInSection>
                                    <div className="relative aspect-[4/3] overflow-hidden shadow-2xl border-b-2 border-l-2 border-white/10 rounded-sm">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                                            style={{ backgroundImage: "url('https://img.1necat.net/839b6d5d9584120e81c4fb874ad780d8.jpg')" }}
                                        />
                                    </div>
                                </FadeInSection>
                            </div>
                        </div>

                        {/* Area 3: Suburbs */}
                        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                            <div className="w-full md:w-3/5 order-1 md:order-1">
                                <FadeInSection>
                                    <div className="relative aspect-[4/3] overflow-hidden shadow-2xl border-b-2 border-r-2 border-white/10 rounded-sm">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                                            style={{ backgroundImage: "url('https://img.1necat.net/2025-11-27_18.50.25.png')" }}
                                        />
                                    </div>
                                </FadeInSection>
                            </div>
                            <div className="w-full md:w-2/5 order-2 md:order-2">
                                <FadeInSection delay={200}>
                                    <h3 className="text-3xl md:text-4xl font-serif mb-6 text-white" style={{ fontFamily: 'var(--font-noto-serif)' }}>郊外</h3>
                                    <div className="w-12 h-[1px] bg-white mb-8"></div>
                                    <p className="text-gray-300 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        自然と調和した穏やかな住宅街。<br />
                                        自分だけの理想の家を建てるのに最適な場所です。
                                    </p>
                                    <p className="text-xs text-gray-400 tracking-widest uppercase font-helvetica">Suburbs</p>
                                </FadeInSection>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* 4. System - Modern & Clean */}
            < section id="light-section-start" className="py-40 px-6 bg-[#d4d4d4] text-black" >
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-20">
                        <div className="w-full lg:w-1/3">
                            <FadeInSection>
                                <span className="block text-xs font-bold tracking-[0.3em] text-gray-500 mb-8 uppercase font-helvetica">System</span>
                                <h2 className="text-4xl md:text-5xl font-serif mb-12 leading-tight" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                                    生活を彩る<br />様々なシステム
                                </h2>
                                <p className="text-gray-600 leading-loose mb-12" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                    プレイヤー主導の経済、変動する市場価格。<br />
                                    そして、安心して遊べる万全のサポート体制。<br />
                                    どれも、いねさばライフをより楽しくします。
                                </p>
                            </FadeInSection>
                        </div>
                        <div className="w-full lg:w-2/3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FadeInSection delay={200} className="bg-[#f0f0f0] p-10 hover:bg-white transition-colors duration-500 border-t-2 border-black/10">
                                    <div className="text-4xl mb-6 text-black">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-4 font-serif" style={{ fontFamily: 'var(--font-noto-serif)' }}>リアルな物価変動</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm mb-6" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        プレイヤーの取引によってリアルタイムに変動する市場価格。需要と供給を見極め、富を築く楽しみを提供します。
                                    </p>
                                    <button
                                        onClick={() => openModal('economy')}
                                        className="px-8 py-3 rounded-full border border-black/20 text-sm text-gray-600 hover:text-black hover:bg-black/5 hover:border-black transition-all duration-300 tracking-widest flex items-center gap-2 group"
                                        style={{ fontFamily: 'var(--font-noto-sans)' }}
                                    >
                                        <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">+</span>
                                        <span>詳しく</span>
                                    </button>
                                </FadeInSection>
                                <FadeInSection delay={400} className="bg-[#f0f0f0] p-10 hover:bg-white transition-colors duration-500 border-t-2 border-black/10">
                                    <div className="text-4xl mb-6 text-black">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-4 font-serif" style={{ fontFamily: 'var(--font-noto-serif)' }}>即日サポート</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm mb-6" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        困ったときはすぐに運営へ。透明性のある運営で、快適なプレイ環境を維持するための迅速な対応を約束します。
                                    </p>
                                    <button
                                        onClick={() => openModal('support')}
                                        className="px-8 py-3 rounded-full border border-black/20 text-sm text-gray-600 hover:text-black hover:bg-black/5 hover:border-black transition-all duration-300 tracking-widest flex items-center gap-2 group"
                                        style={{ fontFamily: 'var(--font-noto-sans)' }}
                                    >
                                        <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">+</span>
                                        <span>詳しく</span>
                                    </button>
                                </FadeInSection>
                                <FadeInSection delay={600} className="bg-[#f0f0f0] p-10 hover:bg-white transition-colors duration-500 border-t-2 border-black/10 md:col-span-2">
                                    <div className="text-4xl mb-6 text-black">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold mb-4 font-serif" style={{ fontFamily: 'var(--font-noto-serif)' }}>340種類の追加アイテム</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm mb-6" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                        家具、料理、乗り物など、バニラにはない340種類以上のカスタムアイテムを実装。建築の幅が広がり、生活がより豊かになります。
                                    </p>
                                    <button
                                        onClick={() => openModal('items')}
                                        className="px-8 py-3 rounded-full border border-black/20 text-sm text-gray-600 hover:text-black hover:bg-black/5 hover:border-black transition-all duration-300 tracking-widest flex items-center gap-2 group"
                                        style={{ fontFamily: 'var(--font-noto-sans)' }}
                                    >
                                        <span className="group-hover:rotate-180 transition-transform duration-500 inline-block">+</span>
                                        <span>詳しく</span>
                                    </button>
                                </FadeInSection>
                            </div>
                        </div>
                    </div>
                </div>
            </section >


            {/* New Section: Citizenship - Gradient Light */}
            <section className="py-32 md:py-48 px-6 bg-gradient-to-b from-[#e5e5e5] to-[#f5f5f5] text-black relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <FadeInSection>
                        <span className="block text-xs font-bold tracking-[0.3em] text-gray-500 mb-10 uppercase font-helvetica">Citizenship</span>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-16 leading-tight text-gray-900" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                            あなたも、<br />
                            都市開発者の一員です。
                        </h2>
                        <div className="space-y-8 text-gray-600 leading-loose font-light text-sm md:text-base" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                            <p>
                                いねさばでは、運営だけが街を作るのではありません。<br />
                                あなたが建てる家、あなたが営む店、あなたが歩く道。
                            </p>
                            <p>
                                その一つひとつが、この都市の風景となり、歴史となります。<br />
                                さあ、あなたの手で、この街に新たな彩りを。
                            </p>
                        </div>
                    </FadeInSection>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>
            </section>

            {/* 5. Access - Start a Journey (Airplane Takeoff) */}
            < section className="relative py-60 text-black text-center overflow-hidden group" >
                {/* Background Image for Journey */}
                < div className="absolute inset-0 z-0 overflow-hidden" >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url('https://img.1necat.net/d23b15bc802aef4b645617eed52c2b51.jpg')", // Suburbs image as placeholder for "Journey"
                            filter: "brightness(1.1) grayscale(0.2)"
                        }}
                    />
                    {/* Cloud/Speed effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f4f4f4]/0 via-[#f4f4f4]/60 to-[#f4f4f4]"></div>
                </div >

                <div className="container mx-auto px-6 relative z-10">
                    <FadeInSection>
                        <h2 className="text-5xl md:text-7xl font-serif mb-12 leading-tight tracking-widest drop-shadow-sm" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                            さあ、<br />旅に出よう。
                        </h2>
                        <p className="text-lg md:text-xl text-gray-700 mb-20 font-light tracking-widest drop-shadow-sm" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                            無限の可能性が広がる世界が、<br className="md:hidden" />あなたを待っています。
                        </p>
                    </FadeInSection>

                    <div className="flex flex-col items-center gap-8">
                        <FadeInSection delay={200} className="w-full max-w-md flex flex-col items-center">
                            <Link href="/tutorial" className="group">
                                <div className="relative px-12 py-8 border border-black/30 bg-black/5 backdrop-blur-sm transition-all duration-500 group-hover:bg-black/10 group-hover:border-black group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-4 text-black text-xl md:text-2xl font-serif tracking-[0.2em]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                                        <span>VISIT THE CITY</span>
                                        <span className="font-light transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                                    </div>
                                    <p className="text-xs text-gray-600 tracking-widest font-light" style={{ fontFamily: 'var(--font-noto-sans)' }}>初めての方・参加手順はこちら</p>
                                </div>
                            </Link>
                        </FadeInSection>

                        <FadeInSection delay={400}>
                            <Link href="/" className="inline-block text-black/60 hover:text-black transition-colors tracking-widest border-b border-transparent hover:border-black pb-1 mt-12" style={{ fontFamily: 'var(--font-noto-sans)' }}>
                                トップページに戻る
                            </Link>
                        </FadeInSection>
                    </div>
                </div>
            </section >

            {/* Footer - Simple Copyright */}
            < footer className="bg-[#fafafa] text-gray-500 py-12 text-center text-xs tracking-[0.2em] border-t border-gray-200 font-helvetica" >
                & copy; Ineserver.All Rights Reserved.
            </footer >

            <style jsx global>{`
        :root {
            --font-noto-sans: ${notoSansJP.style.fontFamily};
        }
        body {
            background-color: #1c1c1c;
        }
        .font-helvetica {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-fade-in {
            animation: fade-in 1.5s ease-out forwards;
        }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1.0s; }
        
        .writing-vertical-rl {
            writing-mode: vertical-rl;
        }
      `}</style>
        </div >
    );
}
