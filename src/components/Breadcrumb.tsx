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
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">
            現在のページ
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-400">{'>'}</span>
              {item.href && index < items.length - 1 ? (
                <Link 
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? "text-gray-900 font-medium" : "text-gray-600"}>
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
