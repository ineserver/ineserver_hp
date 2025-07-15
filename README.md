# いねさば公式ホームページ

Minecraftサーバー「いねさば」の公式ホームページです。Next.js 15とTailwind CSSで構築されています。

## ローカルでの起動方法

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### セットアップ手順

1. リポジトリをクローンまたはダウンロード
```bash
git clone <repository-url>
cd ineserver_hp
```

2. 依存関係をインストール
```bash
npm install
# または
yarn install
```

3. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev

# 以下はCMSをローカルで起動させるのに必要
npx decap-server
```

4. ブラウザで http://localhost:3000 にアクセス

### ビルド

本番用ビルドを作成するには：
```bash
npm run build
# または
yarn build
```

## ファイル構成

```
ineserver_hp/
├── public/                 # 静的ファイル
│   ├── server-icon.png     # サーバーアイコン
│   └── *.svg               # その他のアイコン
├── src/
│   ├── app/                # App Router（Next.js 13+）
│   │   ├── page.tsx        # トップページ
│   │   ├── layout.tsx      # 共通レイアウト
│   │   ├── globals.css     # グローバルスタイル
│   │   ├── lifestyle/      # くらし・生活カテゴリ
│   │   │   └── page.tsx
│   │   ├── economy/        # 経済カテゴリ
│   │   │   └── page.tsx
│   │   ├── entertainment/  # エンタメカテゴリ
│   │   │   └── page.tsx
│   │   ├── tourism/        # 観光カテゴリ
│   │   │   └── page.tsx
│   │   └── transportation/ # 交通カテゴリ
│   │       └── page.tsx
│   └── components/         # 共有コンポーネント
│       ├── Header.tsx      # ヘッダーコンポーネント
│       └── Breadcrumb.tsx  # パンくずリストコンポーネント
├── package.json            # プロジェクト設定と依存関係
├── next.config.ts          # Next.js設定
├── tailwind.config.js      # Tailwind CSS設定
├── tsconfig.json           # TypeScript設定
└── README.md               # このファイル
```

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI**: React 19

## 主な機能

- レスポンシブデザイン
- ナビゲーション（ヘッダーメニュー）
- カテゴリ別記事表示
- パンくずリスト
- Go Topボタン
- 記事風レイアウト
- **リアルタイムサーバーステータス** - Minecraftサーバーの状態を30秒間隔で自動更新
  - サーバーオンライン/オフライン状態
  - プレイヤー数とプログレスバー
  - サーバーバージョン情報
  - MOTD（Message of the Day）
  - 応答時間（Ping）
  - 接続方法の表示

## サーバーステータス機能

### 環境変数の設定

サーバーステータス機能を使用するには、以下の環境変数を設定してください：

#### ローカル環境（`.env.local`）
```env
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=localhost:25565
MINECRAFT_SERVER_ADDRESS=localhost:25565
```

#### 本番環境（`.env.production`）
```env
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=play.ineserver.com
MINECRAFT_SERVER_ADDRESS=play.ineserver.com
```

### 機能詳細

- **リアルタイム更新**: 30秒間隔でサーバーステータスを自動更新
- **手動更新**: 更新ボタンで即座にステータスを確認
- **視覚的フィードバック**: オンライン時のアニメーション、プレイヤー数のプログレスバー
- **エラーハンドリング**: 接続失敗時の適切なエラー表示
- **レスポンシブデザイン**: モバイルとデスクトップの両方で最適化

### 本番環境への移行

詳細な移行手順については、[PRODUCTION_MIGRATION_GUIDE.md](PRODUCTION_MIGRATION_GUIDE.md)を参照してください。

## カテゴリ

1. **くらし・生活** (`/lifestyle`) - サーバーでの生活に関する情報
2. **経済** (`/economy`) - 経済システムや取引に関する情報
3. **エンタメ** (`/entertainment`) - イベントや遊びに関する情報
4. **観光** (`/tourism`) - 観光スポットや見どころの紹介
5. **交通** (`/transportation`) - 交通手段や移動方法の説明

```
content/
├── announcements/    # お知らせ
├── rules/           # サーバールール  
├── economy/         # 経済ガイド
├── entertainment/   # 娯楽ガイド
└── pages/          # 固定ページ
```

### メディアファイル

画像などのメディアファイルは `public/images/uploads/` に保存されます。

## デプロイ

### Netlifyでのデプロイ

1. GitHubリポジトリをNetlifyに接続
2. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. 環境変数の設定（必要に応じて）

### Netlify Identity の設定

CMS管理画面での認証にNetlify Identityを使用します：

1. Netlifyダッシュボードで「Identity」を有効化
2. 「Registration preferences」を「Invite only」に設定
3. 「Git Gateway」を有効化
4. 管理者ユーザーを招待

## 技術スタック

- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **CMS**: Decap CMS
- **Content**: Markdown + Front Matter
- **Deployment**: Netlify

## プロジェクト構造

```
├── public/
│   ├── admin/          # CMS管理画面
│   └── images/         # 画像ファイル
├── src/
│   ├── app/           # Next.js App Router
│   └── api/           # API Routes
├── content/           # CMSコンテンツ
├── lib/              # ユーティリティ関数
└── netlify.toml      # Netlify設定
```

## CMS実装アーキテクチャ

### 1. コンテンツ管理システム（CMS）

このプロジェクトでは、**ファイルベースのMarkdown CMS**を実装しています。

#### コンテンツディレクトリ構成
```
content/
├── announcements/      # お知らせ記事
│   ├── 2025-07-13-server-maintenance.md
│   └── 2025-07-14-new-features.md
├── tourism/           # 観光スポット
│   └── central-station.md
├── transportation/    # 交通ガイド
│   └── warp-guide.md
├── lifestyle/         # ライフスタイルガイド
│   └── housing-guide.md
├── economy/          # 経済ガイド（未実装）
└── entertainment/    # エンタメガイド（未実装）
```

#### Markdownファイル形式
各Markdownファイルは以下の形式で構成されています：

```markdown
---
title: "記事タイトル"
date: "2025-07-14T10:00:00.000Z"
type: "pickup"
description: "記事の説明文"
published: true
category: "カテゴリ名"
order: 1
---

