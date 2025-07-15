import { useState, useEffect } from 'react';
import { ServerStatus as ServerStatusType } from '@/types/server-status';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // サーバーステータスを取得する関数
  const fetchServerStatus = async () => {
    try {
      setError(null);
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
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchServerStatus();
  }, [serverAddress]);

  // 定期更新
  useEffect(() => {
    const interval = setInterval(fetchServerStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [serverAddress, refreshInterval]);

  // 手動更新
  const handleRefresh = () => {
    setIsLoading(true);
    fetchServerStatus();
  };

  // プレイヤー数の表示色を取得
  const getPlayerCountColor = (online: number, max: number) => {
    const percentage = (online / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // ステータス表示
  const getStatusDisplay = () => {
    if (isLoading && !status) {
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

    return {
      text: 'オフライン',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '❌'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900">サーバーステータス</h2>
      </div>

      {/* ステータス内容 */}
      <div className="p-4">
        {/* メンテナンス中の場合の追加メッセージ */}
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
              <a 
                href="/announcements" 
                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-800 hover:underline transition-colors"
              >
                <span className="mr-1">📢</span>
                メンテナンス情報を確認する
              </a>
            </div>
          </div>
        )}

        {/* サーバー状態とプレイヤー数を横並びに */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* サーバー状態 */}
          <div className="flex items-center">
            <div className="relative mr-3">
              {isLoading && !status && (
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
  );
}
