'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#f0f4f1] to-white">
                <div className="text-center max-w-md mx-auto">
                    {/* 円形アイコン */}
                    <div className="mb-10">
                        <div className="w-32 h-32 mx-auto">
                            <Image
                                src="/server-icon.png"
                                alt="いねさばアイコン"
                                width={128}
                                height={128}
                                className="rounded-full shadow-lg border-4 border-[#5b8064]/20"
                            />
                        </div>
                    </div>

                    {/* 404テキスト */}
                    <div className="mb-6">
                        <h1 className="text-6xl font-bold text-[#5b8064] mb-2">404</h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            ページが見つかりませんでした
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            お探しのページは存在しないか、
                            <br />
                            別の場所に移動した可能性があります。
                        </p>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b8064] text-white rounded-xl font-medium hover:bg-[#4a6b55] transition-all duration-300 hover:shadow-lg hover:scale-105"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            ホームへ戻る
                        </Link>

                        <Link
                            href="/guide"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#5b8064] text-[#5b8064] rounded-xl font-medium hover:bg-[#5b8064]/5 transition-all duration-300 hover:scale-105"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                            ガイドを見る
                        </Link>
                    </div>

                    {/* ヒントメッセージ */}
                    <p className="mt-8 text-xs text-gray-400">
                        迷子になっちゃった？ 上のメニューから探してみてね！
                    </p>
                </div>
            </div>
        </>
    );
}