# 記事の本文

Markdownで記述されたコンテンツ...
```

### 2. データ処理層（lib/content.ts）

`lib/content.ts`では、Markdownファイルを読み込み、HTMLに変換する関数群を提供しています。

#### 主要関数一覧

**一覧取得関数**
- `getAnnouncementFiles()` - お知らせ一覧を取得
- `getTourismFiles()` - 観光スポット一覧を取得
- `getTransportationFiles()` - 交通ガイド一覧を取得
- `getLifestyleFiles()` - ライフスタイルガイド一覧を取得
- `getEconomyFiles()` - 経済ガイド一覧を取得
- `getEntertainmentFiles()` - エンタメガイド一覧を取得

**個別記事取得関数**
- `getAnnouncementData(id)` - 個別お知らせを取得
- `getTourismData(id)` - 個別観光スポットを取得
- `getTransportationData(id)` - 個別交通ガイドを取得
- `getLifestyleData(id)` - 個別ライフスタイルガイドを取得
- `getEconomyData(id)` - 個別経済ガイドを取得
- `getEntertainmentData(id)` - 個別エンタメガイドを取得

#### データ変換処理
1. **ファイル読み込み**: `fs.readFileSync()`でMarkdownファイルを読み込み
2. **Frontmatter解析**: `gray-matter`でメタデータとコンテンツを分離
3. **Markdown→HTML変換**: `remark`と`remark-html`でHTMLに変換
4. **データ構造化**: 以下の形式で返却
   ```typescript
   {
     id: string,           // ファイル名（拡張子なし）
     content: string,      // HTML変換されたコンテンツ
     title: string,        // 記事タイトル
     date: string,         // 公開日
     description: string,  // 説明文
     category?: string,    // カテゴリ
     published?: boolean,  // 公開状態
     order?: number        // 表示順序
   }
   ```

### 3. API層（src/app/api/）

REST APIエンドポイントを提供し、フロントエンドからのデータ取得要求に応答します。

#### APIエンドポイント構成
```
/api/
├── announcements/
│   ├── route.ts           # GET /api/announcements
│   └── [slug]/route.ts    # GET /api/announcements/{slug}
├── tourism/
│   ├── route.ts           # GET /api/tourism
│   └── [slug]/route.ts    # GET /api/tourism/{slug}
├── transportation/
│   ├── route.ts           # GET /api/transportation
│   └── [slug]/route.ts    # GET /api/transportation/{slug}
├── lifestyle/
│   ├── route.ts           # GET /api/lifestyle
│   └── [slug]/route.ts    # GET /api/lifestyle/{slug}
├── economy/
│   ├── route.ts           # GET /api/economy
│   └── [slug]/route.ts    # GET /api/economy/{slug}
└── entertainment/
    ├── route.ts           # GET /api/entertainment
    └── [slug]/route.ts    # GET /api/entertainment/{slug}
```

#### API実装例
```typescript
// /api/announcements/route.ts
import { NextResponse } from 'next/server'
import { getAnnouncementFiles } from '../../../lib/content'

