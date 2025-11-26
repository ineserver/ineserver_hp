import { NextResponse } from 'next/server';
import { getAnnouncementFilesLight } from '../../../../lib/content';

// 60秒ごとにキャッシュを再検証
export const revalidate = 60;

export async function GET() {
  try {
    // 軽量版を使用（HTMLレンダリングをスキップ）
    const announcements = getAnnouncementFilesLight();
    
    // 公開されているお知らせのみをフィルター
    const publishedAnnouncements = announcements.filter((announcement) => {
      return typeof announcement === 'object' && announcement !== null && 'published' in announcement
        ? (announcement as { published?: boolean }).published !== false
        : true;
    });
    
    return NextResponse.json(publishedAnnouncements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
