import { NextResponse } from 'next/server';
import { getAnnouncementFiles } from '../../../../lib/content';

export async function GET() {
  try {
    const announcements = await getAnnouncementFiles();
    
    // 公開されているお知らせのみをフィルター
    const publishedAnnouncements = announcements.filter((announcement: any) => 
      announcement.published !== false
    );
    
    return NextResponse.json(publishedAnnouncements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