export async function GET() {
  try {
    const announcements = await getAnnouncementFiles()
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}
```

### 4. フロントエンド層（src/app/）

#### ページ構成
```
src/app/
├── page.tsx                    # トップページ
├── announcements/
│   ├── page.tsx               # お知らせ一覧ページ
│   └── [slug]/page.tsx        # 個別お知らせページ
├── tourism/
│   ├── page.tsx               # 観光一覧ページ
│   └── [slug]/page.tsx        # 個別観光スポットページ
├── transportation/
│   ├── page.tsx               # 交通一覧ページ
│   └── [slug]/page.tsx        # 個別交通ガイドページ
├── lifestyle/
│   ├── page.tsx               # ライフスタイル一覧ページ
│   └── [slug]/page.tsx        # 個別ライフスタイルページ
├── economy/
│   ├── page.tsx               # 経済一覧ページ
│   └── [slug]/page.tsx        # 個別経済ガイドページ
└── entertainment/
    ├── page.tsx               # エンタメ一覧ページ
    └── [slug]/page.tsx        # 個別エンタメページ
```

#### データフロー

**一覧ページの場合**
1. ページコンポーネントがマウント
2. `useEffect`で対応するAPIエンドポイントに`fetch`リクエスト
3. APIが`lib/content.ts`の一覧取得関数を呼び出し
4. Markdownファイル群を読み込み、HTML変換してレスポンス
5. フロントエンドで記事カードのリストとして表示

**個別記事ページの場合**
1. 動的ルート`[slug]`でslugパラメータを取得
2. `useEffect`で`/api/{category}/{slug}`にfetchリクエスト
3. APIが`lib/content.ts`の個別取得関数を呼び出し
4. 該当するMarkdownファイルを読み込み、HTML変換してレスポンス
5. フロントエンドで`dangerouslySetInnerHTML`を使用してHTMLコンテンツを表示

#### レンダリング例
```typescript
// 個別記事ページでのコンテンツ表示
<div className="prose prose-lg max-w-none">
  <div 
    className="text-gray-700 leading-relaxed"
    dangerouslySetInnerHTML={{ __html: content.content }}
  />
</div>
```

### 5. データフロー図

```
[Markdownファイル] 
    ↓ (fs.readFileSync)
[lib/content.ts] 
    ↓ (gray-matter + remark)
[HTML変換済みデータ] 
    ↓ (APIレスポンス)
[フロントエンドコンポーネント] 
    ↓ (dangerouslySetInnerHTML)
[ユーザー画面に表示]
```

### 6. 技術的な特徴

- **静的ファイルベース**: データベースを使わず、Markdownファイルで管理
- **サーバーサイドレンダリング**: Next.js App Routerによる効率的なレンダリング
- **型安全性**: TypeScriptによる型チェック
- **モジュール設計**: カテゴリごとに独立したAPIエンドポイント
- **コンテンツ管理**: Frontmatterによるメタデータ管理
- **柔軟な表示制御**: `published`フラグによる公開制御

### 7. 開発時の注意事項

#### 新しいカテゴリの追加手順
1. `content/{新カテゴリ}/`ディレクトリを作成
2. `lib/content.ts`に対応する関数を追加
   - `get{Category}Files()` - 一覧取得
   - `get{Category}Data(id)` - 個別取得
3. `src/app/api/{新カテゴリ}/`にAPIルートを作成
   - `route.ts` - 一覧API
   - `[slug]/route.ts` - 個別API
4. `src/app/{新カテゴリ}/`にページコンポーネントを作成
   - `page.tsx` - 一覧ページ
   - `[slug]/page.tsx` - 個別ページ

#### コンテンツ作成ガイドライン
- ファイル名はURL-safeな形式（英数字、ハイフン）を使用
- Frontmatterは必須項目を含める（title, date, published）
- 画像は`public/images/`以下に配置し、相対パスで参照

#### パフォーマンス最適化
- 画像は適切にリサイズしてから配置
- Markdownファイルは適切なサイズに分割
- 不要な`console.log`は削除

### 8. トラブルシューティング

#### よくある問題と解決方法

**Q: 記事の本文が表示されない**
A: APIレスポンスのフィールド名とフロントエンドの期待値を確認。`contentHtml`と`content`の不整合が原因の可能性があります。

**Q: 新しい記事が表示されない**
A: 以下を確認してください：
- Frontmatterに`published: true`が設定されているか
- ファイル名が正しい形式か（拡張子は`.md`）
- サーバーの再起動

**Q: 日付順でソートされない**
A: Frontmatterの`date`フィールドがISO 8601形式（例：`2025-07-14T10:00:00.000Z`）になっているか確認

**Q: カテゴリフィルターが機能しない**
A: Frontmatterの`category`フィールドが正しく設定されているか確認

#### デバッグ方法
1. ブラウザの開発者ツールでNetworkタブを確認
2. APIエンドポイントに直接アクセスしてレスポンスを確認
3. サーバーログを確認（`npm run dev`のコンソール出力）

### 9. 依存関係

#### 主要ライブラリ
```json
{
  "dependencies": {
    "next": "^15.3.5",
    "react": "^19.0.0",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.18",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1"
  }
}
```

#### ライブラリの役割
- **gray-matter**: Markdownファイルのfrontmatter解析
- **remark**: Markdown解析とHTML変換
- **remark-html**: remarkプラグイン（Markdown→HTML）

### 10. 実装済み機能

- ✅ ファイルベースMarkdown CMS
- ✅ 6カテゴリの記事管理（announcements, tourism, transportation, lifestyle, economy, entertainment）
- ✅ 記事一覧・詳細ページの自動生成
- ✅ Frontmatterによるメタデータ管理
- ✅ カテゴリフィルタリング機能
- ✅ レスポンシブデザイン
- ✅ パンくずリスト
- ✅ エラーハンドリング

### 11. 今後の改善予定

- 🔄 管理画面（Decap CMS）の実装
- 🔄 画像アップロード機能
- 🔄 検索機能
- 🔄 タグ機能
- 🔄 RSS/Atom フィード
- 🔄 SEO最適化（メタタグ、構造化データ）

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。
