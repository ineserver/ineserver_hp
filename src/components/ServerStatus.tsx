import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  // .env.production: NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=play.ineserver.com
  serverAddress = process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS || 'localhost:25565',
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
            現在のサーバー状況とプレイヤー情報をリアルタイムでお知らせします。
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
                しばらくお待ちください。作業完了後にサーバーが再開されます。
              </div>
              <div className="mt-2">
                <Link 
                  href="/announcements" 
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-800 hover:underline transition-colors"
                >
                  <span className="mr-1">⚙️</span>
                  メンテナンス情報を確認する
                </Link>
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
    </div>
  );
}
