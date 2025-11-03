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

## 記事を書く時に読んでください

### 共通のMaekdownの書き方

ファイル1行目からこれを記述してください。

```
---
title: # タイトル（必須）
published: true # true/false 公開するかどうか（必須）
type: # 以下のtypeを確認（必須）
number: # type内何番目に表示するか。数字が若いほうが上（必須）
externalLink: <URL> # ここにURLがあるとそこへの直リンクとなる。（必要な場合のみ記載）
---
```
※ ファイル名＝URL名になります。スペースはアンダーバーで代用をお願いします。

### カテゴリ
#### お知らせ(/announcements)
|type|どのカテゴリに表示されるか|
|---|---|
|important|重要なお知らせ|
|normal|お知らせ|
|pickup|ピックアップ※下記も参照|
#### 生活・くらし(/lifestyle)
|type|どのカテゴリに表示されるか|
|---|---|
|rule|サーバールール|
|protection|保護|
#### 経済(/economy)
|type|どのカテゴリに表示されるか|
|---|---|
|income|ineを貯める|
|expenditure|ineを使う|

### イベントはpickup
イベント情報を乗っけるときはannouncementsフォルダ内にて
```
type: pickup
# 以下を上のテンプレに追加してください
eventStartDate: yyyy-mm-ddThh:mm:ss+09:00 # 開始時間
eventEndDate: yyyy-mm-ddThh:mm:ss+09:00 #終了時間
description: # イベントの概要
```
にして投稿してください。