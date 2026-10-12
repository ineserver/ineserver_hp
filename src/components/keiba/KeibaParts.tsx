import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  FRAME_CLASS,
  STATUS_LABEL,
  avatarUrl,
  formatIne,
  horsePath,
  type Owner,
  type RaceClass,
  type RaceStatus,
} from '@/lib/keiba';

// 枠番（枠の色の四角）
export function FrameBox({ frame, className = '' }: { frame: number; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold tabular-nums ${FRAME_CLASS[frame] ?? FRAME_CLASS[1]} ${className}`}>
      {frame}
    </span>
  );
}

// 馬番を枠の色で（オッズ・払戻しで使う）
export function GateBox({ gate, frame, size = 'md' }: { gate: number; frame: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[11px]' : 'w-6 h-6 text-xs';
  return (
    <span className={`inline-flex items-center justify-center rounded-sm font-bold tabular-nums ${sizeClass} ${FRAME_CLASS[frame] ?? FRAME_CLASS[1]}`}>
      {gate}
    </span>
  );
}

const CLASS_BADGE: Record<RaceClass, { text: string; className: string }> = {
  G1: { text: 'GⅠ', className: 'bg-[#1a4fa0] text-white' },
  G2: { text: 'GⅡ', className: 'bg-[#d6262f] text-white' },
  OP: { text: 'OP', className: 'bg-[#d97706] text-white' },
  ONE_WIN: { text: '1勝', className: 'bg-[#56636f] text-white' },
  SHINBA: { text: '新馬', className: 'bg-[#2e8b57] text-white' },
};

export function ClassBadge({ raceClass, size = 'md' }: { raceClass: RaceClass | null; size?: 'sm' | 'md' | 'lg' }) {
  if (!raceClass) return null;
  const badge = CLASS_BADGE[raceClass];
  const sizeClass = {
    sm: 'text-[10px] px-1.5 py-px',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-0.5',
  }[size];
  return (
    <span className={`inline-block rounded font-bold leading-normal whitespace-nowrap ${sizeClass} ${badge.className}`}>
      {badge.text}
    </span>
  );
}

const STATUS_STYLE: Record<RaceStatus, string> = {
  ENTRY: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200',
  BETTING: 'bg-[#e0262d] text-white',
  GATE: 'bg-amber-500 text-white',
  RUNNING: 'bg-orange-600 text-white',
  FINISHED: 'bg-gray-700 text-white',
  CANCELLED: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status, size = 'md' }: { status: RaceStatus | null; size?: 'sm' | 'md' }) {
  if (!status) return null;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center rounded font-bold whitespace-nowrap ${sizeClass} ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// レース番号（11R）
export function RaceNumberBox({
  number,
  size = 'md',
  light = false,
}: {
  number: number | null;
  size?: 'md' | 'lg';
  light?: boolean;
}) {
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg';
  const colorClass = light ? 'bg-white text-[#1f3d2a]' : 'bg-[#1f3d2a] text-white';
  return (
    <span className={`inline-flex items-center justify-center rounded-md font-bold tabular-nums shrink-0 ${sizeClass} ${colorClass}`}>
      {number ?? '-'}
      <span className="text-[0.6em] ml-px">R</span>
    </span>
  );
}

// 馬名（馬のページへ）
export function HorseLink({ uuid, name, className = '' }: { uuid: string | null | undefined; name: string; className?: string }) {
  if (!uuid) return <span className={className}>{name}</span>;
  return (
    <Link href={horsePath(uuid)} className={`hover:underline underline-offset-2 ${className}`}>
      {name}
    </Link>
  );
}

// 賞金。API の prize（totalPrize）は追加賞金を含んだ合計で、bonus はそのうちの追加賞金。
// 追加賞金があるときは「通常＋追加」の内訳を添える
export function PrizeTotal({
  prize,
  bonus,
  align = 'end',
}: {
  prize: number | null;
  bonus?: number | null;
  align?: 'start' | 'end';
}) {
  const total = prize ?? 0;
  if (total <= 0) return null;
  const extra = Math.min(Math.max(bonus ?? 0, 0), total);
  return (
    <span className={`inline-flex flex-col ${align === 'start' ? 'items-start' : 'items-end'}`}>
      <span className="font-bold text-gray-900">{formatIne(total)}</span>
      {extra > 0 && (
        <span className="text-[10px] font-normal text-gray-500">
          （{(total - extra).toLocaleString('ja-JP')}＋{extra.toLocaleString('ja-JP')}）
        </span>
      )}
    </span>
  );
}

export function OwnerLabel({ owner, className = '' }: { owner: Owner; className?: string }) {
  if (!owner.name) return <span className="text-gray-400">-</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      <Image
        src={avatarUrl(owner.name, 32)}
        alt=""
        width={16}
        height={16}
        className="w-4 h-4 rounded-sm shrink-0"
        unoptimized
      />
      <span className="truncate">{owner.name}</span>
    </span>
  );
}

// 1位（1着・1番人気・上がり1位など）と2位の背景。表ではそのセルだけに付ける
export const rankClass = (rank: number | null | undefined) =>
  rank === 1 ? 'bg-[#ffef7f]' : rank === 2 ? 'bg-[#cbdeff]' : '';

// 着順（表の外で使う四角）
export function PositionMark({ position, finished, size = 'md' }: { position: number | null; finished: boolean; size?: 'sm' | 'md' | 'lg' }) {
  if (!finished || position == null) {
    return <span className="text-xs font-bold text-gray-500">中止</span>;
  }
  const sizeClass = { sm: 'w-5 h-5 text-xs', md: 'w-7 h-7 text-sm', lg: 'w-9 h-9 text-lg' }[size];
  return (
    <span className={`inline-flex items-center justify-center font-bold tabular-nums text-gray-900 ${sizeClass} ${rankClass(position)}`}>
      {position}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-6 py-12 text-center">
      <p className="font-bold text-gray-800 mb-1">{title}</p>
      {children && <div className="text-sm text-gray-500">{children}</div>}
    </div>
  );
}

// 見出し（記事ページの h2 と同じ、アクセント色の下線）
export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3 pb-2 border-b-[3px] border-[#5b8064]">
      <h2 className="text-xl font-bold text-[#333333] leading-[1.3]">{children}</h2>
      {aside && <div className="shrink-0 text-xs text-gray-500">{aside}</div>}
    </div>
  );
}

// 競馬ページの上の緑の帯
export function KeibaPageHeader({
  breadcrumb,
  children,
}: {
  breadcrumb: { label: string; href?: string }[];
  children: ReactNode;
}) {
  return (
    <div className="bg-[#2f5a3c] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-7">
        <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-white/60 mb-4">
          <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.href ? (
                <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
              ) : (
                <span className="text-white/90">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
