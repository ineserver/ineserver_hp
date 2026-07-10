import type { Metadata } from 'next';
import Header from '@/components/Header';
import MarketPageClient from '@/components/MarketPageClient';

export const metadata: Metadata = {
  title: 'アイテム市場相場',
  description: 'いねさばの全アイテムの現在価格・前日比・30日間変動データを一覧で確認できます。',
};

export default function MarketPage() {
  return (
    <>
      <Header />
      <div className="flex-grow bg-white">
        <MarketPageClient />
      </div>
    </>
  );
}
