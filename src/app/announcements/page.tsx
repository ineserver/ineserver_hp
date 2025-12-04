import { Suspense } from 'react';
import { getAnnouncementFiles } from '../../../lib/content';
import AnnouncementsClientPage from '@/components/AnnouncementsClientPage';

export default async function AnnouncementsPage() {
  const filesData = await getAnnouncementFiles();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnnouncementsClientPage announcements={filesData} />
    </Suspense>
  );
}
