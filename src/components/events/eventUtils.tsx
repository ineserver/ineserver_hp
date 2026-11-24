"use client";

import { useEffect, useState } from "react";

// トップのイベント表示で共通に使う型と関数

export interface ShowcaseEvent {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    image?: string;
    /** お知らせの公開日（ISO文字列）。先頭に出すものを選ぶときに使う */
    date?: string;
    /** frontmatter の featured: true。先頭に固定する */
    featured?: boolean;
    /** 本文の冒頭（何をするイベントか） */
    excerpt?: string;
    /** バナー画像から取り出した、背景のにじみの色（サーバー側で求める） */
    palette?: PaletteColor[];
}

/** 背景のにじみに使う色と、その色が画像の中にある位置（0〜1） */
export interface PaletteColor {
    color: string;
    x: number;
    y: number;
    weight: number;
}

export type EventStatus = {
    kind: "ongoing" | "upcoming";
    label: string;
    countdown: string;
};

export const DEFAULT_IMAGE = "https://img.1necat.net/2025-11-29_15.48.01.png";
/** 画像から色を取り出せなかったときのにじみ（いねさばの緑と灰色をうっすら） */
export const DEFAULT_PALETTE: PaletteColor[] = [
    { color: "#5b8064", x: 0.25, y: 0.35, weight: 0.7 },
    { color: "#9ca3af", x: 0.8, y: 0.2, weight: 0.5 },
];

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// サーバー（Azure）とブラウザで日付がずれないよう、表示はすべて日本時間で行う
const jstDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
        month: "numeric",
        day: "numeric",
        weekday: "short",
    });

const jstDayNumber = (ms: number) => Math.floor((ms + 9 * HOUR) / DAY);

/** 「12/4(金) 23:59」の形 */
export const formatDateTime = (iso: string) =>
    `${jstDate(iso)} ${new Date(iso).toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "numeric", minute: "2-digit" })}`;

/** 開催中なら「あと◯日」、始まる前（予告）なら「◯日後に開始」 */
export function getStatus(event: ShowcaseEvent, now: number): EventStatus {
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();

    if (now < start) {
        const days = jstDayNumber(start) - jstDayNumber(now);
        const countdown = days <= 0 ? "本日開始" : days === 1 ? "明日から" : `${days}日後に開始`;
        return { kind: "upcoming", label: "予告", countdown };
    }

    const remaining = end - now;
    const countdown =
        remaining >= DAY ? `あと${Math.floor(remaining / DAY)}日`
            : remaining >= HOUR ? `あと${Math.ceil(remaining / HOUR)}時間`
                : "まもなく終了";
    return { kind: "ongoing", label: "開催中", countdown };
}

/**
 * 表示順
 * 1. featured: true のもの（なければ一番新しく告知したもの）を先頭に
 * 2. 残りは、開催中を終わるのが近い順 → 開催予定を始まるのが近い順
 */
export function orderEvents(events: ShowcaseEvent[], now: number): ShowcaseEvent[] {
    if (events.length === 0) return [];
    const first =
        events.find((e) => e.featured) ??
        [...events].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
    const rest = events.filter((e) => e.id !== first.id);
    const time = (iso: string) => new Date(iso).getTime();
    const ongoing = rest.filter((e) => time(e.startDate) <= now).sort((a, b) => time(a.endDate) - time(b.endDate));
    const upcoming = rest.filter((e) => time(e.startDate) > now).sort((a, b) => time(a.startDate) - time(b.startDate));
    return [first, ...ongoing, ...upcoming];
}

/**
 * 現在時刻。初回はサーバーで描画した時刻を使い、マウント後に差し替える
 * （サーバーとブラウザで表示が食い違うとハイドレーションエラーになるため）
 */
export function useNow(renderedAt: number) {
    const [now, setNow] = useState(renderedAt);
    useEffect(() => {
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
        return () => clearInterval(timer);
    }, []);
    return now;
}

/** 「動きを減らす」設定のブラウザでは自動再生しない */
export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return reduced;
}
