# いねさば公式ホームページ

Minecraftサーバー「いねさば」の公式ホームページです。Next.js 15とTailwind CSSで構築されています。

## 前提条件
- Node.js 18.0.0以上
- npm または yarn

## 環境設定

### 推奨バージョンのカスタマイズ

チュートリアルページで表示される推奨Minecraftバージョンは、環境変数で設定できます。

`.env.local`ファイルを作成し、以下の変数を設定してください：

```bash
# 推奨Minecraftバージョン
NEXT_PUBLIC_RECOMMENDED_VERSION=1.21.4

# サポートバージョン範囲
NEXT_PUBLIC_MIN_VERSION=1.21.3
NEXT_PUBLIC_MAX_VERSION=1.21.7

# バージョンの説明文
NEXT_PUBLIC_VERSION_DESCRIPTION=いねさばで最も安定して動作するバージョンです

# Minecraftサーバーアドレス
NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS=1necat.net
```

設定例は `.env.local.example` を参照してください。

## 注意事項
- masterブランチにpushすると、GitHub Actionsが作動し、ビルドが開始されます。
- 作業中はdevブランチにpushしてください。