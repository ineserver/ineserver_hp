import { useState, useEffect, useCallback } from 'react';
import { ServerStatus as ServerStatusType } from '@/types/server-status';
import MaintenanceSchedule from './MaintenanceSchedule';

interface ServerStatusProps {
  serverAddress?: string;
  refreshInterval?: number;
}

export default function ServerStatus({
  // 【本番環境での変更点1】
  // 環境変数を使用することで、ローカル/本番の切り替えが容易になります
  // .env.local: NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=localhost:25565
  // .env.production: NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=1necat.net
  serverAddress = process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS || '1necat.net',
  refreshInterval = 30000 // 30秒
}: ServerStatusProps) {
  const [status, setStatus] = useState<ServerStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 初期値をfalseに変更
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // 初回ロード完了フラグ

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // サーバーステータスを取得する関数
  const fetchServerStatus = useCallback(async () => {
    try {
      setError(null);
      // 初回ロード時のみローディング状態を表示
      if (!hasInitialLoad) {
        setIsLoading(true);
      }
      
      const response = await fetch(`/api/server-status?address=${encodeURIComponent(serverAddress)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ServerStatusType = await response.json();
      setStatus(data);
      if (isClient) {
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch server status:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      // エラー時は前回のステータスを保持
    } finally {
      setIsLoading(false);
      setHasInitialLoad(true);
    }
  }, [serverAddress, hasInitialLoad, isClient]);

  // 初回ロード（非同期で実行、UI表示をブロックしない）
  useEffect(() => {
    // 少し遅延させてUI表示を優先
    const timer = setTimeout(() => {
      fetchServerStatus();
    }, 100);
    return () => clearTimeout(timer);
  }, [serverAddress, fetchServerStatus]);

  // 定期更新
  useEffect(() => {
    const interval = setInterval(fetchServerStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [serverAddress, refreshInterval, fetchServerStatus]);

  // プレイヤー数の表示色を取得
  const getPlayerCountColor = (online: number, max: number) => {
    const percentage = (online / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // ステータス表示
  const getStatusDisplay = () => {
    // 初回ロード中の場合
    if (isLoading && !hasInitialLoad) {
      return {
        text: '確認中...',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: '⏳'
      };
    }

    if (error) {
      return {
        text: 'オフライン',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '❌'
      };
    }

    // メンテナンス中の判定
    if (status?.version && (status.version === 'Maintenance' || status.version === 'メンテナンス')) {
      return {
        text: 'メンテナンス中',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: '🔧'
      };
    }

    if (status?.online) {
      return {
        text: 'オンライン',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🟢'
      };
    }

    // データがない場合（初回ロード前）
    if (!status && !hasInitialLoad) {
      return {
        text: '取得中...',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: '⏳'
      };
    }

    return {
      text: 'オフライン',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '❌'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        {/* ヘッダー */}
        <div className="bg-[#5b8064] p-6 rounded-t-lg">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.5 3A1.5 1.5 0 003 4.5v2A1.5 1.5 0 004.5 8h15A1.5 1.5 0 0021 6.5v-2A1.5 1.5 0 0019.5 3h-15zM3 10.5v7A1.5 1.5 0 004.5 19H9a1.5 1.5 0 001.5-1.5V12A1.5 1.5 0 009 10.5H4.5A1.5 1.5 0 003 12v-1.5zm10.5 0v7A1.5 1.5 0 0015 19h4.5a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0019.5 11H15a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">サーバーステータス</h2>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            現在のサーバー状況です
          </p>
        </div>

        {/* ステータス内容 */}
        <div className="p-6">{/* メンテナンス中の場合の追加メッセージ */}
          {status?.version && (status.version === 'Maintenance' || status.version === 'メンテナンス') && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">🔧</span>
                <span className="text-orange-800 font-medium">サーバーはメンテナンス中です</span>
              </div>
              <div className="text-sm text-orange-700 mt-1">
                メンテナンス中はサーバーに接続できません。メンテナンス終了までお待ち下さい。
              </div>
            </div>
          )}

          {/* サーバー状態とプレイヤー数を横並びに */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* サーバー状態 */}
            <div className="flex items-center">
              <div className="relative mr-3">
                {(isLoading && !hasInitialLoad) && (
                  <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                )}
                {error && (
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                )}
                {/* メンテナンス中の場合 */}
                {status?.version && (status.version === 'Maintenance' || status.version === 'メンテナンス') && (
                  <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                )}
                {/* 通常のオンライン状態 */}
                {status?.online && status.version !== 'Maintenance' && status.version !== 'メンテナンス' && (
                  <div className="w-4 h-4 bg-green-500 rounded-full pulse-green"></div>
                )}
                {/* オフライン状態 */}
                {status && !status.online && status.version !== 'Maintenance' && status.version !== 'メンテナンス' && (
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                )}
                {/* 初回ロード前 */}
                {!status && !hasInitialLoad && !isLoading && (
                  <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">サーバー状態</div>
                <div className={`text-sm ${statusDisplay.color} font-medium`}>
                  {statusDisplay.text}
                </div>
              </div>
            </div>

            {/* プレイヤー数 */}
            {status && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">プレイヤー数</span>
                  <span className={`text-sm font-semibold ${getPlayerCountColor(status.players.online, status.players.max)}`}>
                    {status.players.online} / {status.players.max}
                  </span>
                </div>
                {/* プレイヤー数のプログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 progress-bar ${
                      status.players.online > 0 
                        ? status.players.online / status.players.max >= 0.9 
                          ? 'bg-red-500' 
                          : status.players.online / status.players.max >= 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${Math.min((status.players.online / status.players.max) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* バージョンと最終更新時刻を横並びに */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            {status && (
              <div className="text-sm text-gray-600">
                バージョン: <span className={`font-medium ${
                  status.version === 'Maintenance' || status.version === 'メンテナンス' 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-900'
                }`}>
                  {status.version}
                </span>
              </div>
            )}
            {isClient && lastUpdate && (
              <div className="text-xs text-gray-500">
                最終更新: {lastUpdate.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メンテナンス予定 */}
      <MaintenanceSchedule />

      {/* コミュニティ・サポート */}
      <div className="space-y-4">
        {/* タイトルブロック */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-[#5b8064] p-6 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <h3 className="text-xl font-bold text-white">コミュニティ・サポート</h3>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
        {/* Discord招待リンク */}
        <a 
          href="https://discord.gg/tdefsEKYhp" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block bg-white rounded-lg border border-gray-200 p-4 bg-[#5865F2]/5 border-[#5865F2]/20 transition-all duration-300 cursor-pointer overflow-visible relative"
        >
          <div className="flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
              </svg>
            </div>
            <div className="flex-grow flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">公式Discord</h4>
              </div>
              <svg className="w-5 h-5 text-[#5865F2] hover:text-[#4752C4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
          {/* ホバー時の詳細テキスト（ブロックの真上にオーバーレイ） */}
          <div className="absolute inset-0 bg-indigo-50 border border-[#5865F2] rounded-lg p-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 pointer-events-none flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-700 font-medium">他のプレイヤーと交流しよう</p>
            </div>
          </div>
        </a>

        {/* 既知の不具合 */}
        <a 
          href="https://github.com/ineserver/ineserver-Public/issues" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 active:bg-gray-50 transition-all duration-300 cursor-pointer overflow-visible relative"
        >
          <div className="flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div className="flex-grow flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">既知の不具合</h4>
              </div>
              <svg className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
          {/* ホバー時の詳細テキスト（ブロックの真上にオーバーレイ） */}
          <div className="absolute inset-0 bg-gray-50 border border-gray-300 rounded-lg p-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 pointer-events-none flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-700 font-medium">現在確認されている問題と対応状況</p>
            </div>
          </div>
        </a>

        {/* 寄付ページ */}
        <a 
          href="#" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block bg-white rounded-lg border border-gray-200 p-4 bg-pink-50 border-pink-200 hover:bg-pink-100 active:bg-pink-100 transition-all duration-300 cursor-pointer overflow-visible relative"
        >
          <div className="flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="flex-grow flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">サーバー運営支援</h4>
              </div>
              <svg className="w-5 h-5 text-pink-600 hover:text-pink-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
          {/* ホバー時の詳細テキスト（ブロックの真上にオーバーレイ） */}
          <div className="absolute inset-0 bg-pink-50 border border-pink-300 rounded-lg p-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 pointer-events-none flex items-center">
            <div className="mr-4">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-gray-700 font-medium">サーバーをサポートして継続運営にご協力ください</p>
            </div>
          </div>
        </a>
        </div>
      </div>
    </div>
  );
}
