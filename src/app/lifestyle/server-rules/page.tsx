'use client';

import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

export default function ServerRulesPage() {
  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: 'くらし・生活', href: '/lifestyle' },
    { label: 'サーバールール' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">サーバールール</h1>
        </header>

        {/* コンテンツ */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">はじめに</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当サーバーにログインした時点でこのサーバールールの内容を確認の上同意したものとみなし、また当サーバーを利用する際、このサーバールールを遵守するものとします。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              このルールは予告なく変更する場合があります。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              サーバールールに従わなかった場合、BANなどの措置をいたします。なお、措置に不服な場合は異議申し立てフォーム（
              <a href="https://forms.gle/pXWFq3uHCV5mvau6" className="text-blue-600 hover:text-blue-800 underline">
                https://forms.gle/pXWFq3uHCV5mvau6
              </a>
              ）でのみ受領いたします。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              以下、いねが提供するサーバーすべてを「いねさば」「いね鯖」、ロビーやアスレチックがあるサーバーを「ロビーサーバー」「ロビー鯖」、経済要素があるサーバー（資源ワールドを含む）を「経済サーバー」「経済鯖」とします。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              以下、サーバー内でオペレーター権限を持っている全てのユーザーを「管理者」と定義します。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              ここで明記されたルールを違反した場合、警告やBANなどといった処罰がされます。
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              ルールの改定をしたあとの初ログイン15分以内の場合、改定された範囲のルールは適用しないこととします。
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">全サーバー適用</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">1 プレイヤーの行動について</h3>
            <div className="ml-4 mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                ゲームバランスを害するMODやリソースパック（シュルカー、クライマントの利用は禁止です。（※）くだらないの禁止
              </p>
              <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                ※ただし、サーバー内で許可MODや許可アイテムとして紹介されているものは除く
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                チャットでの暴言、不適切な発言、スパム行為は禁止です。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                他のプレイヤーに迷惑をかける行為は禁止です。
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">2 建築について</h3>
            <div className="ml-4 mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                他のプレイヤーの建築物を無断で破壊・改変することは禁止です。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                公共の場所での迷惑建築は禁止です。
              </p>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
