import type { Metadata } from 'next';
import LPClientPage from '@/components/LPClientPage';

export const metadata: Metadata = {
    title: 'サーバー紹介',
    description: 'あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」いねさばの紹介ページです。生きている経済、340種類以上のカスタムアイテム、自由な秩序のあるマイクラサーバー。',
    openGraph: {
        title: 'サーバー紹介 | いねさば',
        description: 'あなたらしい距離感で街に溶け込める。そんな「都市計画サーバー」いねさばの紹介ページです。',
        images: ['/server-icon.png'],
    },
};

export default function LandingPage() {
    return <LPClientPage />;
}
