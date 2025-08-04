# いねさば公式ホームページ

Minecraftサーバー「いねさば」の公式ホームページです。Next.js 15とTailwind CSSで構築されています。

## 前提条件
- Node.js 18.0.0以上
- npm または yarn

## 環境変数
- **GOOGLE_CALENDAR_API_KEY**：GoogleカレンダーのAPI
- **MINECRAFT_SERVER_ADDRESS**：Minecraftサーバーのアドレス（1necat.netでOK）
- **NEXT_PUBLIC_MINECRAFT_SERVER_ADDRESS**：同上
- **NEXT_PUBLIC_RECOMMENDED_VERSION**：推奨のサーバーバージョン(1.21.4など)

## 注意事項
- masterブランチにpushすると、GitHub Actionsが作動し、ビルドが開始されます。
- 作業中はdevブランチにpushしてください。