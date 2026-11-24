"use client";

// トップの「開催中・開催予定のイベント」
// 都庁総合ホームページの形にならい、色の帯の上にバナー（16:9のまま）と解説の欄を並べ、
// 帯の下端に「一時停止＋サムネと題名」の帯を重ねる。
// 箱・札・ボタンは、下の「お知らせ」「サーバーステータス」と同じ作り（角丸・灰色の枠線・影なし）にそろえる。
// 帯は白を下地に、表示中のバナーから取り出した数色（lib/image-color.ts）をぼかして重ねる。
// にじみは、その色がバナーの中にある位置から出す。切り替えると、にじみも入れ替わる。

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    DEFAULT_IMAGE,
    DEFAULT_PALETTE,
    EventStatus,
    PaletteColor,
    ShowcaseEvent,
    formatDateTime,
    getStatus,
    orderEvents,
    useNow,
    usePrefersReducedMotion,
} from "./eventUtils";

interface Props {
    events: ShowcaseEvent[];
    renderedAt: number;
}

const GREEN = "#5b8064";
// イベント欄の幅（この中に画像・解説欄・ナビゲーションを置く）：1440pxまでの画面では下のお知らせなどと同じ（最大1280px）。
// それより大きい画面（4Kモニターなど）では、1440pxの画面で見たときと同じ割合（画面幅の88.9%）まで広げる。
// 下のお知らせなどは1280pxのままなので、大きい画面ほどイベント欄が目立つ
// （大きい画面用の切り替えは rem で書く。px で書くと lg より前に並び、lg に上書きされるため。
//   90.0625rem＝1441px、120rem＝1920px、160rem＝2560px）
const WIDE = "mx-auto max-w-[max(80rem,88.9vw)] px-3 sm:px-4 lg:px-6";

function Chevron({ dir = "right", className = "h-4 w-4" }: { dir?: "left" | "right"; className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
        </svg>
    );
}

