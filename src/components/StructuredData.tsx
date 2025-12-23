import Script from 'next/script';

interface WebSiteData {
  name?: string;
  url?: string;
  description?: string;
}

interface OrganizationData {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListData {
  items: BreadcrumbItem[];
}

interface ArticleData {
  headline: string;
  description: string;
  image?: string | unknown;
  datePublished: string;
  dateModified?: string;
  url: string;
}

type StructuredDataType = 'WebSite' | 'Organization' | 'BreadcrumbList' | 'Article';

interface StructuredDataProps {
  type: StructuredDataType;
  data: WebSiteData | OrganizationData | BreadcrumbListData | ArticleData;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'WebSite': {
      const websiteData = data as WebSiteData;
      structuredData = {
        ...structuredData,
        '@type': 'WebSite',
        name: websiteData.name || 'いねさば',
        url: websiteData.url || 'https://www.1necat.net',
        description: websiteData.description || 'あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.1necat.net/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      };
      break;
    }

    case 'Organization': {
      const orgData = data as OrganizationData;
      structuredData = {
        ...structuredData,
        '@type': 'Organization',
        name: orgData.name || 'いねさば',
        url: orgData.url || 'https://www.1necat.net',
        logo: orgData.logo || 'https://www.1necat.net/server-icon.png',
        description: orgData.description || 'あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」です。',
        sameAs: orgData.sameAs || [],
      };
      break;
    }

    case 'BreadcrumbList': {
      const breadcrumbData = data as BreadcrumbListData;
      structuredData = {
        ...structuredData,
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbData.items.map((item: BreadcrumbItem, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      break;
    }

    case 'Article': {
      const articleData = data as ArticleData;
      structuredData = {
        ...structuredData,
        '@type': 'Article',
        headline: articleData.headline,
        description: articleData.description,
        image: articleData.image,
        datePublished: articleData.datePublished,
        dateModified: articleData.dateModified || articleData.datePublished,
        author: {
          '@type': 'Organization',
          name: 'いねさば',
          url: 'https://www.1necat.net',
        },
        publisher: {
          '@type': 'Organization',
          name: 'いねさば',
          url: 'https://www.1necat.net',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.1necat.net/server-icon.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleData.url,
        },
      };
      break;
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="afterInteractive"
    />
  );
}
