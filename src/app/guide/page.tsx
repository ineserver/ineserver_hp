import {
  getLifeFiles,
  getEconomyFiles,
  getAdventureFiles,
  getTransportFiles,
} from '../../../lib/content';
import GuideClientPage from '@/components/GuideClientPage';

export const metadata = {
  title: 'ガイド | いねさば',
};

export default async function GuidePage() {
  const lifeFiles = (await getLifeFiles()).filter(item => item.type !== 'guideline' && item.type !== 'other');
  const economyFiles = (await getEconomyFiles()).filter(item => item.type !== 'guideline' && item.type !== 'other');
  const adventureFiles = (await getAdventureFiles()).filter(item => item.type !== 'guideline' && item.type !== 'other');
  const transportFiles = (await getTransportFiles()).filter(item => item.type !== 'guideline' && item.type !== 'other');

  return (
    <GuideClientPage
      lifeFiles={lifeFiles}
      economyFiles={economyFiles}
      adventureFiles={adventureFiles}
      transportFiles={transportFiles}
    />
  );
}
