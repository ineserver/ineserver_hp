import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "いねさばの歴史",
  description: "2017年の初起動から現在まで、いねさばの歩みを年表で紹介しています。",
  openGraph: {
    title: "いねさばの歴史 | いねさば",
    description: "2017年の初起動から現在まで、いねさばの歩みを年表で紹介しています。",
    images: ["/server-icon.png"],
  },
};

// 年表のデータ（古い順に並べる）
const timeline = [
  {
    year: "2017",
    events: [
      {
        date: "8月9日",
        title: "いねさばの始まり",
        text: "仲間内のDiscordグループの企画として、最初のサーバーを立ち上げました。その日のうちに、最初のプレイヤーが遊びに来てくれています。",
      },
      {
        date: "10月11日",
        title: "経済の始まり",
        text: "お金や売り買いを楽しむための「経済」のワールドを初めて作りました。今の経済サーバーの原点です。",
      },
    ],
  },
  {
    year: "2019",
    events: [
      {
        date: "7月27日",
        title: "今のロビーの誕生",
        text: "今もロビーで使っている、アスレチックとロビーのワールドを作りました。",
      },
    ],
  },
  {
    year: "2020",
    events: [
      {
        date: "5月26日",
        title: "本格的な運営へ",
        text: "経済サーバーを単独で動かし始めました。2020年はコロナ禍をきっかけに、それまで限定日だけだった開放から、本格的な運営に切り替えた年です。",
      },
      {
        date: "10月23日",
        title: "今の街が始まる",
        text: "今みなさんが暮らしている街のワールドを作りました。今ある街並みは、この日から積み上げてきたものです。",
      },
      {
        date: "11月11日",
        title: "公式Discordを開設",
        text: "いねさば単体のDiscordサーバーを作りました。",
      },
    ],
  },
  {
    year: "2023",
    events: [
      {
        date: "8月23日",
        title: "Closed Betaを開始",
        text: "参加を申請した人だけが遊べる形で、テスト運営を始めました。",
      },
    ],
  },
  {
    year: "2024",
    events: [
      {
        date: "1月23日",
        title: "Open Betaを開始",
        text: "参加の申請（ホワイトリスト）をなくし、誰でも自由に参加できるサーバーになりました。Discordへの参加も必須ではなくなっています。",
      },
    ],
  },
];

// 他コンテンツの .markdown-content h1 と同じ見た目
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl leading-[1.2] font-bold text-[var(--color-text-primary)] mb-4 px-4 py-3 border-l-[6px] border-[var(--color-accent)] bg-[#f0f4f1] lg:-ml-6 lg:-mr-2">
      {children}
    </h2>
  );
}

export default function HistoryPage() {
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
                <span className="text-white/90">いねさばの歴史</span>
              </nav>

              <div className="flex items-center gap-3">
                <div className="text-white/80">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">いねさばの歴史</h1>
              </div>
            </div>
          </div>

          <article className="flex-grow w-full max-w-4xl mx-auto px-5 py-8">
            <header className="mb-10">
              <p className="text-gray-700 leading-relaxed">
                いねさばは、2017年8月9日に仲間内の企画として始まったサーバーです。2020年に本格的な運営に切り替え、2024年からは誰でも参加できるサーバーになりました。ここでは、これまでの歩みを振り返ります。
              </p>
            </header>

            <div className="space-y-10">
              {timeline.map((period) => (
                <section key={period.year}>
                  <SectionHeading>{period.year}年</SectionHeading>
                  <ol className="relative border-l-2 border-[#5b8064]/30 ml-3">
                    {period.events.map((event, index) => (
                      <li key={index} className="relative pl-6 pb-6 last:pb-0">
                        <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#5b8064]"></span>
                        <div className="text-sm font-bold text-[#5b8064]">{event.date}</div>
                        <h3 className="text-lg font-bold text-gray-900 mt-0.5">{event.title}</h3>
                        <p className="text-gray-700 leading-relaxed mt-1">{event.text}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
