# サーバーステータス機能 - 本番環境への移行ガイド

## 概要

このドキュメントは、ローカル環境（localhost:25565）で開発されたサーバーステータス機能を本番環境に移行する際の変更点をまとめたものです。

## 必要な変更点

### 1. サーバーアドレスの変更

#### ファイル: `src/components/ServerStatus.tsx`
```typescript
// 【変更前】ローカル環境
serverAddress = 'localhost:25565'

// 【変更後】本番環境
serverAddress = '1necat.net:25565'
```

#### ファイル: `src/app/page.tsx`
```typescript
// 【変更前】ローカル環境
<ServerStatus serverAddress="localhost:25565" />

// 【変更後】本番環境
<ServerStatus serverAddress="play.ineserver.com" />
```

#### ファイル: `src/app/api/server-status/route.ts`
```typescript
// 【変更前】ローカル環境
const address = searchParams.get('address') || 'localhost:25565';

// 【変更後】本番環境
const address = searchParams.get('address') || 'play.ineserver.com';
```

### 2. 環境変数の活用（推奨）

より柔軟な運用のため、環境変数を使用することを強く推奨します。

#### `.env.local` ファイルの作成
```env
# ローカル環境
MINECRAFT_SERVER_ADDRESS=localhost:25565

# 本番環境
MINECRAFT_SERVER_ADDRESS=play.ineserver.com
```

#### コードの修正例

**`src/components/ServerStatus.tsx`**
```typescript
export default function ServerStatus({ 
  serverAddress = process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS || 'play.ineserver.com',
  refreshInterval = 30000
}: ServerStatusProps) {
```

**`src/app/page.tsx`**
```typescript
<ServerStatus serverAddress={process.env.NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS} />
```

**`src/app/api/server-status/route.ts`**
```typescript
const address = searchParams.get('address') || process.env.MINECRAFT_SERVER_ADDRESS || 'play.ineserver.com';
```

### 3. 本番環境での考慮事項

#### 3.1 外部API制限
- mcsrvstat.us APIには利用制限があります
- 頻繁なリクエストを避けるため、更新間隔を調整することを検討してください

#### 3.2 エラーハンドリング
- 本番環境では、より詳細なエラー監視を実装することを推奨します
- Sentry、LogRocket、または類似のサービスを検討してください

#### 3.3 パフォーマンス最適化
- サーバーステータスのキャッシュを検討
- Redis や Vercel KV などのキャッシュソリューションを活用

#### 3.4 セキュリティ
- API制限の実装（Rate Limiting）
- CORS設定の確認
- 適切なエラーメッセージの設定

## 代替実装オプション

### オプション 1: 外部API（mcsrvstat.us）- 現在使用中
現在の実装では、この方法を使用しています。

**メリット：**
- 簡単に実装できる
- 外部依存関係なし
- 安定性が高い

**デメリット：**
- API制限がある
- 外部サービスに依存
- レスポンス時間が遅い場合がある

### オプション 2: 直接サーバークエリ（将来的な実装）
より高速で信頼性の高い方法として、直接サーバーにクエリを送信する実装を検討できます。

**推奨ライブラリ：**
- `mcstatus.io` API
- 独自のMinecraftプロトコル実装
- サーバー側でのステータスAPI提供

**実装例：**
```typescript
// 将来的な実装例
async function fetchServerStatusDirect(address: string): Promise<ServerStatus> {
  // 直接サーバーにクエリを送信
  // 実装は複雑になるが、より高速で信頼性が高い
}
```

## デプロイメント手順

### 1. 環境変数の設定
Vercel、Netlify、またはその他のホスティングサービスで環境変数を設定：

```
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=play.ineserver.com
MINECRAFT_SERVER_ADDRESS=play.ineserver.com
```

### 2. 設定ファイルの確認
- `next.config.ts`
- `package.json`
- `.env.local`（本番環境では`.env.production`）

### 3. テスト
デプロイ前に以下をテスト：
- サーバーステータスAPI (`/api/server-status`)
- フロントエンドでの表示
- エラーハンドリング

## 監視とメンテナンス

### 監視すべき項目
- API応答時間
- エラー発生率
- サーバーステータスの取得成功率
- ユーザー体験への影響

### メンテナンス項目
- 定期的なAPIレスポンス確認
- エラーログの監視
- 外部API（mcsrvstat.us）の稼働状況確認

## トラブルシューティング

### よくある問題

1. **サーバーステータスが取得できない**
   - サーバーアドレスの確認
   - ファイアウォール設定の確認
   - 外部API（mcsrvstat.us）の稼働状況確認

2. **応答が遅い**
   - タイムアウト設定の調整
   - キャッシュの実装
   - 更新間隔の調整

3. **エラーが頻発する**
   - エラーログの確認
   - 外部API制限の確認
   - サーバー側の設定確認

## 連絡先

本番環境での問題や質問については、開発チームまでご連絡ください。
