import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { iconMap } from '@/components/Icons';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentListPageProps {
  config: ContentPageConfig;
  content: ContentItem[];
  children?: React.ReactNode;
}

export default function ContentListPage({ config, content = [], children }: ContentListPageProps) {
  const IconComponent = iconMap[config.icon];

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: config.title }
  ];

  // グループラベルとアイコンのマッピング
  const groupIconMap: Record<string, keyof typeof iconMap> = {
    'サーバールール': 'fileText',
    '保護': 'shield',
    'ineを貯める': 'trendingUp',
    'ineを使う': 'trendingDown',
    'アイテム取引': 'package',
    '土地・ライセンス': 'landmark',
  };

  // typeに基づいてグループ分け
  const groupedContent = config.enableGrouping
    ? content.reduce((acc, item) => {
      const type = item.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    }, {} as Record<string, ContentItem[]>)
    : { all: content };

  const renderContentItem = (item: ContentItem) => {
    const linkContent = (
      <>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-lg font-medium">{item.title}</span>
        {item.externalLink && (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </>
    );

    return (
      <div key={item.id} className="py-2 pl-0">
        {item.externalLink ? (
          <a
            href={item.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#5b8064] hover:text-[#4a6b55] hover:underline transition-colors duration-200"
          >
            {linkContent}
          </a>
        ) : (
          <Link
            href={`${config.basePath}/${item.id}`}
            className="inline-flex items-center text-[#5b8064] hover:text-[#4a6b55] hover:underline transition-colors duration-200"
          >
            {linkContent}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <article className="max-w-4xl mx-auto px-5 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <IconComponent className={`${config.color} mr-6`} size={40} />
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{config.title}</div>
            </div>
          </div>
        </header>

        {children && (
          <div className="mb-12">
            {children}
          </div>
        )}

        {/* コンテンツ一覧 */}
        <section>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">{config.emptyMessage}</p>
            </div>
          ) : config.enableGrouping ? (
            <div className="space-y-10">
              {Object.entries(groupedContent).map(([type, items]) => {
                const groupLabel = config.groupLabels?.[type] || type;
                const GroupIcon = groupIconMap[groupLabel] ? iconMap[groupIconMap[groupLabel]] : null;

                return (
                  <div key={type}>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 py-3 px-4 border-l-6 border-[#5b8064] bg-[#f0f4f1] flex items-center lg:-mx-4">
                      {GroupIcon && <GroupIcon className="text-gray-800 mr-3" size={28} />}
                      {groupLabel}
                    </h1>
                    <div className="space-y-2">
                      {items.map(renderContentItem)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {content.map(renderContentItem)}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
