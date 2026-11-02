import {
  getLifeFiles,
  getEconomyFiles,
  getAdventureFiles,
  getTransportFiles,
} from '../../../lib/content';
import GuideClientPage from '@/components/GuideClientPage';

export const metadata = {
  title: 'いねさばの歩き方',
  description: 'いねさばの便利機能やシステムをやりたいこと別・カテゴリ別に解説。くらし、経済、娯楽、交通の各分野のガイドを確認できます。',
  openGraph: {
    title: 'いねさばの歩き方 | いねさば',
    description: 'いねさばの便利機能やシステムをやりたいこと別・カテゴリ別に解説します。',
    images: ['/server-icon.png'],
  },
};

// NEW・更新の印は今日の日付で決まるので、1時間ごとに作り直す
export const revalidate = 3600;

export default async function GuidePage() {
  const lifeFiles = await getLifeFiles();
  const economyFiles = await getEconomyFiles();
  const adventureFiles = await getAdventureFiles();
  const transportFiles = await getTransportFiles();

  // 日本時間の今日（YYYY-MM-DD）。サーバーとブラウザで表示がずれないようにここで決める
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

  return (
    <GuideClientPage
      lifeFiles={lifeFiles}
      economyFiles={economyFiles}
      adventureFiles={adventureFiles}
      transportFiles={transportFiles}
      today={today}
    />
  );
}
