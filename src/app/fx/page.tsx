import type { Metadata } from 'next';
import Header from '@/components/Header';
import FxPageClient from '@/components/fx/FxPageClient';

export const metadata: Metadata = {
  title: '職業ポイントFX',
  description: 'いねさばの職業ポイントFXの現在値・チャート・損益ランキングを確認できます。',
};

export default function FxPage() {
  return (
    <>
      <Header />
      <div className="flex-grow">
        <FxPageClient />
      </div>
    </>
  );
}
