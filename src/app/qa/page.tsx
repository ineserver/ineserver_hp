import type { Metadata } from 'next';
import QAClientPage from '@/components/QAClientPage';

export const metadata: Metadata = {
    title: 'よくある質問',
    description: 'いねさばについてよく寄せられる質問と回答をまとめました。建築、MOD、トラップタワーなどに関するルールを確認できます。',
    openGraph: {
        title: 'よくある質問 | いねさば',
        description: 'いねさばについてよく寄せられる質問と回答をまとめました。',
        images: ['/server-icon.png'],
    },
};

export default function QAPage() {
    return <QAClientPage />;
}