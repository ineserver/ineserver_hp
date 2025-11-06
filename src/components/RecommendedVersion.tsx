'use client';

import React, { useEffect, useState } from 'react';
import { getRecommendedVersion } from '@/lib/server-config';

interface ServerStatus {
  online: boolean;
  version?: string;
  players?: {
    online: number;
    max: number;
  };
}

const RecommendedVersion: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 設定からの推奨バージョン（環境変数で設定可能）
  const configuredRecommendedVersion = getRecommendedVersion();

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        setError(null);

        const response = await fetch(`/api/server-status?address=1necat.net`);
        
        if (!response.ok) {
          throw new Error(`Server status API error: ${response.status}`);
        }
        
        const data = await response.json();
        setServerStatus(data);
      } catch (err) {
        console.error('Failed to fetch server status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchServerStatus();
  }, []);

  // APIから取得したサポートバージョン範囲
  const supportedRange = serverStatus?.version || (error ? '取得に失敗しました' : '取得中...');
  
  return (
      <div className="ml-13 flex flex-col md:flex-row gap-3">
        {/* 推奨バージョン（環境変数で設定） */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 flex-1 min-w-0 md:w-1/2">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-green-900 text-sm">推奨バージョン</span>
          </div>
          <p className="text-green-800 text-sm font-semibold ml-6">{configuredRecommendedVersion}</p>
          <p className="text-xs mt-1 ml-6">いねさばのサーバーバージョンです。宗教上の理由がない限りこのバージョンで接続するのがおすすめです！</p>
        </div>

        {/* サポート範囲（APIから取得） */}
        <div className="rounded-lg p-3 border border-gray-200 flex-1 min-w-0 md:w-1/2">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-sm">ログイン可能バージョン</span>
          </div>
          <p className="text-sm font-semibold ml-6">{supportedRange}</p>
          <p className="text-xs mt-1 ml-6">サーバーにログインができるバージョンです。一部のバージョンで不具合が発生する場合があります。</p>
        </div>
      </div>
  );
};

export default RecommendedVersion;
