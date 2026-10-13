'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================
// 印（見る人が自分で付ける予想の印）
//   このブラウザにだけ保存する。◎○▲ は1レースに1頭ずつ
// ============================================================

export const MARKS = ['◎', '○', '▲', '△', '☆', '消'] as const;
export type Mark = (typeof MARKS)[number];
export type MarkMap = Record<number, Mark>;

export const MARK_LABEL: Record<Mark, string> = {
  '◎': '本命',
  '○': '対抗',
  '▲': '単穴',
  '△': '連下',
  '☆': '注目',
  '消': '消し',
};

const ONE_HORSE_MARKS: Mark[] = ['◎', '○', '▲'];

// 消し以外の印を付けた馬
export const isPicked = (mark: Mark | undefined) => mark != null && mark !== '消';

const storageKey = (raceId: string) => `i-keiba:marks:${raceId}`;

export function useMarks(raceId: string) {
  const [marks, setMarks] = useState<MarkMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(raceId));
      setMarks(raw ? JSON.parse(raw) : {});
    } catch {
      setMarks({});
    }
  }, [raceId]);

  const setMark = useCallback((gate: number, mark: Mark | null) => {
    setMarks(prev => {
      const next: MarkMap = {};
      for (const [key, value] of Object.entries(prev)) {
        const g = Number(key);
        if (g === gate) continue;
        // ◎○▲ は付け替えると前の馬から外れる
        if (mark && ONE_HORSE_MARKS.includes(mark) && value === mark) continue;
        next[g] = value;
      }
      if (mark) next[gate] = mark;
      try {
        localStorage.setItem(storageKey(raceId), JSON.stringify(next));
      } catch {
        // 保存できなくても、開いている間は使える
      }
      return next;
    });
  }, [raceId]);

  return { marks, setMark };
}

const MENU_WIDTH = 248;

// 印を付けるボタン（押すと印の一覧が出る）
export function MarkPicker({
  mark,
  onChange,
  horseName,
}: {
  mark: Mark | undefined;
  onChange: (mark: Mark | null) => void;
  horseName: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (e: Event) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('touchstart', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('touchstart', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8)),
      });
    }
    setOpen(o => !o);
  };

  const choose = (next: Mark | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={`${horseName}の印${mark ? `（${MARK_LABEL[mark]}）` : ''}`}
        aria-expanded={open}
        className={`w-7 h-7 inline-flex items-center justify-center rounded border border-gray-300 bg-gray-100 font-bold leading-none cursor-pointer transition-colors hover:border-[#5b8064] ${mark
          ? mark === '消' ? 'text-gray-500 text-xs' : 'text-gray-900 text-base'
          : 'text-gray-400 text-xs'
          }`}
      >
        {mark ?? '--'}
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: position.top, left: position.left, width: MENU_WIDTH }}
          className="z-[60] bg-white border border-gray-300 shadow-lg p-1.5 grid grid-cols-7 gap-1"
        >
          {MARKS.map(m => (
            <button
              key={m}
              type="button"
              role="menuitem"
              title={MARK_LABEL[m]}
              onClick={() => choose(m)}
              className={`h-8 flex flex-col items-center justify-center border text-base font-bold leading-none cursor-pointer hover:bg-[#f0f5f1] ${m === mark ? 'border-[#2f5a3c] bg-[#e6eee8]' : 'border-gray-200'} ${m === '消' ? 'text-gray-500 text-sm' : 'text-gray-900'}`}
            >
              {m}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(null)}
            className="h-8 border border-gray-200 text-[11px] text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            なし
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

// 除外の馬は印の場所に「除外」と書く
export function ExcludedMark() {
  return <span className="text-xs text-gray-500 whitespace-nowrap">除外</span>;
}

// 表示だけ（結果など）
export function MarkText({ mark }: { mark: Mark | undefined }) {
  if (!mark) return null;
  return <span className={`font-bold ${mark === '消' ? 'text-gray-400 text-xs' : 'text-gray-900'}`}>{mark}</span>;
}
