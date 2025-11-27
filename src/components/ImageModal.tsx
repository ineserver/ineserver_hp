'use client';

import { useEffect, useState } from 'react';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    // モーダルが開いている間はbodyのスクロールを無効化
    document.body.style.overflow = 'hidden';

    // GoTopボタンを非表示にする
    const goTopButton = document.querySelector('[aria-label="トップへ戻る"]') as HTMLElement;
    if (goTopButton) {
      goTopButton.style.display = 'none';
    }

    // ESCキーでモーダルを閉じる
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);

      // GoTopボタンを再表示
      if (goTopButton) {
        goTopButton.style.display = '';
      }
    };
  }, [onClose, isZoomed]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isZoomed ? '' : 'p-4'}`}
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={isZoomed ? () => setIsZoomed(false) : onClose}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
        aria-label="閉じる"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 虫眼鏡ボタン（ズームしていない時のみ表示） */}
      {!isZoomed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(true);
          }}
          className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
          aria-label="拡大"
          title="さらに拡大"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      )}

      {/* 画像コンテナ */}
      <div
        className={`relative flex transition-all duration-300 ${isZoomed ? 'overflow-auto max-w-none max-h-none w-full h-full' : 'items-center justify-center max-w-[95vw] max-h-[90vh]'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className={`object-contain rounded-lg shadow-2xl transition-all duration-300 ${isZoomed ? 'max-w-none cursor-zoom-out m-auto' : 'max-w-full max-h-[90vh] w-auto h-auto cursor-zoom-in'
            }`}
          style={{ display: 'block' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
        />
      </div>

      {/* 画像の説明 */}
      {alt && !isZoomed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-70 px-4 py-2 rounded-lg backdrop-blur-sm">
          {alt}
        </div>
      )}
    </div>
  );
}
