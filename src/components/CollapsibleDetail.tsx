import React from 'react';

interface CollapsibleDetailProps {
    title: string;
    children: React.ReactNode;
}

export default function CollapsibleDetail({ title, children }: CollapsibleDetailProps) {
    return (
        <details className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 [&[open]_svg.chevron]:rotate-180">
            <summary className="flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#5b8064] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01M12 12v4m9-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{title}</span>
                </div>
                <svg
                    className="chevron w-4 h-4 text-gray-400 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </summary>
            <div className="px-4 pb-0 text-sm text-gray-700 border-t border-gray-100 pt-3 bg-white">
                {children}
            </div>
        </details>
    );
}
