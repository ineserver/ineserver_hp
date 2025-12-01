'use client';

import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [showToast, setShowToast] = useState(false);

  // 複数行かどうかをチェック
  const isMultiLine = children.includes('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // 単一行の場合は通常のcodeタグを返す
  if (!isMultiLine) {
    return (
      <code className={className}>
        {children}
      </code>
    );
  }

  // 複数行の場合はコピーボタン付きのpreタグを返す
  return (
    <div className="code-block-wrapper">
      <div className="code-block-container">
        <button
          onClick={handleCopy}
          className="code-copy-button"
          title="コードをコピー"
          aria-label="コードをコピー"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <pre className="code-block-pre">
          <code className={className}>
            {children}
          </code>
        </pre>
      </div>

      {/* トースト通知 */}
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
    </div>
  );
}
