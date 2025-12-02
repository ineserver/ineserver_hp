import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePageClient, { Announcement, Event, PatchNote } from "@/components/HomePageClient";
import { getAnnouncementFilesLight } from "../../lib/content";
import { getLatestPatchNoteLight } from "@/lib/patch-notes";

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
    eventEndDate: item.eventEndDate as string | undefined
  }));

  // Filter events
  const currentDate = new Date();
  const currentEvents: Event[] = formattedAnnouncements
    .filter((announcement) =>
      announcement.type === 'pickup' &&
      announcement.eventStartDate &&
      announcement.eventEndDate
    )
    .filter((announcement) => {
      const endDate = new Date(announcement.eventEndDate!);
      return currentDate <= endDate;
    })
    .map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      description: announcement.description,
      startDate: announcement.eventStartDate!,
      endDate: announcement.eventEndDate!
    }))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Fetch patch note
  const latestPatchNoteData = getLatestPatchNoteLight();

  // Cast to PatchNote interface (compatible)
  const latestPatchNote = latestPatchNoteData as unknown as PatchNote | null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HomePageClient
        announcements={formattedAnnouncements}
        currentEvents={currentEvents}
        latestPatchNote={latestPatchNote}
      />
      <Footer />
    </div>
  );
}