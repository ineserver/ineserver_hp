'use client';

import { useState } from 'react';

interface CommandCodeProps {
  children: string; // コマンドの内容
}

export default function CommandCode({ children }: CommandCodeProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      // クリップボードにコピー
      await navigator.clipboard.writeText(children);

      // トーストを表示
      setShowToast(true);

      // 3秒後に非表示
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <>
      {/* コマンド表示部分 */}
      <span
        onClick={handleCopy}
        title="クリックしてコピー"
        className="
          font-mono inline-block px-[0.4em] py-[0.15em] mx-[0.1em] rounded text-[0.9em]
          cursor-pointer transition-all duration-200
          bg-[#e6e6e6] text-[#222222] border border-[#cccccc]
          hover:bg-[#d4d4d4] hover:border-[#b0b0b0]
          active:bg-[#c0c0c0] active:translate-y-[1px]
          mr-1
        "
      >
        {children}
      </span>

      {/* トースト通知 (Portalを使わず簡易的に配置) */}
      <span
        className={`
          fixed bottom-[30px] left-1/2 -translate-x-1/2 z-50
          flex items-center justify-center gap-2 px-4 py-3 rounded
          bg-[#5b8064] text-white shadow-md
          transition-all duration-300 ease-in-out
          ${showToast ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'}
        `}
      >
        {/* アイコン SVG */}
        <svg
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 stroke-current stroke-2 fill-none"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span className="text-sm">クリップボードにコピーしました</span>
      </span>
    </>
  );
}