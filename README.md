# いねさば公式ホームページ

Minecraftサーバー「いねさば」の公式ホームページです。Next.js 15とTailwind CSSで構築されています。

## セットアップ手順

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### ローカル環境セットアップ

1. リポジトリをクローンまたはダウンロード
```bash
git clone <repository-url>
cd ineserver_hp
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定（`.env.local`を作成）
```env
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=localhost:25565
MINECRAFT_SERVER_ADDRESS=localhost:25565
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key_here
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. ブラウザで http://localhost:3000 にアクセス

### 本番環境ビルド

```bash
npm run build
npm start
```

## 本番環境時に変更するファイル一覧

### 1. 環境変数設定
- `.env.production` または デプロイサービスの環境変数設定
```env
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=play.ineserver.com
MINECRAFT_SERVER_ADDRESS=play.ineserver.com
GOOGLE_CALENDAR_API_KEY=実際のAPIキー
```

### 2. メタデータ設定
- `src/app/layout.tsx`
```tsx
export const metadata: Metadata = {
  title: "いねさば公式ホームページ", // 本番用タイトルに変更
  description: "Minecraftサーバー「いねさば」の公式ホームページ", // 本番用説明文に変更
};
```

### 3. サーバー固有設定
- `public/config.yml` - CMS設定（本番リポジトリURL）
- `netlify.toml` - Netlify設定（本番用リダイレクトルール等）

### 4. アセット確認
- `public/server-icon.png` - サーバーアイコン画像を実際のものに変更
- その他必要な画像ファイルの配置

### 5. コンテンツファイル
- `content/` ディレクトリ内のMarkdownファイルを本番用コンテンツに更新

### Google Calendar API Keyの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成、または既存のプロジェクトを選択
3. 「APIとサービス」→「ライブラリ」から「Google Calendar API」を有効化
4. 「APIとサービス」→「認証情報」でAPIキーを作成
5. 作成したAPIキーを環境変数に設定
