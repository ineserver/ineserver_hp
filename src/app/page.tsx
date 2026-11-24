import Header from "@/components/Header";
import HomePageClient, { Announcement, Event, PatchNote } from "@/components/HomePageClient";
import { getAnnouncementExcerpt, getAnnouncementFilesLight } from "../../lib/content";
import { getLatestPatchNoteLight } from "@/lib/patch-notes";
import { getBandPalette } from "../../lib/image-color";

export const revalidate = 60;

export default async function Home() {
  // Fetch data
  const announcementsData = getAnnouncementFilesLight();

  // Filter and format announcements
  const publishedAnnouncements = announcementsData.filter((announcement) => {
    return typeof announcement === 'object' && announcement !== null && 'published' in announcement
      ? (announcement as { published?: boolean }).published !== false
      : true;
  });

  const formattedAnnouncements: Announcement[] = publishedAnnouncements.map((item) => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    date: item.date ? new Date(item.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '',
    type: (item.type as 'important' | 'normal' | 'pickup') || 'normal',
    eventStartDate: item.eventStartDate as string | undefined,
    eventEndDate: item.eventEndDate as string | undefined,
    image: (item.image || item.Image) as string | undefined
  }));

  // 開催中・開催予定のイベント（type: pickup で期間があり、まだ終わっていないもの）
  const currentDate = new Date();
  const eventsWithoutColor: Event[] = publishedAnnouncements
    .filter((item) => item.type === 'pickup' && item.eventStartDate && item.eventEndDate)
    .filter((item) => currentDate <= new Date(item.eventEndDate as string))
    .map((item) => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      startDate: item.eventStartDate as string,
      endDate: item.eventEndDate as string,
      image: (item.image || item.Image) as string | undefined,
      date: item.date as string | undefined,
      featured: item.featured === true,
      excerpt: getAnnouncementExcerpt(item.id),
    }));

  // 背景のにじみの色はバナー画像から取り出す
  const currentEvents: Event[] = await Promise.all(
    eventsWithoutColor.map(async (event) => ({ ...event, palette: await getBandPalette(event.image) }))
  );

  // Fetch patch note
  const latestPatchNoteData = await getLatestPatchNoteLight();

  // Cast to PatchNote interface (compatible)
  const latestPatchNote = latestPatchNoteData as unknown as PatchNote | null;

  return (
    <>
      <Header />
      <div className="flex-grow bg-white">
        <HomePageClient
          announcements={formattedAnnouncements}
          currentEvents={currentEvents}
          renderedAt={currentDate.getTime()}
          latestPatchNote={latestPatchNote}
        />
      </div>
    </>
  );
}