'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { BanRecordResolved } from '@/app/bans/page';

// SVGアイコンコンポーネント
function BanIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function MuteIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function WarnIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function KickIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UnknownIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfinityIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
    </svg>
  );
}

// 処罰タイプの定義
const PUNISHMENT_TYPES: Record<number, { label: string; tagClass: string; iconColor: string; icon: ReactNode }> = {
  0: {
    label: 'BAN',
    tagClass: 'bg-red-100 text-red-800',
    iconColor: 'text-red-800',
    icon: <BanIcon />,
  },
  1: {
    label: 'ミュート',
    tagClass: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-800',
    icon: <MuteIcon />,
  },
  2: {
    label: '警告',
    tagClass: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-800',
    icon: <WarnIcon />,
  },
  3: {
    label: 'キック',
    tagClass: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-800',
    icon: <KickIcon />,
  },
};

function getPunishmentType(type: number) {
  return PUNISHMENT_TYPES[type] ?? {
    label: `TYPE ${type}`,
    tagClass: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-800',
    icon: <UnknownIcon />,
  };
}

// Unixタイムスタンプ（秒）を日本時間フォーマットに変換
function formatDate(timestamp: number): string {
  if (timestamp === 0) return '無期限';
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 終了日時までの残り時間を計算
function getTimeRemaining(endTimestamp: number): string | null {
  if (endTimestamp === 0) return null;
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTimestamp - now;
  if (remaining <= 0) return '期限切れ';
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  if (days > 0) return `残り ${days}日 ${hours}時間`;
  const minutes = Math.floor((remaining % 3600) / 60);
  if (hours > 0) return `残り ${hours}時間 ${minutes}分`;
  return `残り ${minutes}分`;
}

// アバター画像のURL（Minotar）
function getAvatarUrl(mcid: string): string {
  return `https://minotar.net/helm/${mcid}/40`;
}

type FilterType = 'all' | number;

export default function BansPageClient({ bans }: { bans: BanRecordResolved[] }) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hidePardoned, setHidePardoned] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const filteredBans = bans.filter(b => {
    const matchesFilter = filter === 'all' || b.type === filter;
    const matchesSearch = searchQuery === '' || b.victim_mcid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPardoned = hidePardoned ? b.status !== 'Pardoned' : true;
    return matchesFilter && matchesSearch && matchesPardoned;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBans.length / ITEMS_PER_PAGE));
  const currentItems = filteredBans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 各タイプの件数を算出
  const typeCounts = bans.reduce<Record<number, number>>((acc, ban) => {
    acc[ban.type] = (acc[ban.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="bg-[#5b8064] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90">処罰リスト</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="text-white/80">
                  <BanIcon className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">処罰リスト</h1>
              </div>
              <p className="text-white/70 text-sm">サーバールールに違反したプレイヤーの処罰履歴です</p>
            </div>
          </div>
        </div>
      </div>

      <article className="flex-grow w-full max-w-4xl mx-auto px-5 py-8">
        <header className="mb-8">

          {/* 関連リンク */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
            <Link
              href="/server-guide/rule"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors col-span-1"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">サーバールール</span>
            </Link>
            <Link
              href="/server-guide/terms_of_service"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors col-span-1"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="truncate">利用規約</span>
            </Link>
            <a
              href="https://forms.gle/tLHCGYr3GVyMarAk6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5b8064] text-white rounded-lg text-sm font-medium hover:bg-[#4a6b51] transition-colors sm:col-span-2"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              解除申請フォーム（処罰毎に1回まで）
              <svg className="w-3 h-3 ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* MCID検索 */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="MCIDで検索..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064] transition-colors bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* フィルター */}
          <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setFilter('all'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filter === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  すべて ({bans.length})
                </button>
                {Object.entries(PUNISHMENT_TYPES).map(([typeNum, info]) => {
                  const count = typeCounts[Number(typeNum)] || 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={typeNum}
                      onClick={() => { setFilter(Number(typeNum)); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1 ${filter === Number(typeNum)
                        ? `${info.tagClass} font-bold`
                        : 'bg-white text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {info.icon} {info.label} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500 flex-shrink-0">
                {filteredBans.length} 件表示
              </div>
            </div>

            {/* 2段目: その他のフィルター */}
            <div className="pt-3 border-t border-gray-200/60">
              <label className="inline-flex items-center gap-2 cursor-pointer hover:text-gray-900 transition-colors font-medium text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={hidePardoned}
                  onChange={(e) => { setHidePardoned(e.target.checked); setCurrentPage(1); }}
                  className="w-4 h-4 accent-[#5b8064] text-[#5b8064] bg-white border-gray-300 rounded focus:ring-[#5b8064] focus:ring-2 cursor-pointer"
                />
                解除済みを非表示
              </label>
            </div>
          </div>
        </header>

        {/* リスト */}
        <section>
          {filteredBans.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">処罰記録がありません</h3>
              <p className="text-gray-600">現在表示できる処罰記録はありません。</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentItems.map((ban) => {
                const punishType = getPunishmentType(ban.type);
                const isExpanded = expandedId === ban.id;
                const timeRemaining = getTimeRemaining(ban.end);

                return (
                  <div
                    key={ban.id}
                    className={`group border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-sm ${ban.status === 'Pardoned' ? 'bg-gray-50' : 'bg-white'
                      }`}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ban.id)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* アバター */}
                          <div className={`relative flex-shrink-0 transition-opacity ${!ban.is_active ? 'opacity-70' : ''}`}>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              <Image
                                src={getAvatarUrl(ban.victim_mcid)}
                                alt={ban.victim_mcid}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                          </div>

                          {/* プレイヤー情報 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-gray-900 font-bold text-base truncate ${!ban.is_active ? 'line-through' : ''}`}>
                                {ban.victim_mcid}
                              </span>
                              {ban.status !== 'Pardoned' && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded whitespace-nowrap ${punishType.tagClass}`}>
                                  <span className={punishType.iconColor}>{punishType.icon}</span> {punishType.label}
                                </span>
                              )}
                              {ban.status === 'Active' && ban.end === 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800 whitespace-nowrap">
                                  <InfinityIcon className="w-3 h-3" /> 永久
                                </span>
                              )}
                              {ban.status === 'Pardoned' && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-800 whitespace-nowrap">
                                  運営により解除済み
                                </span>
                              )}
                              {ban.status === 'Expired' && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-800 whitespace-nowrap">
                                  期限切れ
                                </span>
                              )}
                              {ban.status === 'Active' && ban.end !== 0 && timeRemaining && timeRemaining !== '期限切れ' && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700 whitespace-nowrap">
                                  {timeRemaining}
                                </span>
                              )}
                            </div>
                            <p className={`text-gray-500 text-sm mt-1 truncate ${!ban.is_active ? 'line-through' : ''}`}>
                              {ban.reason}
                            </p>
                          </div>

                          {/* 日時・展開ボタン */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="hidden sm:block text-right">
                              <p className="text-gray-500 text-sm font-mono">{formatDate(ban.start)}</p>
                            </div>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[#5b8064] rotate-180' : 'bg-gray-100'}`}>
                              <svg
                                className={`w-4 h-4 transition-colors ${isExpanded ? 'text-white' : 'text-gray-500'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* 展開時の詳細 */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="px-4 sm:px-6 pb-5 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DetailItem label="処罰ID" value={`#${ban.id}`} />
                          <DetailItem label="処罰タイプ" icon={punishType.icon} value={punishType.label} valueColor={punishType.iconColor} />
                          <DetailItem label="開始日時" value={formatDate(ban.start)} />
                          <DetailItem
                            label="終了日時"
                            icon={ban.end === 0 ? <InfinityIcon className="w-3.5 h-3.5" /> : undefined}
                            value={ban.end === 0 ? '無期限' : formatDate(ban.end)}
                            valueColor={ban.status === 'Pardoned' ? 'text-gray-400 line-through' : (ban.end === 0 ? 'text-red-800' : undefined)}
                            extra={ban.status === 'Pardoned' ? (
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-800 whitespace-nowrap">
                                運営により解除済み
                              </span>
                            ) : (ban.status === 'Expired' ? '期限切れ' : (timeRemaining ?? undefined))}
                          />
                          <div className="sm:col-span-2">
                            <DetailItem label="理由" value={ban.reason} />
                          </div>
                          <DetailItem label="プレイヤー" value={ban.victim_mcid} />
                          <DetailItem label="実行者" value={ban.operator_mcid} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ペジネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                前へ
              </button>
              <span className="text-sm text-gray-600 font-medium px-4">
                {currentPage} / {totalPages} ページ
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                次へ
              </button>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}

// 詳細項目コンポーネント
function DetailItem({
  label,
  value,
  icon,
  valueColor,
  extra,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  valueColor?: string;
  extra?: ReactNode;
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs font-medium mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className={`text-sm font-medium inline-flex items-center gap-1 ${valueColor ?? 'text-gray-900'}`}>
          {icon}{value}
        </p>
        {extra && (
          <div className="text-blue-600 text-xs font-medium">{extra}</div>
        )}
      </div>
    </div>
  );
}
