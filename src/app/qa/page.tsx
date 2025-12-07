'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: React.ReactNode;
    category: string;
}

const faqData: FAQItem[] = [
    // 生活・建築
    {
        category: '生活・建築',
        question: 'レールとチェストトロッコを用いるn連かまどが作れない',
        answer: (
            <div>
                <p>保護されたかまどやチェストに対してホッパーを機能させるには、対象に対して <code className="bg-gray-100 px-2 py-1 rounded font-mono">/chopper on</code> コマンドを実行する必要があります。</p>
                <p className="mt-2 text-sm text-gray-600">※保護がかかっていない場合はコマンド不要で動作します。</p>
            </div>
        ),
    },
    {
        category: '生活・建築',
        question: 'トロッコにmobを載せられない',
        answer: (
            <div>
                <p>トロッコに乗った状態で、以下のコマンドを入力してください。</p>
                <p className="mt-2 mb-2"><code className="bg-gray-100 px-2 py-1 rounded font-mono">/train collision mobs enter</code></p>
                <p>このコマンドを実行すると、Mobをトロッコに乗せることができるようになります。</p>
            </div>
        ),
    },

    // その他
    {
        category: 'その他',
        question: 'プラグイン名を教えてほしい',
        answer: (
            <p>申し訳ございませんが、セキュリティ保持の観点から導入プラグイン名の公開は行っておりません。</p>
        ),
    },
    {
        category: 'その他',
        question: 'リソースパックのローカル版が欲しい',
        answer: (
            <div>
                <p>公式Discordサーバーの「お知らせ」チャンネルをご確認ください。配布されている場合があります。</p>
                <a
                    href="https://discord.gg/tdefsEKYhp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-[#5b8064] hover:underline"
                >
                    Discordを確認する
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        ),
    },
];

// カテゴリをグループ化
const categories = [...new Set(faqData.map(item => item.category))];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
            <button
                onClick={onToggle}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
            >
                <span className="text-base font-medium text-gray-900 pr-4">{item.question}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#5b8064] rotate-180' : 'bg-gray-100'}`}>
                    <svg
                        className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-gray-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {item.answer}
                </div>
            </div>
        </div>
    );
}

export default function QAPage() {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const toggleItem = (index: number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
    };

    const filteredFAQ = selectedCategory
        ? faqData.filter(item => item.category === selectedCategory)
        : faqData;

    const groupedFAQ = selectedCategory
        ? { [selectedCategory]: filteredFAQ }
        : categories.reduce((acc, category) => {
            acc[category] = faqData.filter(item => item.category === category);
            return acc;
        }, {} as Record<string, FAQItem[]>);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-4xl mx-auto">
                    {/* ヘッダーセクション */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5b8064]/10 rounded-2xl mb-6">
                            <svg className="w-8 h-8 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">よくある質問</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            いねさばについてよく寄せられる質問と回答をまとめました。
                        </p>
                    </div>

                    {/* カテゴリフィルター */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCategory === null
                                ? 'bg-[#5b8064] text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            すべて
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCategory === category
                                    ? 'bg-[#5b8064] text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* FAQ リスト */}
                    <div className="space-y-8">
                        {Object.entries(groupedFAQ).map(([category, items]) => (
                            <div key={category}>
                                {!selectedCategory && (
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <span className="w-1.5 h-6 bg-[#5b8064] rounded-full mr-3"></span>
                                        {category}
                                    </h2>
                                )}
                                <div className="space-y-3">
                                    {items.map((item, idx) => {
                                        const globalIndex = faqData.indexOf(item);
                                        return (
                                            <AccordionItem
                                                key={globalIndex}
                                                item={item}
                                                isOpen={openItems.has(globalIndex)}
                                                onToggle={() => toggleItem(globalIndex)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* お問い合わせセクション */}
                    <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">お探しの回答が見つかりませんか？</h3>
                        <p className="text-gray-600 mb-6">
                            上記に無い質問やお困りのことがあれば、お気軽にお問い合わせください。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/tutorial"
                                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors shadow-lg shadow-gray-900/20 active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                チュートリアルを見る
                            </Link>
                            <a
                                href="https://discord.gg/tdefsEKYhp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] font-medium transition-colors shadow-lg shadow-[#5865F2]/20 active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Discordで質問する
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}