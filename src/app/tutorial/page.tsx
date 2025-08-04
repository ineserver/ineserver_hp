'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import RecommendedVersion from '@/components/RecommendedVersion';
import Link from 'next/link';

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText('1necat.net');
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'チュートリアル' }
  ];

  const steps = [
    {
      id: 0,
      title: "チュートリアルへようこそ！",
      subtitle: "いねさばの始め方をステップごとに説明します",
      content: (
        <div className="space-y-6">
          {/* 画像配置エリア */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-blue-300 text-center mb-6">
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">ウェルカム画像</h3>
              <p className="text-sm font-medium text-blue-600">いねさばの魅力的な画像をここに配置予定</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 rounded-full animate-bounce bg-blue-500" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-500" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-purple-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5h18" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">いねさばに興味を持っていただきありがとうございます！</h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              このチュートリアルでは、いねさばでの遊び方や追加要素を分かりやすく解説します。
              新規プレイヤーの方でも安心してサーバーに参加できるよう、ステップごとに進めていきましょう！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900">このチュートリアルの内容</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  サーバールールの要点
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ログイン方法
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  基本的な遊び方
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  就職・経済システム（今後追加予定）
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-gray-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900">所要時間</h4>
              </div>
              <p className="text-gray-700 mb-4">
                約10-15分で完了します
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-semibold">ヒント:</span> 
                  実際にMinecraftを起動してサーバーに接続しながら進めることをおすすめします！
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "サーバールールについて",
      subtitle: "まずは基本的なルールを確認しましょう",
      content: (
        <div className="space-y-6">
          {/* 画像配置エリア */}
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
            <div className="space-y-2">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">サーバールール説明画像を配置予定</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900">重要：ルールを守って楽しくプレイしましょう</h3>
              </div>
            </div>
            <p className="text-red-800 leading-relaxed">
              サーバーにログインした時点で、サーバールールに同意したものとみなされます。
              <b>長いルールを読むのは大変だと思いますので、以下に簡単な要点をまとめました。</b>
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-2">マナーを守って楽しくプレイ</h5>
                  <p className="text-gray-700 mb-3">
                    他のプレイヤーへの迷惑行為、チャットでの暴言・不適切な発言・スパム行為は禁止です。また、他プレイヤーの建築物を無断で破壊・改変することも禁止されています。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-2">許可MOD・クライアントについて</h5>
                  <p className="text-gray-700 mb-3">
                    ゲームバランスを変えるMODやクライアントの使用は禁止されています。OptiFineやReplayModなど、プレイを補助するMODは許可されています。
                  </p>
                  <a 
                    href="https://github.com/ineserver/ineserver-Public/wiki/%E8%A8%B1%E5%8F%AFMOD%E4%B8%80%E8%A6%A7" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    許可MOD一覧を確認
                  </a>
                  <p className="text-sm text-gray-500 mt-2">※不明な場合は運営までお問い合わせください</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364-6.364M12 12l-6.364 6.364" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-2">トラップタワーの禁止</h5>
                  <p className="text-gray-700 mb-3">
                    経済サーバーと資材ワールドでは、トラップタワー全般の作成及び使用が禁止されています。これはサーバー負荷軽減とゲームバランス維持のための重要なルールです。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-2">建築制限区域について</h5>
                  <p className="text-gray-700 mb-3">
                    環状1号線より内側及び白椿駅付近では、土地を看板から購入する必要があります。また、購入後1ヶ月間利用されない場合は取り消される場合があります。
                  </p>
                  <Link 
                    href="/lifestyle/rule"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    詳細なルールを確認
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="text-lg font-semibold text-yellow-900">詳細なルールについて</h4>
            </div>
            <p className="text-yellow-800 mb-4">
              上記は要点のみです。より詳細なルールについては、以下のリンクから確認できます。
            </p>
            <Link 
              href="/lifestyle/rule"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white rounded-lg transition-all duration-200 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              詳細なサーバールールを見る
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "ログイン方法",
      subtitle: "いねさばに接続してみましょう",
      content: (
        <div className="space-y-6">
          {/* 画像配置エリア */}
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
            <div className="space-y-2">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">Minecraftランチャーのスクリーンショットを配置予定</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-blue-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">サーバーに接続しましょう！</h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Minecraftを起動して、いねさばに接続してみましょう。
              以下の手順に従って進めてください。
            </p>
          </div>

          <div className="space-y-6">
            {/* ステップ1: 必要環境 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                <h4 className="text-lg font-semibold text-gray-900">必要な環境を確認</h4>
              </div>
              <div className="ml-11">
                {/* 対応エディション情報 */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    対応エディション
                  </h5>
                  <p className="text-blue-800 text-sm"><b>Java Edition のみ</b></p>
                  <p className="text-blue-700 text-xs mt-1">統合版（Bedrock Edition）は接続できません</p>
                </div>
                
                {/* 推奨バージョン表示コンポーネント */}
                <div className="mb-4">
                  <RecommendedVersion />
                </div>
              </div>
            </div>

            {/* ステップ2: サーバー追加 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                <h4 className="text-lg font-semibold text-gray-900">サーバーをリストに追加</h4>
              </div>
              <div className="ml-11 space-y-4">
                <div className="space-y-3">
                  <p className="text-gray-700">Minecraftを起動し、「マルチプレイ」を選択してください。</p>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      サーバー情報
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm w-24">サーバー名:</span>
                        <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">いねさば</code>
                        <span className="text-gray-500 text-xs ml-2">（任意の名前でOK）</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm w-24">アドレス:</span>
                        <code className="bg-yellow-200 px-2 py-1 rounded text-sm font-mono font-bold">1necat.net</code>
                        <button 
                          onClick={handleCopyAddress}
                          className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          コピー
                        </button>
                      </div>
                      <div className="flex items-start pt-2 border-t border-gray-200">
                        <span className="text-gray-600 text-sm w-24 mt-1">リソースパック:</span>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <code className="bg-green-200 px-2 py-1 rounded text-sm font-mono font-bold text-green-800">有効</code>
                            <span className="text-red-600 text-xs ml-2 font-medium">（必ず有効にしてください）</span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            いねさばオリジナルのアイテムやブロックが追加されます
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ3: 接続 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                <h4 className="text-lg font-semibold text-gray-900">サーバーに接続</h4>
              </div>
              <div className="ml-11 space-y-4">
                <p className="text-gray-700">
                  サーバーリストに追加できたら、ダブルクリックまたは「サーバーに接続」ボタンでログインしてみましょう！
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="text-lg font-semibold text-blue-900">初回ログイン時の流れ</h4>
            </div>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5 bg-blue-500">1</span>
                <div>
                  <p className="font-medium">ロビーサーバーに接続</p>
                  <p className="text-sm text-blue-700">初回ログイン時は「ロビーサーバー」に接続されます</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5 bg-blue-500">2</span>
                <div>
                  <p className="font-medium">経済サーバーへ移動</p>
                  <p className="text-sm text-blue-700">真っ直ぐ進むとメインの「経済サーバー」に接続できます</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5 bg-blue-500">3</span>
                <div>
                  <p className="font-medium">初期資金をゲット！</p>
                  <p className="text-sm text-blue-700">新規プレイヤーには2000ineがプレゼントされます</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "いねさばへようこそ！",
      subtitle: "無事にログインできました！これからやりたいことを選んでみましょう",
      content: (
        <div className="space-y-6">
          {/* 画像配置エリア */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-dashed border-green-300 text-center mb-6">
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">いねさばの街並み</h3>
              <p className="text-sm font-medium text-green-600">プレイヤーが作った美しい建築画像をここに配置予定</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">おめでとうございます！</h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              無事にいねさばに到着しました！ここからは、あなたがやりたいことに合わせて進めることができます。
              以下の3つの選択肢から、興味のあるものを選んでみてください。
            </p>
          </div>

          <h4 className="text-xl font-bold text-gray-900 text-center mb-6">次にやりたいことを選んでください</h4>

          <div className="grid grid-cols-1 gap-6">
            {/* 1. チュートリアルの続き */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-300 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mr-3">推奨</span>
                    <h4 className="text-xl font-bold text-gray-900">チュートリアルの続きをする</h4>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    経済システム（就職・投資）、建築・拠点作り、交通システムなど、いねさばの基本的な要素を詳しく学びます。
                    初心者の方に特におすすめです。
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      17種類の職業システムの説明
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      土地取得と建築の基本
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      交通システムの使い方
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    チュートリアルを続ける
                  </button>
                </div>
              </div>
            </div>

            {/* 2. ガイドページ */}
            <div className="bg-white rounded-2xl border-2 border-green-200 hover:border-green-300 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">ガイドページでやりたいことから見つける</h4>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    ガイドページから、あなたが興味のある分野を自由に探索できます。
                    特定の分野に興味がある方におすすめです。
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      経済システム
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      観光・建築地
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      交通システム
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      エンターテイメント
                    </div>
                  </div>
                  <Link 
                    href="/guide"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0" />
                    </svg>
                    ガイドページを見る
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg mt-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">コミュニティに参加しませんか？</h4>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              公式Discordサーバーでは、他のプレイヤーと交流したり、
              最新情報を受け取ったり、困ったときに質問することができます。
              ぜひコミュニティに参加してみてください。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">気軽な雑談コミュニティ</span>
                </div>
                <p className="text-sm text-gray-600">ゲーム以外のことでも何でも雑談できます</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-900">質問・相談歓迎</span>
                </div>
                <p className="text-sm text-gray-600">わからないことは気軽に質問できます</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6c.552 0 1-.448 1-1s-.448-1-1-1H5c-.552 0-1-.448-1-1s.448-1 1-1h7c1.657 0 3-1.343 3-3s-1.343-3-3-3H4.984c-.418 0-.79.26-.937.65L3 13h7c.552 0 1 .448 1 1s-.448 1-1 1H3" />
                  </svg>
                  <span className="font-semibold text-gray-900">最新情報をお届け</span>
                </div>
                <p className="text-sm text-gray-600">アップデートやイベント情報をいち早く</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold text-gray-900">見るだけでもOK</span>
                </div>
                <p className="text-sm text-gray-600">ROM専の方も大歓迎です</p>
              </div>
            </div>
            <div className="text-center">
              <a 
                href="https://discord.gg/tdefsEKYhp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                いねさば公式Discordに参加する
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mt-8">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-900">お疲れ様でした！</h4>
            </div>
            <p className="text-gray-700">
              基本的なチュートリアルは以上です。どの選択肢を選んでも、いつでも他の選択肢に戻って来ることができます。
              いねさばでの素敵な時間をお楽しみください！
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "経済システムの基本",
      subtitle: "いねさばの経済システムについて詳しく学びましょう",
      content: (
        <div className="space-y-6">
          {/* 画像配置エリア */}
          <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border-2 border-dashed border-yellow-300 text-center mb-6">
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">経済システム</h3>
              <p className="text-sm font-medium text-yellow-600">就職・市場取引・投資の画像をここに配置予定</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 rounded-full animate-bounce bg-yellow-500" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-orange-500" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-red-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">いねさばの経済システム</h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              いねさばでは豊富な経済要素を楽しむことができます。17種類の職業から選択して収入を得たり、
              市場で他のプレイヤーと取引したりして、サーバー内での経済活動を楽しみましょう。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">就職システム</h4>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  17種類の職業から選択可能
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  定期的な給与の受け取り
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  職業ごとの特別なスキル
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16v0c0 .553.448 1 1 1h12M7 13v4a2 2 0 002 2h2a2 2 0 002-2v-4" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">市場取引</h4>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  アイテムの売買が可能
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  プレイヤー間での取引
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  価格の変動システム
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-semibold text-blue-900">始め方</h4>
            </div>
            <p className="text-blue-800 mb-4">
              まずはサーバーにログインして `/job` コマンドで職業を選択してみましょう。
              詳しい情報は経済システムのガイドページでご確認いただけます。
            </p>
            <Link 
              href="/economy"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              経済システムの詳細を見る
            </Link>
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
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                いねさばチュートリアル
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">進捗状況</div>
              <div className="text-2xl font-bold text-gray-800">
                {currentStep + 1} / {steps.length}
              </div>
            </div>
          </div>
          
          {/* ステップインジケーター */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">チュートリアルの進行状況</span>
              <span className="text-xs text-gray-500">クリックでジャンプできます</span>
            </div>
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(index)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-[#5b8064] text-white shadow-xl scale-110 ring-4 ring-[#5b8064]/30 animate-pulse'
                        : index < currentStep
                        ? 'bg-[#5b8064] text-white shadow-md hover:scale-105'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-105'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-3 rounded-full transition-all duration-500 ${
                      index < currentStep ? 'bg-[#5b8064]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-[#5b8064] to-[#4a6b55] rounded-full mr-4" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-lg">
                  {steps[currentStep].subtitle}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            {steps[currentStep].content}
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`inline-flex items-center px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            前のステップ
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`inline-flex items-center px-50 py-4 rounded-xl font-medium transition-all duration-200 min-w-[200px] ${
              currentStep === steps.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#5b8064] to-[#4a6b55] hover:from-[#4a6b55] hover:to-[#3a5745] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            次のステップ
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 補助情報 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-[#5b8064] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="text-[#5b8064] font-semibold">困ったときは</span>
                <p className="text-gray-600 text-sm mt-1">
                  このチュートリアルでわからないことがあれば、お気軽に質問してください
                </p>
              </div>
            </div>
            <a 
              href="https://discord.gg/tdefsEKYhp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5b8064] to-[#4a6b55] hover:from-[#4a6b55] hover:to-[#3a5745] text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              公式Discord に参加する
            </a>
          </div>
        </div>
      </div>
      
      {/* コピー完了トースト */}
      {showCopyToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-[#5b8064] to-[#4a6b55] text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            クリップボードにコピーしました
          </div>
        </div>
      )}
    </div>
  );
}
