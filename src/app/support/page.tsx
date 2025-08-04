"use client";

import Header from "@/components/Header";

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* ヘッダーセクション */}
        <div className="text-center mb-16">
                    <div className="flex items-center justify-center mb-6">
            <span className="text-5xl mr-4">❤️</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">いねさばサポート制度</h1>
              <p className="text-xl text-gray-600">あなたのサポートがサーバーを支えています</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            いつも、いねさばで遊んでくれてありがとうございます！<br />
            もし、この場所を気に入ってくれて、「もう少しだけ応援してもいいかな」と思っていただけたら、<br />
            サーバーの維持費のために「コーヒーを一杯」おごっていただけると、嬉しいです！
          </p>
        </div>

        {/* 料金プラン */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">あなたに最適なプランをお選びください</h2>
          </div>

          {/* プランカード */}
          <div className="flex flex-wrap justify-center gap-8 mb-16 max-w-7xl mx-auto">
            {/* 一回限りのサポート */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-sm min-w-[300px]">
              <div className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V3A2,2 0 0,0 20,3Z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">One time</h3>
                  <div className="flex items-baseline justify-center text-center">
                    <span className="text-4xl font-black text-gray-900">50円</span>
                    <span className="text-gray-500 ml-1">〜</span>
                  </div>
                  <p className="text-gray-500 mt-2">一回限りのサポート</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Discord限定ロール</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Supporter</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                    <span className="text-gray-500">限定記事の閲覧</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                    <span className="text-gray-500">Minecraft Suffix付与</span>
                  </li>
                </ul>

                <a 
                  href="https://ko-fi.com/1necat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold text-center block mt-auto"
                >
                  サポートする
                </a>
              </div>
            </div>

            {/* Mono Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-sm min-w-[300px]">
              <div className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mono Plan</h3>
                  <div className="flex items-baseline justify-center text-center">
                    <span className="text-4xl font-black text-gray-900">120円</span>
                    <span className="text-gray-500 ml-1">/月</span>
                  </div>
                  <p className="text-gray-500 mt-2">メンバーシップ</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Discord限定ロール</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Supporter</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-gray-900 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">mono member</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">限定記事の閲覧</span>
                    <span className="text-xs text-gray-500 ml-2">（バックナンバーを含む）</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                    <span className="text-gray-500">Minecraft Suffix付与</span>
                  </li>
                </ul>

                <a 
                  href="https://ko-fi.com/1necat/tiers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-xl font-bold text-center block mt-auto"
                >
                  Get Mono
                </a>
              </div>
            </div>

            {/* Fish Plan - おすすめ - 常に表示 */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-sm min-w-[300px]" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2px'
            }}>
              <div className="bg-white rounded-2xl h-full">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-bold rounded-t-2xl">
                  おすすめ
                </div>
                <div className="p-8 pt-12 flex flex-col h-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Fish Plan</h3>
                    <div className="flex items-baseline justify-center text-center">
                      <span className="text-4xl font-black text-gray-900">480円</span>
                      <span className="text-gray-500 ml-1">/月</span>
                    </div>
                    <p className="text-gray-500 mt-2">メンバーシップ</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Discord限定ロール</span>
                    </li>
                    <li className="flex items-center ml-8">
                      <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Supporter</span>
                    </li>
                    <li className="flex items-center ml-8">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">fish member</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">限定記事の閲覧</span>
                      <span className="text-xs text-gray-500 ml-2">（バックナンバーを含む）</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                      <span className="text-gray-700">Minecraft Suffix付与</span>
                    </li>
                    <li className="flex items-center ml-8">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-lg">🐟</span>
                      </div>
                      <span className="text-sm text-gray-600">魚のSuffix</span>
                    </li>
                  </ul>

                  <a 
                    href="https://ko-fi.com/1necat/tiers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold text-center block mt-auto"
                  >
                    Get Fish
                  </a>
                </div>
              </div>
            </div>

            {/* Rice Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-sm min-w-[300px]">
              <div className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Rice Plan</h3>
                  <div className="flex items-baseline justify-center text-center">
                    <span className="text-4xl font-black text-gray-900">980円</span>
                    <span className="text-gray-500 ml-1">/月</span>
                  </div>
                  <p className="text-gray-500 mt-2">メンバーシップ</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Discord限定ロール</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Supporter</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">rice member</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">限定記事の閲覧</span>
                    <span className="text-xs text-gray-500 ml-2">（バックナンバーを含む）</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Minecraft Suffix付与</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-lg">🌾</span>
                    </div>
                    <span className="text-sm text-gray-600">稲のSuffix</span>
                  </li>
                </ul>

                <a 
                  href="https://ko-fi.com/1necat/tiers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold text-center block mt-auto"
                >
                  Get Rice
                </a>
              </div>
            </div>

            {/* Cat Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-sm min-w-[300px]">
              <div className="p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Cat Plan</h3>
                  <div className="flex items-baseline justify-center text-center">
                    <span className="text-4xl font-black text-gray-900">1480円</span>
                    <span className="text-gray-500 ml-1">/月</span>
                  </div>
                  <p className="text-gray-500 mt-2">メンバーシップ</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Discord限定ロール</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Supporter</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">cat member</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">限定記事の閲覧</span>
                    <span className="text-xs text-gray-500 ml-2">（バックナンバーを含む）</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Minecraft Suffix付与</span>
                  </li>
                  <li className="flex items-center ml-8">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-lg">🐱</span>
                    </div>
                    <span className="text-sm text-gray-600">猫のSuffix</span>
                  </li>
                </ul>

                <a 
                  href="https://ko-fi.com/1necat/tiers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-bold text-center block mt-auto"
                >
                  Get Cat
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ セクション */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">よくある質問</h2>
            <p className="text-gray-600">サポート制度について、よくいただく質問をまとめました</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 利用可能な決済手段 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">利用可能な決済手段について</h3>
              <p className="text-gray-700 leading-relaxed">
                クレジット/一部デビットカード（VISA・MasterCard・JCB・AMEX・UnionPay）をご利用いただけます。銀行振込やギフトカードなどには対応しておりません。
              </p>
            </div>

            {/* Discord限定ロール */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Discord限定ロールについて</h3>
              <p className="text-gray-700 leading-relaxed">
                Discord限定ロールを取得するには、「いねさば公式Discord」に参加しているDiscordアカウントが必要です。
              </p>
            </div>

            {/* 限定記事の閲覧 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">限定記事の閲覧について</h3>
              <p className="text-gray-700 leading-relaxed">
                限定記事を閲覧するには、Ko-fiのアカウントを取得する必要があります。
              </p>
            </div>

            {/* Minecraft Suffix 付与 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Minecraft Suffix 付与について</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>SuffixとはMCIDの前につくアレのことです。（ チャット欄で「🐱 1necat : 〇〇」のように表示されます）</p>
                <p>Suffixを付与するには「いねさば公式Discord」に参加する必要があります。</p>
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">連携方法：</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Minecraft内でコマンド：<code className="bg-gray-200 px-2 py-1 rounded text-xs">/discordsrv link</code> と入力</li>
                    <li>表示された4桁の数字を記録</li>
                    <li>4桁の数字を「Ine Server Bot」のDMに送信</li>
                    <li>「リンクされました」的な英文が出てくればOK！</li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-3">
                    ※ Discordのロールが変わってから約5分経たないとSuffixは付与されません
                  </p>
                </div>
              </div>
            </div>

            {/* サポートの違い */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">サポートの違いについて</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p><strong>メンバーシップ：</strong>すべていねさばの維持費用に使われます</p>
                <p><strong>一回限りのサポート：</strong>開発のモチベーションアップのため、コーヒーを購入するかもしれません</p>
                <p className="text-sm text-gray-600">どちらも最終的には「いねさば」をサポートすることになります</p>
              </div>
            </div>

            {/* なぜサポートが必要？ */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">なぜサポートが必要なの？</h3>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>サーバーの維持には多くの固定費用がかかります：</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>ドメイン代</li>
                  <li>サーバーのメンテナンス費用</li>
                  <li>プラグイン費用</li>
                  <li>バックアップサーバー費用</li>
                  <li>ホームページサーバー費用</li>
                </ul>
                <p className="text-sm">学生ということもあり、コミュニティを維持・発展させていくために、ぜひご協力をお願いいたします！</p>
              </div>
            </div>
          </div>
        </div>

        {/* 透明性セクション */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M16,8A2,2 0 0,0 18,6V4H16V6A2,2 0 0,0 14,8H16M18,9H14A1,1 0 0,0 13,10V15H19V10A1,1 0 0,0 18,9M4,2H20V4H4V2Z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">透明性</h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              いねさばでは頂いた金額やどこに使ったのかを収支報告として公開しております。<br />
              また、メンバーシップ会員には月に1回、会報誌ということで収支報告とその詳細を限定公開しております。
            </p>
            <a 
              href="https://inesaba.notion.site/737f3291eecd4043a538c94c80c59f83" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg"
            >
              収支報告を見る
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
