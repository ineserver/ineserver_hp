import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncementData } from '../../../../../lib/content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const content = await getAnnouncementData(slug);
    
    if (!content) {
      return NextResponse.json(
        { error: 'お知らせが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'お知らせの取得に失敗しました' },
      { status: 500 }
    );
  }
}
