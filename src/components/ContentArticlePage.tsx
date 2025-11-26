'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';

import Breadcrumb from '@/components/Breadcrumb';
import { ContentItem, ContentPageConfig } from '@/types/content';
import { useEffect, useState } from 'react';
import parse, { DOMNode, Element, domToReact, HTMLReactParserOptions } from 'html-react-parser';
import CommandCode from '@/components/CommandCode';
import CollapsibleDetail from '@/components/CollapsibleDetail';

interface ContentArticlePageProps {
  config: ContentPageConfig;
  content: ContentItem | null;
  showDate?: boolean;
  showToc?: boolean;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ContentArticlePage({ config, content, showDate = false, showToc = false }: ContentArticlePageProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!showToc || !content) return;

    // HTMLから見出しを抽出
    const parser = new DOMParser();
    const doc = parser.parseFromString(content.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const items: TocItem[] = [];
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      // rehype-slugで自動生成されたIDを使用
      const id = heading.id || '';

      if (id) {
        items.push({ id, text, level });
      }
    });

    setTocItems(items);
  }, [content, showToc]);

  if (!content) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">記事が見つかりません</h3>
            <p className="text-gray-600">記事は消されたか移動された可能性があります。。。</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'いねさば', href: '/' },
    { label: config.title, href: config.basePath },
    { label: content.title }
  ];

  // html-react-parser options
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        // ブロック形式のコマンド
        if (domNode.attribs.class && domNode.attribs.class.includes('command-code')) {
          const extractText = (node: DOMNode): string => {
            if (node instanceof Element && node.children) {
              return node.children.map((child) => extractText(child as DOMNode)).join('');
            }
            if ('data' in node && typeof node.data === 'string') {
              return node.data;
            }
            return '';
          };

          const textContent = extractText(domNode);
          return (
            <div className="mb-4">
              <CommandCode>{textContent.trim()}</CommandCode>
            </div>
          );
        }

        // インライン形式のコマンド
        if (domNode.name === 'code' && domNode.attribs.class && domNode.attribs.class.includes('command-inline')) {
          const extractText = (node: DOMNode): string => {
            if (node instanceof Element && node.children) {
              return node.children.map((child) => extractText(child as DOMNode)).join('');
            }
            if ('data' in node && typeof node.data === 'string') {
              return node.data;
            }
            return '';
          };

          const textContent = extractText(domNode);
          return <CommandCode>{textContent.trim()}</CommandCode>;
        }

        // CollapsibleDetail
        if (domNode.name === 'details' && domNode.attribs.class && domNode.attribs.class.includes('collapsible-detail')) {
          // summaryタグを探してtitleを取得
          const summaryNode = domNode.children.find(
            (child) => child instanceof Element && child.name === 'summary'
          ) as Element | undefined;

          let title = '詳細';
          if (summaryNode && summaryNode.children.length > 0) {
            const firstChild = summaryNode.children[0];
            if ('data' in firstChild && typeof firstChild.data === 'string') {
              title = firstChild.data;
            }
          }

          // summary以外の要素をchildrenとして渡す
          const contentNodes = domNode.children.filter(
            (child) => !(child instanceof Element && child.name === 'summary')
          );

          return (
            <CollapsibleDetail title={title}>
              {domToReact(contentNodes as DOMNode[], options)}
            </CollapsibleDetail>
          );
        }
      }
    },
  };

  return (
    <div className="bg-white flex flex-col h-full">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <article className="max-w-4xl mx-auto px-5 py-8">
        {/* ページヘッダー */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-900">{content.title}</h1>
            {content.category && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {content.category}
              </span>
            )}
          </div>
          {content.description && (
            <p className="text-xl text-gray-600 leading-relaxed">{content.description}</p>
          )}
          {showDate && content.date && (
            <div className="flex items-center text-sm text-gray-500 mt-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(content.date).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(/\//g, '-')}
            </div>
          )}
        </header>

        {/* アイキャッチ画像 */}
        {content.image && (
          <div className="mb-12 lg:-mx-[1.5rem]">
            <Image
              src={content.image}
              alt={content.title}
              width={1200}
              height={630}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        )}

        {/* 目次 */}
        {showToc && tocItems.length > 0 && (
          <nav className="mb-12 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              aria-expanded={isTocOpen}
              aria-controls="table-of-contents"
            >
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                もくじ
              </h2>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isTocOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              id="table-of-contents"
              className={`overflow-hidden transition-all duration-300 ${isTocOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <ul className="px-6 pt-4 pb-4 space-y-2">
                {tocItems.map((item) => (
                  <li
                    key={item.id}
                    style={{ marginLeft: `${(item.level - 1) * 1}rem` }}
                    className="text-sm"
                  >
                    <a
                      href={`#${item.id}`}
                      className="text-[#5b8064] hover:text-[#4a6b55] hover:underline transition-colors duration-200"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}

        {/* コンテンツ */}
        <article className="max-w-none">
          <div className="markdown-content">
            {parse(content.content, options)}
          </div>
        </article>

        {/* フッター */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href={config.basePath}
              className={`inline-flex items-center ${config.color} font-medium transition-colors duration-200`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {config.backButtonText}
            </Link>
          </div>
        </footer>
      </article>

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
