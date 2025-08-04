import RecommendedVersion from '@/components/RecommendedVersion';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">推奨バージョン機能テスト</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            サーバーから動的に取得された推奨バージョン
          </h2>
          <RecommendedVersion />
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">機能説明</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 実際のMinecraftサーバー (1necat.net) に接続してプロトコルバージョンを取得</li>
            <li>• プロトコルバージョンから対応するMinecraftバージョンを判定</li>
            <li>• サーバーに最適な推奨バージョンを表示</li>
            <li>• サーバーがオフラインの場合はフォールバック情報を表示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
