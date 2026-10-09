'use client';

import Link from "next/link";
import Image from "next/image";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { useEffect, useState } from "react";
import { trackLpModalOpen, trackLpCtaClick, trackExternalLink } from "@/lib/analytics";
import { cfImageUrl } from "@/lib/cloudflare-image";

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

const serif: React.CSSProperties = { fontFamily: "var(--font-noto-serif)" };

// 本文中のリンク風ボタン（暗い背景用・明るい背景用）
const linkOnDark = "text-sm text-[#a9c7b0] underline decoration-1 underline-offset-[6px] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9c7b0]";
const linkOnLight = "text-sm text-[#3f6149] underline decoration-1 underline-offset-[6px] hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3f6149]";

// モーダル
const Modal = ({ isOpen, onClose, title, children, theme = 'light' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; theme?: 'dark' | 'light' }) => {
    if (!isOpen) return null;

    const dark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto p-7 md:p-10 border-t-4 border-[#5b8064] shadow-xl animate-fade-in-up ${dark ? 'bg-[#252525] text-gray-300' : 'bg-[#f5f5f5] text-gray-700'}`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="閉じる"
                    className={`absolute top-4 right-4 p-1 transition-colors ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className={`jp-heading text-2xl md:text-[1.75rem] font-medium leading-snug mb-6 pr-8 ${dark ? 'text-white' : 'text-black'}`} style={serif}>
                    {title}
                </h3>
                <div className="space-y-7 text-[15px] leading-[1.9]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ModalHeading = ({ children }: { children: React.ReactNode }) => (
    <h4 className="jp-heading text-lg font-semibold text-black mb-2" style={serif}>{children}</h4>
);

const HERO_IMAGES = [
    "https://img.1necat.net/2025-11-29_15.26.54.png",
    "https://img.1necat.net/2025-11-29_15.25.35.png",
    "https://img.1necat.net/2025-11-29_15.48.01.png",
    "https://img.1necat.net/2025-11-29_15.50.03.png"
];

const AREAS = [
    {
        name: "白椿駅",
        note: "スポーン地点",
        body: "ログインすると、最初にこの駅に着きます。住宅街の一つがある萌木駅へは、中央線の1番線から3駅です。",
        image: "https://img.1necat.net/2025-11-28_02.41.46.png",
    },
    {
        name: "中心地",
        note: "有料の区画",
        body: "街の中心部は「中心地」と呼ばれる有料の土地で、店や大きな建物が集まっています。区画はオークションで販売します。（＝地価がかかります）",
        image: "https://img.1necat.net/2025-11-28_16.26.18.png",
    },
    {
        name: "住宅街",
        note: "土地代なし",
        body: "中心地の外なら、どこに建てても土地代はかかりません。初めての方向けには、スポーンの真裏にある三岳が丘、競馬場の最寄りの駿原台、ご近所さんが多めの萌木の3つの住宅街を用意しています。",
        image: "https://img.1necat.net/2025-11-27_18.50.25.png",
    },
];

const SYSTEMS = [
    {
        id: "economy",
        title: "相場が動く市場",
        body: "アイテム市場の価格は固定ではなく、住民の売買に合わせてその都度上下します。値動きはWebでも公開しています。",
        link: "市場の仕組み",
    },
    {
        id: "support",
        title: "運営とサポート",
        body: "UptimeRobotで計測した稼働率は99.78%です。毎週の定期メンテナンスと、Discordでの問い合わせ対応を続けています。",
        link: "稼働率とサポートの実績",
    },
    {
        id: "items",
        title: "340種類以上の追加アイテム",
        body: "家具や料理、乗り物などを追加しています。リソースパックは参加時に自動で入るので、MODの導入は要りません。",
        link: "追加アイテムについて",
    },
];

export default function LPClientPage() {
    const [headerColor, setHeaderColor] = useState<'white' | 'black'>('white');

    // 開いているモーダル
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // ヒーローのスライドショー
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 表示中と次のスライドの画像だけを読み込む（初回表示時に全スライドの画像をまとめて読み込まない）
    const [loadedHeroIndexes, setLoadedHeroIndexes] = useState<number[]>([0]);
    useEffect(() => {
        const nearby = [currentHeroIndex, (currentHeroIndex + 1) % HERO_IMAGES.length];
        setLoadedHeroIndexes((prev) => nearby.every((i) => prev.includes(i)) ? prev : Array.from(new Set([...prev, ...nearby])));
    }, [currentHeroIndex]);

    const openModal = (id: string) => {
        setActiveModal(id);
        trackLpModalOpen(id);
    };
    const closeModal = () => setActiveModal(null);

    // 明るいセクションがヘッダー位置まで来たらロゴの配色を切り替える
    useEffect(() => {
        const handleScroll = () => {
            const lightSection = document.getElementById('light-section-start');
            if (lightSection) {
                const rect = lightSection.getBoundingClientRect();
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
        <div
            className={`min-h-screen bg-[#1c1c1c] text-gray-200 ${notoSerifJP.variable} ${notoSansJP.variable} overflow-x-hidden select-none flex flex-col`}
            style={{ fontFamily: 'var(--font-noto-sans)' }}
        >

            {/* モーダル */}
            <Modal isOpen={activeModal === 'concept'} onClose={closeModal} title="意思疎通ステータス" theme="dark">
                <p>いねさばには、今話しかけてよいかどうかを周りに知らせる「意思疎通ステータス」があります。状態は「雑談歓迎」「作業中」「離席中」の3つで、建築に集中したいときは「作業中」にしておけば、無理に会話に付き合う必要はありません。</p>
                <p>話さなくても、同じ街のどこかに誰かがいる。それくらいの距離感で過ごせる場所にしたいと考えています。</p>
            </Modal>

            <Modal isOpen={activeModal === 'economy'} onClose={closeModal} title="アイテム市場">
                <div>
                    <ModalHeading>価格は売買で動きます</ModalHeading>
                    <p>ゲーム内のアイテム市場（/market）の価格は固定ではありません。誰かがまとめて売れば下がり、買われ続ければ上がるため、同じアイテムでも売る日によって手に入る額が変わります。</p>
                </div>
                <div>
                    <ModalHeading>相場はWebでも見られます</ModalHeading>
                    <p>全アイテムの現在価格と前日比、30日間の値動きは公式サイトで公開しています。全体の物価の目安になる「いねさば物価平均」も載せているので、ログインしていないときにスマホで確認しておくこともできます。</p>
                    <a
                        href="https://www.1necat.net/market"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackExternalLink('market', 'https://www.1necat.net/market')}
                        className={`mt-4 inline-flex items-center gap-1.5 ${linkOnLight}`}
                    >
                        市場のページを開く
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'support'} onClose={closeModal} title="運営とサポート">
                <div>
                    <ModalHeading>稼働率と保護</ModalHeading>
                    <p>UptimeRobotで計測した稼働率は99.785%です。毎週定期メンテナンスを行い、ラグや突然のダウンが起きにくいように手を入れています。ブロックの設置や破壊はCoreProtectで記録しているため、荒らしの被害を受けても元に戻せます。</p>
                </div>
                <div>
                    <ModalHeading>問い合わせへの返信</ModalHeading>
                    <p>不具合の報告や相談は公式Discordで受け付けており、原則24時間以内に返信しています。</p>
                    <p className="mt-3 border-l-2 border-[#5b8064] pl-3 text-sm text-gray-600">直近の不具合報告22件のうち、24時間以内に返信できたのは19件でした。</p>
                </div>
                <div>
                    <ModalHeading>開発タスクの公開</ModalHeading>
                    <p>要望や不具合が放置されていないか確かめられるように、サーバーの改修タスクはGitHubで公開しています。</p>
                    <figure className="mt-4">
                        <div className="overflow-hidden rounded-sm border border-black/10">
                            <Image
                                src="https://img.1necat.net/6178bc97da86c11d0014235bfa84eeab.png"
                                alt="GitHubで公開している開発タスクの一覧"
                                width={800}
                                height={450}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <figcaption className="mt-2 text-xs text-gray-500">GitHubのタスク管理画面</figcaption>
                    </figure>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'items'} onClose={closeModal} title="追加アイテム">
                <div>
                    <ModalHeading>家具から乗り物まで</ModalHeading>
                    <p>照明やソファ、キッチンといった家具のほか、料理、車、帽子など、バニラにはないアイテムを340種類以上追加しています。家の中まで作り込みたい人には、とくに使い道が多いはずです。自作のテクスチャは、なるべくバニラの見た目になじむように作っています。</p>
                    <div className="mt-4 overflow-hidden rounded-sm border border-black/10">
                        <Image
                            src="https://img.1necat.net/2025-11-29_01.41.15.png"
                            alt="家具や料理などの追加アイテムの一覧"
                            width={800}
                            height={450}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>
                <div>
                    <ModalHeading>MODの導入は不要</ModalHeading>
                    <p>追加アイテムの表示に必要なリソースパックは、サーバーに入るときに自動で読み込まれます。確認画面で「はい」を押せば、そのまま遊べます。</p>
                </div>
            </Modal>


            {/* ロゴ（固定表示） */}
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
                        unoptimized
                    />
                    <div className="flex flex-col">
                        <span
                            className={`text-sm md:text-xl font-bold tracking-widest drop-shadow-sm transition-colors duration-500 ${headerColor === 'black' ? 'text-black' : 'text-white'}`}
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

            <div className="flex-grow flex flex-col">

                {/* ヒーロー */}
                <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        {HERO_IMAGES.map((img, index) => (
                            <div
                                key={img}
                                className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${index === currentHeroIndex ? "opacity-100" : "opacity-0"}`}
                                style={{
                                    filter: "brightness(0.4) contrast(1.1)"
                                }}
                            >
                                {/* 1枚目はLCP要素なので優先して読み込む */}
                                {loadedHeroIndexes.includes(index) && (
                                    <Image
                                        src={img}
                                        alt=""
                                        fill
                                        sizes="100vw"
                                        priority={index === 0}
                                        fetchPriority={index === 0 ? "high" : undefined}
                                        loading="eager"
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 px-6 text-center text-white">
                        <h1 className="jp-heading text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.08em] mb-8 opacity-0 animate-fade-in-up" style={serif}>
                            街を積む。<br className="md:hidden" />日々を紡ぐ。
                        </h1>
                        <p className="text-base md:text-lg tracking-[0.04em] text-gray-100 opacity-0 animate-fade-in-up delay-500">
                            住民と一緒に街を作っている、マインクラフトの都市計画サーバーです。
                        </p>
                    </div>
                </section>

                {/* コンセプト */}
                <section className="bg-[#222] px-6 py-32 md:py-48">
                    <div className="mx-auto max-w-5xl md:grid md:grid-cols-[1fr_1.4fr] md:gap-16">
                        <h2 className="jp-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white mb-12 md:mb-0" style={serif}>
                            自由のある秩序
                        </h2>
                        <div className="max-w-[34em] space-y-6 text-base md:text-[17px] leading-[2] text-gray-300">
                            <p>
                                中心地の土地は有料で、幹線道路と鉄道は認可制です。街としての決まりはいくつかありますが、その中で何を建て、何を売り、どう過ごすかは住民に任せています。
                            </p>
                            <p>
                                建築に没頭する人もいれば、市場で売り買いをする人、釣りばかりしている人、週末の競馬で馬券を買う人もいます。会話に加わるかどうかも、その日の気分で決めて構いません。
                            </p>
                            <button type="button" onClick={() => openModal('concept')} className={linkOnDark}>
                                意思疎通ステータスについて
                            </button>
                        </div>
                    </div>
                </section>

                {/* 街の案内 */}
                <section className="bg-[#4a4a4a] px-6 py-28 md:py-40">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="jp-heading text-4xl md:text-5xl font-medium text-white mb-6" style={serif}>
                            街の案内
                        </h2>
                        <p className="max-w-[34em] text-gray-300 leading-[1.9] mb-20 md:mb-28">
                            白椿駅を起点に、有料の中心地と、その外側の住宅街が広がっています。
                        </p>

                        <div className="space-y-24 md:space-y-32">
                            {AREAS.map((area, i) => (
                                <article key={area.name} className="md:grid md:grid-cols-5 md:gap-14 md:items-center">
                                    <div className={`md:col-span-3 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#3d3d3d]">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url('${cfImageUrl(area.image, 1200)}')` }}
                                            />
                                        </div>
                                    </div>
                                    <div className={`md:col-span-2 mt-8 md:mt-0 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                                        <h3 className="jp-heading text-3xl md:text-4xl font-medium text-white mb-2" style={serif}>
                                            {area.name}
                                        </h3>
                                        <p className="text-sm text-[#a9c7b0] mb-6">{area.note}</p>
                                        <p className="max-w-[30em] text-gray-200 leading-[1.95]">{area.body}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 街の仕組み（ここから明るい配色。ヘッダー切り替えの基準） */}
                <section id="light-section-start" className="bg-[#d4d4d4] text-black px-6 py-28 md:py-40">
                    <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_2fr] lg:gap-20">
                        <div className="mb-14 lg:mb-0">
                            <h2 className="jp-heading text-4xl md:text-5xl font-medium leading-tight mb-8" style={serif}>
                                街の仕組み
                            </h2>
                            <p className="max-w-[30em] text-gray-700 leading-[1.95]">
                                職業やスキル、毎週末の競馬などもありますが、ここでは暮らしの土台になっている3つを紹介します。
                            </p>
                        </div>
                        <div className="border-t border-black/20">
                            {SYSTEMS.map((system) => (
                                <div key={system.id} className="border-b border-black/20 py-9 md:grid md:grid-cols-[13rem_1fr] md:gap-10">
                                    <h3 className="jp-heading text-xl md:text-[1.375rem] font-semibold leading-snug mb-3 md:mb-0" style={serif}>
                                        {system.title}
                                    </h3>
                                    <div>
                                        <p className="text-gray-700 leading-[1.9] mb-4">{system.body}</p>
                                        <button type="button" onClick={() => openModal(system.id)} className={linkOnLight}>
                                            {system.link}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 公共事業 */}
                <section className="bg-gradient-to-b from-[#e5e5e5] to-[#f5f5f5] text-black px-6 py-28 md:py-40">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="jp-heading text-3xl md:text-5xl font-medium leading-snug mb-10" style={serif}>
                            道路と鉄道は、住民も敷けます。
                        </h2>
                        <div className="max-w-[34em] space-y-6 text-gray-700 leading-[1.95] mb-14">
                            <p>
                                いねさばでは、家や店は住民がそれぞれ建てています。それに加えて、幹線道路と鉄道も住民の手で敷くことができます。
                            </p>
                            <p>
                                幹線道路と鉄道の整備は認可制です。ガイドラインに沿って計画を立て、運営の認可を受ければ、公式の都市インフラとして施工できます。
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                            <figure>
                                <div className="relative aspect-video overflow-hidden rounded-sm bg-[#dcdcdc]">
                                    <Image
                                        src="https://img.1necat.net/2025-11-29_15.24.15.png"
                                        alt="サーバー内の幹線道路"
                                        fill
                                        sizes="(min-width: 768px) 50vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-600">道路</figcaption>
                            </figure>
                            <figure>
                                <div className="relative aspect-video overflow-hidden rounded-sm bg-[#dcdcdc]">
                                    <Image
                                        src="https://img.1necat.net/2025-11-29_15.23.53.png"
                                        alt="サーバー内の鉄道"
                                        fill
                                        sizes="(min-width: 768px) 50vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm text-gray-600">鉄道</figcaption>
                            </figure>
                        </div>
                    </div>
                </section>

                {/* 参加への導線 */}
                <section className="relative overflow-hidden px-6 py-40 md:py-56 text-center text-black">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url('${cfImageUrl("https://img.1necat.net/d23b15bc802aef4b645617eed52c2b51.jpg", 1920)}')`,
                                filter: "brightness(1.1) grayscale(0.2)"
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#f4f4f4]/10 via-[#f4f4f4]/75 to-[#f4f4f4]"></div>
                    </div>

                    <div className="relative z-10 mx-auto max-w-2xl">
                        <h2 className="jp-heading text-4xl md:text-6xl font-medium leading-tight mb-8" style={serif}>
                            まずは白椿駅から。
                        </h2>
                        <p className="text-gray-800 leading-[1.9] mb-12">
                            下のボタンから、参加方法をまとめたチュートリアルに進めます。街でお会いできるのを楽しみにしています。
                        </p>
                        <Link
                            href="/tutorial"
                            onClick={() => trackLpCtaClick('tutorial')}
                            className="inline-block bg-[#222] px-10 py-4 text-white tracking-[0.06em] transition-colors hover:bg-[#3f6149] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3f6149]"
                        >
                            チュートリアルを見る
                        </Link>
                        <div className="mt-14">
                            <Link href="/" className="text-sm text-gray-700 underline decoration-1 underline-offset-[6px] hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3f6149]">
                                トップページに戻る
                            </Link>
                        </div>
                    </div>
                </section>

            </div>

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
        /* 見出しの字詰めと、文節での改行 */
        .jp-heading {
            font-feature-settings: "palt";
            word-break: auto-phrase;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .delay-500 { animation-delay: 0.5s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1 !important;
          }
        }
      `}</style>
        </div>
    );
}
