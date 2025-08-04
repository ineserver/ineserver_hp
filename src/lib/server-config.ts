// サーバー設定管理
// 推奨バージョンのみ環境変数で設定可能
// サポートバージョン範囲はAPIから取得

interface ServerConfig {
  recommendedVersion: string;
  serverAddress: string;
  description?: string;
}

// デフォルト設定
const DEFAULT_CONFIG: ServerConfig = {
  recommendedVersion: '1.21.4',
  serverAddress: '1necat.net',
  description: 'いねさばで最も安定して動作するバージョンです'
};

/**
 * サーバー設定を取得
 * 推奨バージョンのみ環境変数で設定可能
 */
export function getServerConfig(): ServerConfig {
  return {
    recommendedVersion: process.env.NEXT_PUBLIC_RECOMMENDED_VERSION || DEFAULT_CONFIG.recommendedVersion,
    serverAddress: process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS || DEFAULT_CONFIG.serverAddress,
    description: process.env.NEXT_PUBLIC_VERSION_DESCRIPTION || DEFAULT_CONFIG.description
  };
}

/**
 * 推奨バージョンを取得（シンプル版）
 */
export function getRecommendedVersion(): string {
  return getServerConfig().recommendedVersion;
}
