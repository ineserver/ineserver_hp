import { useState, useEffect } from 'react';

export interface MaintenanceInfo {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
}

export interface MaintenanceResponse {
  success: boolean;
  nextMaintenance: MaintenanceInfo | null;
  error?: string;
  message?: string;
}

export default function MaintenanceSchedule() {
  const [maintenance, setMaintenance] = useState<MaintenanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 初期状態を false に変更
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/maintenance');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: MaintenanceResponse = await response.json();
        
        if (data.success) {
          setMaintenance(data.nextMaintenance);
          setMessage(data.message || null);
        } else {
          setError(data.error || 'メンテナンス予定の取得に失敗しました');
        }
      } catch (err) {
        console.error('Failed to fetch maintenance schedule:', err);
        setError('メンテナンス予定の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    // 少し遅延させてUI表示を優先
    const timer = setTimeout(() => {
      fetchMaintenance();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilMaintenance = (startTime: string) => {
    const now = new Date();
    const maintenanceDate = new Date(startTime);
    const diffTime = maintenanceDate.getTime() - now.getTime();
    
    if (diffTime < 0) return null; // 過去のメンテナンス
    
    // 日本時間での日付計算のため、JST (UTC+9) を考慮
    const nowJST = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const maintenanceDateJST = new Date(maintenanceDate.getTime() + (9 * 60 * 60 * 1000));
    
    // 日本時間での日付のみを比較（時刻は無視）
    const nowDateJST = new Date(nowJST.getFullYear(), nowJST.getMonth(), nowJST.getDate());
    const maintenanceDateOnlyJST = new Date(maintenanceDateJST.getFullYear(), maintenanceDateJST.getMonth(), maintenanceDateJST.getDate());
    
    const dayDiff = Math.floor((maintenanceDateOnlyJST.getTime() - nowDateJST.getTime()) / (1000 * 60 * 60 * 24));
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);
    
    // 24時間以内（1日未満）の場合は時間表示
    if (diffTime < 24 * 60 * 60 * 1000) {
      if (diffHours > 0) {
        return `${diffHours}時間後`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分後`;
      } else {
        return `${diffSeconds}秒後`;
      }
    }
    
    // 前日（明日）の場合
    if (dayDiff === 1) {
      return `明日`;
    }
    
    // 2日以上先の場合
    if (dayDiff >= 2) {
      return `${dayDiff}日後`;
    }
    
    // その他の場合（当日の24時間以上先など）
    return `${diffHours}時間後`;
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* ヘッダー */}
        <div className="bg-[#5b8064] p-6 rounded-t-lg">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">メンテナンス予定</h2>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            次回のメンテナンス情報です。メンテナンス中はサーバーへの接続ができません。
          </p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5b8064]"></div>
          </div>
        </div>
      </div>
    );
  }  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* ヘッダー */}
        <div className="bg-[#5b8064] p-6 rounded-t-lg">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">メンテナンス予定</h2>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            次回のメンテナンス情報です。メンテナンス中はサーバーへの接続ができません。
          </p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">⚠️</span>
            <span className="text-gray-700 font-medium">メンテナンス予定を取得できませんでした</span>
          </div>
        </div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* ヘッダー */}
        <div className="bg-[#5b8064] p-6 rounded-t-lg">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">メンテナンス予定</h2>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            次回のメンテナンス情報をお知らせします。メンテナンス中はサーバーへの接続ができません。
          </p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-gray-900 font-medium">
              {message || '予定されているメンテナンスはありません'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {message ? '' : 'サーバーは正常に稼働中です'}
          </div>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntilMaintenance(maintenance.startTime);
  const isToday = daysUntil && (daysUntil.includes('時間後') || daysUntil.includes('分後') || daysUntil.includes('秒後'));
  const isTomorrow = daysUntil && daysUntil === '明日';
  
  // 日時の色を緊急度に応じて設定
  const dateTimeColorClass = isToday ? 'text-red-700' : isTomorrow ? 'text-yellow-700' : 'text-blue-700';

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* ヘッダー */}
      <div className="bg-[#5b8064] p-6 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold text-white">メンテナンス予定</h2>
          </div>
          {/* カレンダーボタン */}
          <a 
            href="https://calendar.google.com/calendar/u/0?cid=dnFobnRpa2FsOXU1OWE1Ym1hOWphdmNjcWdAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-white/20 text-white text-sm rounded-md hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            詳細
          </a>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          次回のメンテナンス情報をお知らせします。メンテナンス中はサーバーへの接続ができません。
        </p>
      </div>
      
      <div className={`p-4 ${
        isToday ? 'bg-red-50' : 
        isTomorrow ? 'bg-yellow-50' : 
        'bg-blue-50'
      }`}>
        {/* 資源更新の場合は特別な表示 */}
        {maintenance.description?.includes('資源更新') && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg mb-4 font-bold text-center">
            資源更新予定
          </div>
        )}
        
        <div className="space-y-4">
          {/* カウントダウン表示 */}
          {daysUntil && (
            <div className="flex items-baseline justify-center">
              {daysUntil === '明日' ? (
                <span className={`text-2xl font-bold ${dateTimeColorClass}`}>明日</span>
              ) : (
                <span 
                  className={`${dateTimeColorClass}`} 
                  dangerouslySetInnerHTML={{
                    __html: daysUntil.replace(/(\d+)(日後|時間後|分後|秒後)/g, '<span class="text-2xl font-bold">$1</span><span class="text-lg font-bold">$2</span>')
                  }} 
                />
              )}
            </div>
          )}
          
          {/* 日付・時間表示 */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-2 ${dateTimeColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`${dateTimeColorClass}`}>
                {formatDate(maintenance.startTime)}
              </span>
            </div>
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-2 ${dateTimeColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`${dateTimeColorClass}`}>
                {formatTime(maintenance.startTime)} ～ {formatTime(maintenance.endTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
