import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "運営ヘルパー募集",
  description:
    "いねさばの運営ヘルパー募集要項です。募集する部署、応募の条件、応募の流れ、ヘルパーのルールを掲載しています。",
  openGraph: {
    title: "運営ヘルパー募集 | いねさば",
    description: "いねさばの運営を一緒に支えてくれる「運営ヘルパー」を募集しています。",
    images: ["/server-icon.png"],
  },
};

// 応募用GoogleフォームのURL
const APPLICATION_FORM_URL = "https://forms.gle/t36WKARHt9eye9oSA";

const departments = [
  {
    name: "住民部",
    details: [
      { label: "主な仕事", text: "新しく来た人の案内や、チャット・チケットでの質問への対応。見回りをして、ルール違反があれば注意する（重い処分は鯖主が判断します）。住民の困りごとや意見を集めて鯖主に届ける" },
      { label: "いつ・どのくらい", text: "自分がログインしている時間に、できる範囲で。決まった時間に入る必要はありません" },
      { label: "向いている人", text: "人と話すのが苦にならない人。いねさばのことをよく知っていて、人に教えるのが好きな人" },
    ],
  },
  {
    name: "イベント部",
    details: [
      { label: "主な仕事", text: "鯖主が考えた世界観と仕様をもとに、ボスやクエスト（MythicMobs・NotQuestsなど）を作る。betaサーバーで試してから本番に出す。開催中の不具合や調整に対応する" },
      { label: "いつ・どのくらい", text: "イベントの準備期間に作業が集中します。普段は少なめです" },
      { label: "向いている人", text: "人の構想を形にするのが好きな人。英語の資料をAIや翻訳で調べながら進められる人" },
    ],
  },
  {
    name: "建築部",
    details: [
      { label: "主な仕事", text: "駅や公共施設など、街の整備のための建築。イベント会場の建築や改変（指定した範囲の中で、クリエイティブやWorldEditを使います）" },
      { label: "いつ・どのくらい", text: "作業ごとに期限があり、その期間に集中します" },
      { label: "向いている人", text: "いねさばの街並みに合わせて建てられる人。これまでに公開している建築があると分かりやすいです" },
    ],
  },
  {
    name: "競馬部",
    details: [
      { label: "主な仕事", text: "毎週末の競馬の開催と進行。開催の告知" },
      { label: "いつ・どのくらい", text: "毎週末の開催時間に入れること（来られない週は控えの人と交代します）" },
      { label: "向いている人", text: "競馬が好きな人。決まった時間にきちんと動ける人" },
    ],
  },
];

const requests = [
  "任された範囲のことは、自分で考えて決めて進めること",
  "住民から見える変更や、ineが動くことは鯖主に相談すること",
  "住民の困りごとや意見を鯖主に届けること",
  "週に1回、部のチャンネルで近況を一言報告すること",
];

const requirements = [
  "いねさば（経済サーバー）でのプレイ時間が50時間以上（統計→「プレイした時間」が2.09d以上）",
  "週に3時間ほど、運営の時間を取れる（競馬部は週末の開催時間に入れること）",
  "Discordを使える",
  "「ヘルパーのルール」を読み、同意できる",
];

const steps = [
  "Googleフォームから応募する",
  "公式Discordのチケットでやり取りを始める",
  "チケットでチャット面接を行う（時間を合わせる必要はありません。ゆっくり答えてください）",
  "1か月のお試し期間",
  "正式にヘルパーとして任命",
];

const dutyRules = [
  "権限は担当の仕事にだけ使う。自分や知り合いのためのアイテム出し・テレポート・建築はしない",
  "クリエイティブやWorldEditで出したものをサバイバルに持ち出さない",
  "未発表の情報（イベントの内容、価格の変更、新しいアイテム）は、発表まで口外しない",
  "未発表の情報をもとに市場で売買しない",
  "担当の仕事で知ったことや行った操作で、自分の利益を出さない",
  "揉め事は一人で抱えず、鯖主に相談する",
  "鯖主とのやり取りは個人のDMではなく、運営用のチャンネルやスレッドで行う",
];

const residentRoles = [
  "住民の困りごとや意見を鯖主に届ける",
  "鯖主の案に反対意見を言ってもよい",
  "仕事以外の時間は、サバイバルでふつうの住民として遊んでよい",
];

const departmentRules = [
  { name: "建築部", rule: "クリエイティブでの作業は、サバイバルの持ち物と分けた環境で行う" },
  { name: "イベント部", rule: "本番では他の住民と同じ条件で遊ぶ。未発表の素材を先に買い集めない" },
  { name: "競馬部", rule: "自分が進行するレースの馬券は買わない" },
];

const activityRules = [
  "ヘルパーの活動は無償のボランティアです",
  "週に1回、部のチャンネルで近況を一言報告してください",
  "辞めるときは2週間前までに鯖主に伝えてください",
  "権限の私的利用や未発表の情報の漏えいがあった場合は、その時点でヘルパーを外れていただきます",
];