// 「#5b8064」と透明度から rgba() を作る
function withAlpha(hex: string, alpha: number) {
    const v = parseInt(hex.slice(1), 16);
    return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha.toFixed(2)})`;
}

// にじみを置く場所（帯と下のナビゲーションを合わせた範囲の%）。バナーと解説欄の裏は見えないので、まわりの余白に置く
const ANCHORS = [
    { x: 0, y: 25 },   // 左
    { x: 100, y: 20 }, // 右
    { x: 45, y: 0 },   // 上
    { x: 0, y: 92 },   // 左下（ナビゲーションの高さ）
    { x: 100, y: 92 }, // 右下（ナビゲーションの高さ）
    { x: 75, y: 0 },   // 右上
];

// 取り出した色を、白の上に重ねるぼかしの背景にする
// 色ごとに、バナーの中でその色がある位置に一番近い場所から出し、余った場所は多い色から順に埋める
function meshBackground(palette: PaletteColor[]) {
    const assigned: { anchor: number; color: PaletteColor; primary: boolean }[] = [];
    const used = new Set<number>();
    for (const c of palette) {
        // バナーは左側およそ3分の2・上から8割ほどにあるので、画像の中の位置をその範囲に写す
        const mx = c.x * 66;
        const my = c.y * 80;
        let best = -1;
        let bestDist = Infinity;
        ANCHORS.forEach((p, i) => {
            if (used.has(i)) return;
            const d = (p.x - mx) ** 2 + (p.y - my) ** 2;
            if (d < bestDist) { bestDist = d; best = i; }
        });
        if (best < 0) break;
        used.add(best);
        assigned.push({ anchor: best, color: c, primary: true });
    }
    let k = 0;
    ANCHORS.forEach((_, i) => {
        if (used.has(i)) return;
        assigned.push({ anchor: i, color: palette[k % palette.length], primary: false });
        k++;
    });

    return assigned
        .map(({ anchor, color, primary }) => {
            const p = ANCHORS[anchor];
            const alpha = primary ? 0.4 + 0.35 * color.weight : 0.32;
            return `radial-gradient(ellipse 52% 95% at ${p.x}% ${p.y}%, ${withAlpha(color.color, alpha)} 0%, ${withAlpha(color.color, 0)} 72%)`;
        })
        .join(", ");
}

// 札：ガイドの「NEW」「更新」と同じ形（角を少し丸めた塗りの札）。開催中はいねさばの緑、予告は記事の強調と同じ赤
function StatusTag({ status, size = "md" }: { status: EventStatus | null; size?: "sm" | "md" }) {
    const color = !status ? "bg-gray-500" : status.kind === "ongoing" ? "bg-[#5b8064]" : "bg-[#bf5550]";
    const box = size === "sm" ? "min-w-[2.5rem] px-1.5 py-1 text-[10px]" : "min-w-[3rem] px-2 py-1 text-xs";
    return (
        <span className={`inline-block flex-shrink-0 text-center font-bold leading-none whitespace-nowrap rounded text-white ${box} ${color}`}>
            {status ? status.label : "ご案内"}
        </span>
    );
}

export default function EventSpotlight({ events, renderedAt }: Props) {
    const now = useNow(renderedAt);
    const reducedMotion = usePrefersReducedMotion();
    const ordered = orderEvents(events, renderedAt);
    const hasEvents = ordered.length > 0;

    const slides = hasEvents
        ? ordered.map((e) => ({ key: e.id, event: e as ShowcaseEvent | null, href: `/announcements/${e.id}`, image: e.image || DEFAULT_IMAGE, title: e.title, description: e.description, excerpt: e.excerpt ?? "", palette: e.palette && e.palette.length > 0 ? e.palette : DEFAULT_PALETTE }))
        : [{ key: "welcome", event: null, href: "/lp", image: DEFAULT_IMAGE, title: "いねさばへようこそ", description: "忙しい日常離れ、もう一つの「居場所」をあなたに。", excerpt: "", palette: DEFAULT_PALETTE }];

    const n = slides.length;
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const autoplay = n > 1 && !paused && !hovered && !reducedMotion;

    const go = (delta: number) => setActive((a) => (a + delta + n) % n);

    // 帯（スマホでは横にスクロールする）の中で、選んでいる項目が隠れていたら見える位置まで動かす
    const stripRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    useEffect(() => {
        const strip = stripRef.current;
        const item = itemRefs.current[active];
        if (!strip || !item) return;
        const left = item.offsetLeft;
        const right = left + item.offsetWidth;
        if (left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth) {
            strip.scrollTo({ left: left - (strip.clientWidth - item.offsetWidth) / 2, behavior: reducedMotion ? "auto" : "smooth" });
        }
    }, [active, reducedMotion]);
    const current = slides[active];

    // 説明文と開始・終了の表は、解説欄に最後まで入りきるときだけ出す（途中で切れるなら出さない）。
    // スマホでは CSS で最初は隠しておき、ここで入りきると分かったときだけ出す
    const panelRef = useRef<HTMLDivElement>(null);
    const excerptRef = useRef<HTMLParagraphElement>(null);
    const datesRef = useRef<HTMLTableElement>(null);
    const fitDetails = useCallback(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const show = (el: HTMLElement | null, on: boolean, display: string) => { if (el) el.style.display = on ? display : "none"; };
        const overflows = () => panel.scrollHeight > panel.clientHeight + 1;
        // 両方 → 説明文だけ → 表だけ → どちらも出さない、の順に試し、最初に入りきった組み合わせにする（説明文を優先）
        const patterns: [boolean, boolean][] = [[true, true], [true, false], [false, true], [false, false]];
        for (const [excerpt, dates] of patterns) {
            show(excerptRef.current, excerpt, "block");
            show(datesRef.current, dates, "table");
            if (!overflows()) break;
        }
    }, []);
    useLayoutEffect(() => { fitDetails(); }, [active, fitDetails]);
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const observer = new ResizeObserver(() => fitDetails());
        observer.observe(panel);
        return () => observer.disconnect();
    }, [fitDetails]);
    const status = current.event ? getStatus(current.event, now) : null;

    // 画面上でのこの欄の上端（＝ヘッダーの高さ）。PCで「ヘッダー＋この欄＝画面の高さの80%」にするために使う
    const sectionRef = useRef<HTMLElement>(null);
    const [heroTop, setHeroTop] = useState<number | null>(null);
    useEffect(() => {
        const measure = () => {
            const el = sectionRef.current;
            if (el) setHeroTop(Math.round(el.getBoundingClientRect().top + window.scrollY));
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // 自動切り替えを止めるのは、マウスが画像・解説欄・ナビゲーションの上にあるときだけ（背景の上では止めない）
    const hoverHandlers = {
        onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === "mouse") setHovered(true); },
        onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === "mouse") setHovered(false); },
    };

    // スマホでは画像を左右にスワイプして切り替える
    const swipe = useRef({ x: 0, dx: 0, touching: false });
    const swipeHandlers = {
        onPointerDown: (e: React.PointerEvent) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, dx: 0, touching: true }; },
        onPointerMove: (e: React.PointerEvent) => { if (swipe.current.touching) swipe.current.dx = e.clientX - swipe.current.x; },
        onPointerUp: () => {
            if (!swipe.current.touching) return;
            swipe.current.touching = false;
            if (swipe.current.dx < -40) go(1);
            else if (swipe.current.dx > 40) go(-1);
        },
        onPointerCancel: () => { swipe.current.touching = false; },
        onClickCapture: (e: React.MouseEvent) => { if (Math.abs(swipe.current.dx) > 8) { e.preventDefault(); swipe.current.dx = 0; } },
    };

    return (
        <section
            ref={sectionRef}
            aria-roledescription="carousel"
            aria-label="開催中・開催予定のイベント"
            onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
            className="relative overflow-hidden bg-white"
            style={heroTop !== null ? ({ "--hero-top": `${heroTop}px` } as React.CSSProperties) : undefined}
        >
            {/* にじみ：この欄から下のナビゲーションの途中までに敷き、そこで白に溶かす。
                スライドごとに重ねて置き、表示中のものだけを見せる */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 bottom-4 sm:bottom-12 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
                {slides.map((s, i) => (
                    <div
                        key={s.key}
                        className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
                        style={{ backgroundImage: meshBackground(s.palette) }}
                    />
                ))}
            </div>

            <div className={`@container relative ${WIDE} pt-4 lg:pt-6 pb-3 sm:pb-4 lg:pb-0`}>
                {/* 見出しは画面には出さず、読み上げ・検索向けにだけ置く（この欄そのものが見出しの役をするため） */}
                <h2 className="sr-only">{hasEvents ? "開催中・開催予定のイベント" : "ご案内"}</h2>

                {/* スマホ・PCでは、画像（16:9）・解説欄・ナビゲーションの大きさを globals.css の .event-hero-* で決める
                    （ヘッダーとこの欄を合わせて画面の高さの80%に収め、下の20%に次の内容が見えるようにする） */}
                <div className="event-hero-group mx-auto">
                    <div className="event-hero-row grid grid-cols-1 gap-3 sm:gap-4">
                        {/* 画像：切らずに16:9のまま、上には何も重ねない。切り替えはフェード */}
                        <div className="event-hero-banner relative touch-pan-y" {...hoverHandlers} {...swipeHandlers}>
                            <Link href={current.href} draggable={false} className="relative block aspect-video h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                                {slides.map((s, i) => (
                                    <Image
                                        key={s.key}
                                        src={s.image}
                                        alt={i === active ? s.title : ""}
                                        fill
                                        draggable={false}
                                        sizes="(min-width: 1024px) 70vw, 100vw"
                                        priority={i === 0}
                                        className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
                                    />
                                ))}
                            </Link>
                        </div>

                        {/* 解説欄。スマホでは「札・残り日数・題名・詳細を見る」が基本。
                            説明文と開始・終了の表は、最後まで入りきるときだけ出す（fitDetails） */}
                        <div
                            ref={panelRef}
                            className="event-hero-panel flex flex-col rounded-lg border border-gray-200 bg-white px-5 py-4 sm:py-5 lg:px-6 lg:py-6 min-[120rem]:px-8 min-[120rem]:py-8 min-[160rem]:px-10 min-[160rem]:py-10 text-[#333]"
                            {...hoverHandlers}
                        >
                            <div className="flex items-center gap-2.5">
                                <StatusTag status={status} />
                                {status && <span className="text-sm min-[120rem]:text-base min-[160rem]:text-lg font-bold text-gray-900">{status.countdown}</span>}
                            </div>

                            <h3 className="shrink-0 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-none text-[1.2rem] sm:text-[1.3rem] lg:text-[1.45rem] min-[120rem]:text-[1.8rem] min-[160rem]:text-[2.2rem] font-bold leading-[1.45] text-[#222]" style={{ fontFeatureSettings: '"palt"' }}>
                                {current.title}
                            </h3>

                            {current.event && (
                                <table ref={datesRef} className="event-hero-dates shrink-0 mt-4 w-full border-collapse text-sm min-[120rem]:text-base min-[160rem]:text-lg">
                                    <tbody>
                                        <tr>
                                            <th scope="row" className="w-16 border-y border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600">開始</th>
                                            <td className="border-y border-gray-200 px-3 py-2">{formatDateTime(current.event.startDate)}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row" className="border-y border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-600">終了</th>
                                            <td className="border-y border-gray-200 px-3 py-2">{formatDateTime(current.event.endDate)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}

                            <p ref={excerptRef} className="event-hero-excerpt shrink-0 mt-4 text-sm min-[120rem]:text-base min-[160rem]:text-lg leading-[1.85] text-[#444]">{current.excerpt || current.description}</p>

                            <div className="shrink-0 mt-auto pt-4 sm:pt-5">
                                <Link
                                    href={current.href}
                                    className="flex w-full items-center justify-center rounded-md bg-[#5b8064] px-6 py-3 min-[120rem]:py-4 text-sm min-[120rem]:text-base min-[160rem]:text-lg font-medium text-white transition-colors duration-200 hover:bg-[#4a6b55]"
                                >
                                    {current.event ? "詳細を見る" : "いねさばについて"}
                                    <Chevron className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {n > 1 && (
                        <>
                            {/* スマホのナビゲーション：点と線（選んでいるものが線になり、次に切り替わるまでの残り時間で色が伸びる） */}
                            <div className="sm:hidden mt-3 flex items-center justify-center gap-1">
                                {slides.map((s, i) => {
                                    const isActive = i === active;
                                    return (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => setActive(i)}
                                            aria-label={`${i + 1}件目：${s.title}`}
                                            aria-current={isActive}
                                            className="p-1.5 cursor-pointer"
                                        >
                                            <span className={`relative block h-1.5 overflow-hidden rounded-full bg-gray-300 transition-all ${isActive ? "w-7" : "w-1.5"}`}>
                                                {isActive && (
                                                    <span
                                                        key={active}
                                                        className={`absolute inset-0 rounded-full ${!reducedMotion ? "event-autoplay" : ""}`}
                                                        style={{ background: GREEN, animationPlayState: autoplay ? "running" : "paused" }}
                                                        onAnimationEnd={() => go(1)}
                                                    />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* タブレット・PCのナビゲーション：［前・一時停止・次］［イベント…］［一覧］ */}
                            <div className="event-hero-strip mt-4 hidden sm:flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white" {...hoverHandlers}>
                                {/* 操作はここにまとめる：前へ・一時停止・次へ（音楽プレーヤーと同じ並び） */}
                                <div className="flex shrink-0 divide-x divide-gray-200 border-r border-gray-200" style={{ color: GREEN }}>
                                    <button
                                        type="button"
                                        onClick={() => go(-1)}
                                        aria-label="前のイベント"
                                        className="flex w-10 lg:w-12 items-center justify-center hover:bg-gray-50 cursor-pointer"
                                    >
                                        <Chevron dir="left" className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaused((p) => !p)}
                                        aria-label={paused ? "自動切り替えを再開" : "自動切り替えを一時停止"}
                                        className="flex w-10 lg:w-12 items-center justify-center hover:bg-gray-50 cursor-pointer"
                                    >
                                        {paused ? (
                                            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                                        ) : (
                                            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => go(1)}
                                        aria-label="次のイベント"
                                        className="flex w-10 lg:w-12 items-center justify-center hover:bg-gray-50 cursor-pointer"
                                    >
                                        <Chevron className="h-5 w-5" />
                                    </button>
                                </div>

                                <div ref={stripRef} className="relative flex flex-1 overflow-x-auto no-scrollbar">
                                    {slides.map((s, i) => {
                                        const st = s.event ? getStatus(s.event, now) : null;
                                        const isActive = i === active;
                                        return (
                                            <button
                                                key={s.key}
                                                ref={(el) => { itemRefs.current[i] = el; }}
                                                type="button"
                                                onClick={() => setActive(i)}
                                                aria-current={isActive}
                                                className={`relative flex min-w-[230px] flex-1 items-center gap-3 border-r border-gray-200 last:border-r-0 px-3 py-3 min-[120rem]:px-4 text-left cursor-pointer ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}
                                            >
                                                {/* 上端の線：選んでいるものは、次に切り替わるまでの残り時間を表す */}
                                                {isActive && (
                                                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gray-200">
                                                        <span
                                                            key={active}
                                                            className={`block h-full ${!reducedMotion ? "event-autoplay" : ""}`}
                                                            style={{ background: GREEN, animationPlayState: autoplay ? "running" : "paused" }}
                                                            onAnimationEnd={() => go(1)}
                                                        />
                                                    </span>
                                                )}
                                                <span className="relative aspect-video w-16 lg:w-20 min-[120rem]:w-28 min-[160rem]:w-36 shrink-0 overflow-hidden bg-gray-100">
                                                    <Image src={s.image} alt="" fill sizes="144px" className="object-cover" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className={`text-xs lg:text-[13px] min-[120rem]:text-sm min-[160rem]:text-base leading-snug line-clamp-2 ${isActive ? "font-bold text-[#222]" : "font-medium text-gray-600"}`}>
                                                        {s.title}
                                                    </span>
                                                    {st && (
                                                        <span className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
                                                            <StatusTag status={st} size="sm" />
                                                            <span className="text-[11px] min-[120rem]:text-xs text-gray-500">{st.countdown}</span>
                                                        </span>
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <Link
                                    href="/announcements?filter=pickup"
                                    className="flex shrink-0 items-center gap-0.5 border-l border-gray-200 px-4 text-sm font-bold whitespace-nowrap hover:bg-gray-50"
                                    style={{ color: GREEN }}
                                >
                                    一覧
                                    <Chevron className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
