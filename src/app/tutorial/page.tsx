import type { Metadata } from 'next';
import TutorialClientPage from '@/components/TutorialClientPage';

export const metadata: Metadata = {
  title: 'チュートリアル',
  description: 'いねさばへの参加方法と基本的な遊び方を解説します。サーバーへのログイン方法から、経済システム、拠点の作り方まで初心者向けのガイドです。',
  openGraph: {
    title: 'チュートリアル | いねさば',
    description: 'いねさばへの参加方法と基本的な遊び方を解説します。',
    images: ['/server-icon.png'],
  },
};

export default function TutorialPage() {
  return <TutorialClientPage />;
}
