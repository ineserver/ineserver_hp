# いねさば 公式ホームページ

Minecraftサーバー「いねさば」の公式Webサイトです。  
**Next.js 15** と **Tailwind CSS** で構築されています。

---

## 🚀 クイックスタート

### 前提条件

- **Node.js** 18.0.0 以上
- **npm** または **yarn**

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build
npm start
```

---

## 🔧 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください。

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `GOOGLE_CALENDAR_API_KEY` | Google Calendar API キー | `AIza...` |
| `MINECRAFT_SERVER_ADDRESS` | Minecraftサーバーアドレス | `1necat.net` |
| `NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS` | 公開用サーバーアドレス | `1necat.net` |
| `NEXT_PUBLIC_RECOMMENDED_VERSION` | 推奨Minecraftバージョン | `1.21.4` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 測定ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Google Search Console サイト確認コード | `vYtPF7pb...` |
| `NEXT_PUBLIC_MARKET_API_BASE` | アイテム市場ページが読む API の向き先（省略時は `https://api.1necat.net`。手元で確かめるとき用） | `http://localhost:4000` |

---

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router ページ
│   ├── api/               # API Routes
│   │   ├── maintenance/   # メンテナンス情報取得
│   │   ├── patch-notes/   # パッチノート取得
│   │   └── ...
│   ├── announcements/     # お知らせページ
│   ├── life/              # 生活・くらしページ
│   ├── economy/           # 経済ページ
│   ├── adventure/         # 冒険ページ
│   ├── transport/         # 交通ページ
│   ├── server-guide/      # サーバーガイドページ
│   ├── patch-notes/       # パッチノートページ
│   ├── guide/             # ガイド一覧ページ
│   ├── qa/                # Q&Aページ
│   └── tutorial/          # チュートリアルページ
├── components/            # 共通コンポーネント
└── lib/                   # ユーティリティ関数

content/                   # Markdownコンテンツ
├── announcements/         # お知らせ記事
├── life/                  # 生活・くらし記事
├── economy/               # 経済記事
├── adventure/             # 冒険記事
├── transport/             # 交通記事
├── server-guide/          # サーバーガイド記事
└── patch-notes/           # パッチノート
```

---

## 📝 コンテンツの書き方

### Frontmatter（メタデータ）

各Markdownファイルの先頭に以下を記述してください：

```yaml
---
title: "記事タイトル"           # 必須
published: true                 # 必須: true/false
type: "protection"              # 必須: カテゴリタイプ（下記参照）
number: 1                       # 必須: 表示順（数字が小さいほど上）
description: "記事の説明"       # 任意: カード表示用
image: "/images/example.png"    # 任意: サムネイル画像
externalLink: "https://..."     # 任意: 外部リンク（指定すると外部遷移）
---
```

> ⚠️ **注意**: ファイル名がそのままURLになります（例: `land-protection.md` → `/life/land-protection`）

---

### カテゴリ別タイプ一覧

#### 📢 お知らせ (`/announcements`)

| type | 説明 |
|------|------|
| `important` | 重要なお知らせ |
| `normal` | 通常のお知らせ |
| `pickup` | イベント・ピックアップ |

#### 🏠 生活・くらし (`/life`)

| type | 説明 |
|------|------|
| `protection` | 保護関連 |
| `feature` | 便利機能 |
| `item` | アイテム |
| `license` | 許可・ライセンス |
| `advertising` | 宣伝 |

#### 💰 経済 (`/economy`)

| type | 説明 |
|------|------|
| `earn` | ineを稼ぐ |
| `spend` | ineを使う |

#### ⚔️ 冒険 (`/adventure`)

| type | 説明 |
|------|------|
| `dungeon` | ダンジョン |
| `event` | イベント |

#### 🚂 交通 (`/transport`)

| type | 説明 |
|------|------|
| `rail` | 鉄道 |
| `road` | 道路 |

#### 📖 サーバーガイド (`/server-guide`)

| type | 説明 |
|------|------|
| `rule` | サーバールール |
| `guideline` | ガイドライン |

---

### イベント記事の書き方

イベント情報は `announcements/` フォルダ内で `type: pickup` を指定します：

```yaml
---
title: "イベントタイトル"
published: true
type: pickup
number: 1
eventStartDate: 2024-12-25T18:00:00+09:00   # 開始日時
eventEndDate: 2024-12-25T22:00:00+09:00     # 終了日時
description: "イベントの概要説明"
---
```

---

## 🔴 Google Calendar API エラーコード

メンテナンス情報の取得に失敗した場合、以下のエラーコードが表示されます：

| コード | 説明 | 対処法 |
|--------|------|--------|
| `GCAL_001` | APIキーが設定されていない | `.env.local` に `GOOGLE_CALENDAR_API_KEY` を設定 |
| `GCAL_002` | 接続タイムアウト | しばらく待ってから再度アクセス |
| `GCAL_003` | APIレート制限に達した | しばらく待ってから再度アクセス（1分間に100リクエスト制限） |
| `GCAL_004` | API認証エラー | APIキーが正しいか、Google Cloud Consoleで有効化されているか確認 |
| `GCAL_005` | カレンダーが見つからない | カレンダーIDが正しいか、公開設定になっているか確認 |
| `GCAL_006` | Googleサーバーエラー | Google側の一時的な問題。しばらく待ってから再度アクセス |
| `GCAL_007` | 不明なAPIエラー | コンソールログで詳細を確認 |
| `GCAL_008` | ICSフィード取得失敗 | カレンダーの公開設定を確認 |
| `GCAL_009` | ICSフィード解析失敗 | カレンダーデータの形式を確認 |
| `GCAL_010` | ネットワークエラー | インターネット接続を確認 |
| `GCAL_011` | JSONパース失敗 | APIレスポンスが不正。コンソールログで詳細確認 |
| `GCAL_NETWORK` | クライアント側通信エラー | ブラウザのネットワーク接続を確認 |

> 💡 **フォールバック機能**: APIでの取得が失敗した場合、自動的にICS形式のカレンダーフィードからデータ取得を試みます。

---

## 🚀 デプロイ

### GitHub Actions による自動デプロイ

- **`master` ブランチ**にpushすると、自動でビルド・デプロイが開始されます
- 作業中は **`dev` ブランチ** を使用してください

```bash
# 開発ブランチで作業
git checkout dev
git add .
git commit -m "変更内容"
git push origin dev

# 本番デプロイ（masterにマージ）
git checkout master
git merge dev
git push origin master
```

---

## 🛠️ 開発者向け情報

### 主な技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **コンテンツ**: Markdown + gray-matter
- **ホスティング**: Vercel / GitHub Pages

### 便利なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# Lintチェック
npm run lint

# 型チェック
npx tsc --noEmit
```

---

## 📄 ライセンス

このプロジェクトは「いねさば」運営チームが管理しています。  
無断での複製・再配布はご遠慮ください。

---

## 🔗 関連リンク

- **公式サイト**: [https://1necat.net](https://1necat.net)
- **Dynmap**: [https://map.1necat.net](https://map.1necat.net)
- **Discord**: [いねさば Discord サーバー](https://discord.gg/inesaba)