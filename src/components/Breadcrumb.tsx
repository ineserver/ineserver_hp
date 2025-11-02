'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="bg-white">
      <div className="max-w-4xl mx-auto px-5 py-4">
        <div className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide">
          <div className="bg-[#5b8064] text-white px-3 py-1 rounded text-xs font-medium flex-shrink-0">
            現在のページ
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-gray-400">{'>'}</span>
              {item.href && index < items.length - 1 ? (
                <Link 
                  href={item.href}
                  className="text-[#5b8064] hover:text-[#4a6b55] underline transition-colors duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? "text-gray-900 font-medium whitespace-nowrap" : "text-gray-600 whitespace-nowrap"}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;