// 他コンテンツの .markdown-content h1 と同じ見た目
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl leading-[1.2] font-bold text-[var(--color-text-primary)] mb-4 px-4 py-3 border-l-[6px] border-[var(--color-accent)] bg-[#f0f4f1] lg:-ml-6 lg:-mr-2">
      {children}
    </h2>
  );
}

// 他コンテンツの .markdown-content h2 と同じ見た目
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl leading-[1.3] font-bold text-[var(--color-text-primary)] mt-6 mb-3 pb-2 border-b-[3px] border-[var(--color-accent)] lg:-ml-6 lg:-mr-2 lg:pl-6">
      {children}
    </h3>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start text-gray-700 leading-relaxed">
          <span className="inline-block w-1.5 h-1.5 bg-[#5b8064] rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RecruitPage() {
  return (
    <>
      <Header />
      <div className="flex-grow bg-white">
        <div className="bg-white flex flex-col h-full">
          <div className="bg-[#5b8064] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <nav className="flex items-center gap-2 text-xs text-white/60 mb-4">
                <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white/90">運営ヘルパー募集</span>
              </nav>

              <div className="flex items-center gap-3">
                <div className="text-white/80">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">運営ヘルパー募集要項</h1>
              </div>
            </div>
          </div>

          <article className="flex-grow w-full max-w-4xl mx-auto px-5 py-8">
            <header className="mb-10">
              <p className="text-gray-700 leading-relaxed">
                いねさばでは、サーバーの運営を一緒に支えてくれる「運営ヘルパー」を募集しています。いねさばをもっと良くしていくために、それぞれの分野を一緒に担ってくれる仲間を探しています。締切はなく、いつでも受け付けています。
              </p>
            </header>

            <div className="space-y-10">
              {/* 募集する部署 */}
              <section>
                <SectionHeading>募集する部署</SectionHeading>
                {departments.map((department) => (
                  <div key={department.name}>
                    <SubHeading>{department.name}</SubHeading>
                    <BulletList
                      items={department.details.map((detail) => (
                        <>
                          <span className="font-bold text-gray-900">{detail.label}</span>：{detail.text}
                        </>
                      ))}
                    />
                  </div>
                ))}
              </section>

              {/* ヘルパーにお願いしたいこと */}
              <section>
                <SectionHeading>ヘルパーにお願いしたいこと</SectionHeading>
                <BulletList items={requests} />
              </section>

              {/* 応募の条件 */}
              <section>
                <SectionHeading>応募の条件</SectionHeading>
                <BulletList items={requirements} />
                <p className="mt-4 text-gray-700 leading-relaxed">
                  ヘルパーの活動は無償のボランティアです。経験は問いません。普段から自分で何か始めるのが好きな人に向いています。ヘルパーになっても、サバイバルでの普段のプレイはこれまで通り楽しめます。
                </p>
              </section>

              {/* 応募の流れ */}
              <section>
                <SectionHeading>応募の流れ</SectionHeading>
                <ol className="space-y-4">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5b8064] text-white text-sm font-bold flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  合否はチケットでお伝えします。プレイ時間などの条件が足りない場合は、条件を満たしてからいつでも再応募できます。面接の結果見送りとなった場合は、1か月空けてから再応募してください。
                </p>
                <div className="mt-6">
                  <a
                    href={APPLICATION_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 bg-[#5b8064] text-white rounded-lg font-medium hover:bg-[#4a6b51] transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    応募フォーム
                    <svg className="w-3.5 h-3.5 ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </section>

              {/* ヘルパーのルール */}
              <section>
                <SectionHeading>ヘルパーのルール</SectionHeading>
                <p className="text-gray-700 leading-relaxed">
                  ヘルパーは、鯖主寄りでも住民寄りでもない中間の立場です。運営の仕事をしているときは運営側に立ち、それ以外はふつうの住民として遊びます。
                </p>

                <SubHeading>自分で決めていいこと・鯖主に相談すること</SubHeading>
                <p className="text-gray-700 leading-relaxed">
                  住民から見える変更（告知・ルール・新しい施設など）と、ineが動くこと（報酬・賞金・販売など）は、鯖主に相談してください。それ以外は、任された範囲で自分の判断で進めて構いません。
                </p>

                <SubHeading>運営の仕事で守ること</SubHeading>
                <BulletList items={dutyRules} />

                <SubHeading>住民としての役目</SubHeading>
                <BulletList items={residentRoles} />

                <SubHeading>部署ごとの決まり</SubHeading>
                <BulletList
                  items={departmentRules.map((item) => (
                    <>
                      <span className="font-bold text-gray-900">{item.name}</span>：{item.rule}
                    </>
                  ))}
                />

                <SubHeading>活動について</SubHeading>
                <BulletList items={activityRules} />
              </section>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
