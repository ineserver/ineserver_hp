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
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        バージョン情報
      </h5>
      
      <div className="space-y-3">
        {/* 推奨バージョン（環境変数で設定） */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-green-900 text-sm">推奨バージョン</span>
          </div>
          <p className="text-green-800 text-sm font-semibold ml-6">{configuredRecommendedVersion}</p>
          <p className="text-green-700 text-xs mt-1 ml-6">いねさばで最も安定して動作するバージョンです</p>
        </div>

        {/* サポート範囲（APIから取得） */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-gray-900 text-sm">サポート範囲</span>
          </div>
          <p className="text-gray-800 text-sm font-semibold ml-6">{supportedRange}</p>
          <p className="text-gray-700 text-xs mt-1 ml-6">サーバーが対応しているMinecraftバージョンの範囲です</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendedVersion;
