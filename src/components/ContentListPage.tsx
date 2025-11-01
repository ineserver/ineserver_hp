import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { iconMap } from '@/components/Icons';
import { ContentItem, ContentPageConfig } from '@/types/content';

interface ContentListPageProps {
  config: ContentPageConfig;
  content: ContentItem[];
}

export default function ContentListPage({ config, content = [] }: ContentListPageProps) {
  const IconComponent = iconMap[config.icon];

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: config.title }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center mb-6">
            <IconComponent className={`${config.color} mr-6`} size={40} />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{config.title}</h1>
              <p className="text-gray-600 text-lg">
                {config.description}
              </p>
            </div>
          </div>
        </header>

        {/* コンテンツ一覧 */}
        <section>
          {content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">{config.emptyIcon}</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツがありません</h3>
              <p className="text-gray-600">{config.emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`${config.basePath}/${item.id}`}
                  className="block w-full"
                >
                  <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-colors duration-200 hover:shadow-md">
                    <div className="flex items-center">
                      <IconComponent className={`${config.color} mr-6`} size={40} />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
