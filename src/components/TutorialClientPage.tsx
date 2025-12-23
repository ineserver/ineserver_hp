'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import RecommendedVersion from '@/components/RecommendedVersion';
import Link from 'next/link';
import CommandCode from '@/components/CommandCode';
import CollapsibleDetail from '@/components/CollapsibleDetail';
import ImageModal from '@/components/ImageModal';
import { trackTutorialStepChange } from '@/lib/analytics';

export default function TutorialClientPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const steps = [
    {
      id: 0,
      title: "チュートリアルへようこそ！",
      content: (
        <div className="markdown-content">
          <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/a4b5d73c97c288bff8c5c86c3d8f859a.jpg', alt: 'いねさばへようこそ' })}>
            <Image
              src="https://img.1necat.net/a4b5d73c97c288bff8c5c86c3d8f859a.jpg"
              alt="いねさばへようこそ"
              className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
              width={1200}
              height={675}
            />
          </div>
          <h1>
            いねさばに興味を持っていただきありがとうございます！
          </h1>
          <p>このチュートリアルでは、<b>いねさばの基本的な遊び方やサーバールール</b>について説明します。</p>
          <p>はじめましての方や、お久しぶりの方向けに、<b>サーバーへのログイン方法からログイン後の流れ・基本的な遊び方まで</b>をわかりやすくご紹介します！</p>
          <p>「この部分だけ知りたい」という方は上部にある各セクション番号をクリックしてジャンプしてください。</p>
          <nav className="bg-gray-100 rounded-lg">
            <p className="text-2xl font-bold text-gray-800 px-4 pt-4 pb-0">いねさばってどんなサーバー？</p>
            <p className="px-4">あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。</p>
            <p className="px-4"><b>生きている経済：</b> プレイヤー間の取引によって、アイテムの価格がリアルタイムに変動します。昨日の価値は今日の価値ではない、シビアでリアルな市場がここにはあります。</p>
            <p className="px-4"><b>日常をアップグレード：</b> 340種類以上のカスタム家具や料理が、あなたの生活を彩ります。</p>
            <p className="px-4"><b>あなたらしい距離感：</b> 無理に繋がる必要はありません。「意思疎通ステータス」で、その時の気分に合わせた心地よい距離感で街に溶け込めます。</p>
            <p className="px-4">街を作るのも、経済を動かすのも、ただのんびりと暮らすのもあなた次第。そんな、自由な秩序のあるサーバーを目指しています。</p>
            <p className="font-bold px-4">いねさばでできることについて、もっと詳しく知りたい方は、以下のボタンから紹介ページをご覧ください！</p>
            <div className="px-4 pt-0 pb-4">
              <Link href="/lp">
                <button className="bg-[#5b8064] text-white px-6 py-2 rounded-md hover:bg-[#4a6b55] cursor-pointer">紹介ページはこちら</button>
              </Link>
            </div>
          </nav>
        </div>

      )
    },
    {
      id: 1,
      title: "守ってほしいこと",
      content: (
        <div className="space-y-8">
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-start space-x-4 mb-2">
              <div>
                <h3 className="text-xl font-bold text-red-700">ルールについて</h3>
              </div>
            </div>
            <p className="leading-relaxed">当サーバーも例に漏れず、長いルールや利用規約があります。しかし、そんな長い文章を読むのは正直大変だと思います。</p>
            <p className="leading-relaxed font-bold">そのため、他のサーバーに無いようなマイナーなルールや特に守ってほしいことを4つピックアップしました！</p>
          </div>

          <div className="space-y-8 px-4">
            <div className="flex items-start space-x-4">
              <svg className="w-8 h-8 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="flex-1">
                <h5 className="text-xl font-bold mb-2">マナーを守ろう</h5>
                <p>
                  他のプレイヤーへの迷惑行為、チャットでの不適切な発言・スパム行為、他プレイヤーの建築物を無断で破壊・改変することは禁止です。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <svg className="w-8 h-8 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <div className="flex-1">
                <h5 className="text-xl font-bold mb-2">MOD・クライアントについて</h5>
                <p className="mb-2">
                  ゲームバランスを変えるものでなければ、MODやクライアントの利用は可能です。許可されているMOD・クライアントについては、以下のボタンから許可MOD一覧をご確認ください。
                </p>
                <a
                  href="https://github.com/ineserver/ineserver-Public/wiki/%E8%A8%B1%E5%8F%AFMOD%E4%B8%80%E8%A6%A7"
                  className="inline-flex items-center px-4 py-2 bg-[#5b8064] hover:bg-[#4a6b54] text-white rounded-lg transition-all duration-200 font-medium text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  許可MOD一覧を確認
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="text-sm text-gray-500 mt-2">※ 明記されていないMOD・クライアントで不安な場合は運営までお問い合わせください</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <svg className="w-8 h-8 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
              </svg>
              <div className="flex-1">
                <h5 className="text-xl font-bold mb-2">トラップタワーの禁止・自動収穫機の制限があります</h5>
                <p>
                  トラップタワー全般の作成及び使用は禁止です。ただし、自動畑などは<b>一つのスイッチで停止できる機構がある場合に限り、ログアウト時に作動を停止させれば</b>作成可能です。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <svg className="w-8 h-8 text-[#5b8064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="flex-1">
                <h5 className="text-xl font-bold mb-2">建築制限区域があります</h5>
                <p className="mb-2">
                  環状1号線より内側及び白椿駅付近では、土地を購入する必要があります。制限区域など、詳しいルールについては以下のボタンからご確認ください。
                </p>
                <Link
                  href="/server-guide/building_restrictions"
                  className="inline-flex items-center px-4 py-2 bg-[#5b8064] hover:bg-[#4a6b54] text-white rounded-lg transition-all duration-200 font-medium text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  中心地の土地利用について
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <p className="mb-4">
              なお、<b>サーバーにログインした時点で、下記のサーバールール及び利用規約に同意したものとみなします。</b>
            </p>
            <p className="mb-4">
              実際の処罰は以下のルールに則って行われますのでご注意ください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link
                href="/server-guide/rule"
                className="inline-flex items-center px-4 py-2 bg-[#5b8064] hover:bg-[#4a6b54] text-white rounded-lg transition-all duration-200 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                サーバールール
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <Link
                href="/server-guide/terms_of_service"
                className="inline-flex items-center px-4 py-2 bg-[#5b8064] hover:bg-[#4a6b54] text-white rounded-lg transition-all duration-200 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                利用規約
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "ログインしてみよう",
      content: (
        <div className="space-y-6">
          <p>それでは、早速いねさばにログインしてみましょう！</p>

          <div className="space-y-6">
            <div className="flex items-baseline mb-4">
              <div className="w-10 h-10 flex-shrink-0 bg-[#5b8064] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
              <p className="text-lg font-semibold"><b>Java版からの接続のみ対応しています。</b>BE版（統合版）からはアクセス出来ません。</p>
            </div>

            <div className="flex items-baseline mb-4">
              <div className="w-10 h-10 flex-shrink-0 bg-[#5b8064] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
              <p className="text-lg font-semibold">対応バージョンは以下のとおりです</p>
            </div>
            <div className="mb-4">
              <RecommendedVersion />
            </div>

            <div className="flex items-baseline mb-1">
              <span className="w-10 h-10 flex-shrink-0 bg-[#5b8064] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
              <h4 className="text-lg font-semibold">サーバーを追加</h4>
            </div>
            <div className="ml-14">
              <div className="space-y-1 mb-4">
                <p>Minecraftを起動し、「マルチプレイ」を選択してください。</p>
                <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2015.59.40.png', alt: 'Minecraftメイン画面' })}>
                  <Image
                    src="https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2015.59.40.png"
                    alt="Minecraftメイン画面"
                    className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                    width={1200}
                    height={675}
                  />
                </div>
                <p>右下にある「サーバーを追加」をクリックしてください。</p>
                <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2015.59.48.png', alt: 'Minecraftマルチ選択画面' })}>
                  <Image
                    src="https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2015.59.48.png"
                    alt="Minecraftマルチ選択画面"
                    className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                    width={1200}
                    height={675}
                  />
                </div>
                <p>サーバー名にわかりやすい名前（例：いねさば）を、<b className="text-red-600">サーバーアドレスに「1necat.net」</b>を、<b className="text-red-600">リソースパックは「有効」</b>に設定してください。</p>
                <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2016.00.01.png', alt: 'Minecraftマルチプレイ追加画面' })}>
                  <Image
                    src="https://img.1necat.net/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202025-11-17%2016.00.01.png"
                    alt="Minecraftマルチプレイ追加画面"
                    className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                    width={1200}
                    height={675}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-baseline mb-1">
              <span className="w-10 h-10 flex-shrink-0 bg-[#5b8064] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</span>
              <h4 className="text-lg font-semibold">サーバーに接続</h4>
            </div>
            <div className="ml-14">
              <p className="space-y-1 mb-4">
                サーバーリストに追加できたら、ダブルクリックまたは「サーバーに接続」ボタンでログインしてみましょう！
              </p>
            </div>
          </div>

          <div className="markdown-content">
            <h1>いねさばに接続できました！</h1>
            <p>続いてメインのサーバーである、経済サーバーに移動してみましょう！</p>
            <h2>最初にログインしたサーバーは「ロビーサーバー」です</h2>
            <p>ロビーサーバーは、経済サーバーがメンテナンス時などの待機場になります。</p>
            <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/2025-11-19_14.46.59.png', alt: 'いねさばロビー' })}>
              <Image
                src="https://img.1necat.net/2025-11-19_14.46.59.png"
                alt="いねさばロビー"
                className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                width={1200}
                height={675}
              />
            </div>
            <h2>目の前の水に入ると「経済サーバー」に移動できます！</h2>
            <p>いねさばのメインのサーバーはこの「経済サーバー」です。これから解説していくものはすべて「経済サーバー」内のものになります。</p>
            <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/2025-11-19_23.48.55.png', alt: 'いねさば経済サーバー' })}>
              <Image
                src="https://img.1necat.net/2025-11-19_23.48.55.png"
                alt="いねさば経済サーバー"
                className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                width={1200}
                height={675}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "いねさばへようこそ！",
      content: (
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/2025-11-21_15.02.13.png', alt: '経済ワールド説明画像' })}>
            <Image
              src="https://img.1necat.net/2025-11-21_15.02.13.png"
              alt="経済ワールド説明画像"
              className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
              width={1200}
              height={675}
            />
          </div>
          <div className="markdown-content">
            <h1>チュートリアルクリアおめでとうございます！</h1>
            <p> 無事にいねさばに到着しました！ここからは、自由に行動をすることが出来ます！</p>
            <p> ...と、「いきなり言われても、、、」だと思いますので、「知っておくと便利なこと」と「やっておいた方が良いこと」をご紹介します！</p>

            <h1>まずは観光から</h1>
            <p>いねさばには（まだ少ないですが）観光スポットが幾つかあります！目の前の「白椿駅」から電車の旅に出るのも良し、スポーン地点周辺を散策するも良し、気になる場所を訪れてみましょう！</p>
            <p>いねさばではサイト上で確認できるマップを用意しています。→
              <Link className="inline-flex items-center" href="https://map.1necat.net" target="_blank" rel="noopener noreferrer">マップはこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg></Link></p>
            <p>また、<CommandCode>/spawn</CommandCode>コマンドで、スポーン地点に戻ることができます。道に迷ったら、/spawnを使いましょう！</p>

            <h1>お腹が空いたら</h1>
            <p>散策中、お腹が減ると思います。</p>
            <p>そんなときには、<b className="text-red">市場取引機能</b>を利用しましょう！</p>
            <p><CommandCode>/market</CommandCode>コマンドで、取引画面を開くことができます。</p>

            <h2>カテゴリを選ぶ</h2>
            <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/84f0e56743771bf49598a875d4f85905.png', alt: 'カテゴリ説明画像' })}>
              <Image
                src="https://img.1necat.net/84f0e56743771bf49598a875d4f85905.png"
                alt="カテゴリ説明画像"
                className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                width={1200}
                height={675}
              />
            </div>
            <p>今回は食料カテゴリ→購入したい食べ物を選択します。</p>

            <h2>購入する</h2>
            <div className="rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setModalImage({ src: 'https://img.1necat.net/eb8be81f07fbad47458c2109cb0f7bce.png', alt: '購入説明画像' })}>
              <Image
                src="https://img.1necat.net/eb8be81f07fbad47458c2109cb0f7bce.png"
                alt="購入説明画像"
                className="w-full h-auto object-cover hover:opacity-80 transition-opacity duration-200"
                width={1200}
                height={675}
              />
            </div>
            <p>左側の緑色のロウソクをクリックすると購入できます。ロウソクの本数は購入数です。</p>

            <h2>これで食料を購入できました！</h2>
            <p>市場取引では食料以外でも、<b>建材や鉱石</b>も購入することができます。</p>
            <p>ホームページ上からも最新の物価を確認できます。→
              <Link className="inline-flex items-center" href="https://market.1necat.net" target="_blank" rel="noopener noreferrer">市場状況はこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg></Link></p>
            <p>ちなみに、初回ログイン時に<b className="text-red">全員に2000ineをプレゼントしております！</b>&ldquo;ine&rdquo;は、市場取引の他に他の住民のショップから物を買ったり、土地を購入したり、車を買ったりなど様々なことに使えます！</p>
            <CollapsibleDetail title="通貨：ineについて">
              <p>&ldquo;ine&rdquo;は、このサーバーでの基本的な通貨です。</p>
              <p>ineを使うことで、「市場取引」「ユーザー同士の取引（ショップ等）」「土地購入」「車購入」「コマンド購入」など様々なことに使えます。</p>
              <p>現在の所有している金額は<CommandCode>/money show</CommandCode>コマンドで確認できます。</p>
            </CollapsibleDetail>

            <h1>拠点を決めよう</h1>
            <p>次に、生活の拠点となる自宅を決めましょう！</p>
            <p>いねさばでは、<b className='text-red'>賃貸に住む・土地代を払って中心地に家を建てる・土地代無料の郊外に家を建てる</b>など、さまざまな選択肢があります。</p>
            <p>以下では、それぞれの特徴や実際の自宅の建て方をご案内します。自分の好きなやり方をお選びください</p>

            <h2>おすすめ！　選択肢① 郊外に自宅をつくる</h2>
            <p>最も一般的な、Minecraftらしい選択肢です。</p>
            <p>いねさばの <Link className="inline-flex items-center" href="server-guide/building_restrictions" target="_blank" rel="noopener noreferrer">中心地エリア<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg></Link> 以外では基本的に無料で建築ができます。</p>
            <p>いねさばには幾つかの住宅街が整備されています！詳しくはマップからご確認ください！</p>
            <p>なお、郊外エリアは保護がされていません。<b className="text-red">保護はご自身で忘れずにおかけください！</b>→ <Link className="inline-flex items-center" href="life/land-protection" target="_blank" rel="noopener noreferrer">保護のやり方はこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg></Link></p>

            <h2>選択肢② マンション・アパートに住む</h2>
            <p>中心地エリアに住みたいけど、高い土地代を払いたくない方向けの選択肢です。</p>
            <p>いねさばにはマンション・アパートがいくつかあります。マンション・アパートには土地代がかからず、費用を抑えて中心地に住むことができます。</p>
            <p><Link className="inline-flex items-center" href="economy/land-purchase" target="_blank" rel="noopener noreferrer">マンション・アパートについて詳しくはこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg></Link></p>

            <h2>選択肢③ 中心地に自宅をつくる</h2>
            <p>夢のある選択肢です！色々な商業拠点のある中心地に土地代を払って自宅を立てることが出来ます。</p>
            <p>中心地では土地代を払うことで、その区画を入手することができます。</p>
            <p><Link className="inline-flex items-center" href="economy/land-purchase" target="_blank" rel="noopener noreferrer">土地の購入について詳しくはこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg></Link></p>
            <h1>資材を集めよう</h1>
            <p>拠点を建てるには資材が必要だと思います！</p>
            <p>いねさばでは、資材を集める方法として大きく2つの選択肢があります！</p>

            <h2>選択肢① 市場取引機能</h2>
            <p>上記の食料で使った市場取引機能を使うことで、建材や鉱石を入手することが出来ます！</p>
            <p><CommandCode>/market</CommandCode>コマンドで、取引画面を開くことができます。</p>

            <h2>選択肢② 資源ワールドを使う</h2>
            <p>いねさばには、「資源ワールド」という資源を集めるためのワールドがあります。</p>
            <CollapsibleDetail title="そもそも、ワールド・サーバーとは？">
              <p>サーバーとはいねさばで言うところの、「経済サーバー（今いるところ）」、「ロビーサーバー」といったものです。TABキーで出てくる大きな枠組のものがそれです。</p>
              <p>ワールドとは、サーバーの中で個別のワールドを指します。経済サーバーには「経済ワールド」「資源ワールド」などの複数のワールドがあります。</p>
              <p>チャットはサーバー毎に分かれています。経済サーバーではロビーサーバーのチャットが見れません。逆も同様です。</p>
            </CollapsibleDetail>
            <p>資源ワールドへは各地にある市役所の中から移動することが可能です。</p>
            <p>今回は白椿市役所から資源ワールドに行ってみましょう！</p>
            <p><CommandCode>/spawn</CommandCode>コマンドでスポーンに移動し、地面の案内に従って白椿市役所に向かってください。白椿市役所1階右奥にワールドを移動できるワープゲートがあります。</p>
            <p>このように、市役所から資源ワールドへ移動することができます。拠点を市役所の近くにするのも良いかもですね・・・！</p>
            <p>ちなみに、各市役所の位置はマップから検索できます。マップの左上の「ここで検索」から検索してみましょう！ → <Link className="inline-flex items-center" href="https://map.1necat.net" target="_blank" rel="noopener noreferrer">マップはこちら<svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg></Link></p>
            <CollapsibleDetail title="資源ワールドの注意点">
              <p>資源ワールドはあくまでも「資源採集のためのワールド」です。</p>
              <p><b className="text-red">定期的にワールド自体が更新されてしまいます</b>ので、大事な持ち物を保管したり、建築はしないことをおすすめします。</p>
              <p>また、経済ワールドでの<b className="text-red">資源採集のための探索は固く禁じられております</b>のでご注意ください。</p>
            </CollapsibleDetail>

            <h1>さいごに</h1>
            <p>お疲れ様でした！いねさばの基本的な遊び方は以上で終了です！</p>
            <p>最後に、いねさばで役に立つ情報を幾つかご案内します！</p>

            <h2>わからないことがあれば「いねさばの歩き方」を見よう</h2>
            <p>いねさばの歩き方は公式HPの右上から見ることが出来ます。こんな感じのアイコンです↓</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4 bg-gray-50 rounded-xl border border-gray-200 mt-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">PC</span>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm text-white font-bold shadow-md flex items-center gap-1.5 pointer-events-none scale-90">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  いねさばの歩き方
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">スマホ</span>
                <div className="relative p-1.5 rounded-md flex items-center justify-center bg-white border border-gray-100 shadow-sm pointer-events-none scale-90" style={{ minWidth: '40px', minHeight: '40px' }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="mobileGuideGradientTutorialCompact" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#a21caf" />
                      </linearGradient>
                    </defs>
                    <path stroke="url(#mobileGuideGradientTutorialCompact)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <p>いねさばの歩き方ではいねさば独自の追加要素の細かい解説や、追加アイテムの詳細など、いねさばライフを楽しむための情報がカテゴリごとにまとめられています！</p>
            <p>迷ったら、「いねさばの歩き方」を見てみましょう！</p>

            <h2>Discordに参加してみよう！</h2>
            <p>いねさばでは公式Discordを用意しております。公式Discordではいち早いお知らせや、住民同士の交流などを行っております！</p>
            <p>ROM専でも大丈夫です！ぜひお気軽にご参加ください！</p>
          </div>
          <Link
            href="https://discord.gg/tdefsEKYhp"
            className="flex sm:inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] !text-white rounded-lg transition-all duration-200 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Discordに参加する
          </Link>
          <div className="markdown-content">
            <h2>以上でいねさばのチュートリアルは終了です！</h2>
            <p>もし、遊んでいて分からないことがあったらスタッフなどに気軽に聞いて下さい！</p>
            <p>いねさばでは様々な遊び方があります。あなたらしい遊び方でいねさばを楽しんでいただけたら幸いです！</p>
            <p>それでは、良いいねさばライフを👋</p>
          </div>
        </div>
      )
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      trackTutorialStepChange(nextIndex, steps[nextIndex].title, 'next');
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      trackTutorialStepChange(prevIndex, steps[prevIndex].title, 'prev');
      scrollToTop();
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    trackTutorialStepChange(stepIndex, steps[stepIndex].title, 'jump');
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                いねさばチュートリアル
              </h1>
            </div>
          </div>



        </div>

        {/* 新しいプログレスバー */}
        <div className="flex items-end gap-1 mb-2 px-2 sm:px-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center relative overflow-hidden ${isActive
                  ? 'flex-1 bg-[#5b8064] text-white h-12 shadow-md z-10'
                  : `w-20 sm:flex-1 h-7 sm:h-10 hover:h-8 sm:hover:h-11 ${isPast ? 'bg-[#5b8064]/80 text-white' : 'bg-gray-200 text-gray-400'}`
                  }`}
                aria-label={`Step ${index + 1}: ${step.title}`}
              >
                <span className={`${isActive ? 'text-sm' : 'text-xs'} font-bold truncate px-2`}>
                  STEP {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 lg:p-12 mb-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-[#5b8064] to-[#4a6b55] rounded-full mr-4" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {steps[currentStep].title}
                </h2>
              </div>
            </div>
          </div>

          <div className="mb-8">
            {steps[currentStep].content}
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between items-center mb-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-all duration-200 ${currentStep === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700 text-white transform hover:-translate-y-0.5 cursor-pointer'
              }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            前のステップ
          </button>

          {currentStep === steps.length - 1 ? (
            <Link
              href="/guide"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-all duration-200 sm:min-w-[460px] bg-gradient-to-r from-[#5b8064] to-[#4a6b55] hover:from-[#4a6b55] hover:to-[#3a5745] text-white transform hover:-translate-y-0.5 cursor-pointer"
            >
              いねさばの歩き方に進む
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={nextStep}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-all duration-200 sm:min-w-[460px] bg-gradient-to-r from-[#5b8064] to-[#4a6b55] hover:from-[#4a6b55] hover:to-[#3a5745] text-white transform hover:-translate-y-0.5 cursor-pointer"
            >
              次のステップ
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* 補助情報 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-[#5b8064] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01" />
              </svg>
              <div>
                <span className="text-[#5b8064] font-semibold">困ったときは</span>
                <p className="text-gray-600 text-sm mt-1">
                  このチュートリアルでわからないこと・困ったことがあれば、公式Discordにて、気軽にご質問ください！
                </p>
              </div>
            </div>
            <a
              href="https://discord.gg/tdefsEKYhp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl transition-all duration-200 font-medium transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              公式Discord に参加する
            </a>
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
}
